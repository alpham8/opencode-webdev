## 1) Coding Standard: PSR-12 Across All Languages

[PSR-12](https://www.php-fig.org/psr/psr-12/) is the **universal style reference**. Where it is PHP-specific, apply its intent to every other language consistently.

| Rule | Value |
|---|---|
| Indentation | 4 spaces — no tabs |
| Max line length | 120 characters |
| Line endings | LF (Unix) |
| Encoding | UTF-8 without BOM |
| File ending | Single newline at end of file |
| Trailing whitespace | Never |
| Imports / includes | Ordered, no unused entries |
| Braces | Consistent, readable — no brace gymnastics |
| Operators / keywords | Consistent whitespace around them |
| One action per line | No clever dense one-liners |

If a language's tooling cannot reproduce PSR-12 brace placement exactly, enforce the closest consistent equivalent and **prioritize readability and consistency**.

### Brace Placement in JavaScript / TypeScript (PSR-12 Intent)

Opening braces for **classes, methods, and functions** go on their **own line** — matching PHP PSR-12 brace placement. Control structures (`if`, `for`, `while`, etc.) keep the opening brace on the same line.

```typescript
// ❌ Bad — opening brace on same line as function/class declaration
class UserService {
    public getUser(id: number): User {
        if (id <= 0) {
            throw new Error('Invalid ID');
        }

        return this.repository.find(id);
    }
}

// ✅ Good — opening brace on own line for class, method, function
class UserService
{
    public getUser(id: number): User
    {
        if (id <= 0) {
            throw new Error('Invalid ID');
        }

        return this.repository.find(id);
    }
}
```

This applies to all standalone function declarations, class declarations, and method definitions. Arrow functions and callbacks are exempt — they follow standard JS/TS conventions.

### HTML / Twig: Attributes Always on One Line (Non-Negotiable)

**All attributes of an HTML or Twig element must be written on a single line**, regardless of how many attributes there are or how long the resulting line becomes. This is an explicit **exception to the 120-character rule**.

Splitting attributes across multiple lines breaks whitespace-removal tools in HTML/Twig templates (e.g. Shopware's HTML minifier).

```twig
{# ❌ Bad — attributes split across lines, breaks whitespace removers #}
<input
    type="text"
    name="search"
    class="form-control"
    placeholder="Suchen…"
    aria-label="Suchen">

{# ✅ Good — all attributes on one line, even if it exceeds 120 chars #}
<input type="text" name="search" class="form-control" placeholder="Suchen…" aria-label="Suchen">
```

This applies to all HTML, Twig, and template files. The 120-character limit does **not** apply to HTML element lines.