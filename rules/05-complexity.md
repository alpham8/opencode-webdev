## 5) Low Complexity

Keep cyclomatic complexity low. Aim for **≤ 5 per function**, hard limit **10** — if a function exceeds this, refactor before adding more logic.

- Prefer flat over nested.
- Prefer composition to inheritance where it reduces branching.
- Avoid boolean flag parameters — use separate functions or strategy patterns instead.
- Avoid deeply chained calls that obscure control flow.
- **Maximum 4 parameters** per function/method. Beyond that, introduce a value object, DTO, or options object.
- **No mixed return types**: A method must always return the same type. Never return `string` sometimes and `array` other times.

```typescript
// ❌ Bad — boolean flag parameter
function render(component: Component, isAdmin: boolean) { … }

// ✅ Good — separate, explicit functions
function renderAdminView(component: Component) { … }
function renderUserView(component: Component) { … }
```