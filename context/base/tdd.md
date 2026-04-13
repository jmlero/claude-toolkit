## Development Methodology: TDD

Always follow Test-Driven Development when implementing features or fixing bugs.

### Red-Green-Refactor Cycle

1. **RED**: Write a failing test first that describes the expected behavior
2. **GREEN**: Write the minimum code to make the test pass
3. **REFACTOR**: Improve code quality while keeping tests green

### Testing Standards

- Each test should test ONE behavior
- Test names must describe the expected behavior clearly
- Keep tests independent and isolated
- Mock external dependencies (database, APIs, LLM calls)
- Run tests after every change
