---
name: symfony-project-setup
description: Use when creating a new Symfony project, scaffolding a Symfony application, or setting up the project skeleton - covers directory structure, bundles, services config, Vite/pentatrion, DDEV, PHPUnit, base template, i18n, CAPTCHA, and deployment.
---

# Symfony Project Setup Blueprint

## Related Skills

| Need | Skill |
|------|-------|
| Symfony framework components reference | `symfony` |
| Svelte 5 + TypeScript components (frontend) | `svelte` |
| DDEV configuration and commands | `ddev-development` |

---

## Overview

Standard blueprint for new Symfony 6/7 projects. Derived from production projects: consistent stack of DDEV + Vite (pentatrion) + Bootstrap 5 + TypeScript + Doctrine ORM + bilingual i18n.

---

## 1. Project Initialization

```bash
# Create Symfony project
composer create-project symfony/skeleton my-project
cd my-project

# Install core bundles
composer require symfony/twig-bundle symfony/form symfony/validator \
    symfony/security-bundle symfony/mailer symfony/mime \
    symfony/serializer symfony/translation symfony/console \
    symfony/http-client symfony/asset symfony/web-link \
    symfony/intl symfony/expression-language \
    symfony/property-access symfony/property-info \
    symfony/html-sanitizer symfony/notifier symfony/string \
    doctrine/orm doctrine/doctrine-bundle doctrine/doctrine-migrations-bundle \
    twig/extra-bundle twig/intl-extra \
    pentatrion/vite-bundle

# Dev dependencies
composer require --dev symfony/debug-bundle symfony/web-profiler-bundle \
    symfony/maker-bundle symfony/browser-kit symfony/css-selector \
    phpunit/phpunit
```

---

## 2. Directory Structure

```
my-project/
├── config/
│   ├── bundles.php
│   ├── routes.yaml
│   ├── services.yaml
│   └── packages/
│       ├── cache.yaml
│       ├── doctrine.yaml
│       ├── doctrine_migrations.yaml
│       ├── framework.yaml
│       ├── mailer.yaml
│       ├── monolog.yaml
│       ├── pentatrion_vite.yaml
│       ├── security.yaml
│       ├── translation.yaml
│       ├── twig.yaml
│       ├── validator.yaml
│       ├── dev/
│       │   ├── debug.yaml
│       │   ├── monolog.yaml
│       │   └── web_profiler.yaml
│       ├── prod/
│       │   ├── monolog.yaml
│       │   └── routing.yaml
│       └── test/
│           ├── framework.yaml
│           ├── monolog.yaml
│           ├── twig.yaml
│           └── web_profiler.yaml
├── content/                    # Optional: filesystem-based content (blog, pages)
├── public/
│   ├── index.php
│   └── assets/
│       └── js/                 # Vite build output
├── src/
│   ├── Kernel.php
│   ├── CacheWarmer/            # CacheWarmerInterface implementations
│   ├── Command/                # Console commands (#[AsCommand])
│   ├── Controller/
│   │   └── ErrorController.php
│   ├── Entity/                 # Doctrine entities (ORM attributes)
│   ├── Form/
│   │   ├── ContactType.php
│   │   └── Type/               # Custom form types (e.g. AltchaWidgetType)
│   ├── Repository/             # Doctrine repositories
│   ├── Service/                # Business logic
│   └── Validator/              # Custom constraints + validators
├── templates/
│   ├── base.html.twig
│   ├── form/                   # Custom form widget templates
│   │   └── altcha_widget.html.twig
│   ├── assets/
│   │   ├── scss/
│   │   │   └── all.scss        # SCSS entry point
│   │   ├── ts/
│   │   │   └── src/
│   │   │       └── main.ts     # TypeScript entry point
│   │   └── img/
│   └── bundles/                # Auto-generated bundle assets
├── tests/
│   ├── bootstrap.php
│   └── Controller/
├── translations/
│   ├── messages.de.yaml
│   └── messages.en.yaml
├── .ddev/
│   └── config.yaml
├── .env
├── composer.json
├── phpunit.xml.dist
├── vite.config.js
└── deploy-prod.sh
```

> **Entity vs Model:** Use `src/Entity/` (Symfony convention). Some projects use `src/Model/` — pick one and stay consistent.

---

## 3. Core Configuration Files

### `config/bundles.php`

