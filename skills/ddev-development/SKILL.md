---
name: ddev-development
description: Use when working in a DDEV project - running commands, customizing containers, configuring nginx/PHP, installing PECL extensions, managing add-ons, or troubleshooting DDEV issues. Triggers on .ddev/ directory, ddev commands, container configuration, PHP extension installation, custom nginx/apache config, Docker build failures, web-build Dockerfile changes.
---

# DDEV Development Environment

## Overview

DDEV is a Docker-based local development environment for PHP projects. All PHP, Composer, Node.js, and npm commands MUST run inside the DDEV container via `ddev exec` or shortcut commands. Git runs on the host.

> **Shopware projects:** See also `shopware-ddev` (Shopware-specific CLI commands) and `shopware` (plugin architecture, version compatibility).

## Quick Reference: Commands

| Task | Command |
|------|---------|
| Start project | `ddev start` |
| Stop project | `ddev stop` |
| Restart (apply config changes) | `ddev restart` |
| Run command in container | `ddev exec <command>` |
| SSH into container | `ddev ssh` |
| PHP via Composer | `ddev composer <args>` |
| Node.js packages | `ddev npm <args>` or `ddev yarn <args>` |
| Database export | `ddev export-db --file=dump.sql.gz` |
| Database import | `ddev import-db --file=dump.sql.gz` |
| Snapshot (full state) | `ddev snapshot --name=before-migration` |
| Restore snapshot | `ddev snapshot restore before-migration` |
| View project info | `ddev describe` |
| View all projects | `ddev list` |
| Install add-on | `ddev add-on get <repo>` (e.g., `ddev/ddev-redis`) |
| Remove add-on | `ddev add-on remove <name>` |
| List add-ons | `ddev add-on list` |
| Xdebug toggle | `ddev xdebug on` / `ddev xdebug off` |
| Clean up | `ddev clean` / `ddev delete` |

## Config: .ddev/config.yaml

Core settings — changes require `ddev restart`:

```yaml
name: my-project
type: php                    # php, drupal, wordpress, laravel, symfony, etc.
docroot: public              # Web root relative to project root
php_version: "8.3"           # "5.6" to "8.5"
webserver_type: nginx-fpm    # nginx-fpm (default), apache-fpm, or generic
nodejs_version: "20"         # Any major version, or "auto" (reads .nvmrc / package.json)
corepack_enable: false       # true = enables yarn and pnpm via corepack
composer_version: "2"        # "2", "2.2" (LTS), "2.9.3" (exact), "stable", "preview"
database:
  type: mariadb              # mariadb, mysql, or postgres
  version: "11.8"            # MariaDB 5.5–10.8/10.11/11.4/11.8, MySQL 5.5–8.4, PostgreSQL 9–18
xdebug_enabled: false
performance_mode: mutagen    # "" (default), "mutagen", "none"
timezone: "Europe/Berlin"    # defaults to host timezone or UTC
webimage_extra_packages:     # Extra apt packages for the web container (no Dockerfile needed)
  - php${DDEV_PHP_VERSION}-tidy
upload_dirs:                 # Paths excluded from Mutagen sync (user-uploaded files)
  - web/uploads
fail_on_hook_fail: false     # true = abort ddev start if a hook fails
disable_settings_management: false  # true = DDEV won't touch CMS settings files

# Extra hostnames and FQDNs
additional_hostnames: []
additional_fqdns: ["example.com"]

# Hooks
hooks:
  post-start:
    - exec: "composer install"
    - exec-host: "echo 'Project started'"

# Extra daemons (managed by supervisord)
web_extra_daemons:
  - name: "vite"
    command: "npm run dev"
    directory: /var/www/html

# Expose extra ports via ddev-router
web_extra_exposed_ports:
  - name: vite
    container_port: 5173
    http_port: 5172
    https_port: 5173
```

### Config Overrides

- `config.*.yaml` files merge into `config.yaml` (used by add-ons)
- `config.local.yaml` for machine-specific overrides (gitignored by default)

## Changing PHP Version

Edit `.ddev/config.yaml` or use the CLI, then restart:

