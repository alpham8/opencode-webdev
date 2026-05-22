## 18) Git Workflow

### Conventional Commits

All commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]
```

| Type | When to use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process, tooling, dependency updates |
| `style` | Formatting, whitespace — no logic change |

- **Subject line**: Maximum 50 characters, imperative mood ("add", not "added" or "adds").
- **Body**: Wrap at 72 characters. Explain *why*, not *what*.
- **Scope**: Optional but encouraged. Use the module, component, or area name.

### Branch Naming

```
type/short-description
```

Examples: `feat/user-auth`, `fix/cart-total-rounding`, `refactor/order-service`.

- Lowercase, hyphens as separators.
- Type prefix matches Conventional Commits types.
- Keep it short but descriptive.

### Workflow Rules

- **Never commit directly to `main` / `master`** — use feature branches
- **squash your commits before merge** to maintain a clear history (unless project conventions say otherwise)
- **use merge strategy instead of rebase** most projects are intended for teamwork, so rebase would fail
- **One logical change per commit** — do not mix unrelated changes
- **Delete branches after merge** — no stale branches