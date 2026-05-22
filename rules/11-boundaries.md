## 11) Boundaries (Non-Negotiable)

Explicit autonomy limits. These override any implicit assumptions.

### Always Do

- Run linter, formatter, and typecheck before considering work done.
- Run tests before committing.
- Work in `src/`, `tests/`, `app/`, `lib/` and other source directories.
- Read existing tests and copy their style when writing new ones.

### Ask First

- Adding or removing dependencies.
- Database schema changes or new migrations.
- Changing CI/CD pipeline configuration.
- Modifying shared infrastructure, deployment configs, or environment files.
- Deleting files outside the immediate scope of the task.
- Changing authentication or authorization logic.

### Never

- Commit secrets, credentials, API keys, or `.env` files.
- Modify `vendor/`, `node_modules/`, or other managed directories.
- Edit production configuration files directly.
- Bulk-update lockfiles (`composer update` / `npm update` without a specific package).
- Force-push to `main` or `master`.