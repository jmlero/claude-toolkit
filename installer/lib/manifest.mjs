// Single source of truth for everything the installer can install.
// When you add a new plugin/MCP/skill to the README, add it here too.
//
// Item types:
//   marketplace-plugin  — installed via Claude Code's plugin marketplace system
//   mcp                 — MCP server; printed as instructions (most need interactive auth)
//   manual-skill        — SKILL.md file downloaded from a URL into .claude/skills/
//   context-fragment    — Markdown practice file copied into context/base/ and @-referenced in CLAUDE.md

export const MARKETPLACES = {
  jmlero: { name: "jmlero", repo: "jmlero/claude-toolkit" },
  anthropic: { name: "claude-plugins-official", repo: "anthropics/claude-code" },
  hashicorp: { name: "hashicorp", repo: "hashicorp/agent-skills" },
  antonbabenko: { name: "antonbabenko", repo: "antonbabenko/terraform-skill" },
  obra: { name: "obra", repo: "obra/superpowers" },
  openaiCodex: { name: "openai-codex", repo: "openai/codex-plugin-cc" },
};

export const items = [
  // ─── jmlero plugins ────────────────────────────────────────────────────
  {
    id: "audit-code",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.jmlero,
    category: "jmlero",
    description: "Production readiness audit — security, errors, auth, Docker, deps",
    suggest: () => ({ pick: true, reason: "core toolkit" }),
  },
  {
    id: "audit-docs",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.jmlero,
    category: "jmlero",
    description: "Documentation audit — staleness, redundancy, broken refs, bloat",
    suggest: (ctx) => ctx.hasDocs
      ? { pick: true, reason: "README/docs detected" }
      : { pick: false },
  },
  {
    id: "review-pr",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.jmlero,
    category: "jmlero",
    description: "PR review — code quality, security, tests, framework checks",
    suggest: (ctx) => ctx.isGitRepo
      ? { pick: true, reason: "git repo" }
      : { pick: false },
  },
  {
    id: "slim-cli",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.jmlero,
    category: "jmlero",
    description: "Rewrites verbose CLI output to compact versions, saves tokens",
    recommendedScope: "user", // this one is best installed once, globally
    suggest: () => ({ pick: true, reason: "always useful (user scope)" }),
  },

  // ─── Anthropic official ───────────────────────────────────────────────
  {
    id: "frontend-design",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.anthropic,
    category: "Anthropic",
    description: "Production-grade UI with anti-AI-slop aesthetics",
    suggest: (ctx) => (ctx.hasReact || ctx.hasVue || ctx.hasNextJs || ctx.hasSvelte)
      ? { pick: true, reason: `detected: ${[ctx.hasReact && "React", ctx.hasNextJs && "Next.js", ctx.hasVue && "Vue", ctx.hasSvelte && "Svelte"].filter(Boolean).join(", ")}` }
      : { pick: false },
  },
  {
    id: "typescript-lsp",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.anthropic,
    category: "Anthropic",
    description: "TypeScript language server for better code intelligence",
    recommendedScope: "user",
    suggest: (ctx) => ctx.hasTypeScript
      ? { pick: true, reason: "TypeScript detected (user scope)" }
      : { pick: false },
  },
  {
    id: "pyright-lsp",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.anthropic,
    category: "Anthropic",
    description: "Python type checking and language server",
    recommendedScope: "user",
    suggest: (ctx) => ctx.hasPython
      ? { pick: true, reason: "Python detected (user scope)" }
      : { pick: false },
  },
  {
    id: "github",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.anthropic,
    category: "Anthropic",
    description: "GitHub integration (issues, PRs, actions)",
    suggest: (ctx) => ctx.isGitHubRepo
      ? { pick: true, reason: "GitHub remote detected" }
      : { pick: false },
  },

  // ─── Community ────────────────────────────────────────────────────────
  {
    id: "terraform",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.hashicorp,
    category: "Community",
    description: "12 skills: HCL, Stacks, AVM, provider dev. For platform/provider teams.",
    suggest: (ctx) => ctx.hasTerraform
      ? { pick: false, reason: "Terraform detected (pick one: this OR terraform-skill)" }
      : { pick: false },
  },
  {
    id: "terraform-skill",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.antonbabenko,
    category: "Community",
    description: "Module dev, testing, CI/CD, security. Lightweight. For app teams.",
    suggest: (ctx) => ctx.hasTerraform
      ? { pick: true, reason: "Terraform detected" }
      : { pick: false },
  },
  {
    id: "superpowers",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.obra,
    category: "Community",
    description: "14 skills: TDD Iron Law, debugging, verification, brainstorming",
    suggest: () => ({ pick: false }),
  },
  {
    id: "codex",
    type: "marketplace-plugin",
    marketplace: MARKETPLACES.openaiCodex,
    category: "Community",
    description: "OpenAI Codex CLI integration — use Codex as a tool from Claude Code",
    suggest: () => ({ pick: false }),
  },

  // ─── MCP Servers (printed as instructions) ────────────────────────────
  {
    id: "codegraph",
    type: "mcp",
    category: "MCP Server",
    description: "Semantic code knowledge graph — ~92% fewer exploration tool calls",
    installCommand: "npx @colbymchenry/codegraph",
    postInstall: "codegraph init --index",
    suggest: () => ({ pick: true, reason: "big tool-call savings" }),
  },
  {
    id: "context7",
    type: "mcp",
    category: "MCP Server",
    description: "Up-to-date library docs pulled into prompts — fixes stale training data",
    installCommand: "npx ctx7 setup",
    suggest: () => ({ pick: true, reason: "stops outdated-API hallucinations" }),
  },
  {
    id: "backlog",
    type: "mcp",
    category: "MCP Server",
    description: "Markdown-native task manager & Kanban for Git repos",
    installCommand: "npm i -g backlog.md",
    postInstall: "backlog init",
    suggest: () => ({ pick: false }),
  },

  // ─── Context fragments (always-active CLAUDE.md practices) ───────────
  {
    id: "tdd",
    type: "context-fragment",
    category: "Dev Methodology",
    description: "TDD: Red-Green-Refactor cycle, always-active via CLAUDE.md",
    sourceUrl: "https://raw.githubusercontent.com/jmlero/claude-toolkit/main/context/base/tdd.md",
    installPath: "context/base/tdd.md",
    claudeMdRef: "@./context/base/tdd.md",
    suggest: () => ({ pick: true, reason: "universal best practice" }),
  },

  // ─── Manual skills (copied from URL) ──────────────────────────────────
  {
    id: "fastapi",
    type: "manual-skill",
    category: "Framework Skill",
    description: "Official FastAPI best practices (Annotated, async/sync, DI, streaming)",
    installPath: ".claude/skills/fastapi/SKILL.md",
    sourceUrl: "https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/.agents/skills/fastapi/SKILL.md",
    suggest: (ctx) => ctx.hasFastAPI
      ? { pick: true, reason: "FastAPI detected" }
      : { pick: false },
  },
];
