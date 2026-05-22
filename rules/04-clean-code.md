## 4) Clean Code (Non-Negotiable)

**Readability over cleverness — always.**

- **Guard clauses first**: Return early to avoid deep nesting.
- **Single responsibility**: One function does one thing.
- **Small functions**: A function should fit on one screen (~30–40 lines maximum). If it does not, split it.
- **No magic numbers or strings**: Use named constants or enums.
- **No premature abstraction**: Add layers only when they demonstrably reduce complexity.
- **Meaningful names**: Variables, functions, and classes must reveal intent. No unexplained abbreviations.
- **Dead code discipline**: Remove imports, variables, and functions that YOUR changes made unused. Pre-existing dead code: mention it to the user, but do not remove it unless explicitly asked. Commented-out code: remove it — use version control instead.
- **get vs find naming**: `getX()` expects the result to exist and throws on failure. `findX()` is a lookup that may return an empty result (empty array, empty string). Never mix these semantics.
- **Boolean method names**: Methods returning `bool` must start with `is`, `has`, `can`, `should`, or `was` — e.g. `isActive()`, `hasPermission()`, `canEdit()`.
- **Mutually exclusive conditions**: When a variable or expression can only be in one state at a time, use `if / else if / else` — never a chain of separate `if` statements. Multiple independent `if` blocks evaluate every branch regardless of whether an earlier one matched, wasting CPU cycles and obscuring the logical exclusivity. The correct structure gives the runtime an explicit XOR: once a branch matches, the rest are skipped. **Order branches by descending probability**: put the most frequently true condition first so the runtime exits the chain as early as possible in the common case.

```typescript
// ❌ Bad
function p(u: any, t: string) {
    if (u !== null) { if (u.active) { if (t === 'x') { return 42; } } }
}

// ✅ Good
const PERMISSION_DENIED = 403;

function resolvePermission(user: User, type: PermissionType): number
{
    if (!user.active) {
        return PERMISSION_DENIED;
    }

    if (type !== PermissionType.Admin) {
        return PERMISSION_DENIED;
    }

    return HttpStatus.Ok;
}
```

```typescript
// ❌ Bad — all three branches evaluated every time; order is arbitrary
function getLabel(status: string): string
{
    if (status === 'active') { return 'Active'; }
    if (status === 'pending') { return 'Pending'; }
    if (status === 'inactive') { return 'Inactive'; }

    return 'Unknown';
}

// ✅ Good — if/else if/else gives the runtime an explicit XOR;
//           most frequent case ('active') is checked first → fewest comparisons in the common path
function getLabel(status: string): string
{
    if (status === 'active') {         // ~80 % of calls
        return 'Active';
    } else if (status === 'pending') { // ~15 %
        return 'Pending';
    } else if (status === 'inactive') { // ~4 %
        return 'Inactive';
    } else {                           // < 1 % / unexpected value
        return 'Unknown';
    }
}

// ✅ Even better — model the finite set with an enum or discriminated union (see Section 3)
```