```bash
# Via CLI (recommended)
ddev config --php-version 8.3
ddev restart

# Supported versions: 5.6, 7.0–7.4, 8.0–8.5
```

Or set in config.yaml directly:

```yaml
php_version: "8.3"
```

**Gotchas:**
- Only major.minor versions are supported (e.g. `8.3`), not patch versions.
- After switching, verify with `ddev exec php --version`.
- Extension packages installed via `webimage_extra_packages` must match the new version (use `${DDEV_PHP_VERSION}` variable, not a hardcoded version).
- PECL extensions in the Dockerfile also use `${DDEV_PHP_VERSION}` — they rebuild automatically.

---

## Changing Node.js Version

Edit `.ddev/config.yaml` or use the CLI, then restart:

```bash
# Via CLI (recommended)
ddev config --nodejs-version 22
ddev restart

# Supported: any major (16, 18, 20, 22…) or precise version (18.19.2)
```

Or set in config.yaml directly:

```yaml
nodejs_version: "22"
```

**Use `auto` to read version from project files** (`.nvmrc`, `package.json` `engines.node`, etc.):

```bash
ddev config --nodejs-version=auto
ddev restart
```

This uses the [`n`](https://www.npmjs.com/package/n) tool under the hood. Any version specifier supported by `n` works.

**Enable yarn / pnpm via corepack:**

```yaml
corepack_enable: true   # Runs `corepack enable` — makes yarn and pnpm available
```

Then run `ddev yarn <args>` or `ddev exec pnpm <args>`.

**Gotchas:**
- Non-default versions are downloaded on first `ddev start` — slower on first boot.
- For CI, the default LTS version avoids download delays.
- Verify with `ddev exec node --version` and `ddev exec npm --version`.

---

## Changing Database Engine or Version

⚠️ **Always snapshot before changing database type or version** — existing data may be incompatible.

```bash
ddev snapshot --name=before-db-change
ddev config --database=mysql:8.0
ddev restart
```

Supported types and versions:

| Type | Versions |
|------|----------|
| `mariadb` | 5.5–10.8, 10.11, 11.4, 11.8 (default) |
| `mysql` | 5.5–8.0, 8.4 |
| `postgres` | 9–18 |

---

## Changing Composer Version

```bash
ddev config --composer-version=2.2   # LTS, or "2", "2.9.3", "stable", "preview"
ddev restart --no-cache              # Force re-download (Composer is cached at build time)
```

If you ran `composer self-update` inside the container, the change won't persist across restarts — use `composer_version` in config.yaml instead.

---

## Customization

### Custom nginx Configuration

**Location:** `.ddev/nginx_full/nginx-site.conf`

DDEV auto-generates this file with `#ddev-generated` marker. To customize:
1. Remove the `#ddev-generated` line (otherwise DDEV overwrites it on restart)
2. Edit as needed
3. Run `ddev restart`

Additional `.conf` files in `.ddev/nginx_full/` are also loaded.

**Root path inside container:** `/var/www/html/{docroot}`
**PHP-FPM socket:** `unix:/run/php-fpm.sock`

### Custom PHP Configuration

**Location:** `.ddev/php/*.ini`

All `.ini` files in this directory are copied to `/etc/php/{version}/{cli,fpm}/conf.d/`.

```ini
; .ddev/php/my-php.ini
[PHP]
max_execution_time = 240
memory_limit = 512M
upload_max_filesize = 64M
post_max_size = 64M
```

You can also disable extensions by creating an empty file matching the extension's config name (e.g., empty `.ddev/php/20-xdebug.ini` disables Xdebug).

### Custom Dockerfile (web-build)

**Location:** `.ddev/web-build/Dockerfile`

Extends the base DDEV web image. Runs as root. Available build args:
- `BASE_IMAGE` — the DDEV webserver image
- `DDEV_PHP_VERSION` — e.g., "8.3"
- `username` — the host user mapped into the container

```dockerfile
ARG BASE_IMAGE
FROM $BASE_IMAGE

# Example: install a system package
RUN apt-get update && apt-get install -y --no-install-recommends \
    some-package \
    && rm -rf /var/lib/apt/lists/*
```

**Important:** The container uses Debian/Ubuntu. Use `apt-get`, not `yum` or `zypper`.

### Installing PECL Extensions

PECL extensions require compilation inside the Dockerfile. Key gotchas:
- `pecl` is NOT installed by default — add `php-pear` package
- `make` is NOT installed by default — add it explicitly
- `php{version}-dev` is needed for `phpize`
- Use `phpenmod` to enable extensions after installation

```dockerfile
ARG BASE_IMAGE
FROM $BASE_IMAGE

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        php${DDEV_PHP_VERSION}-dev php-pear libbrotli-dev make \
    && pecl install brotli \
    && echo "extension=brotli.so" > /etc/php/${DDEV_PHP_VERSION}/mods-available/brotli.ini \
    && phpenmod brotli \
    && rm -rf /var/lib/apt/lists/*
```

**Common PECL issues:**
- `make failed` — missing `make` package (add `make` to apt-get install)
- `pecl: command not found` — missing `php-pear` package
- `phpize: command not found` — missing `php${DDEV_PHP_VERSION}-dev`
- `--no-install-recommends` skips build tools — always add `make` explicitly
- Purging `php-dev` with `autoremove` can break other packages — skip the purge or be very careful

**Note:** `php_extensions` in config.yaml only works for extensions available as Debian apt packages (e.g., `php8.3-redis`). Most PECL-only extensions (like brotli) require the Dockerfile approach.

### Environment Variables

| Method | Scope | Location |
|--------|-------|----------|
| `.ddev/.env` | All containers | Project-level |
| `.ddev/.env.web` | Web container only | Per-service |
| `.ddev/.env.db` | DB container only | Per-service |
| `web_environment` in config.yaml | Web container | Config |

### Hooks

Available hooks in `config.yaml`:
- `pre-start`, `post-start`
- `pre-stop`, `post-stop`
- `pre-import-db`, `post-import-db`
- `pre-import-files`, `post-import-files`
- `pre-snapshot`, `post-snapshot`

```yaml
hooks:
  post-start:
    - exec: "composer install"          # Runs in web container
    - exec-host: "echo done"           # Runs on host
```

## Add-ons

Pre-packaged extensions for common services. Registry: https://addons.ddev.com/

```bash
ddev add-on get ddev/ddev-redis          # Redis
ddev add-on get ddev/ddev-rabbitmq       # RabbitMQ
ddev add-on get ddev/ddev-minio          # MinIO (S3-compatible)
ddev add-on get ddev/ddev-elasticsearch  # Elasticsearch
ddev add-on get codingsasi/ddev-playwright  # Playwright
```

Add-ons create `docker-compose.*.yaml` and `config.*.yaml` files in `.ddev/`.

## Node.js Dev Servers & Hot Reload Proxies

For tools like Vite, webpack-dev-server, or any filesystem watcher that runs its own HTTP server, DDEV exposes the dev server's port through `ddev-router` — making it reachable on the host at the project's `.ddev.site` URL.

### Step 1: Bind the dev server to `0.0.0.0`

The container is a separate network entity from the host. Binding to `127.0.0.1` (the default for most dev servers) makes the server unreachable from outside the container. Always bind to `0.0.0.0`.

**Vite (`vite.config.js` / `vite.config.ts`):**

```javascript
server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    origin: `${process.env.DDEV_PRIMARY_URL_WITHOUT_PORT}:5173`,
    cors: {
        origin: /https?:\/\/([A-Za-z0-9\-\.]+)?(\.ddev\.site)(?::\d+)?$/,
    },
},
```

**Other dev servers:** Pass `--host 0.0.0.0` (webpack) or equivalent flag.

### Step 2: Expose the port via ddev-router

Add to `.ddev/config.yaml` — all three fields are required (omitting `https_port` defaults it to `0` and crashes `ddev-router`):

```yaml
web_extra_exposed_ports:
  - name: vite
    container_port: 5173
    http_port: 5172      # http://myproject.ddev.site:5172
    https_port: 5173     # https://myproject.ddev.site:5173
```

The dev server is now available at **`https://myproject.ddev.site:5173`** on the host.

### Step 3: Auto-start the dev server (optional)

Run it as a background daemon (managed by supervisord inside the container):

```yaml
web_extra_daemons:
  - name: "vite"
    command: bash -c 'npm install && npm run dev -- --host'
    directory: /var/www/html
```

Or via a post-start hook (simpler, but blocks `ddev start` output):

```yaml
hooks:
  post-start:
    - exec: "npm run dev -- --host"
```

### Multi-port example (Vite + another service)

```yaml
web_extra_exposed_ports:
  - name: vite
    container_port: 5173
    http_port: 5172
    https_port: 5173
  - name: storybook
    container_port: 6006
    http_port: 6005
    https_port: 6006
```

---

## Inter-Project Communication

DDEV projects run in Docker and can communicate with each other. All container names follow the pattern `ddev-<projectname>-<service>`.

### Hostname conventions

| Target | Hostname from inside any container |
|--------|-----------------------------------|
| Another project's web container | `ddev-<projectname>-web` |
| Another project's database | `ddev-<projectname>-db` |
| A named add-on service | `ddev-<projectname>-<service>` |
| The host machine | `host.docker.internal` |

**The target project must be running** (`ddev start`) for its containers to be reachable.

### Accessing another project's database

```bash
# From inside the current project's web container
ddev exec mysql -h ddev-backend-db -u db -pdb db

# Or set it as DB host in .env
DB_HOST=ddev-backend-db
```

**Note:** If CMS settings management is enabled (`disable_settings_management: false`), DDEV may reset `DB_HOST` to `db` on restart. Disable it if you need a persistent cross-project DB connection.

### Accessing another project via HTTP/S (since DDEV 1.24.10)

From inside any container, use either the public domain or the internal Docker hostname:

```bash
# Public domain (goes through ddev-router, works the same as in a browser)
curl https://backend.ddev.site/api/endpoint

# Internal Docker hostname (faster, no DNS lookup)
curl https://ddev-backend-web/api/endpoint
```

For HTTPS to the internal hostname, the calling container must trust DDEV's CA. For external/add-on containers, mount the DDEV CA certificate.

### Accessing host machine services from a container

```bash
# Connect to a service running on the host (must listen on 0.0.0.0, not 127.0.0.1)
curl http://host.docker.internal:8080
```

---

## Container Paths

| Host | Container |
|------|-----------|
| Project root | `/var/www/html` |
| `{docroot}/` | `/var/www/html/{docroot}` |
| `.ddev/php/` | `/etc/php/{version}/{cli,fpm}/conf.d/` |
| `.ddev/nginx_full/` | nginx site configs |

## Common Gotchas

1. **`#ddev-generated` marker** — DDEV overwrites files containing this marker on restart. Remove it to customize.
2. **Commands on host vs container** — PHP/Node/Composer run in container (`ddev exec`), Git runs on host.
3. **Database version lock-in** — DB data created with one version may not work with another. Use `ddev snapshot` before changing.
4. **Playwright inside DDEV** — `baseURL` must be `https://localhost` (not `*.ddev.site`) when running tests inside the container.
5. **Port conflicts** — If ports 80/443 are taken, use `router_http_port` / `router_https_port` in config.yaml.
6. **Container rebuild** — Dockerfile changes require `ddev restart`. If cached layers cause issues, use `ddev delete` then `ddev start`.
7. **Multiple DDEV global configs** — If you see "multiple global DDEV configurations found", delete one of `~/.ddev` or `~/.config/ddev`.

## Debugging

```bash
ddev logs                    # Web container logs
ddev logs -s db              # Database logs
ddev describe                # Project status and URLs
ddev debug diagnose          # Run diagnostics
ddev debug compose-config    # Show generated docker-compose
ddev debug rebuild           # Full rebuild with verbose output
ddev exec php --ini          # Show loaded PHP configuration
ddev exec php -m             # List loaded PHP modules
```