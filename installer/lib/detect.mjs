import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export function detectStack(cwd = process.cwd()) {
  const exists = (p) => fs.existsSync(path.join(cwd, p));
  const readIfExists = (p) => exists(p) ? fs.readFileSync(path.join(cwd, p), "utf8") : "";

  const ctx = {
    cwd,
    isGitRepo: exists(".git"),
    hasDockerfile: exists("Dockerfile") || exists("docker-compose.yml") || exists("compose.yml"),
    hasDocs: exists("docs") || exists("README.md") || exists("readme.md"),
    hasTsConfig: exists("tsconfig.json"),
    hasPackageJson: exists("package.json"),
    hasPyProject: exists("pyproject.toml"),
    hasRequirementsTxt: exists("requirements.txt"),
    hasGoMod: exists("go.mod"),
    hasCargoToml: exists("Cargo.toml"),
  };

  // Terraform — any .tf file in cwd or common dirs
  try {
    const hasTf = fs.readdirSync(cwd).some((f) => f.endsWith(".tf"));
    ctx.hasTerraform = hasTf || exists("terraform") || exists("infra");
  } catch {
    ctx.hasTerraform = false;
  }

  ctx.hasPython = ctx.hasPyProject || ctx.hasRequirementsTxt;

  // Parse package.json for JS framework detection
  if (ctx.hasPackageJson) {
    try {
      const pkg = JSON.parse(readIfExists("package.json"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      ctx.hasReact = "react" in deps;
      ctx.hasVue = "vue" in deps;
      ctx.hasNextJs = "next" in deps;
      ctx.hasSvelte = "svelte" in deps || "@sveltejs/kit" in deps;
      ctx.hasTypeScript = ctx.hasTsConfig || "typescript" in deps;
    } catch {}
  }

  // FastAPI detection
  const pyFiles = readIfExists("pyproject.toml") + "\n" + readIfExists("requirements.txt");
  ctx.hasFastAPI = /\bfastapi\b/i.test(pyFiles);

  // GitHub remote
  try {
    const remote = execSync("git remote get-url origin", { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    ctx.isGitHubRepo = /github\.com/i.test(remote);
  } catch {
    ctx.isGitHubRepo = false;
  }

  return ctx;
}

export function humanSummary(ctx) {
  const parts = [];
  if (ctx.hasReact) parts.push("React");
  if (ctx.hasNextJs) parts.push("Next.js");
  if (ctx.hasVue) parts.push("Vue");
  if (ctx.hasSvelte) parts.push("Svelte");
  if (ctx.hasTypeScript) parts.push("TypeScript");
  if (ctx.hasPython) parts.push("Python");
  if (ctx.hasFastAPI) parts.push("FastAPI");
  if (ctx.hasGoMod) parts.push("Go");
  if (ctx.hasCargoToml) parts.push("Rust");
  if (ctx.hasTerraform) parts.push("Terraform");
  if (ctx.hasDockerfile) parts.push("Docker");
  if (ctx.isGitHubRepo) parts.push("GitHub");
  return parts;
}
