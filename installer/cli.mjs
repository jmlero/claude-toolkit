#!/usr/bin/env node
import * as p from "@clack/prompts";
import pc from "picocolors";
import fs from "node:fs";
import path from "node:path";
import { items } from "./lib/manifest.mjs";
import { detectStack, humanSummary } from "./lib/detect.mjs";
import { installPlugin, isPluginEnabled } from "./lib/settings.mjs";

function parseFlags(argv) {
  const flags = { yes: false, dryRun: false, scope: null, help: false };
  for (const a of argv) {
    if (a === "-y" || a === "--yes") flags.yes = true;
    else if (a === "--dry-run") flags.dryRun = true;
    else if (a === "-h" || a === "--help") flags.help = true;
    else if (a.startsWith("--scope=")) flags.scope = a.split("=")[1];
    else if (a === "--scope") {
      const next = argv[argv.indexOf(a) + 1];
      if (next) flags.scope = next;
    }
  }
  return flags;
}

function printHelp() {
  console.log(`
${pc.bold("jmlero-toolkit")} — interactive installer for the jmlero claude-toolkit

${pc.bold("Usage:")}
  npx github:jmlero/claude-toolkit [flags]

${pc.bold("Flags:")}
  -y, --yes              Install suggested items non-interactively
  --scope <project|user> Default scope (default: project)
  --dry-run              Show what would be installed, don't write files
  -h, --help             Show this help
`);
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  if (flags.help) return printHelp();

  const cwd = process.cwd();

  p.intro(pc.bgCyan(pc.black(" jmlero-toolkit installer ")));

  // Detect stack
  const ctx = detectStack(cwd);
  const stack = humanSummary(ctx);
  p.log.info(stack.length ? `Detected stack: ${pc.cyan(stack.join(", "))}` : "No specific stack detected");
  p.log.info(`Working directory: ${pc.dim(cwd)}`);

  // Build choices with suggestions and already-installed markers
  const suggestions = items.map((item) => ({
    item,
    ...item.suggest(ctx),
    existingScope: item.type === "marketplace-plugin"
      ? isPluginEnabled({ pluginId: item.id, marketplace: item.marketplace, cwd })
      : null,
  }));

  const choices = suggestions.map(({ item, pick, reason, existingScope }) => {
    const star = pick ? pc.yellow("★") : " ";
    const badge = existingScope ? pc.dim(` [already installed @ ${existingScope}]`) : "";
    const reasonStr = reason ? pc.dim(` — ${reason}`) : "";
    return {
      value: item.id,
      label: `${star} ${pc.bold(item.id)} ${pc.dim(`(${item.category})`)}${badge}`,
      hint: `${item.description}${reasonStr}`,
    };
  });

  let selected;
  if (flags.yes) {
    selected = suggestions.filter((s) => s.pick && !s.existingScope).map((s) => s.item.id);
    p.log.info(`--yes: auto-selecting ${selected.length} suggested items`);
  } else {
    selected = await p.multiselect({
      message: `Select items to install ${pc.yellow("★")} = suggested for this project`,
      options: choices,
      initialValues: suggestions.filter((s) => s.pick && !s.existingScope).map((s) => s.item.id),
      required: false,
    });
    if (p.isCancel(selected)) {
      p.cancel("Cancelled");
      process.exit(0);
    }
  }

  if (!selected.length) {
    p.outro("Nothing selected. Bye.");
    return;
  }

  // Scope decision
  let scope = flags.scope;
  if (!scope) {
    if (flags.yes) {
      scope = "project";
    } else {
      const r = await p.select({
        message: "Default scope for plugins",
        options: [
          { value: "project", label: `${pc.bold("project")} — .claude/settings.json (shared via git)`, hint: "recommended" },
          { value: "user", label: `${pc.bold("user")} — ~/.claude/settings.json (all projects)` },
        ],
        initialValue: "project",
      });
      if (p.isCancel(r)) {
        p.cancel("Cancelled");
        process.exit(0);
      }
      scope = r;
    }
  }
  if (scope !== "project" && scope !== "user") {
    p.log.error(`Invalid scope: ${scope}`);
    process.exit(1);
  }

  // Install
  const selectedItems = items.filter((i) => selected.includes(i.id));
  const mcpInstructions = [];
  const manualSkills = [];

  const spinner = p.spinner();
  spinner.start(flags.dryRun ? "Planning installs (dry-run)" : "Installing");

  for (const item of selectedItems) {
    const itemScope = item.recommendedScope === "user" ? "user" : scope;

    if (item.type === "marketplace-plugin") {
      if (flags.dryRun) {
        spinner.message(`would install ${item.id}@${item.marketplace.name} → ${itemScope}`);
        continue;
      }
      const result = installPlugin({
        pluginId: item.id,
        marketplace: item.marketplace,
        scope: itemScope,
        cwd,
      });
      spinner.message(
        result.alreadyEnabled
          ? `${item.id} already enabled`
          : `enabled ${item.id}@${item.marketplace.name} (${itemScope})`
      );
    } else if (item.type === "mcp") {
      mcpInstructions.push(item);
    } else if (item.type === "manual-skill") {
      manualSkills.push(item);
    }
  }

  // Manual skills: fetch + write
  for (const item of manualSkills) {
    const dest = path.join(cwd, item.installPath);
    if (flags.dryRun) {
      spinner.message(`would download ${item.id} → ${item.installPath}`);
      continue;
    }
    try {
      const res = await fetch(item.sourceUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.text();
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, body);
      spinner.message(`downloaded ${item.id} → ${item.installPath}`);
    } catch (e) {
      spinner.message(pc.red(`failed to fetch ${item.id}: ${e.message}`));
    }
  }

  spinner.stop(flags.dryRun ? "Dry-run complete" : "Install complete");

  // Print MCP instructions at the end
  if (mcpInstructions.length) {
    p.log.warn("MCP servers need manual install (most require interactive auth):");
    for (const m of mcpInstructions) {
      const extra = m.postInstall ? `\n      then: ${pc.cyan(m.postInstall)}` : "";
      console.log(`    ${pc.bold(m.id)}: ${pc.cyan(m.installCommand)}${extra}`);
    }
  }

  p.outro(
    flags.dryRun
      ? "Dry-run — no files written."
      : `Done. ${pc.dim("Restart Claude Code or run /reload-plugins to pick up changes.")}`
  );
}

main().catch((err) => {
  console.error(pc.red("Error:"), err.message);
  process.exit(1);
});
