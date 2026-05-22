## 7) JavaScript / TypeScript Tooling Defaults

### Prettier

```json
{
    "printWidth": 120,
    "tabWidth": 4,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "bracketSpacing": true,
    "endOfLine": "lf"
}
```

### ESLint (enforce PSR-12 intent)

- Forbid `var`
- Prefer `const`
- Forbid `any` (allow `unknown`)
- Enforce removal of unused imports and variables
- Require explicit types on all exported / public module boundaries

If a project already has ESLint + Prettier configured, do **not** fight the existing setup. Adjust it minimally to meet the rules above.