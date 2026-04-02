---
name: audit-docs
description: Audit documentation files for staleness, redundancy, broken references, and bloat. Use periodically to keep docs lean, accurate, and useful.
disable-model-invocation: true
context: fork
agent: general-purpose
---

Perform a comprehensive audit of all documentation and markdown files in this project.

## Scope

Find and read every `.md` file in the project. Pay special attention to:
- `docs/` directory (all files and subdirectories)
- Root-level docs (`README.md`, `CLAUDE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, etc.)
- Any index or table-of-contents files
- Agent/skill definitions if present (`.claude/`)

## Audit Checks

For each file, evaluate and report as: OK, WARN, or ACTION.

### 1. Staleness
- [ ] Does the content match the current codebase? (Check referenced env vars, endpoints, config values against actual code)
- [ ] Are referenced files/directories still present?
- [ ] Are issue-specific docs for completed/shipped work still in active docs instead of an archive?
- [ ] Do code examples match current patterns?

### 2. Redundancy
- [ ] Is the same information documented in multiple files?
- [ ] Are there docs that are strict subsets of other docs?
- [ ] Do architecture/project docs contain implementation details that belong elsewhere?

### 3. Broken References
- [ ] Do all internal links and cross-references point to existing files?
- [ ] Do all `@./path` includes in CLAUDE.md resolve to existing files?
- [ ] Does any index/TOC file list only files that exist?
- [ ] Does any index/TOC include all files that actually exist?

### 4. Bloat & Scope Creep
- [ ] Are stable docs free of issue-specific implementation details?
- [ ] Are any files over 300 lines? If so, can they be split or trimmed?
- [ ] Are there empty or near-empty files (<10 lines of content)?
- [ ] Are there empty directories?

### 5. Accuracy of Context-Loaded Docs
Files loaded via `@` in CLAUDE.md get injected into every AI session. They must be worth the token cost.
- [ ] Is every `@`-included file actively useful for day-to-day development?
- [ ] Could any `@`-included content be moved to on-demand docs?
- [ ] Is the total token footprint of `@`-included files reasonable? (flag if combined content exceeds ~500 lines)

### 6. Archive Hygiene
- [ ] Are completed rollout checklists archived?
- [ ] Are one-time setup guides that have been executed archived?
- [ ] Is the archive only used for genuinely historical docs?

## Output Format

```markdown
# Documentation Audit

## Summary
- OK: X | WARN: Y | ACTION: Z
- Total doc files: N
- Context-loaded files: N (@-included, ~N lines)

## Actions Required
1. [Category] Description - File - Recommendation

## Warnings
1. [Category] Description - File - Recommendation

## Healthy Files
- File - reason it's fine
```

Sort findings by impact (highest first). For each ACTION/WARN, include the specific file and a concrete recommendation (delete, archive, trim, fix reference, merge into another file).