```php
<?php

return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\TwigBundle\TwigBundle::class => ['all' => true],
    Twig\Extra\TwigExtraBundle\TwigExtraBundle::class => ['all' => true],
    Symfony\Bundle\SecurityBundle\SecurityBundle::class => ['all' => true],
    Doctrine\Bundle\DoctrineBundle\DoctrineBundle::class => ['all' => true],
    Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle::class => ['all' => true],
    Symfony\Bundle\MonologBundle\MonologBundle::class => ['all' => true],
    Pentatrion\ViteBundle\PentatrionViteBundle::class => ['all' => true],
    Symfony\Bundle\WebProfilerBundle\WebProfilerBundle::class => ['dev' => true, 'test' => true],
    Symfony\Bundle\DebugBundle\DebugBundle::class => ['dev' => true],
    Symfony\Bundle\MakerBundle\MakerBundle::class => ['dev' => true],
];
```

### `config/services.yaml`

```yaml
parameters:

services:
    _defaults:
        autowire: true
        autoconfigure: true

    App\:
        resource: '../src/'
        exclude:
            - '../src/DependencyInjection/'
            - '../src/Entity/'
            - '../src/Kernel.php'
            - '../src/Tests/'

    # Explicit service config for constructor parameters:
    # App\Service\MyService:
    #     arguments:
    #         $projectDir: '%kernel.project_dir%'
    #         $siteBaseUrl: '%env(SITE_BASE_URL)%'
```

### `config/packages/framework.yaml`

```yaml
framework:
    secret: '%env(APP_SECRET)%'
    session:
        handler_id: null
        cookie_secure: auto
        cookie_samesite: strict
    php_errors:
        log: true
    http_method_override: false
    handle_all_throwables: true

when@test:
    framework:
        test: true
        session:
            storage_factory_id: session.storage.factory.mock_file
```

### `config/packages/doctrine.yaml`

```yaml
doctrine:
    dbal:
        url: '%env(resolve:DATABASE_URL)%'
    orm:
        auto_generate_proxy_classes: true
        enable_lazy_ghost_objects: true
        naming_strategy: doctrine.orm.naming_strategy.underscore_number_aware
        auto_mapping: true
        mappings:
            App:
                type: attribute
                is_bundle: false
                dir: '%kernel.project_dir%/src/Entity'
                prefix: 'App\Entity'
                alias: App

when@prod:
    doctrine:
        orm:
            auto_generate_proxy_classes: false
            proxy_dir: '%kernel.build_dir%/doctrine/orm/Proxies'
            query_cache_driver:
                type: pool
                pool: doctrine.system_cache_pool
            result_cache_driver:
                type: pool
                pool: doctrine.result_cache_pool

    framework:
        cache:
            pools:
                doctrine.result_cache_pool:
                    adapter: cache.app
                doctrine.system_cache_pool:
                    adapter: cache.system
```

### `config/packages/twig.yaml`

```yaml
twig:
    default_path: '%kernel.project_dir%/templates'
    form_themes:
        - 'bootstrap_5_horizontal_layout.html.twig'
        - 'form/altcha_widget.html.twig'
    # globals:
    #     analytics_id: '%env(ANALYTICS_ID)%'

when@test:
    twig:
        strict_variables: true
```

### `config/packages/security.yaml`

Minimal setup (no user authentication):

```yaml
security:
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt))/
            security: false
        main:
            lazy: true

    access_control: []
```

With login authentication:

```yaml
security:
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'
    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email
    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt))/
            security: false
        main:
            lazy: true
            provider: app_user_provider
            custom_authenticator: App\Security\AppAuthenticator
            login_throttling:
                max_attempts: 3
                interval: '15 minutes'
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800
            logout:
                path: app_logout

    access_control:
        - { path: ^/login, roles: PUBLIC_ACCESS }
        - { path: ^/, roles: ROLE_USER }
```

### `config/packages/cache.yaml`

```yaml
framework:
    cache:
        app: cache.adapter.filesystem
        system: cache.adapter.system

        # Custom pools:
        # pools:
        #     cache.blog:
        #         adapter: cache.adapter.filesystem
        #         default_lifetime: 2592000
        #     cache.api:
        #         adapter: cache.adapter.redis
        #         default_lifetime: 60
```

### `config/packages/translation.yaml`

```yaml
framework:
    default_locale: de
    enabled_locales: ['de', 'en']
    translator:
        default_path: '%kernel.project_dir%/translations'
        fallbacks:
            - en
```

### `config/packages/mailer.yaml`

```yaml
framework:
    mailer:
        dsn: '%env(MAILER_DSN)%'
```

### `config/packages/validator.yaml`

```yaml
framework:
    validation:
        email_validation_mode: html5
```

---

## 4. Environment Variables

### `.env`

