## 19) CSS / SCSS Property Ordering

**Always order CSS properties following the Box Model — outside to inside, then layout, then typography.**

This makes the visual structure of an element immediately readable: you see the outer spacing first, then the box itself, then its interior, then how it sits in the document, and finally how text looks inside it.

### Canonical Order

```
1. margin
2. border
3. outline
4. height / min-height / max-height
5. width / min-width / max-width
6. padding
──────────────────────────────────
7. position / top / right / bottom / left / z-index
8. display / flex / grid properties
──────────────────────────────────
9. font-size / font-family / font-weight / line-height
10. color / text-* / letter-spacing
──────────────────────────────────
11. background / background-*
12. opacity / visibility
13. transition / animation
14. cursor / pointer-events / user-select
```

### Example

```scss
// ❌ Bad — random property order
.card {
    background: #fff;
    font-size: 1rem;
    margin: 1rem;
    display: flex;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    color: #333;
    height: 200px;
}

// ✅ Good — Box Model order
.card {
    margin: 1rem;
    border: 1px solid #e0e0e0;
    height: 200px;
    padding: 1.5rem;
    display: flex;
    font-size: 1rem;
    color: #333;
    background: #fff;
}
```

### SCSS-Specific Rules

- **Nesting limit**: Maximum 3 levels deep. Beyond that, extract a new class.
- **`&` modifier placement**: List `&:hover`, `&:focus`, `&--modifier` (BEM), and `&__child` blocks **after** all plain properties.
- **Variables before properties**: Declare SCSS variables and `@include` calls at the top of a block, before the ordered properties.

```scss
// ✅ Good — variables/mixins first, then Box Model order, then nested selectors
.button {
    $radius: 4px;

    @include reset-button;

    margin: 0;
    border: 2px solid currentColor;
    border-radius: $radius;
    height: 2.5rem;
    padding: 0 1rem;
    display: inline-flex;
    font-size: 0.875rem;
    color: var(--color-primary);
    background: transparent;
    cursor: pointer;

    &:hover {
        background: var(--color-primary-light);
    }

    &--disabled {
        opacity: 0.5;
        pointer-events: none;
    }
}
```
