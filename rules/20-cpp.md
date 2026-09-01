## 20) C++ Conventions

These rules apply to all C++ code. Project-specific overrides (e.g. Mixxx's `.clang-format` and `CONTRIBUTING.md`) take precedence where they conflict.

### Formatting Baseline

| Rule | Value |
|---|---|
| Indentation | 4 spaces, never tabs |
| Continuation indent | 8 spaces |
| Max line length | 100 hard limit, 80 soft target |
| Braces | Google-style: opening brace on the same line |
| Control flow bodies | Always braced, even single-line |
| Include guards | `#pragma once` (no `#ifndef` guards) |

### Naming Conventions

| Element | Style | Example |
|---|---|---|
| Classes / structs | `CamelCase` | `WaveformRenderBeat` |
| Methods / functions | `camelBack` | `getTrackInfo()` |
| Member variables | `m_` prefix | `m_beatColor` |
| Pointer members | `m_p` prefix | `m_pConfig` |
| Local pointer variables | `p` prefix | `pTrackInfo` |
| Constants | `k` + `PascalCase` | `kMaxBufferSize` |
| Enums | `enum class CamelCase` | `enum class ChannelLayout` |
| ControlObject / setting keys | `snake_case` | `beat_active` |

### Include Order

Separated by blank lines, alphabetical within each group:

1. Matching header (`#include "foo/bar.h"` in `bar.cpp`)
2. System headers (`<cstdint>`, `<vector>`)
3. Qt headers (`<QObject>`, `<QString>`)
4. Library dependencies (`<portaudio.h>`)
5. Project-local headers (`"track/beats.h"`)
6. Forward declarations

### Memory Management

- No naked `new` / `delete` — use `std::make_unique`, `std::make_shared`, or Qt's `make_parented`.
- Prefer `std::unique_ptr` for exclusive ownership, `std::shared_ptr` only when ownership is genuinely shared.
- Use `DISALLOW_COPY_AND_ASSIGN(ClassName)` in the `private` section for non-copyable classes that don't use `= delete` directly.

### Qt-Specific

- `QStringLiteral("...")` for string literals in non-translatable contexts.
- `tr("...")` for user-visible translatable strings.
- `override` on all virtual overrides; omit the redundant `virtual` keyword.
- `final` on classes not designed for further inheritance.
- No `Q_UNUSED` — use unnamed parameters instead: `void foo(int /*unused*/)`.
- Prefer direct signal-slot connections (`&Sender::signal, receiver, &Receiver::slot`) over lambdas. Lambdas receive extra scrutiny for lifetime and control-flow issues.

### Enums and Constants

- Always `enum class`, never C-style `enum`.
- No magic numbers or strings — extract as `kPascalCase` constants.

### Defensive Checks

- Use `VERIFY_OR_DEBUG_ASSERT(cond) { recovery; }` for defensive checks instead of bare `assert()` or `Q_ASSERT()`.
- No `goto`.

### Documentation

- `///` doc comments in headers for public API.
- `// TODO(username)` or `// TODO(issue URL)` for deferred work.
- Inline comments explain *why*, not *what*.

### Namespaces

- Wrap new code in `namespace mixxx {}`.
- Use anonymous namespaces for file-local helpers in `.cpp` files.
- No `using namespace` in headers.

### Out-Parameters

Non-const reference out-parameters: use pointers, not references (legacy convention in many C++/Qt codebases).

```cpp
// Preferred
void calculate(int input, int* pOutput);

// Avoid
void calculate(int input, int& output);
```

### Formatting Tool

Run `clang-format` against the project's `.clang-format` before committing. Only format new or modified code — do not mass-reformat unrelated code. Keep formatting commits separate from logic commits.
