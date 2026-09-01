## 6) Code Maintainability

### Architecture

- **Thin controllers / routes**: Business logic belongs in services or use-cases.
- **DTOs / ViewModels** at I/O boundaries: Never expose persistence entities directly to the outside.
- **Errors are explicit and meaningful**: Never silently swallow exceptions. Log or re-throw with context.
- **Constructor discipline**: Constructors assign dependencies — nothing else. No business logic, no I/O, no HTTP calls. Pure configuration (e.g. setting up a converter) is acceptable.
- **All dependencies required**: Every injected service must be non-optional. If a class needs a dependency, it must always receive one — no fallback behaviour on missing services.
- **Specific exceptions**: Throw domain-specific exceptions (e.g. `PostNotFoundException`), not generic `\RuntimeException` or `\Exception`. Catch specific exceptions, never bare `catch (\Exception $e)` unless re-throwing.

### Symfony/Shopware Service Configuration (PHP over XML)

For **new** service definitions (Symfony DI: registrations, decorators, tags), use the PHP config format (`services.php` with `Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator`) instead of `services.xml`. PHP config is Symfony's current recommended style — typed, IDE-navigable, refactor-safe — while XML is legacy-but-supported, not actively recommended for new code.

- Applies to **new** service files only. Don't rewrite an existing, working `services.xml` into PHP just for its own sake — that's a refactor unrelated to the task at hand (see Refactoring Rules below).
- If a plugin's bootstrap only knows how to load XML (e.g. a Shopware plugin `build()` method wired to `XmlFileLoader`), adding a first PHP config file requires also wiring a `PhpFileLoader` for it — treat that loader change as part of the same task, not a silent side effect, and call it out explicitly since it changes how the plugin bootstraps *all* its services, not just the new one.
- Where Shopware/Symfony attributes cover the need (`#[AsDecorator]`, `#[Autoconfigure]`, `#[AsMessageHandler]`, etc.), prefer attributes over either config format — least ceremony, co-located with the class.

### Documentation

- Public APIs and non-obvious functions require a concise docblock explaining *why*, not *what*.
- Inline comments explain *intent*, not mechanics. Do not comment the obvious.
- Keep comments up to date with the code — stale comments are worse than none.

### Refactoring Rules

- Only refactor as part of a focused, clearly scoped change.
- Never mix refactoring with feature work in the same commit/diff.
- Leave the code measurably better than you found it (Boy Scout Rule).