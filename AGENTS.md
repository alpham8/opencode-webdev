# Engineering Baseline — opencode

Project-local files always override this baseline:
`AGENTS.md` · `README*` · `docs/` · `code-conventions.md` · `.editorconfig`

---

## 0) Always Start Here

1. Read all project-local rules **before touching code**.
2. Read the project's `README`, `package.json` scripts, `composer.json` scripts,
   or `Makefile` before running any build/test command. Never guess commands.
3. Follow existing patterns unless they violate this baseline or a refactor
   is explicitly requested.
4. Keep diffs small, focused, and easy to review.
5. Do not introduce new dependencies or tools unless required or explicitly
   requested.

---

## Coding Rules (always active)

The following 20 rule files are loaded via `opencode.json → instructions`
and apply to every session:

01-coding-standard · 02-security · 03-type-system · 04-clean-code ·
05-complexity · 06-maintainability · 07-js-ts-tooling · 08-vue-svelte ·
09-testing · 10-environment · 11-boundaries · 12-performance ·
13-database · 14-dependencies · 15-observability · 16-accessibility ·
17-i18n · 18-git-workflow · 19-css · 20-cpp