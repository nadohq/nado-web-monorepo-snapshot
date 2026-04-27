# Code Review Guidelines

## Mindset
- Review as a senior software architect — consider system-wide implications, not just the immediate change

## Always check
- Unintended side effects: does this change affect shared state, other modules, or downstream consumers?
- Redundant styles, views, or logic — flag duplication and suggest consolidation or simplification
- Reinventing the wheel — if complex logic exists, check whether an existing util or well-maintained library already solves it
- Documentation: any non-obvious code, function, or module should have a clear explanation; flag undocumented intent
- Code conventions: flag deviations from established patterns in the codebase (naming, structure, error handling, etc.)
- Error handling: does the code handle partial failures gracefully, or does it assume the happy path? Are errors surfaced meaningfully, or silently swallowed?
- Performance: flag N+1 queries, unnecessary re-renders, or expensive operations in hot paths