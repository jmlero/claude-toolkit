---
name: audit-code
description: Perform a production readiness audit of the codebase. Checks security, error handling, auth, input validation, Docker config, and coding standards. Use when preparing for deployment or reviewing overall code quality.
disable-model-invocation: true
context: fork
agent: general-purpose
---

Perform a comprehensive production readiness audit of this codebase.

## Audit Categories

Check each category and report findings as: PASS, WARN, or FAIL.

### 1. Security
- [ ] CORS restricted to known frontend URL (not `*` with credentials)
- [ ] No secrets in code or committed `.env` files
- [ ] SQL injection protection (parameterized queries / ORM)
- [ ] XSS protection in frontend
- [ ] Auth required on all mutating endpoints
- [ ] JWT validation on protected routes
- [ ] No `DEBUG=True` or verbose errors exposed to clients

### 2. Error Handling
- [ ] Generic error messages to clients (no stack traces leaked)
- [ ] Full error details logged server-side only
- [ ] Proper HTTP status codes (400 vs 500 vs 401 vs 403)
- [ ] Frontend handles error/loading/empty states

### 3. Input Validation
- [ ] Request/input models validate all API inputs (Pydantic, Zod, JSON Schema, etc.)
- [ ] File upload validation (type, size)
- [ ] Path parameters validated (UUID format, numeric IDs)
- [ ] Query parameters have sensible defaults and limits

### 4. Database
- [ ] No unbounded queries (pagination on list endpoints)
- [ ] Proper indexes on frequently queried columns
- [ ] Foreign keys with appropriate cascade behavior
- [ ] Connection pooling configured

### 5. Docker & Infrastructure
- [ ] Containers run as non-root user
- [ ] No unnecessary ports exposed
- [ ] Health checks defined
- [ ] Production Dockerfiles use multi-stage builds
- [ ] `.dockerignore` excludes unnecessary files

### 6. Code Quality
- [ ] No TODO/FIXME/HACK without linked issue
- [ ] No commented-out code blocks
- [ ] Consistent code patterns across modules
- [ ] Tests exist for critical paths

### 7. Dependencies
- [ ] No known critical vulnerabilities
- [ ] Dependency versions pinned
- [ ] Unused dependencies removed

## Output Format

```markdown
# Production Readiness Audit

## Summary
- PASS: X | WARN: Y | FAIL: Z

## Critical Findings (FAIL)
1. [Category] Description - File:Line - Recommendation

## Warnings (WARN)
1. [Category] Description - File:Line - Recommendation

## Passed Checks
- [Category] Description
```

Report findings sorted by severity. For each FAIL/WARN, include the specific file and line number, and a concrete fix recommendation.
