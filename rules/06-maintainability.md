## 6) Code Maintainability

### Architecture

- **Thin controllers / routes**: Business logic belongs in services or use-cases.
- **DTOs / ViewModels** at I/O boundaries: Never expose persistence entities directly to the outside.
- **Errors are explicit and meaningful**: Never silently swallow exceptions. Log or re-throw with context.
- **Constructor discipline**: Constructors assign dependencies — nothing else. No business logic, no I/O, no HTTP calls. Pure configuration (e.g. setting up a converter) is acceptable.
- **All dependencies required**: Every injected service must be non-optional. If a class needs a dependency, it must always receive one — no fallback behaviour on missing services.
- **Specific exceptions**: Throw domain-specific exceptions (e.g. `PostNotFoundException`), not generic `\RuntimeException` or `\Exception`. Catch specific exceptions, never bare `catch (\Exception $e)` unless re-throwing.

### Documentation

- Public APIs and non-obvious functions require a concise docblock explaining *why*, not *what*.
- Inline comments explain *intent*, not mechanics. Do not comment the obvious.
- Keep comments up to date with the code — stale comments are worse than none.

### Refactoring Rules

- Only refactor as part of a focused, clearly scoped change.
- Never mix refactoring with feature work in the same commit/diff.
- Leave the code measurably better than you found it (Boy Scout Rule).