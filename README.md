# claude-toolkit

Personal collection of Claude Code plugins for full-stack development. Public so others can use it, designed for my workflow first.

## Quick Start

```bash
# Add the marketplace (once per machine)
/plugin marketplace add jmlero/claude-toolkit

# Install what you need per project
/plugin install audit-code@jmlero --scope project
/plugin install slim-cli@jmlero --scope user
```

## My Plugins

### Code Quality

| Plugin | Type | What it does | Install |
|--------|------|-------------|---------|
| **audit-code** | Skill | Production readiness audit — security, error handling, auth, Docker, dependencies | `/plugin install audit-code@jmlero` |
| **audit-docs** | Skill | Documentation audit — staleness, redundancy, broken refs, bloat | `/plugin install audit-docs@jmlero` |
| **review-pr** | Skill | PR review — code quality, security, tests, framework checks | `/plugin install review-pr@jmlero` |

### Operations

| Plugin | Type | What it does | Install |
|--------|------|-------------|---------|
| **slim-cli** | Hook | Rewrites verbose CLI output to compact versions, saves tokens | `/plugin install slim-cli@jmlero` |

### When to Use What

- **Starting a new project?** Install `audit-code` and `slim-cli`
- **Reviewing code?** `review-pr` + `audit-code`
- **Cleaning up docs?** `audit-docs`

---

## Curated Third-Party Plugins

Plugins I use or recommend from other sources.

### Official (Anthropic)

| Plugin | What it does | Install |
|--------|-------------|---------|
| **frontend-design** | Production-grade UI with anti-AI-slop aesthetics | `/plugin install frontend-design@claude-plugins-official` |
| **typescript-lsp** | TypeScript language server for better code intelligence | `/plugin install typescript-lsp@claude-plugins-official` |
| **pyright-lsp** | Python type checking and language server | `/plugin install pyright-lsp@claude-plugins-official` |
| **github** | GitHub integration (issues, PRs, actions) | `/plugin install github@claude-plugins-official` |

### Framework

| Skill | What it does | Source |
|-------|-------------|--------|
| **fastapi** | Official FastAPI best practices — Annotated syntax, return types, async/sync, dependency injection, streaming. Not a plugin — manual install only (see [How To](#skills-that-arent-plugins)). | [fastapi/fastapi](https://github.com/fastapi/fastapi/tree/master/fastapi/.agents/skills/fastapi) |

### Community

| Plugin | What it does | Source |
|--------|-------------|--------|
| **terraform** | 12 skills: HCL generation, Stacks, Azure Verified Modules, provider development (Go SDK). Best for platform/provider teams. | [hashicorp/agent-skills](https://github.com/hashicorp/agent-skills/tree/main/terraform) |
| **terraform-skill** | Module dev, testing decision matrix, CI/CD templates, security/compliance checklists. Lightweight (~4.4K tokens). Best for app teams. | [antonbabenko/terraform-skill](https://github.com/antonbabenko/terraform-skill) |
| **superpowers** | 14 skills: TDD (strict "Iron Law"), systematic debugging, verification before completion, brainstorming, planning, code review. The most comprehensive methodology framework. | [obra/superpowers](https://github.com/obra/superpowers) |
| **codex** | OpenAI Codex integration — use Codex CLI as a tool from Claude Code. | [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) |

### Directories

Useful sources for discovering more plugins:

- [skills.sh](https://skills.sh/) — searchable directory of Claude Code skills
- [midudev/autoskills](https://github.com/midudev/autoskills) — curated collection of community skills

---

## Plugin Types

- **Skill** — Prompt templates that guide Claude through structured workflows. Invoked with `/skill-name` or auto-triggered. Most plugins in this toolkit are skills.
- **Hook** — Runs automatically on events (e.g., `slim-cli` rewrites commands before every Bash call). No manual invocation.
- **Agent** — Custom subagents for specialized tasks.

## Project Structure

```
claude-toolkit/
├── .claude-plugin/
│   └── marketplace.json        # Marketplace manifest
├── plugins/
│   ├── audit-code/             # Production readiness audit
│   ├── audit-docs/             # Documentation audit
│   ├── slim-cli/               # CLI output optimizer (hook)
│   └── review-pr/              # Pull request review
├── LICENSE
└── README.md
```

Each plugin follows the standard structure:
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json             # Plugin manifest
├── skills/
│   └── skill-name/
│       └── SKILL.md            # Skill definition
└── hooks/                      # (optional) Hook definitions
    └── hooks.json
```

## How To Install

### Plugins from this toolkit (jmlero)

```bash
# 1. Add the marketplace (once per machine)
/plugin marketplace add jmlero/claude-toolkit

# 2. Install a plugin globally (available in all projects)
/plugin install slim-cli@jmlero --scope user

# 3. Or install per project (only available in this project)
/plugin install audit-code@jmlero --scope project
```

### Plugins from Anthropic official

```bash
# 1. Add the official marketplace (once per machine)
/plugin marketplace add anthropics/claude-code

# 2. Install a plugin
/plugin install frontend-design@claude-plugins-official
/plugin install typescript-lsp@claude-plugins-official
/plugin install pyright-lsp@claude-plugins-official
/plugin install github@claude-plugins-official
```

### Plugins from GitHub repos (community)

```bash
# 1. Add the repo as a marketplace
/plugin marketplace add antonbabenko/terraform-skill
/plugin marketplace add obra/superpowers
/plugin marketplace add openai/codex-plugin-cc

# 2. Install the plugin (use the marketplace name, not the repo name)
/plugin install terraform-skill@antonbabenko
/plugin install test-driven-development@obra
/plugin install codex@openai
```

### Plugins from repos with multiple plugins (e.g. HashiCorp)

```bash
# 1. Add the marketplace
/plugin marketplace add hashicorp/agent-skills

# 2. List available plugins
/plugin marketplace list hashicorp

# 3. Install the one you need
/plugin install terraform-code-generation@hashicorp
/plugin install terraform-module-generation@hashicorp
/plugin install terraform-provider-development@hashicorp
```

### Skills that aren't plugins

Some skills aren't packaged as plugins — they're just SKILL.md files inside a repo. Copy them manually:

```bash
# Example: FastAPI official skill
mkdir -p .claude/skills/fastapi
curl -sL https://raw.githubusercontent.com/fastapi/fastapi/master/fastapi/.agents/skills/fastapi/SKILL.md \
  > .claude/skills/fastapi/SKILL.md
```

### Managing plugins

```bash
# List installed plugins
/plugin

# Disable without uninstalling
/plugin disable slim-cli@jmlero

# Re-enable
/plugin enable slim-cli@jmlero

# Uninstall
/plugin uninstall slim-cli@jmlero

# Update all marketplaces
/plugin marketplace update

# Reload plugins without restarting
/reload-plugins
```

### Scopes explained

| Scope | Flag | Settings file | Shared via git? | Use for |
|-------|------|---------------|-----------------|---------|
| User | `--scope user` | `~/.claude/settings.json` | No | Personal tools across all projects |
| Project | `--scope project` | `.claude/settings.json` | Yes | Team tools shared with the repo |
| Local | `--scope local` | `.claude/settings.local.json` | No (gitignored) | Personal tools for one project |

## License

MIT
