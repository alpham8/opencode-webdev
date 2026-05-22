---
name: shopware-utils
description: Use when working with the dustin/shopware-utils library in Shopware 6 plugins — creating Plugin or AdditionalBundle classes, registering bundles, themes, migrations, configuration objects, or auto-installing resources (custom fields, document types, payment methods, mail templates).
---

# dustin/shopware-utils

Library for structuring large Shopware 6 plugins with sub-bundles, auto-resource installation, and config-as-service.

Docs: https://dustinsimon.gitbook.io/shopware-utils

## Installation

```bash
composer require dustin/shopware-utils
```

---

## Plugin & AdditionalBundle

Use `Dustin\ShopwareUtils\Core\Framework\Plugin` instead of the Shopware base class. Sub-features go into `AdditionalBundle` classes — same lifecycle hooks as a plugin, but invisible in admin and always activated with the main plugin.

### Plugin (main class)

```php
use Dustin\ShopwareUtils\Core\Framework\Plugin;

class MyPlugin extends Plugin
{
    protected function createAdditionalBundles(): array
    {
        return [
            new MyFeatureBundle(),
            new ShopwareUtils(),   // always include
        ];
    }

    public function getTablesToRemove(): array
    {
        return ['my_table', 'my_other_table'];  // dropped on uninstall
    }
}
```

### AdditionalBundle

```php
use Dustin\ShopwareUtils\Core\Framework\AdditionalBundle;

class MyFeatureBundle extends AdditionalBundle
{
    // install(), activate(), update() available — same signature as Plugin
    public function getTablesToRemove(): array
    {
        return ['feature_table'];
    }
}
```

**Rules:**
- Bundle subdirectory name **must match** the class name (e.g. `MyFeatureBundle/`)
- Bundles share the parent plugin's install/activate lifecycle
- Not visible as separate plugins in Shopware admin

---

## Themes

Implement `ThemeInterface` on Plugin or AdditionalBundle. One theme per bundle max.

```php
use Dustin\ShopwareUtils\Core\Framework\Plugin;          // or AdditionalBundle
use Shopware\Storefront\Framework\ThemeInterface;

class MyThemePlugin extends Plugin implements ThemeInterface {}
```

> Bundle directory name must equal class name — required for theme asset resolution.

---

## Migrations

Migrations live in `Migration/` of the plugin or bundle. Create via console:

```bash
# For a plugin
bin/console database:create-migration --plugin MyPlugin --name MyMigration

# For an AdditionalBundle
bin/console database:create-migration --bundle MyFeatureBundle --name MyMigration
```

Tables listed in `getTablesToRemove()` are automatically deleted on uninstall (DELETE → DROP in order).

---

## Configuration (config.xml as service)

All XML files in `Resources/config/` — except `services.xml` and `routes.xml` — are treated as Shopware plugin config files and auto-installed with their default values. Values are deleted on uninstall.

**Use config as injected service:**

`Resources/config/services.yaml`:
```yaml
services:
    MyPlugin\Config\MyConfig:
        factory: ['@Dustin\ShopwareUtils\Core\System\SystemConfiguration\ConfigurationFactory', 'create']
        arguments:
            - 'MyPlugin'          # plugin name / config scope
            - !tagged_iterator my_plugin.config
```

Config class:
```php
use Dustin\ShopwareUtils\Core\System\SystemConfiguration\Configuration;

class MyConfig extends Configuration
{
    public function getMyValue(): string
    {
        return $this->get('MyPlugin.config.myValue');
    }
}
```

---

## Auto-installing Resources

All resources are installed/updated via `bin/console plugin:update <PluginName>`.

### Custom Fields — `Resources/custom_fields/<name>.json`

```json
{
    "name": "my_custom_field_set",
    "editable": false,
    "label": { "de-DE": "Mein Set", "en-GB": "My set" },
    "translated": true,
    "position": 1,
    "customFields": {
        "my_field": {
            "type": "text",
            "label": { "de-DE": "Feld", "en-GB": "Field" }
        }
    },
    "relations": ["product", "category"]
}
```

Installed, updated, and **removed on uninstall** automatically.

### Document Types — `Resources/document_types/<technicalName>.json`

```json
{
    "technicalName": "my_document_type",
    "fileNamePrefix": "doc_",
    "translations": { "de-DE": { "name": "Mein Typ" }, "en-GB": { "name": "My type" } }
}
```

Not uninstalled if in use.

### Payment Methods — `Resources/payment_methods/<technicalName>.json`

```json
{
    "technicalName": "my_payment",
    "handlerIdentifier": "My\\Payment\\Handler",
    "active": true,
    "media": "logo.png",
    "translations": { "de-DE": { "name": "Zahlung" }, "en-GB": { "name": "Payment" } }
}
```

`position`, `active`, `name`, `description` — installed only, **not updated** (editable in admin).

### Mail Template Types — `Resources/mail_template_types/<technicalName>.json`

```json
{
    "technicalName": "my_mail_type",
    "availableEntities": { "customer": "customer" },
    "translations": { "de-DE": { "name": "Mein Typ" }, "en-GB": { "name": "My type" } }
}
```

Not uninstalled if in use.

### Mail Templates — `Resources/mail_templates/` (5 files per template)

```
<name>.json
<name>.de-DE.twig          ← plain text
<name>.de-DE.html.twig     ← HTML
<name>.en-GB.twig
<name>.en-GB.html.twig
```

```json
{
    "id": "befd8c25231344929c2648d90e986904",
    "name": "my_template",
    "type": "my_mail_template_type",
    "translations": {
        "de-DE": { "subject": "Betreff", "senderName": "Shop" },
        "en-GB": { "subject": "Subject", "senderName": "Shop" }
    }
}
```

Installed only — **never updated or uninstalled** (user-editable in admin).

---

## Resource Directory Overview

```
<BundleOrPlugin>/
└── Resources/
    ├── config/
    │   ├── services.yaml
    │   └── my_config.xml          ← auto-installed plugin config
    ├── custom_fields/
    │   └── my_set.json
    ├── document_types/
    │   └── my_type.json
    ├── payment_methods/
    │   └── my_payment.json
    ├── mail_template_types/
    │   └── my_type.json
    └── mail_templates/
        ├── my_template.json
        ├── my_template.de-DE.twig
        ├── my_template.de-DE.html.twig
        ├── my_template.en-GB.twig
        └── my_template.en-GB.html.twig
```