# slim-cli — Claude Code Plugin

Puts your CLI output on a diet. A PreToolUse hook that rewrites verbose commands to compact versions.

## Install

```bash
/plugin marketplace add jmlero/claude-toolkit
/plugin install slim-cli@jmlero
```

Or install locally:

```bash
claude --plugin-dir /path/to/claude-toolkit/plugins/slim-cli
```

## What It Does

Intercepts Bash tool calls and rewrites commands that produce noisy output into compact equivalents. Commands that already have compact flags or piped output are left unchanged.

### Rewrite Rules (26 total)

#### Git (8 rules)
| Input | Output |
|-------|--------|
| `git status` | `git status --short --branch` |
| `git log` | `git log --oneline -10` |
| `git diff` | `git diff --stat` |
| `git push ...` | `... 2>&1 \| tail -2` |
| `git pull` | `git pull --rebase 2>&1 \| tail -3` |
| `git pull --rebase` | `... 2>&1 \| tail -3` |
| `git fetch ...` | `... --quiet` |
| `git clone ...` | `git clone --quiet ...` |

#### Docker (5 rules)
| Input | Output |
|-------|--------|
| `docker compose logs ...` | `... --tail=50` |
| `docker compose build ...` | `... 2>&1 \| tail -30` |
| `docker compose up ... -d` | `... 2>&1 \| tail -5` |
| `docker ps ...` | `... --format 'table Names Status Ports'` |
| `docker images ...` | `... --format 'table Repo Tag Size'` |

#### npm / yarn / pnpm (5 rules)
| Input | Output |
|-------|--------|
| `npm install/ci/add ...` | `... 2>&1 \| tail -5` |
| `npm run build ...` | `... 2>&1 \| tail -10` |
| `npm list` / `npm ls` | `... --depth=0` |
| `yarn install/add ...` | `... 2>&1 \| tail -5` |
| `pnpm install/add ...` | `... 2>&1 \| tail -5` |

#### pip (3 rules)
| Input | Output |
|-------|--------|
| `pip install ...` | `... --quiet` |
| `python -m pip install ...` | `... --quiet` |
| `pip list` | `... 2>&1 \| head -30` |

#### curl / wget (2 rules)
| Input | Output |
|-------|--------|
| `curl ...` | `curl -sS ...` |
| `wget ...` | `wget --quiet ...` |

#### Go (3 rules)
| Input | Output |
|-------|--------|
| `go test ...` | `... 2>&1 \| tail -20` |
| `go build ...` | `... 2>&1 \| tail -10` |
| `go get ...` | `... 2>&1 \| tail -5` |

## Safety

- **Never rewrites piped commands** — if `|` is already present, the user controls output
- **Errors preserved** — `tail` captures final lines where errors appear; `--quiet` flags still show errors; curl uses `-sS` (silent + show-errors)
- **Only top-level commands** — commands inside `docker compose exec` are not matched
- **Exact pattern matching** — only rewrites known patterns, everything else passes through

## Testing

Pipe JSON into the script to test individual rules:

```bash
# Should rewrite: docker compose logs → add --tail=50
echo '{"tool_name":"Bash","tool_input":{"command":"docker compose logs backend"}}' | ./slim-cli.sh

# Should pass through: already has --tail
echo '{"tool_name":"Bash","tool_input":{"command":"docker compose logs --tail=100 backend"}}' | ./slim-cli.sh

# Should pass through: not a Bash tool
echo '{"tool_name":"Read","tool_input":{"path":"file.txt"}}' | ./slim-cli.sh
```

## License

MIT
