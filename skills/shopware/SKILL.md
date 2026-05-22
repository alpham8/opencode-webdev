---
name: shopware
description: Use when developing Shopware 5 or Shopware 6 plugins, working with the Enlight framework, DAL, event system, Twig/Smarty templates, Storefront JS, or Admin Vue components. Triggers on plugin development, entity definitions, event subscribers, template blocks, SW5 hooks, SW6 DAL queries.
---

# Shopware Plugin Development

## Related Skills

| Need | Skill |
|------|-------|
| **PHP** (types, security, PSR standards) | `php` |
| **Symfony framework** (DI, events, routing, forms, serializer, etc.) | `symfony` |
| **Vue.js** (Shopware 6 Administration is built on Vue) | `vue` |
| **TypeScript** (type system, generics, utility types) | `typescript` |
| DDEV CLI commands for Shopware (build, cache, plugin install) | `shopware-ddev` |
| dustin/shopware-utils library (sub-bundles, auto-resources) | `shopware-utils` |
| DDEV config, PHP/Node/DB version changes, port setup | `ddev-development` |

> **Shopware 6 is built on Symfony.** All Symfony patterns (service container, event dispatcher, routing, console, forms, serializer, messenger, etc.) apply directly. See the `symfony` skill for the full Symfony reference.

---

## Overview

Shopware 5 (Enlight/Symfony 3, Smarty, ExtJS backend) and Shopware 6 (Symfony 4+, Twig, Vue.js admin) share the plugin concept but differ fundamentally in architecture. Both use a service-container-based DI and event-driven extension model.

---

## Shopware 6

### Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Core | Symfony | Business logic, DAL, APIs, rules |
| Storefront | Twig + SCSS + JS | Customer-facing shop |
| Administration | Vue.js (Meteor) | Merchant backend |

**Key objects:** `Context` (admin/background), `SalesChannelContext` (storefront, carries customer/currency/language state).

### Plugin vs. App

| Capability | Plugin | App |
|---|---|---|
| Modify database structure | Yes | No |
| Run in Cloud shops | No | Yes |
| Add custom logic/routes/commands | Yes | Partial (external only) |
| Full Storefront/Admin control | Yes | Yes |

Plugins are Symfony bundles with full system access. Apps are HTTP-API-based and run externally.

### Plugin Structure

```
custom/plugins/SwagExample/
├── src/
│   ├── SwagExample.php          # Plugin class
│   ├── Core/Content/Example/    # Custom entity domain
│   ├── Storefront/Controller/
│   ├── Subscriber/
│   └── Resources/
│       ├── config/
│       │   ├── services.xml     # (or services.php)
│       │   ├── config.xml       # Plugin config form
│       │   └── plugin.png       # 128×128 plugin icon
│       ├── views/storefront/    # Twig overrides
│       ├── app/
│       │   ├── storefront/src/  # JS plugins + SCSS
│       │   └── administration/  # Vue.js
│       └── snippet/
└── composer.json
```

**Plugin base class** (`src/SwagExample.php`):

```php
namespace Swag\Example;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\UninstallContext;

class SwagExample extends Plugin
{
    public function uninstall(UninstallContext $context): void
    {
        parent::uninstall($context);

        if ($context->keepUserData()) {
            return;
        }

        /** @var Connection $connection */
        $connection = $this->container->get(Connection::class);

        // Check existence before dropping (idempotency)
        $columns = $connection->fetchAllAssociative(
            'SHOW COLUMNS FROM `my_table` LIKE :col',
            ['col' => 'my_column']
        );

        if (count($columns) === 0) {
            return;
        }

        $connection->executeStatement(
            'ALTER TABLE `my_table` DROP FOREIGN KEY `fk.my_table.my_column`, DROP COLUMN `my_column`'
        );
    }
}
```

> Always check `keepUserData()` before touching the database in `uninstall()`. Drop FK constraints before columns.

**`composer.json`** (complete recommended structure):

```json
{
    "name": "vendor/plugin-name",
    "description": "Short description.",
    "version": "1.0.0",
    "type": "shopware-platform-plugin",
    "license": "MIT",
    "authors": [
        { "name": "Developer Name", "email": "dev@example.com", "role": "Developer" },
        { "name": "Company GmbH", "email": "info@example.com", "homepage": "https://example.com/", "role": "Manufacturer" }
    ],
    "require": {
        "shopware/core": ">=6.6.0 <6.8.0",
        "shopware/administration": ">=6.6.0 <6.8.0"
    },
    "extra": {
        "shopware-plugin-class": "Vendor\\PluginName\\PluginName",
        "manufacturerLink": { "de-DE": "https://example.com/", "en-GB": "https://example.com/" },
        "supportLink":      { "de-DE": "https://example.com/kontakt/", "en-GB": "https://example.com/contact/" },
        "label":       { "de-DE": "Plugin Name DE", "en-GB": "Plugin Name EN" },
        "description": { "de-DE": "Beschreibung DE", "en-GB": "Description EN" }
    },
    "autoload": {
        "psr-4": { "Vendor\\PluginName\\": "src/" }
    }
}
```

> **Critical:** `manufacturerLink` and `supportLink` must be **locale-keyed objects**, not plain strings. `PluginService::getTranslations()` iterates all four extra keys with `foreach` — a plain string causes a fatal error on `plugin:refresh`.

> **Admin dependency:** Always require `shopware/administration` (same version range) for plugins that add or override admin components.

**Plugin icon:** Place a 128×128 PNG at `src/Resources/config/plugin.png`. Shopware stores it as a blob in `plugin.icon` on `plugin:refresh`.

Scaffold with: `bin/console plugin:create SwagExample`

---

### Data Abstraction Layer (DAL)

The DAL replaces direct ORM/SQL. Use repositories, not Doctrine EntityManager.

**Inject repository** (`services.xml`):

```xml
<service id="Swag\Example\Service\ProductService">
    <argument type="service" id="product.repository"/>
</service>
```

Or with `services.php` (modern format):

```php
$services->set(ProductService::class)
    ->args([service('product.repository')]);
```

Repository service names follow the pattern: `entity_name.repository`.

#### Reading Data