```dotenv
APP_ENV=dev
APP_SECRET=change-me-to-32-char-hex-string
DATABASE_URL="mysql://app:!ChangeMe!@127.0.0.1:3306/app?serverVersion=10.11.0-MariaDB"
MAILER_DSN=null://null
# MESSENGER_TRANSPORT_DSN=doctrine://default
# ALTCHA_HMAC_KEY=change-me
# SITE_BASE_URL=https://example.com
```

### `.env.local` (not committed)

```dotenv
APP_SECRET=actual-secret-here
DATABASE_URL="mysql://db:db@db:3306/db"
MAILER_DSN=smtp://user:pass@smtp.example.com:587
```

> **Rule:** Never commit secrets. `.env` has defaults/placeholders, `.env.local` has real values and is gitignored.

---

## 5. Vite / Frontend Build

### `config/packages/pentatrion_vite.yaml`

```yaml
pentatrion_vite:
    default_config: main
    configs:
        main:
            build_directory: assets/js
            script_attributes:
                defer: true
            preload_attributes:
                fetchpriority: auto
```

### `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import symfonyPlugin from 'vite-plugin-symfony';

export default defineConfig({
    plugins: [
        symfonyPlugin(),
    ],
    root: '.',
    base: '/assets/js/',
    build: {
        manifest: true,
        outDir: 'public/assets/js',
        rollupOptions: {
            input: {
                main: './templates/assets/ts/src/main.ts',
            },
        },
    },
});
```

With Svelte:

```javascript
import { defineConfig } from 'vite';
import symfonyPlugin from 'vite-plugin-symfony';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [
        symfonyPlugin(),
        svelte(),
    ],
    // ... same build config
});
```

### `package.json` (dependencies)

```json
{
    "devDependencies": {
        "vite": "^6.0",
        "vite-plugin-symfony": "^8.0",
        "typescript": "^5.0",
        "sass": "^1.80",
        "bootstrap": "^5.3"
    }
}
```

### Asset directories

```
templates/assets/
├── scss/
│   └── all.scss          # @import "~bootstrap/scss/bootstrap"; + custom
├── ts/
│   └── src/
│       └── main.ts       # import '../scss/all.scss'; + app logic
└── img/
    ├── logo.webp
    └── favicon.ico
