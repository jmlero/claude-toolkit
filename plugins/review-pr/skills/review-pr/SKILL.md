---
name: review-pr
description: Review a pull request against project standards. Checks code quality, security, tests, and patterns. Use when reviewing PRs or when someone says "review this PR".
argument-hint: [PR-number-or-URL]
disable-model-invocation: true
---

Review pull request: $ARGUMENTS

## Steps

### 1. Gather PR Context
```bash
# Get PR details
gh pr view $ARGUMENTS

# Get the diff
gh pr diff $ARGUMENTS

# Get PR comments
gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments
```

### 2. Review Checklist

#### Code Quality
- [ ] Follows existing patterns in the codebase
- [ ] No code duplication
- [ ] Functions do one thing
- [ ] Meaningful variable/function names
- [ ] No magic numbers or strings
- [ ] No commented-out code

#### Security (Critical)
- [ ] No secrets or credentials in code
- [ ] Auth required on mutating endpoints
- [ ] Input validated at API boundary
- [ ] No SQL injection risk
- [ ] Error messages don't leak internals
- [ ] No wildcard CORS with credentials

#### Testing
- [ ] Tests exist for new/changed code
- [ ] Tests cover happy path AND error cases
- [ ] Mocks used for external dependencies
- [ ] Tests are independent and isolated

#### Framework & Infrastructure
Apply checks relevant to the project's stack (skip what doesn't apply):
- [ ] Follows framework conventions and idioms
- [ ] Proper status codes and error responses
- [ ] Types are explicit (no `any`, no untyped returns)
- [ ] Infrastructure config not broken by the change
- [ ] Environment variables documented

#### Git
- [ ] Commits follow conventional format (feat:, fix:, etc.)
- [ ] PR is focused (not mixing unrelated changes)
- [ ] PR description explains the "why"

### 3. Output Format

```markdown
## PR Review: #<number>

### Summary
Brief description of what the PR does.

### Verdict: APPROVE / REQUEST_CHANGES / COMMENT

### Findings

#### Must Fix (blocking)
1. [Category] Description - file:line

#### Should Fix (non-blocking)
1. [Category] Description - file:line

#### Nits (optional)
1. Description - file:line

### What's Good
- Positive observations about the PR
```

Be constructive. Explain WHY something should change, not just what.