```php
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\RangeFilter;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Sorting\FieldSorting;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Aggregation\Metric\AvgAggregation;

$criteria = new Criteria();
$criteria->addFilter(new EqualsFilter('active', true));
$criteria->addFilter(new RangeFilter('price', ['gte' => 10]));
$criteria->addAssociation('manufacturer');
$criteria->addSorting(new FieldSorting('name', FieldSorting::ASCENDING));
$criteria->setLimit(25)->setOffset(0);

// Standard search — returns EntitySearchResult
$result = $this->productRepository->search($criteria, $context);
$entity = $result->first();

// Get only IDs — more efficient when you don't need the full entity
$ids = $this->productRepository->searchIds($criteria, $context);
$firstId = $ids->firstId();

// Post-filter: applies to result but NOT to aggregations
$criteria->addPostFilter(new EqualsFilter('name', 'Foo'));

// Aggregations — do NOT call ->first() when using aggregations
$criteria->addAggregation(new AvgAggregation('avg-rating', 'productReviews.points'));
$result = $this->productRepository->search($criteria, $context);
$rating = $result->getAggregations()->get('avg-rating');
```

#### Writing Data

```php
use Shopware\Core\Framework\Uuid\Uuid;

// Create
$this->repository->create([
    ['id' => Uuid::randomHex(), 'name' => 'New', ...]
], $context);

// Update
$this->repository->update([
    ['id' => $id, 'name' => 'Updated']
], $context);

// Delete
$this->repository->delete([['id' => $id]], $context);

// Upsert — always provide ID, otherwise data is always created (never updated)
$this->repository->upsert([
    ['id' => $knownId, 'name' => 'Upserted']
], $context);
```

> **ManyToMany pitfall:** You cannot update a `ManyToMany` mapping entity directly (e.g. `productCategoryRepository->update()`). Assign associations through the owning entity's repository instead.

#### Custom Entity

Full pattern: `EntityDefinition` + `Entity` + `EntityCollection` + Migration + service registration.

**Migration** (`src/Migration/Migration1611664789Example.php`):
```php
public function update(Connection $connection): void
{
    $connection->executeStatement(<<<SQL
        CREATE TABLE IF NOT EXISTS `swag_example` (
            `id`          BINARY(16) NOT NULL,
            `name`        VARCHAR(255) COLLATE utf8mb4_unicode_ci,
            `description` VARCHAR(255) COLLATE utf8mb4_unicode_ci,
            `active`      TINYINT(1),
            `custom_fields` JSON NULL,
            `created_at`  DATETIME(3) NOT NULL,
            `updated_at`  DATETIME(3),
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    SQL);
}

public function updateDestructive(Connection $connection): void
{
    // DROP TABLE only in destructive migrations
}
```

Generate skeleton: `bin/console database:create-migration -p SwagExample --name ExampleDescription`

**EntityDefinition** (`src/Core/Content/Example/ExampleDefinition.php`):
```php
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\ApiAware;
use Shopware\Core\Framework\DataAbstractionLayer\Field\Flag\Required;
use Shopware\Core\Framework\DataAbstractionLayer\Field\{IdField, StringField, BoolField, CustomFields, CreatedAtField, UpdatedAtField};
use Shopware\Core\Framework\DataAbstractionLayer\FieldCollection;

class ExampleDefinition extends EntityDefinition
{
    public const ENTITY_NAME = 'swag_example';

    public function getEntityName(): string { return self::ENTITY_NAME; }
    public function getEntityClass(): string { return ExampleEntity::class; }
    public function getCollectionClass(): string { return ExampleCollection::class; }

    protected function defineFields(): FieldCollection
    {
        return new FieldCollection([
            (new IdField('id', 'id'))->addFlags(new Required(), new ApiAware()),
            (new StringField('name', 'name'))->addFlags(new ApiAware()),
            (new StringField('description', 'description'))->addFlags(new ApiAware()),
            (new BoolField('active', 'active'))->addFlags(new ApiAware()),
            new CustomFields(),
            new CreatedAtField(),
            new UpdatedAtField(),
        ]);
    }
}
```

**Entity** (`src/Core/Content/Example/ExampleEntity.php`):
```php
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityCustomFieldsTrait;
use Shopware\Core\Framework\DataAbstractionLayer\EntityIdTrait;

class ExampleEntity extends Entity
{
    use EntityIdTrait;
    use EntityCustomFieldsTrait;

    protected ?string $name = null;
    protected ?bool $active = null;

    public function getName(): ?string { return $this->name; }
    public function setName(?string $name): void { $this->name = $name; }
    public function isActive(): ?bool { return $this->active; }
    public function setActive(?bool $active): void { $this->active = $active; }
}
```

**EntityCollection** (`src/Core/Content/Example/ExampleCollection.php`):
```php
use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;

/** @extends EntityCollection<ExampleEntity> */
class ExampleCollection extends EntityCollection
{
    protected function getExpectedClass(): string { return ExampleEntity::class; }
}
```

**Service registration** (`services.xml`):
```xml
<service id="Swag\Example\Core\Content\Example\ExampleDefinition">
    <tag name="shopware.entity.definition" entity="swag_example"/>
</service>
```

Shopware auto-creates the `swag_example.repository` service. Inject it by that name.

---

### Event System

```php
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Shopware\Core\Content\Product\ProductEvents;
use Shopware\Core\Framework\DataAbstractionLayer\Event\EntityLoadedEvent;

class MySubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            ProductEvents::PRODUCT_LOADED_EVENT => 'onProductsLoaded',
            'product.written'                   => 'onProductWritten',
        ];
    }

    public function onProductsLoaded(EntityLoadedEvent $event): void
    {
        foreach ($event->getEntities() as $product) {
            // ...
        }
    }
}
```

Register with tag `kernel.event_subscriber` in `services.xml`.

**Important event families:**
- `EntityWrittenEvent` — after DAL writes (`product.written`, `order.written`, …)
- `SalesChannelContextCreatedEvent` — storefront context built
- `PageLoadedEvent` subtypes — page data assembled (add data here, not in controller)
- Business events (flow builder) — order placed, customer registered, etc.

> **Versioned entities note:** Some entities (orders, products) are versioned. Some events are only triggered on the "live" version.

#### Custom Events

Implement one of these interfaces:

| Interface | When to use |
|---|---|
| `ShopwareEvent` | Basic event with `Context` |
| `ShopwareSalesChannelEvent` | Extends `ShopwareEvent`, adds `SalesChannelContext` |
| `SalesChannelAware` | Provides `getSalesChannelId()` |

Dispatch via injected `EventDispatcherInterface` (`event_dispatcher` service ID):

```php
$this->eventDispatcher->dispatch(new MyCustomEvent($entity, $context));
```

---

### Storefront — Custom Controller + Page

Full pattern: Controller + Page Loader + Page + PageLoadedEvent.

