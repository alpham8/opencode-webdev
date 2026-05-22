## 8) Vue & Svelte

- **TypeScript is the source language** — it must always be **compiled down to JavaScript**. No raw TypeScript is ever shipped or embedded directly in HTML.
- Component script blocks use `<script setup lang="ts">` (Vue) / `<script lang="ts">` (Svelte) so the bundler/compiler (Vite, SvelteKit, etc.) handles the TS → JS compilation step.
- The compiled output (`.js`) is what gets delivered to the browser — never `.ts` files directly.
- No plain `.js` component source files — TypeScript is always the authoring language.
- Props, emits, and exposed values must have explicit TypeScript types.
- Composables (Vue) / stores (Svelte) follow the same strict typing rules as any other module.
- **No TypeScript syntax inside HTML template blocks** (`<template>` / markup) — types live exclusively in the `<script>` block.

### TypeScript Decorators

Decorators are **allowed and encouraged** where they reduce boilerplate or complexity (e.g. dependency injection, class-based components, ORMs).

Rules:
- Do not mix decorator modes (legacy `experimentalDecorators` vs. TC39 stage-3) within a project.
- Align `tsconfig` and bundler settings to the project's chosen decorator mode consistently.
- Decorators must not hide critical business logic — keep decorated classes readable without knowing the decorator internals.