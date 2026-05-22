---
name: shopware-ddev
description: Use when running Shopware 6 console commands, building assets, managing plugins/themes, or working with the database in a DDEV environment. Quick reference for all important ddev and Shopware CLI commands.
---

# Shopware 6 + DDEV Command Reference

> **Related skills:** `shopware` (plugin architecture, DAL, events) · `shopware-utils` (sub-bundles, auto-resources) · `ddev-development` (DDEV config, PHP/Node/DB version changes, port setup, Dockerfile)

All commands run inside the DDEV container. Prefix with `ddev exec` or use `ddev ssh` for interactive use.

## DDEV Basics

| Task | Command |
|---|---|
| Start | `ddev start` |
| Stop | `ddev stop` |
| Restart | `ddev restart` |
| SSH into container | `ddev ssh` |
| Run single command | `ddev exec <cmd>` |
| Open browser | `ddev launch` |
| Show URLs / status | `ddev describe` |
| View logs | `ddev logs` |
| DB export | `ddev export-db --file=dump.sql.gz` |
| DB import | `ddev import-db --file=dump.sql.gz` |
| Snapshot | `ddev snapshot --name=before-update` |
| Restore snapshot | `ddev snapshot restore before-update` |

---

## Plugin Management

```bash
ddev exec bin/console plugin:refresh
ddev exec bin/console plugin:install --activate PluginName
ddev exec bin/console plugin:update PluginName        # also installs resources (custom fields, etc.)
ddev exec bin/console plugin:deactivate PluginName
ddev exec bin/console plugin:uninstall PluginName
ddev exec bin/console plugin:list
```

---

## Theme & Storefront

```bash
# Compile theme (SCSS → CSS, required after SCSS changes)
ddev exec bin/console theme:compile

# Assign theme to sales channel
ddev exec bin/console theme:change --all

# Dump theme variables
ddev exec bin/console theme:dump

# Build storefront assets (JS/CSS bundle)
ddev exec bin/build-storefront.sh
```

---

## Administration

```bash
# Dump plugin/bundle configuration (required before building)
ddev exec bin/console bundle:dump

# Build admin assets (required after JS/Twig changes in administration)
# Note: bin/build-administration.sh does NOT exist in SW 6.6+
ddev exec bash -c "cd /var/www/html/src/Administration/Resources/app/administration && PROJECT_ROOT=/var/www/html npm run build"
```

> **Pitfall:** `bin/build-administration.sh` was removed in newer Shopware versions. Always use the `npm run build` approach above. Without `bundle:dump` first, the build fails with a `paths[0] must be of type string` error because the plugin map is missing.

---

## Asset Watching (HMR / Dev Server)

The Shopware storefront watcher runs a webpack dev server inside the container. DDEV must expose the port so the browser can reach it.

### 1. Expose ports in `.ddev/config.yaml`

```yaml
web_extra_exposed_ports:
  - name: storefront-watch
    container_port: 9998
    http_port: 9997
    https_port: 9998
```

Then apply: `ddev restart`

### 2. Start the watcher

```bash
ddev exec bin/watch-storefront.sh
```

The watcher is now reachable at: `https://<project>.ddev.site:9998`

Shopware automatically injects the hot-reload script when `APP_ENV=dev` and the webpack dev server responds on port 9998.

### Administration watcher

The admin watcher uses port 8080 by default:

```yaml
# additional entry in web_extra_exposed_ports:
  - name: admin-watch
    container_port: 8080
    http_port: 8079
    https_port: 8080
```

```bash
ddev exec bin/watch-administration.sh
```

Admin HMR URL: `https://<project>.ddev.site:8080`

### Notes

- Remove the `#ddev-generated` marker from `.ddev/config.yaml` before adding `web_extra_exposed_ports`, otherwise DDEV overwrites it on restart.
- Both watchers require `APP_ENV=dev` in `.env.local`.
- `ddev describe` shows all exposed ports after restart.

---

## Cache

```bash
ddev exec bin/console cache:clear
ddev exec bin/console cache:warmup
ddev exec bin/console cache:pool:clear cache.http          # HTTP cache only
ddev exec bin/console cache:pool:clear cache.object        # Object cache only
```

---

## Database & Migrations

```bash
# Run pending migrations
ddev exec bin/console database:migrate --all

# Create new migration for a plugin
ddev exec bin/console database:create-migration --plugin PluginName --name MigrationName

# Create new migration for an AdditionalBundle (dustin/shopware-utils)
ddev exec bin/console database:create-migration --bundle BundleName --name MigrationName

# Show migration status
ddev exec bin/console database:migrate-destructive --all   # run destructive migrations
```

---

## Scheduled Tasks

```bash
ddev exec bin/console scheduled-task:run          # run all due tasks once
ddev exec bin/console scheduled-task:list         # list tasks and their status
ddev exec bin/console messenger:consume           # process async message queue
```

---

## Search & Indexing

```bash
ddev exec bin/console es:index                    # reindex Elasticsearch
ddev exec bin/console dal:refresh:index           # refresh DAL search indexes
```

---

## Import / Export

```bash
ddev exec bin/console import:entity products      # Shopware native import
ddev exec bin/console export:entity products
```

---

## User & Sales Channel

```bash
# Create admin user
ddev exec bin/console user:create --admin --firstName="Max" --lastName="Muster" --email="max@example.com" --password="secret" admin

# List sales channels
ddev exec bin/console sales-channel:list

# Generate storefront URL
ddev exec bin/console sales-channel:update-domain localhost
```

---

## Composer (inside container)

```bash
ddev composer install
ddev composer require vendor/package
ddev composer update vendor/package
ddev composer dump-autoload
```

---

## Debugging

```bash
ddev exec bin/console debug:container              # list all services
ddev exec bin/console debug:router                 # list all routes
ddev exec bin/console debug:event-dispatcher       # list event listeners
ddev exec bin/console debug:config PluginName      # show plugin config
ddev logs                                          # web container logs
ddev logs -s db                                    # database logs
ddev exec php -i | grep memory_limit               # check PHP settings
```

---

## Running PHPUnit Tests

When running unit tests inside DDEV, `DATABASE_URL` using `localhost` resolves to a Unix socket (which doesn't exist). Prefix tests with the TCP address:

```bash
DATABASE_URL='mysql://db:db@db:3306/db' ddev exec vendor/bin/phpunit tests/unit/...
```

---

## Full Reset (when things break)

```bash
ddev exec bin/console cache:clear
ddev exec bin/console plugin:refresh
ddev exec bin/console plugin:update PluginName
ddev exec bin/console theme:compile
ddev restart
```