```php
// src/Storefront/Controller/ExampleController.php
use Shopware\Core\PlatformRequest;
use Shopware\Storefront\Framework\Routing\StorefrontRouteScope;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\Routing\Attribute\Route;

#[Route(defaults: [PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [StorefrontRouteScope::ID]])]
class ExampleController extends StorefrontController
{
    public function __construct(private readonly ExamplePageLoader $pageLoader) {}

    #[Route(path: '/example', name: 'frontend.example.page', methods: ['GET'])]
    public function index(Request $request, SalesChannelContext $context): Response
    {
        $page = $this->pageLoader->load($request, $context);

        return $this->renderStorefront('@SwagExample/storefront/page/example/index.html.twig', [
            'page' => $page,
        ]);
    }
}
```

```php
// src/Storefront/Page/Example/ExamplePageLoader.php
class ExamplePageLoader
{
    public function __construct(
        private readonly GenericPageLoaderInterface $genericLoader,
        private readonly EventDispatcherInterface $eventDispatcher,
    ) {}

    public function load(Request $request, SalesChannelContext $context): ExamplePage
    {
        $page = ExamplePage::createFrom($this->genericLoader->load($request, $context));

        // Fetch data from Store API route, not repository directly
        $page->setExampleData(...);

        $this->eventDispatcher->dispatch(new ExamplePageLoadedEvent($page, $context, $request));

        return $page;
    }
}
```

> **Pattern:** Always use `GenericPageLoaderInterface` in page loaders — it loads navigation, header/footer, etc. Fire a `*PageLoadedEvent` so third parties can extend your page.

> **Route attributes:** Use PHP 8 `#[Route]` attributes (not annotations). Require both class-level `_routeScope` and method-level path/name attributes.

---

### Store API Route Pattern

Store API routes must follow the abstract/concrete/decorator pattern so third parties can decorate them.

```php
// AbstractExampleRoute.php
abstract class AbstractExampleRoute
{
    abstract public function getDecorated(): AbstractExampleRoute;
    abstract public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse;
}
```

```php
// ExampleRoute.php
#[Route(defaults: [PlatformRequest::ATTRIBUTE_ROUTE_SCOPE => [StoreApiRouteScope::ID]])]
class ExampleRoute extends AbstractExampleRoute
{
    public function __construct(private readonly EntityRepository $repository) {}

    public function getDecorated(): AbstractExampleRoute
    {
        throw new DecorationPatternException(self::class);
    }

    #[Route(path: '/store-api/example', name: 'store-api.example.search', methods: ['GET', 'POST'], defaults: ['_entity' => 'swag_example'])]
    public function load(Criteria $criteria, SalesChannelContext $context): ExampleRouteResponse
    {
        return new ExampleRouteResponse($this->repository->search($criteria, $context->getContext()));
    }
}
```

```php
// ExampleRouteResponse.php — extends StoreApiResponse
/** @property EntitySearchResult<ExampleCollection> $object */
class ExampleRouteResponse extends StoreApiResponse
{
    public function getExamples(): ExampleCollection
    {
        return $this->object->getEntities();
    }
}
```

The `DecorationPatternException` is thrown from `getDecorated()` when there is no decorator yet. Inject `AbstractExampleRoute` (not the concrete class) into dependents so decorators are used transparently.

---

### Service Decoration Pattern

Full abstract base + concrete + decorator:

```php
// AbstractExampleService.php
abstract class AbstractExampleService
{
    abstract public function getDecorated(): AbstractExampleService;
    abstract public function doSomething(): string;

    // Add new methods as non-abstract first, delegating to getDecorated()
    // Only make abstract after all decorators are updated
    public function doSomethingNew(): string
    {
        return $this->getDecorated()->doSomethingNew();
    }
}
```

```php
// ExampleService.php — concrete (throws DecorationPatternException)
class ExampleService extends AbstractExampleService
{
    public function getDecorated(): AbstractExampleService
    {
        throw new DecorationPatternException(self::class);
    }

    public function doSomething(): string { return 'original'; }
}
```

```php
// ExampleServiceDecorator.php
class ExampleServiceDecorator extends AbstractExampleService
{
    public function __construct(private readonly AbstractExampleService $decorated) {}

    public function getDecorated(): AbstractExampleService
    {
        return $this->decorated;
    }

    public function doSomething(): string
    {
        return $this->decorated->doSomething() . ' decorated';
    }
}
```

**DI registration** (`services.php`):
```php
$services->set(ExampleServiceDecorator::class)
    ->decorate(ExampleService::class)
    ->args([service('.inner')]);
```

> **Tag inheritance pitfall:** Decorating a service with `kernel.event_subscriber` automatically inherits that tag. Your decorator must then also implement `EventSubscriberInterface`. `inherit-tags="false"` is **not valid** XML in Symfony's schema. Solution: do not decorate event-subscriber-tagged services; use a separate subscriber instead.

---

### Storefront Templates (Twig)

Override by mirroring the path under `Resources/views/storefront/`:

```twig
{# Resources/views/storefront/layout/header/logo.html.twig #}
{% sw_extends '@Storefront/storefront/layout/header/logo.html.twig' %}

{% block layout_header_logo_link %}
    <h2>Hello world!</h2>
    {{ parent() }}
{% endblock %}
```

