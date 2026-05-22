## 14) Dependency Management (Non-Negotiable)

### Adding Dependencies

- **Verify existence**: AI tools sometimes hallucinate package names. Always verify a package exists before adding it.
- **Evaluate before adding**: Check maintenance activity, security history, dependency footprint, and community health. Prefer well-maintained packages with few transitive dependencies.
- **Pin exact versions** for application dependencies. Use ranges only for libraries intended for redistribution.
- **One dependency per commit**: Adding a dependency is its own change — never bundle it with feature work.

### Updating Dependencies

- **Never bulk-update**: Always update one package at a time with an explicit version (`composer require vendor/package:^2.1`, `npm install package@4.2.0`).
- **Read changelogs**: Before updating, check the changelog for breaking changes.
- **Lockfile discipline**: Never manually edit lockfiles (`composer.lock`, `package-lock.json`, `yarn.lock`). They are generated artifacts.

### Removing Dependencies

- **Verify unused**: Search the entire codebase for imports/usages before removing a dependency.
- **Remove completely**: Remove from manifest, lockfile (via tool), and any configuration or documentation that references it.