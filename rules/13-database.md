## 13) Database & Migration Discipline

### Migrations

- **One purpose per migration**: Each migration does exactly one thing. Name it descriptively: `add_user_email_index`, `create_orders_table`, `drop_legacy_status_column`.
- **Bidirectional required**: Every migration must include both `up` and `down` (or equivalent rollback). If a rollback is genuinely impossible, document why in a comment inside the migration.
- **No data manipulation in structural migrations**: Separate schema changes from data transformations.
- **Test migrations**: Run `up` then `down` then `up` again to verify idempotency before committing.

### Schema Design

- **Explicit column types**: Every column has a precise type and nullability constraint.
- **Foreign keys enforced**: Use database-level foreign key constraints, not just application-level checks.
- **Timestamps by default**: Include `created_at` and `updated_at` on every table unless there is a documented reason not to.
- **Soft deletes**: Prefer a `deleted_at` timestamp over hard deletes for user-facing data. Hard deletes are acceptable for ephemeral or system-internal data.