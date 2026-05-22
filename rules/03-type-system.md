## 3) Strict Type System (Non-Negotiable)

**Every variable, parameter, return value, and field must have an explicit, precise type.**
Implicit or inferred types are only acceptable where the type is unambiguous and the language makes inference the idiomatic norm (e.g. `const x = 1` in TypeScript is `number` — fine). Ambiguous cases always get an explicit annotation.

### Quick Reference by Language

| Language | Rule | Example |
|---|---|---|
| **TypeScript** | No `any`. No `var`. `const` by default, `let` only when reassignment is needed. Explicit return types on exported functions. | `const count: number = 1;` |
| **JavaScript** | No `var`. Prefer `const`. Migrate to TypeScript when feasible. | `const label = 'active';` |
| **PHP** | `declare(strict_types=1);` in every file. Native type declarations on params, returns, properties. Docblocks only as supplements. | `function add(int $a, int $b): int` |
| **C# / .NET** | Prefer explicit types to `var`. Respect nullable reference types. Never suppress nullable warnings without justification. | `int count = 1;` |
| **Python** | Type hints on all function signatures. Use `mypy` or `pyright` in strict mode where the project allows. | `def add(a: int, b: int) -> int:` |
| **Bash / Shell** | Declare variable types with `declare -i` (integer), `-r` (readonly), `-a` (array) where applicable. Always quote variables. | `declare -i count=1` |
| **SQL** | Explicit column types in DDL. Never use `SELECT *` in application queries. | `created_at TIMESTAMP NOT NULL` |
| **Vue / Svelte** | TypeScript as source language, compiled to JavaScript by the bundler. `<script setup lang="ts">` / `<script lang="ts">`. No TS in HTML templates. | see Section 8 |

### TypeScript: Additional Rules

- `catch (e: unknown)` — always narrow safely before using `e`.
- `unknown` + narrowing instead of `any`.
- Generics over loose union types where appropriate.
- Exported / public APIs must always have explicit types.
- No implicit `any` via `tsconfig` (`"strict": true` minimum).
- No `@ts-ignore` or `@ts-expect-error` without a comment explaining the exact reason. Prefer fixing the underlying type issue.
- No unsafe type assertions (`value as SomeType`) unless preceded by a narrowing check or runtime guard that proves the assertion correct.
- Use `satisfies` to validate object literals against a type without widening the inferred type.
- Use discriminated unions (a shared `type` or `kind` literal field) to model state machines and variant types — never a bag of optional fields.

```typescript
// ❌ Bad — optional fields hide which combinations are actually valid
interface State {
    loading?: boolean;
    data?: User;
    error?: string;
}

// ✅ Good — discriminated union, every state is explicit and exhaustive
type State =
    | { kind: 'loading' }
    | { kind: 'success'; data: User }
    | { kind: 'error'; message: string };

// ❌ Bad — unsafe assertion, no evidence the cast is correct
const user = response.data as User;

// ✅ Good — runtime guard before use
function isUser(value: unknown): value is User
{
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof (value as Record<string, unknown>).id === 'number'
    );
}

if (isUser(response.data)) {
    // response.data is now User — proven at runtime
}
```

### Null Avoidance (Non-Negotiable)

**Never return `null` when a neutral empty value exists.**

- Return empty arrays `[]`, empty strings `''`, or zero values instead of `null`.
- Constructor dependencies must always be required (non-nullable). No `?Type $dep = null` for injected services.
- Nullable is **only acceptable** when `null` carries a genuinely distinct semantic meaning that an empty value cannot represent.

| Language | Do | Don't |
|---|---|---|
| **PHP** | `function find(): array` | `function find(): ?array` |
| **PHP** | `private CacheInterface $cache` | `private ?CacheInterface $cache = null` |
| **TypeScript** | `function find(): Post[]` | `function find(): Post[] \| null` |
| **Python** | `def find() -> list[Post]` | `def find() -> Optional[list[Post]]` |

### Immutability by Default

- Use `readonly` properties (PHP 8.1+), `const` (JS/TS), `final` (Java/PHP classes not designed for extension).
- Prefer constructor promotion with `readonly` for value objects and DTOs.
- Mutate only when genuinely required — prefer creating new instances over modifying existing ones.

```php
// ✅ Good — immutable value object
final class Money
{
    public function __construct(
        public readonly int $amount,
        public readonly string $currency,
    ) {
    }
}
```

### Enums over Magic Values

Use language-native enums instead of string or integer constants for finite sets of values.

```php
// ❌ Bad
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';

// ✅ Good
enum Status: string
{
    case Active = 'active';
    case Inactive = 'inactive';
}
```

### Type-Safe Comparisons (Non-Negotiable)

**Never use `empty()` in PHP.** It hides type information and silently coerces values. Always use explicit, type-safe checks instead.

| Type | Do | Don't |
|---|---|---|
| **Array** | `count($items) > 0` / `count($items) === 0` | `empty($items)` / `!empty($items)` |
| **String** | `$name !== ''` / `$name === ''` | `empty($name)` / `!empty($name)` |
| **Int / Float** | `$count !== 0` / `$count > 0` | `empty($count)` |
| **Bool** | `$flag === true` / `$flag === false` | `empty($flag)` |
| **Null check** | `$value === null` / `$value !== null` | `empty($value)` |

Always use strict comparison (`===`, `!==`). Never use loose comparison (`==`, `!=`).

```php
// ❌ Bad — hides type, unclear intent
if (!empty($posts)) { … }
if (empty($title)) { … }

// ✅ Good — explicit, type-safe
if (count($posts) > 0) { … }
if ($title === '') { … }
```

This applies to all languages: always use the most specific, type-aware comparison available rather than loose truthiness checks.