```

---

## 6. Base Template

### `templates/base.html.twig`

```twig
<!DOCTYPE html>
<html lang="{{ app.request.locale }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{% block title %}{{ 'site.title'|trans }}{% endblock %}</title>

    {# SEO #}
    <meta name="description" content="{% block meta_description %}{{ 'site.description'|trans }}{% endblock %}">
    <link rel="canonical" href="{% block canonical %}{{ url(app.request.attributes.get('_route'), app.request.attributes.get('_route_params')) }}{% endblock %}">

    {# i18n: hreflang alternates #}
    {% block hreflang %}{% endblock %}

    {# Open Graph #}
    <meta property="og:title" content="{% block og_title %}{{ block('title') }}{% endblock %}">
    <meta property="og:description" content="{{ block('meta_description') }}">
    <meta property="og:type" content="website">
    {% block og_image %}{% endblock %}

    {# Favicon #}
    <link rel="icon" href="{{ asset('assets/img/favicon.ico') }}">

    {# Stylesheets (Vite) #}
    {% block stylesheets %}
        {{ vite_entry_link_tags('main') }}
    {% endblock %}
</head>
<body>
    {% block navbar %}
        {# Bootstrap 5 navbar with language switcher #}
    {% endblock %}

    <main>
        {% block body %}{% endblock %}
    </main>

    {% block footer %}{% endblock %}

    {# JavaScript (Vite) #}
    {% block javascripts %}
        {{ vite_entry_script_tags('main') }}
    {% endblock %}
</body>
</html>
```

---

## 7. i18n Setup (DE/EN)

### Route Pattern

```php
use Symfony\Component\Routing\Attribute\Route;

class IndexController extends AbstractController
{
    #[Route('/', name: 'app_index_de', defaults: ['_locale' => 'de'])]
    #[Route('/en', name: 'app_index_en', defaults: ['_locale' => 'en'])]
    public function index(): Response
    {
        return $this->render('index/index.html.twig');
    }

    #[Route('/impressum', name: 'app_imprint_de', defaults: ['_locale' => 'de'])]
    #[Route('/en/imprint', name: 'app_imprint_en', defaults: ['_locale' => 'en'])]
    public function imprint(): Response
    {
        return $this->render('index/imprint.html.twig');
    }
}
```

### Language Switcher (Twig)

```twig
{# Map current route to its counterpart in other locale #}
{% set route = app.request.attributes.get('_route') %}
{% set languageMapping = {
    'app_index_de': 'app_index_en',
    'app_index_en': 'app_index_de',
    'app_imprint_de': 'app_imprint_en',
    'app_imprint_en': 'app_imprint_de',
} %}

{% if languageMapping[route] is defined %}
    <a href="{{ path(languageMapping[route]) }}" hreflang="{{ app.request.locale == 'de' ? 'en' : 'de' }}">
        {{ app.request.locale == 'de' ? 'EN' : 'DE' }}
    </a>
{% endif %}
```

### Translation Files

```yaml
# translations/messages.de.yaml
site:
    title: 'Mein Projekt'
    description: 'Projektbeschreibung auf Deutsch'
nav:
    home: 'Startseite'
    contact: 'Kontakt'
    imprint: 'Impressum'
    privacy: 'Datenschutz'
contact:
    form:
        name: 'Ihr Name'
        email: 'E-Mail-Adresse'
        message: 'Ihre Nachricht'
        submit: 'Absenden'
    success: 'Vielen Dank! Ihre Nachricht wurde gesendet.'
```

```yaml
# translations/messages.en.yaml
site:
    title: 'My Project'
    description: 'Project description in English'
nav:
    home: 'Home'
    contact: 'Contact'
    imprint: 'Imprint'
    privacy: 'Privacy Policy'
contact:
    form:
        name: 'Your name'
        email: 'Email address'
        message: 'Your message'
        submit: 'Send'
    success: 'Thank you! Your message has been sent.'
```

---

## 8. Altcha CAPTCHA Integration

Standard CAPTCHA pattern used across all projects (privacy-friendly alternative to reCAPTCHA):

```bash
composer require altcha-org/altcha
```

### Constraint + Validator

```php
// src/Validator/AltchaChallenge.php
#[\Attribute]
class AltchaChallenge extends \Symfony\Component\Validator\Constraint
{
    public string $message = 'captcha.invalid';
}

// src/Validator/AltchaChallengeValidator.php
class AltchaChallengeValidator extends \Symfony\Component\Validator\ConstraintValidator
{
    public function __construct(
        #[\Symfony\Component\DependencyInjection\Attribute\Autowire('%env(ALTCHA_HMAC_KEY)%')]
        private readonly string $hmacKey,
    ) {}

    public function validate(mixed $value, \Symfony\Component\Validator\Constraint $constraint): void
    {
        if ($value === null || $value === '') {
            $this->context->buildViolation('captcha.missing')->addViolation();
            return;
        }

        $payload = json_decode(base64_decode($value), true);
        if ($payload === null || !\AltchaOrg\Altcha\Altcha::verifySolution($payload, $this->hmacKey)) {
            $this->context->buildViolation($constraint->message)->addViolation();
        }
    }
}
```

### Form Type + Widget Template

```php
// src/Form/Type/AltchaWidgetType.php
class AltchaWidgetType extends \Symfony\Component\Form\AbstractType
{
    public function configureOptions(\Symfony\Component\OptionsResolver\OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'mapped' => false,
            'constraints' => [new \App\Validator\AltchaChallenge()],
        ]);
    }

    public function getBlockPrefix(): string { return 'altcha_widget'; }
}
```

```twig
{# templates/form/altcha_widget.html.twig #}
{% block altcha_widget_widget %}
    <altcha-widget challengeurl="{{ path('app_contact_challenge') }}" hidelogo></altcha-widget>
    {{ form_widget(form, {type: 'hidden'}) }}
{% endblock %}
```

### Challenge Endpoint

```php
#[Route('/contact/challenge', name: 'app_contact_challenge', methods: ['GET'])]
public function challenge(): JsonResponse
{
    $challenge = \AltchaOrg\Altcha\Altcha::createChallenge([
        'hmacKey' => $this->hmacKey,
        'maxNumber' => 100000,
    ]);

    return $this->json($challenge);
}
```

---

## 9. DDEV Configuration

### `.ddev/config.yaml`

```yaml
name: my-project
type: php
docroot: public
php_version: "8.3"
webserver_type: nginx-fpm
database:
    type: mariadb
    version: "10.11"
nodejs_version: "20"
composer_version: "2"
webimage_extra_packages: []
router_http_port: "80"
router_https_port: "443"
```

### Common DDEV Commands

```bash
ddev start
ddev composer install
ddev exec bin/console doctrine:migrations:migrate
ddev exec bin/console cache:clear
ddev npm install
ddev npm run build                    # Vite production build
ddev npm run dev                      # Vite dev server
ddev exec vendor/bin/phpunit          # Run tests
```

---

## 10. PHPUnit Configuration

### `phpunit.xml.dist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true"
         failOnRisky="true"
         failOnWarning="true">

    <php>
        <ini name="display_errors" value="1"/>
        <ini name="error_reporting" value="-1"/>
        <server name="APP_ENV" value="test" force="true"/>
        <server name="SHELL_VERBOSITY" value="-1"/>
        <server name="SYMFONY_PHPUNIT_REMOVE" value=""/>
        <server name="SYMFONY_PHPUNIT_VERSION" value="10"/>
    </php>

    <testsuites>
        <testsuite name="Project Test Suite">
            <directory>tests</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory suffix=".php">src</directory>
        </include>
    </source>

    <extensions>
        <bootstrap class="Symfony\Bridge\PhpUnit\SymfonyTestsListener"/>
    </extensions>
</phpunit>
```

### `tests/bootstrap.php`

```php
<?php

use Symfony\Component\Dotenv\Dotenv;

require dirname(__DIR__) . '/vendor/autoload.php';

if (file_exists(dirname(__DIR__) . '/config/bootstrap.php')) {
    require dirname(__DIR__) . '/config/bootstrap.php';
} elseif (method_exists(Dotenv::class, 'bootEnv')) {
    (new Dotenv())->bootEnv(dirname(__DIR__) . '/.env');
}
```

---

## 11. Deployment Script

### `deploy-prod.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

SERVER="user@server"
TARGET="/srv/www/vhosts/example.com/httpdocs"

echo "=== Building assets ==="
npm run build

echo "=== Syncing files ==="
rsync -avz --delete \
    --exclude='.ddev/' \
    --exclude='.idea/' \
    --exclude='.git/' \
    --exclude='node_modules/' \
    --exclude='var/' \
    --exclude='tests/' \
    --exclude='.env.local' \
    --exclude='templates/assets/ts/' \
    --exclude='templates/assets/scss/' \
    --exclude='templates/assets/js/src/' \
    ./ "${SERVER}:${TARGET}/"

echo "=== Running remote commands ==="
ssh "${SERVER}" "cd ${TARGET} && \
    composer install --no-dev --optimize-autoloader && \
    bin/console cache:clear --env=prod && \
    bin/console doctrine:migrations:migrate --no-interaction && \
    chown -R nginx:nginx var/"

echo "=== Deploy complete ==="
```

---

## 12. Error Controller

```php
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class ErrorController extends AbstractController
{
    public function show(Throwable $exception): Response
    {
        $statusCode = method_exists($exception, 'getStatusCode')
            ? $exception->getStatusCode()
            : 500;

        $template = match (true) {
            $statusCode === 404 => 'error/error404.html.twig',
            default => 'error/error500.html.twig',
        };

        return $this->render($template, [
            'status_code' => $statusCode,
        ], new Response('', $statusCode));
    }
}
```

Configure in `framework.yaml`:

```yaml
framework:
    error_controller: App\Controller\ErrorController::show
```

---

## 13. Contact Form (Standard Pattern)

```php
// src/Form/ContactType.php
class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'contact.form.name',
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Length(min: 2, max: 100),
                ],
            ])
            ->add('email', EmailType::class, [
                'label' => 'contact.form.email',
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Email(),
                ],
            ])
            ->add('message', TextareaType::class, [
                'label' => 'contact.form.message',
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Length(min: 10, max: 5000),
                ],
            ])
            ->add('captcha', AltchaWidgetType::class)
            ->add('submit', SubmitType::class, [
                'label' => 'contact.form.submit',
            ]);
    }
}
```

---

## Checklist for New Projects

- [ ] `composer create-project` + install core bundles
- [ ] DDEV config (`.ddev/config.yaml`) with correct PHP/Node/DB versions
- [ ] `.env` with placeholders, `.env.local` with real secrets (gitignored)
- [ ] `config/services.yaml` with autowire defaults
- [ ] Framework, Doctrine, Twig, Security configs
- [ ] Vite setup: `vite.config.js` + `pentatrion_vite.yaml` + `package.json`
- [ ] SCSS + TypeScript entry points in `templates/assets/`
- [ ] `base.html.twig` with Vite tags, meta, i18n blocks
- [ ] Translation files `messages.de.yaml` + `messages.en.yaml`
- [ ] Altcha CAPTCHA: constraint, validator, form type, widget template, challenge route
- [ ] `phpunit.xml.dist` + `tests/bootstrap.php`
- [ ] Custom `ErrorController` with error templates
- [ ] `deploy-prod.sh` with rsync + remote cache clear + migrations
- [ ] First commit: `.gitignore` includes `.env.local`, `var/`, `vendor/`, `node_modules/`, `public/assets/js/`