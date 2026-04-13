# jmlero-toolkit installer

Interactive CLI that sets up plugins, MCP servers, and skills for a new project in one step — instead of pasting a dozen `/plugin install` commands.

## Usage

```bash
# From the root of a new project:
npx github:jmlero/claude-toolkit
```

The installer will:

1. Detect your stack (React, Python, Terraform, FastAPI, etc.)
2. Show a checkbox menu of **everything** in the toolkit, with ★ next to items suggested for your stack
3. Let you pick a default scope (`project` is default — shared via git)
4. Write the marketplace registrations + `enabledPlugins` directly to `.claude/settings.json` and `~/.claude/settings.json`
5. Print install commands for MCP servers (they need interactive auth, so can't be automated)

After it finishes, restart Claude Code or run `/reload-plugins` in your session.

## Flags

| Flag | What it does |
|------|--------------|
| `-y`, `--yes` | Non-interactive: install all suggested items |
| `--scope <project\|user>` | Default scope (default: `project`) |
| `--dry-run` | Show what would be installed, don't write anything |
| `-h`, `--help` | Print help |

## Examples

```bash
# Interactive, pick exactly what you want:
npx github:jmlero/claude-toolkit

# Just install the suggestions for this stack, no prompts:
npx github:jmlero/claude-toolkit --yes

# Preview without writing:
npx github:jmlero/claude-toolkit --dry-run --yes

# Install everything at user scope instead of project:
npx github:jmlero/claude-toolkit --scope user
```

## How scope works

- **Project scope** (default) — writes to `.claude/settings.json` in the current directory. Shared with your team via git.
- **User scope** — writes to `~/.claude/settings.json`. Available in all projects on this machine.
- A few items are always installed at user scope regardless of the default: `slim-cli`, `typescript-lsp`, `pyright-lsp`. These are global tools that don't belong in per-project settings.

The marketplace registration (the thing that tells Claude Code where to fetch a plugin from) is always written at user scope — marketplaces are inherently global.

## Adding new items

Edit `installer/lib/manifest.mjs`. Each item is an object with:

```js
{
  id: "my-plugin",
  type: "marketplace-plugin",    // or "mcp" or "manual-skill"
  marketplace: MARKETPLACES.something,
  category: "Community",
  description: "what it does",
  suggest: (ctx) => ctx.hasReact
    ? { pick: true, reason: "React detected" }
    : { pick: false },
}
```

The `suggest` function receives the detected stack context from `detect.mjs` and returns whether the item should be pre-selected and why. When you add a plugin to the README's tables, also add it here so the installer stays in sync.

## What the installer writes

- `~/.claude/settings.json` — adds the plugin's marketplace under `extraKnownMarketplaces`, plus any user-scope plugins under `enabledPlugins`
- `.claude/settings.json` — adds project-scope plugins under `enabledPlugins`
- `.claude/skills/<skill>/SKILL.md` — for manual skills like FastAPI, downloads the file

Nothing is downloaded eagerly for marketplace plugins — Claude Code fetches them on first use or when you run `/plugin marketplace update`.