- Use `{% sw_extends %}` (not plain `{% extends %}`).
- `{{ parent() }}` keeps original content.
- Find block names in `vendor/shopware/storefront/Resources/views/`.
- [FroshDevelopmentHelper](https://github.com/FriendsOfShopware/FroshDevelopmentHelper) overlays block names directly in the rendered HTML.

**Pass data to template** via a Subscriber on the matching `*PageLoadedEvent`:

```php
public function onProductPageLoaded(ProductPageLoadedEvent $event): void
{
    $event->getPage()->assign(['myData' => 'value']);
}
```

> **Attribute rule:** All attributes of an HTML/Twig element must stay on **one line** — Shopware's HTML minifier breaks on multi-line attributes.

---

### Storefront JavaScript Plugin

```javascript
// Resources/app/storefront/src/my-plugin/my-plugin.plugin.js
const { PluginBaseClass } = window;   // use window, not import from src/plugin-system

export default class MyPlugin extends PluginBaseClass
{
    init()   // required entrypoint — called after DOMContentLoaded
    {
        this.el.addEventListener('click', this._onClick.bind(this));
    }

    _onClick(event)
    {
        console.log('clicked', this.el);
    }
}
```

Register in `main.js`:

```javascript
// Synchronous (included in main bundle)
window.PluginManager.register('MyPlugin', MyPlugin, '[data-my-plugin]');

// Async (lazy — only loaded when selector matches on page)
window.PluginManager.register(
    'MyPlugin',
    () => import('./my-plugin/my-plugin.plugin'),
    '[data-my-plugin]'
);
```

`this.el` is the matched DOM element. `init()` is the entrypoint; never put init logic in the constructor.

Build assets: `bin/console theme:compile` / via DDEV see `shopware-ddev` skill.

---

### Administration (Vue.js)

```javascript
// Resources/app/administration/src/main.js
import './module/swag-example';
```

```javascript
// module/swag-example/index.js
import './page/swag-example-list';
import deDE from './snippet/de-DE';
import enGB from './snippet/en-GB';

Shopware.Module.register('swag-example', {
    type: 'plugin',
    name: 'SwagExample',
    title: 'swag-example.general.mainMenuItemGeneral',
    color: '#ff3d58',
    icon: 'regular-shopping-bag',

    snippets: { 'de-DE': deDE, 'en-GB': enGB },

    routes: {
        list: {
            component: 'swag-example-list',
            path: 'list',
            meta: { privilege: 'swag_example.viewer' }
        },
    },

    navigation: [{
        id: 'swag-example',
        label: 'swag-example.general.mainMenuItemGeneral',
        color: '#ff3d58',
        path: 'swag.example.list',
        icon: 'regular-shopping-bag',
        parent: 'sw-catalogue',  // inject under Catalogue menu
        position: 100,
        privilege: 'swag_example.viewer'
    }],
});
```

#### Admin — Data Handling (repositoryFactory)

```javascript
// In component:
inject: ['repositoryFactory'],

computed: {
    productRepository() {
        return this.repositoryFactory.create('product');
    },
},

created() {
    const { Criteria } = Shopware.Data;
    const criteria = new Criteria();
    criteria.addFilter(Criteria.equals('active', true));
    criteria.addSorting(Criteria.sort('name', 'ASC'));
    criteria.setLimit(25);

    this.productRepository
        .search(criteria, Shopware.Context.api)
        .then(result => { this.products = result; });
},
```

For new entities: `this.repo.create(Shopware.Context.api)`, then `this.repo.save(entity, context)`.
For delete: `this.repo.delete(id, context)`.

#### Admin — Override / Extend Components

```javascript
// Override (replace in-place):
Shopware.Component.override('sw-dashboard-index', { template });

// Extend (new component based on existing):
Shopware.Component.extend('sw-custom-field', 'sw-text-field', { template });
```

Use `this.$super('methodName')` to call the original method:

```javascript
methods: {
    categoryCriteria() {
        const criteria = this.$super('categoryCriteria');
        criteria.addAssociation('translations.linkMedia');
        return criteria;
    },
}
```

In Twig templates, use `{% parent %}` to include original block content:

```twig
{% block card_content %}
    {% parent %}
    <div>My addition</div>
{% endblock %}
```

#### Admin — Extending Entity Criteria

To add an association when a detail page loads an entity, override the component's criteria computed property:

```javascript
Shopware.Component.override('sw-category-detail', {
    computed: {
        categoryCriteria() {
            const criteria = this.$super('categoryCriteria');
            criteria.addAssociation('translations.linkMedia');
            return criteria;
        },
    },
});
```

Find the right computed/method name by searching for `addAssociation` inside the component's source at `src/Administration/Resources/app/administration/src/module/`.

#### Admin — ACL Permissions

```javascript
// acl/index.js
Shopware.Service('privileges').addPrivilegeMappingEntry({
    category: 'permissions',
    parent: 'catalogues',
    key: 'swag_example',
    roles: {
        viewer:  { privileges: ['swag_example:read'], dependencies: [] },
        editor:  { privileges: ['swag_example:update'], dependencies: ['swag_example.viewer'] },
        creator: { privileges: ['swag_example:create'], dependencies: ['swag_example.viewer', 'swag_example.editor'] },
        deleter: { privileges: ['swag_example:delete'], dependencies: ['swag_example.viewer'] },
    },
});
```

Check in templates: `v-if="acl.can('swag_example.editor')"`. Inject `acl` service to use in JS: `inject: ['acl']`.

---

### Plugin Configuration (`config.xml`)

Creates a settings form in the Administration without custom Vue components.

```xml
<!-- src/Resources/config/config.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<config xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/System/SystemConfig/Schema/config.xsd">

    <card>
        <title>Basic Configuration</title>
        <title lang="de-DE">Grundeinstellungen</title>

        <input-field>
            <name>myTextValue</name>
            <label>Label EN</label>
            <label lang="de-DE">Label DE</label>
            <helpText>Help text EN</helpText>
            <defaultValue>default</defaultValue>
        </input-field>

        <input-field type="single-select">
            <name>mailMethod</name>
            <options>
                <option><id>smtp</id><name>SMTP</name></option>
                <option><id>pop3</id><name>POP3</name></option>
            </options>
            <defaultValue>smtp</defaultValue>
            <label>Mail method</label>
        </input-field>

        <input-field type="bool">
            <name>enabled</name>
            <defaultValue>true</defaultValue>
            <label>Enabled</label>
        </input-field>
    </card>
</config>
```

**Available field types:** `text`, `textarea`, `text-editor`, `url`, `password`, `int`, `float`, `bool`, `checkbox`, `datetime`, `colorpicker`, `single-select`, `multi-select`, `media-selection`.

**Reading config in PHP:**

```php
// Inject: Shopware\Core\System\SystemConfig\SystemConfigService
$this->systemConfigService->get('SwagExample.config.myTextValue');
$this->systemConfigService->getString('SwagExample.config.myTextValue');
$this->systemConfigService->getBool('SwagExample.config.enabled');
$this->systemConfigService->getInt('SwagExample.config.myIntValue');
```

---

### Custom Fields

Custom fields extend existing entities without a full entity extension. They store scalar values in a JSON column. For associations, use an EntityExtension instead.

**Add custom fields via plugin lifecycle:**

```php
// Inject custom_field_set.repository
$this->customFieldSetRepository->create([[
    'name' => 'swag_example_set',
    'config' => ['label' => ['en-GB' => 'Example Set', 'de-DE' => 'Beispiel Set']],
    'customFields' => [[
        'name' => 'swag_example_field',
        'type' => CustomFieldTypes::TEXT,
        'config' => ['label' => ['en-GB' => 'Example Field', 'de-DE' => 'Beispiel Feld']],
    ]],
    'relations' => [['entityName' => 'product']],
]], $context);
```

Available `CustomFieldTypes` constants: `TEXT`, `TEXTAREA`, `INT`, `FLOAT`, `BOOL`, `DATETIME`, `COLOR`, `MEDIA`, `SELECT`, `ENTITY_SELECT`, `HTML`, `PRICE`.

---

### Scheduled Tasks

```php
// src/Service/ScheduledTask/ExampleTask.php
use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTask;

class ExampleTask extends ScheduledTask
{
    public static function getTaskName(): string { return 'swag.example_task'; }
    public static function getDefaultInterval(): int { return 300; } // seconds
}
```

```php
// src/Service/ScheduledTask/ExampleTaskHandler.php — 6.6+ syntax
use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTaskHandler;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler(handles: ExampleTask::class)]
class ExampleTaskHandler extends ScheduledTaskHandler
{
    public function run(): void
    {
        // task logic
    }
}
```

> **6.6 breaking change:** `getHandledMessages()` static method removed from `ScheduledTaskHandler`. Use `#[AsMessageHandler(handles: MyTask::class)]` attribute.

Register both with tags (`services.php`):

```php
$services->set(ExampleTask::class)->tag('shopware.scheduled.task');
$services->set(ExampleTaskHandler::class)->tag('messenger.message_handler');
```

---

### Custom CMS Elements (Erlebniswelten)

Custom CMS elements require a PHP DataResolver, a DI registration, and an admin JS module.

#### PHP — Two Resolver Patterns

**Pattern A — Extend `TextCmsElementResolver`** (text/content fields):

```php
use Shopware\Core\Content\Cms\DataResolver\Element\TextCmsElementResolver;

class HeadlineCmsElementResolver extends TextCmsElementResolver
{
    public function getType(): string { return 'lnx-headline'; }
}
```

DI: inject `Shopware\Core\Framework\Util\HtmlSanitizer` as first argument.

**Pattern B — Implement `CmsElementResolverInterface`** (elements needing DAL queries):

```php
use Shopware\Core\Content\Cms\DataResolver\Element\CmsElementResolverInterface;
use Shopware\Core\Content\Cms\DataResolver\Element\ElementDataCollection;
use Shopware\Core\Content\Cms\DataResolver\ResolverContext\ResolverContext;
use Shopware\Core\Framework\Struct\ArrayStruct;

class PdfSectionCmsElementResolver implements CmsElementResolverInterface
{
    public function __construct(
        private readonly EntityRepository $mediaFolderRepository,
        private readonly EntityRepository $mediaRepository,
    ) {}

    public function getType(): string { return 'lnx-pdf-katalog-section'; }

    public function collect(CmsSlotEntity $slot, ResolverContext $resolverContext): ?CriteriaCollection
    {
        return null; // resolve everything in enrich()
    }

    public function enrich(CmsSlotEntity $slot, ResolverContext $resolverContext, ElementDataCollection $result): void
    {
        $folderName = (string) ($slot->getFieldConfig()->get('folderName')?->getValue() ?? '');

        if ($folderName === '') {
            $slot->setData(new ArrayStruct(['media' => []]));
            return;
        }

        $context = $resolverContext->getSalesChannelContext()->getContext();
        // ... DAL queries ...
        $slot->setData(new ArrayStruct(['media' => $media->getElements()]));
    }
}
```

#### DI Registration (`cms.xml`)

```xml
<service id="Vendor\Plugin\...\HeadlineCmsElementResolver">
    <argument type="service" id="Shopware\Core\Framework\Util\HtmlSanitizer" />
    <tag name="shopware.cms.data_resolver" />
</service>

<service id="Vendor\Plugin\...\PdfSectionCmsElementResolver">
    <argument type="service" id="media_folder.repository" />
    <argument type="service" id="media.repository" />
    <tag name="shopware.cms.data_resolver" />
</service>
```

Tag: `shopware.cms.data_resolver` — required on every resolver.

#### Admin JS Structure

```
module/sw-cms/
├── index.js                        ← imports all elements
└── element/
    └── lnx-headline/
        ├── index.js                ← registerCmsElement() + component registration
        ├── component/index.js
        ├── config/index.js
        └── preview/index.js
```

**`element/lnx-headline/index.js`:**
```javascript
Shopware.Component.register('lnx-cms-el-headline', () => import('./component'));
Shopware.Component.register('lnx-cms-el-config-headline', () => import('./config'));
Shopware.Component.register('lnx-cms-el-preview-headline', () => import('./preview'));

Shopware.Service('cmsService').registerCmsElement({
    name: 'lnx-headline',
    label: 'sw-cms.elements.headline.label',
    component: 'lnx-cms-el-headline',
    configComponent: 'lnx-cms-el-config-headline',
    previewComponent: 'lnx-cms-el-preview-headline',
    defaultConfig: {
        content: { source: 'static', value: 'Lorem ipsum dolor sit amet.' },
        level:   { source: 'static', value: 'h1' },
    },
});
```

**Component/config `index.js`** — always call `initElementConfig()`:
```javascript
import { Mixin } = Shopware;
export default {
    template,
    mixins: [Mixin.getByName('cms-element')],
    created() {
        this.initElementConfig('lnx-headline'); // must be called in BOTH component and config
    },
};
```

**Auto-mapping** (product.name / category.name based on page type):
```javascript
created() {
    this.initElementConfig('lnx-headline');
    const pageType = this.cmsPageState?.currentPage?.type ?? '';
    if (pageType === 'product_detail' && !this.element?.translated?.config?.content) {
        this.element.config.content.source = 'mapped';
        this.element.config.content.value = 'product.name';
    } else if (pageType === 'product_list' && !this.element?.translated?.config?.content) {
        this.element.config.content.source = 'mapped';
        this.element.config.content.value = 'category.name';
    }
},
```

**Storefront template** (`Resources/views/storefront/element/cms-element-lnx-headline.html.twig`):
```twig
{% block element_lnx_headline %}
    <{{ element.config.level.value }}>{{ element.data.content }}</{{ element.config.level.value }}>
{% endblock %}
```

Access slot config via `element.config.*`, resolved data via `element.data.*`.

#### Key Rules

- Element `name` in `registerCmsElement` must exactly match PHP `getType()`.
- `initElementConfig()` must be called in both `component` and `config`.
- `source: 'static'` for user-entered values; `source: 'mapped'` for entity field references.
- Config field values in PHP: `$slot->getFieldConfig()->get('fieldName')?->getValue()`.

#### CMS Block

Blocks define layout structure (which elements go in which slots). Register with `registerCmsBlock`:

```javascript
Shopware.Service('cmsService').registerCmsBlock({
    name: 'image-text-reversed',
    category: 'text-image',    // text | image | text-image | commerce | form | video | sidebar
    label: 'cms.blocks.imageTextReversed.label',
    component: 'cms-block-image-text-reversed',
    previewComponent: 'cms-block-preview-image-text-reversed',
    defaultConfig: { marginBottom: '20px', marginTop: '20px', sizingMode: 'boxed' },
    slots: { left: 'text', right: 'image' },
});
```

Storefront block template (`storefront/block/cms-block-image-text-reversed.html.twig`):
```twig
<div class="col-md-6">
    {% set element = block.slots.getSlot('left') %}
    {% sw_include '@Storefront/storefront/element/cms-element-' ~ element.type ~ '.html.twig' with { 'element': element } %}
</div>
<div class="col-md-6">
    {% set element = block.slots.getSlot('right') %}
    {% sw_include '@Storefront/storefront/element/cms-element-' ~ element.type ~ '.html.twig' with { 'element': element } %}
</div>
```

---

## Shopware 6 Version Compatibility Matrix

### Node.js & npm

| SW Version | Min. Node.js | npm |
|------------|-------------|-----|
| 6.4.x | ≥ 12.21.0 | ^8.0.0 |
| 6.5.x | **≥ 18** | ^8.0.0 \|\| ^9.0.0 |
| 6.6.x | **≥ 20** | ≥ 10.0.0 |
| 6.7.x | ≥ 20 | ≥ 10.0.0 |

**Breaking jumps:** 6.4→6.5 requires Node 16→18. 6.5→6.6 requires 18→20.

### PHP

| SW Version | PHP Versions |
|------------|-------------|
| 6.4.x | ^7.4.3 \|\| ^8.0 |
| 6.5.x | ~8.1 \|\| ~8.2 \|\| ~8.3 |
| 6.6.x | **min. 8.2** (~8.2 \|\| ~8.3) |
| 6.7.x | ~8.2 \|\| ~8.4 |

### MySQL & MariaDB

| SW Version | MySQL | MariaDB |
|------------|-------|---------|
| 6.4.x | 5.7+ or 8.0 | 10.3+ |
| 6.5.x | 8.0 | 10.4–11.0 (tested) |
| 6.6.x | **min. 8.0** | **min. 10.11** (requires `JSON_OVERLAPS`) |
| 6.7.x | 8.0+ | 11.x |

### Admin Build System

| SW Version | Vue | Build Tool | Bootstrap |
|------------|-----|-----------|-----------|
| 6.4 / 6.5 | Vue 2 | Webpack 4 | 4.x |
| 6.6.x | **Vue 3** | **Webpack 5** | 5.x |
| 6.7.x | Vue 3 | **Vite** | 5.3.3 |

> **Pitfall:** `bin/build-administration.sh` was removed in SW 6.6+. Correct approach: `bin/console bundle:dump` then `cd src/Administration/Resources/app/administration && PROJECT_ROOT=/var/www/html npm run build`.

> **6.7 Admin build:** Vite replaces Webpack. Custom webpack configs must be migrated.

---

## Breaking Changes by Version (Plugin Developer Impact)

### 6.4.0.0
- PHP minimum raised to **7.4** (`sodium` extension now required)
- Route annotations deprecated (`@Captcha`, `@RouteScope`, etc.) → use Symfony Route `defaults`
- `AbstractMessageHandler` deprecated → implement `MessageSubscriberInterface`

### 6.5.0.0
- `AbstractMessageHandler` **removed**
- **Bootstrap 5 upgrade**: data attributes renamed (`data-toggle` → `data-bs-toggle`), JS plugins refactored, CSS classes changed. Twig blocks preserved.
- Auto-loaded DAL associations **removed** — must explicitly add via `$criteria->addAssociation()`:
  - `order.stateMachineState`, `order_transaction.stateMachineState`, `order_delivery.stateMachineState`
  - `order_delivery.shippingOrderAddress`, `tax_rule.type`, `import_export_log.file`

### 6.6.0.0
- **Symfony 7 upgrade** — breaks code relying on removed Symfony 6 APIs
- **PHPUnit 10+**
- **PHP 8.1 dropped** — minimum is now 8.2
- **MySQL 5.7 dropped** — minimum is now MySQL 8.0 / MariaDB 10.11
- **Vue 3 upgrade** — `v-model` → `v-model:value` on custom components; `vue-meta` removed; event names renamed
- **Webpack 5** — plugins with custom webpack config must migrate to Webpack 5 API
- `ScheduledTaskHandler::getHandledMessages()` removed → use `#[AsMessageHandler]` attribute
- `EntityExtension::getDefinitionClass()` deprecated → use `getEntityName()`
- HTTP Cache classes marked `@internal` — decorate via events instead
- Session access in tests: use `session.factory` service

### 6.7.0.0
- **Vite replaces Webpack** for admin build
- **Vuex fully replaced by Pinia** across all core stores
- **All PHP class properties now have native types** — subclasses must match
- **Payment handlers consolidated** into single `AbstractPaymentHandler`; old interfaces deprecated
- `technicalName` required (non-nullable) for payment/shipping methods
- `AccountService::login()` removed → use `loginByCredentials()` / `loginById()`
- `SystemConfigService::trace()` / `getTrace()` deprecated (no-op)
- `SystemConfig` exception classes deprecated → use factory methods on `SystemConfigException`
- **Axios 1.x migration** in admin (`CancelToken` → `AbortController`); default still 0.x in 6.7, becomes 1.x in 6.8
- Twig `spaceless` filter removed

### Vue 2 → Vue 3 (6.5 → 6.6)

| Aspect | Vue 2 (≤ 6.5) | Vue 3 (≥ 6.6) |
|--------|--------------|--------------|
| `v-model` on custom component | `v-model="val"` | `v-model:value="val"` |
| Template event name | `@change` | renamed to specific event |
| `vue-meta` | supported | removed (only `title` via own impl) |

For plugins supporting both version ranges: maintain two separate admin templates.

---

## EntityExtension — Version Compatibility

| Version | Abstract method |
|---------|----------------|
| 6.4 / 6.5 | `getDefinitionClass(): string` → returns FQCN, e.g. `CategoryDefinition::class` |
| 6.6 | Both (deprecated `getDefinitionClass()`) |
| 6.7 | `getEntityName(): string` → returns entity name, e.g. `'category'` |

**Cross-version plugin (6.4–6.7):** implement both — PHP does not complain about extra non-abstract methods.

---

## Common Gotchas

1. **SW6 DAL — never use raw SQL** for entity data. Use repositories. Direct DBAL only for reporting/aggregations.
2. **SW6 context** — always pass `Context` or `SalesChannelContext` down; never instantiate `Context::createDefaultContext()` in production code (bypasses ACL).
3. **SW5 cache** — call `$context->scheduleClearCache()` in install/update/activate or changes won't appear.
4. **SW6 Twig** — use `{% sw_extends %}` not `{% extends %}` for storefront templates.
5. **SW6 JS** — `PluginBaseClass` comes from `window`, not from an import path.
6. **Don't call `.first()` on aggregation results** — you need the `EntitySearchResult` object.
7. **Upsert requires an ID** — without an ID, every `upsert()` call creates a new record.
8. **ManyToMany updates** — update through the owning entity, not through the mapping repository.
9. **Custom entity tag** — `shopware.entity.definition` entity attribute must match `ENTITY_NAME` constant.
10. **CMS `initElementConfig()`** — must be called in both component AND config; skipping causes undefined config values.
11. **Store API abstract pattern** — always create Abstract → Concrete → optional Decorators; inject `AbstractXRoute` in consumers.

---

## Common Problems & Solutions (SW6)

### Plugin / Service Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Plugin not visible in admin after upload | `plugin:refresh` not run | `bin/console plugin:refresh` |
| "Service X does not exist" | Service not registered or container not rebuilt | `bin/console cache:clear`, check `services.xml` |
| Entity definition not found | Missing service tag | Add `<tag name="shopware.entity.definition"/>` |
| Subscriber not firing | Missing `kernel.event_subscriber` tag | Add tag in `services.xml` |
| `foreach() argument must be of type array` on plugin:refresh | `manufacturerLink` / `supportLink` set as plain string | Use locale-keyed object: `{"de-DE": "...", "en-GB": "..."}` |
| Custom field not in admin | Plugin not updated after adding field | `bin/console plugin:update PluginName` |
| Migration not executed | Not run after install | `bin/console database:migrate --all` |

### Template / Frontend Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Twig override has no effect | Wrong path, or using `{% extends %}` instead of `{% sw_extends %}` | Mirror path from `vendor/shopware/storefront/Resources/views/`, use `{% sw_extends %}` |
| JS plugin not initialising | Selector not matching, or assets not rebuilt | Check `data-*` attribute; run `bin/console theme:compile` |
| Admin changes not visible | Admin assets not rebuilt | `bin/console bundle:dump` then `npm run build` (see `shopware-ddev` skill) |
| `{{ myData }}` undefined in template | Data not passed via PageLoadedEvent subscriber | Subscribe to correct `*PageLoadedEvent`, call `$event->getPage()->assign()` |

### Cache & Performance Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Stale data in storefront | HTTP cache not purged | `bin/console cache:pool:clear cache.http` |
| Config changes not active | Cache not cleared | `bin/console cache:clear` |
| Scheduled tasks not running | Messenger queue not consumed | `bin/console messenger:consume` (or configure a worker) |

### Installation / Upgrade Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `JSON_OVERLAPS` SQL error on SW 6.6 | MariaDB below 10.11 | Upgrade MariaDB to 10.11+ (snapshot first!) |
| `APP_SECRET` missing error | `.env` not set up | Copy `.env.dist` → `.env`; `bin/console system:generate-app-secret` |
| White page / 500 after update | Plugin incompatible with new SW version | Deactivate plugins one by one; check `var/log/` |
| Build fails: `paths[0] must be of type string` | `bundle:dump` not run before admin build | Run `bin/console bundle:dump` first |

### Common SW5 Problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| Template override ignored | Cache not cleared or wrong file path | `bin/console sw:cache:clear`, verify path mirrors core |
| Event not firing | Wrong event name | Use `Enlight_Controller_Action_PostDispatchSecure_Frontend_<ControllerName>` |
| Plugin not appearing | Class name doesn't match directory | Both must be identical: `SwagExample/SwagExample.php` |
| Hook not called | `shopware.hook` tag missing | Add `<tag name="shopware.hook"/>` |

---

## Frequently Used Dev Tools & Plugins (SW6)

| Tool | Purpose |
|------|---------|
| **FroshDevelopmentHelper** | Debug bar, Twig block name overlay, DAL query log |
| **FroshTools** | Admin UI for cache, queue, feature flags, log viewer |
| **Symfony Profiler** | HTTP request profiler (`/_profiler`), available in `APP_ENV=dev` |
| **SwagPlatformDemoData** | Demo products, categories, customers for fresh installs |

### `.env.local` for Development

```dotenv
APP_ENV=dev
APP_DEBUG=1
APP_SECRET=your-generated-secret
DATABASE_URL="mysql://root:root@db:3306/shopware"
SHOPWARE_HTTP_CACHE_ENABLED=0
SHOPWARE_HTTP_DEFAULT_TTL=0
```

### Useful `bin/console` Commands

```bash
bin/console debug:container | grep product          # Find services by keyword
bin/console debug:event-dispatcher | grep cart      # Find events by keyword
bin/console debug:router                             # All registered routes
bin/console feature:config                           # Show feature flags
bin/console system:config:get SwagExample.config.myKey
bin/console system:config:set SwagExample.config.myKey value
bin/console sales-channel:list
bin/console user:change-password admin
```

---

## Shopware 5

### Architecture

Built on **Enlight** (custom MVC framework) + Symfony DIC + Zend components. Backend uses ExtJS.

| Layer | Technology |
|-------|-----------|
| Frontend | Smarty templates (`.tpl`) |
| Backend | ExtJS 4 |
| Framework | Enlight (MVC + event bus) |
| DI | Symfony DIC via `services.xml` |

### Plugin Structure (SW 5.2+)

```
SwagExample/
├── Resources/
│   ├── services.xml
│   ├── config.xml
│   └── views/frontend/
├── Subscriber/
├── Components/
├── plugin.xml
└── SwagExample.php
```

**Plugin class** (extends `Shopware\Components\Plugin`):
```php
class SwagExample extends Plugin
{
    public function install(InstallContext $context): void
    {
        $context->scheduleClearCache(InstallContext::CACHE_LIST_ALL);
    }

    public function uninstall(UninstallContext $context): void
    {
        if ($context->keepUserData()) { return; }
        // drop custom tables/attributes here
    }
}
```

### Enlight Event System

```php
public static function getSubscribedEvents(): array
{
    return [
        'Enlight_Controller_Action_PostDispatchSecure_Frontend_Detail' => 'onProductDetail',
        'Enlight_Controller_Action_PreDispatch_Frontend'               => 'onFrontendPreDispatch',
        'Shopware_Modules_Basket_AddArticle_Start'                     => 'onAddToCart',
    ];
}

public function onProductDetail(\Enlight_Event_EventArgs $args): void
{
    $view = $args->getSubject()->View();
    $view->assign('myVariable', 'value');
}
```

### Hook System (SW5)

Hooks intercept specific class methods. Use when no event exists.

```php
// services.xml: tag="shopware.hook"
class ArticleListHook extends \Enlight_Hook_HookHandler
{
    public function afterGetArticleById(\Enlight_Hook_HookArgs $args): void
    {
        $return = $args->getReturn();
        // modify $return
        $args->setReturn($return);
    }
}
```

Hook types: `before`, `after`, `replace` (`replace` calls `executeParent()` to chain).

### Smarty Templates (SW5)

```smarty
{* Resources/views/frontend/detail/index.tpl *}
{extends file="parent:frontend/detail/index.tpl"}

{block name="frontend_detail_index_detail_inner"}
    <div class="custom-badge">Sale!</div>
    {$smarty.block.parent}
{/block}
```

---

## SW5 vs SW6 — Key Differences

| Aspect | Shopware 5 | Shopware 6 |
|--------|-----------|-----------|
| Framework | Enlight + Symfony DIC | Full Symfony |
| Templates | Smarty (`.tpl`) | Twig (`.html.twig`) |
| Backend | ExtJS 4 | Vue.js (Meteor) |
| Data layer | Doctrine ORM + direct SQL | DAL (no raw Doctrine) |
| Events | Enlight string-based | PHP class-based |
| Plugin entry | `Plugin.php` + `plugin.xml` | `Plugin.php` + `composer.json` |
| Hooks | Yes (Enlight Hook) | No — use DAL events or decoration |
| Context | `Shopware()->Shop()` | `Context` / `SalesChannelContext` |
| Assets | LESS + Grunt | SCSS + Webpack/Vite |
| API | REST (`/api/v1/`) | Store API + Admin API (JSON:API) |

---

## Shopware Composable Frontends (Headless)

Headless Vue 3 + Nuxt storefront that communicates exclusively via the **Store API**. Successor to the archived `shopware-pwa` (Vue Storefront). Fully replaces the classic Twig-based Storefront.

> **shopware-pwa is archived** (Oct 2024). All new headless work uses **Shopware Composable Frontends** (`@shopware/*` packages).

### Architecture

| Package | npm | Purpose |
|---------|-----|---------|
| API Client | `@shopware/api-client` | Typed Store API abstraction, auth/context-token management |
| Composables | `@shopware/composables` | Vue 3 composables: `useProduct`, `useCart`, `useListing`, `useCustomer`, etc. |
| CMS Base Layer | `@shopware/cms-base-layer` | Vue components for all default CMS sections/blocks/elements |
| Helpers | `@shopware/helpers` | Price formatting, translations, URL handling |
| Nuxt Module | `@shopware/nuxt-module` | Wires up API client + composables + context for Nuxt |
| API Gen CLI | `@shopware/api-gen` | Generates TypeScript types from your Shopware instance's API schema |

**Tech stack:** Vue 3 + Nuxt 4 + TypeScript + UnoCSS/Tailwind. SSR by default.

### vs. Classic Storefront (Twig)

| Aspect | Classic Storefront | Composable Frontends |
|--------|-------------------|---------------------|
| Rendering | PHP/Twig (server) | Vue/Nuxt (Node.js SSR) |
| Extension | Twig blocks, PHP events | Vue components, Nuxt layers |
| Deployment | Same process as Shopware | Separate Node.js application |
| CMS customization | PHP DataResolver + Twig template | Vue component (naming convention) |
| Plugin effects | Subscribers, decorators, Twig | No effect — Store API only |
| Styling | SCSS + Shopware theme system | Free choice (Tailwind, UnoCSS, etc.) |

### CMS Component Resolution

The Store API returns a nested CMS tree. Each node's `type` is converted to a PascalCase Vue component:

```
CMS type "image-text" → component CmsBlockImageText
CMS type "product-listing" → component CmsElementProductListing
```

Custom CMS blocks from backend plugins have **no Vue implementation by default** — you must create them manually.

### Composable Frontends Gotchas

1. **Sales Channel type must be "Storefront"** — Do NOT use the "Headless" type. The Headless type does not generate SEO URLs. This is counterintuitive but required for proper URL resolution.

2. **`devStorefrontUrl` for local dev** — Customer registration requires a `storefrontUrl` matching a domain in Admin > Sales Channel > Domains. Set in `nuxt.config.ts`:
   ```typescript
   shopware: {
       devStorefrontUrl: 'https://your-production-domain.com',
   }
   ```
   Or via env: `NUXT_PUBLIC_SHOPWARE_DEV_STOREFRONT_URL`.

3. **Store API access token is public** — The token appears in client-side code. Only data visible on a normal storefront should be exposed. Use a Vite proxy for production to hide the backend URL:
   ```typescript
   vite: {
       server: {
           proxy: {
               '/store-api': {
                   target: 'https://your-shopware-backend.com',
                   changeOrigin: true,
                   secure: false,
               },
           },
       },
   }
   ```

4. **SSR + DDEV self-signed certs** — SSR causes 500 errors because Node.js rejects self-signed SSL certificates. Workaround (dev only):
   ```dotenv
   NODE_TLS_REJECT_UNAUTHORIZED=0
   ```

5. **CORS with local frontend** — Frontend at `localhost:3000` is cross-origin to the Shopware backend. Fix with server-side proxy (see above) or set `Access-Control-Allow-Origin` on the backend.

6. **Custom CMS blocks not rendered** — Only default Shopware CMS blocks have Vue implementations in `@shopware/cms-base-layer`. Plugin-added blocks must be manually implemented as Vue components following the `CmsBlock<PascalCaseType>` / `CmsElement<PascalCaseType>` naming convention.

7. **Missing `createShopwareContext`** — Occurs when `@shopware/nuxt-module` is installed but the composables layer is not extended. Fix:
   ```typescript
   // nuxt.config.ts
   extends: ['@shopware/composables/nuxt-layer'],
   ```

8. **Type generation recommended** — Default types may not match your instance's custom entities. Run `@shopware/api-gen` against your Shopware instance for accurate TypeScript types.

9. **Demo Store Template is deprecated** — Use the Vue Starter Template with Nuxt layers pattern instead.

10. **No automated migration from shopware-pwa** — Package names changed (`@shopware-pwa/*` → `@shopware/*`), composable API signatures differ, Vue 2→3 and Nuxt 2→4 migration required. Effectively a frontend rewrite.

11. **Routing via `useNavigationSearch`** — Uses Shopware's `SeoUrl` system. A catch-all route resolves the path to one of three types: `frontend.detail.page` (product), `frontend.navigation.page` (category), `frontend.landing.page` (landing page).

12. **API Client hooks** — Use `onContextChanged`, `onResponseError`, `onSuccessResponse` for global request/response handling. The client manages the `sw-context-token` cookie automatically.
