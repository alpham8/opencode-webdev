## 10) Environment

- If a project uses **DDEV** (`.ddev/` exists): run PHP / Composer / Node commands inside the container via `ddev exec …` or `ddev ssh`, unless project docs say otherwise.
- Do not install global tools on the host if the project provides a containerised equivalent.