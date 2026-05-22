---
name: php
description: Use when writing PHP code - modern PHP 8 features, strict typing, enums, readonly, OOP patterns, PSR standards, security (file inclusion, SQL injection, XSS, CSRF, sessions, password hashing, file uploads). Triggers on .php files, composer.json, PHP classes, declare(strict_types=1).
---

# PHP

## Related Skills

| Need | Skill |
|------|-------|
| Symfony framework (built on PHP) | `symfony` |
| Symfony project scaffolding | `symfony-project-setup` |
| Shopware plugin development | `shopware` |
| DDEV for PHP projects | `ddev-development` |

---

## Overview

PHP is a general-purpose scripting language especially suited to server-side web development. Current version: **8.4** (LTS: 8.2).

**Key principles:**
- `declare(strict_types=1);` in every file
- Type declarations on all parameters, return values, and properties
- Follow [PSR standards](https://www.php-fig.org/) wherever possible
- Security by default: validate input, escape output, parameterize queries

---

## PHP-FIG / PSR Standards

Framework-interoperable standards. Adopt wherever possible.

| PSR | Name | Purpose |
|-----|------|---------|
| **PSR-1** | Basic Coding Standard | Class naming, file encoding, side effects |
| **PSR-4** | Autoloading | Namespace to directory mapping (`App\Service\Mailer` to `src/Service/Mailer.php`) |
| **PSR-12** | Extended Coding Style | Brace placement, indentation, line length, imports |
| **PSR-3** | Logger Interface | `Psr\Log\LoggerInterface` |
| **PSR-6** | Caching Interface | `Psr\Cache\CacheItemPoolInterface` |
| **PSR-7** | HTTP Message | `Psr\Http\Message\RequestInterface`, `ResponseInterface` |
| **PSR-11** | Container Interface | `Psr\Container\ContainerInterface` |
| **PSR-14** | Event Dispatcher | `Psr\EventDispatcher\EventDispatcherInterface` |
| **PSR-15** | HTTP Handlers | `Psr\Http\Server\MiddlewareInterface`, `RequestHandlerInterface` |
| **PSR-16** | Simple Cache | `Psr\SimpleCache\CacheInterface` |
| **PSR-18** | HTTP Client | `Psr\Http\Client\ClientInterface` |

### PSR-4 Autoloading (composer.json)

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

`App\Service\OrderService` maps to `src/Service/OrderService.php`

---

## Modern PHP Features (8.0 - 8.4)

### Constructor Promotion (8.0)

```php
class Product
{
    public function __construct(
        public readonly string $name,
        public readonly int $price,
    ) {}
}
```

### Named Arguments (8.0)

```php
$response = new JsonResponse(
    data: ['status' => 'ok'],
    status: 201,
    headers: ['X-Custom' => 'value'],
);
```

### Match Expression (8.0)

```php
$label = match ($status) {
    Status::Active => 'Active',
    Status::Pending => 'Pending',
    Status::Inactive, Status::Archived => 'Inactive',
    default => throw new \UnexpectedValueException("Unknown status: {$status->value}"),
};
```

### Enums (8.1)

```php
enum Status: string
{
    case Active = 'active';
    case Inactive = 'inactive';
    case Pending = 'pending';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Inactive => 'Inactive',
            self::Pending => 'Pending',
        };
    }

    public function isEditable(): bool
    {
        return $this !== self::Inactive;
    }
}

// Usage:
$status = Status::from('active');       // throws on invalid
$status = Status::tryFrom('unknown');   // returns null
$allCases = Status::cases();            // array of all cases
```

### Readonly Properties and Classes (8.1 / 8.2)

```php
// Readonly property
class Money
{
    public function __construct(
        public readonly int $amount,
        public readonly string $currency,
    ) {}
}

// Readonly class (8.2) -- all properties implicitly readonly
readonly class Coordinate
{
    public function __construct(
        public float $lat,
        public float $lng,
    ) {}
}
```

### Intersection and Union Types (8.1 / 8.2)

```php
// Union types (8.0)
function parse(string|int $value): string { /* ... */ }

// Intersection types (8.1)
function process(Countable&Iterator $collection): void { /* ... */ }

// DNF types (8.2)
function handle((Countable&Iterator)|null $collection): void { /* ... */ }

// true, false, null as standalone types (8.2)
function alwaysTrue(): true { return true; }
```

### Fibers (8.1)

```php
$fiber = new Fiber(function (): void {
    $value = Fiber::suspend('first');
    echo "Resumed with: {$value}\n";
    Fiber::suspend('second');
});

$first = $fiber->start();           // 'first'
$second = $fiber->resume('hello');  // 'second'
```

### PHP Attributes (8.0)

```php
#[\Attribute(\Attribute::TARGET_METHOD)]
class Route
{
    public function __construct(
        public readonly string $path,
        public readonly string $method = 'GET',
    ) {}
}

class UserController
{
    #[Route('/users', method: 'GET')]
    public function list(): Response { /* ... */ }
}

// Read via Reflection:
$method = new \ReflectionMethod(UserController::class, 'list');
$attributes = $method->getAttributes(Route::class);
foreach ($attributes as $attr) {
    $route = $attr->newInstance();
}
```

### Property Hooks (8.4)

```php
class User
{
    public string $name {
        set(string $value) => trim($value);
    }

    public string $fullName {
        get => "{$this->firstName} {$this->lastName}";
    }
}
```

### Asymmetric Visibility (8.4)

```php
class Counter
{
    public private(set) int $count = 0;

    public function increment(): void
    {
        $this->count++;
    }
}
```

---

## Type System

### `declare(strict_types=1)`

**Always the first statement in every PHP file.**

```php
<?php

declare(strict_types=1);

function add(int $a, int $b): int
{
    return $a + $b;
}

add(1, 2);     // OK
add(1.5, 2);   // TypeError
```

### Type-Safe Comparisons

```php
// Always strict
$a === $b;   // strict
$a == $b;    // NEVER -- loose comparison hides bugs

// Never use empty() -- explicit checks instead
count($items) > 0;     // not !empty($items)
$name !== '';           // not !empty($name)
$count !== 0;           // not !empty($count)
$value === null;        // not empty($value)
```

---

## OOP Patterns

### Interfaces

```php
interface PaymentGateway
{
    public function charge(Money $amount, string $token): PaymentResult;
    public function refund(string $transactionId): PaymentResult;
}
```

### Final Classes (Value Objects, DTOs)

```php
final class EmailAddress
{
    public function __construct(
        public readonly string $value,
    ) {
        if (filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
            throw new \InvalidArgumentException("Invalid email: {$value}");
        }
    }
}
```

### Late Static Binding

```php
abstract class BaseFactory
{
    public static function create(array $data): static
    {
        return new static($data); // static = calling class
    }
}
```

---

## Security

### Secure File Inclusion (LFI/RFI Prevention)

**Never pass user input to `include` / `require`.**

```php
// DANGEROUS -- Local File Inclusion
include $_GET['page'] . '.php';

// SAFE -- whitelist approach
$allowed = [
    'dashboard' => 'pages/dashboard.php',
    'profile' => 'pages/profile.php',
];
$page = $allowed[$_GET['page']] ?? 'pages/404.php';
include $page;

// SAFE -- realpath validation
$base = realpath(__DIR__ . '/templates');
$path = realpath(__DIR__ . '/templates/' . $_GET['tpl']);
if ($path === false || !str_starts_with($path, $base)) {
    throw new \RuntimeException('Invalid template path');
}
include $path;
```

**php.ini hardening:**
```ini
allow_url_include = Off    ; Prevents Remote File Inclusion
open_basedir = /var/www     ; Restricts file access
```

### SQL Injection Prevention

**Always use prepared statements.**

```php
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email AND active = :active');
$stmt->bindValue(':email', $email, PDO::PARAM_STR);
$stmt->bindValue(':active', true, PDO::PARAM_BOOL);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// PDO connection with security options
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES => false,       // Real prepared statements
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
```

- `EMULATE_PREPARES => false` forces real driver-level prepared statements
- Table/column names cannot be parameterized -- whitelist explicitly
- `bindValue` binds at call time (preferred). `bindParam` binds a variable reference

### XSS Prevention

```php
// HTML body
echo htmlspecialchars($userInput, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

// JavaScript context
echo json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);

// URL parameter
echo urlencode($value);
```

### CSRF Protection

```php
// Generate token
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

// Embed in form
echo '<input type="hidden" name="csrf_token" value="' . $_SESSION['csrf_token'] . '">';

// Validate -- constant-time comparison
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'] ?? '')) {
    throw new \RuntimeException('CSRF validation failed');
}
```

### Session Security

```php
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');

session_start();
session_regenerate_id(true); // ALWAYS after login
```

### Password Hashing

```php
// Hash -- auto-salted, secure
$hash = password_hash($password, PASSWORD_DEFAULT, ['cost' => 12]);

// Or Argon2id (PHP 7.3+)
$hash = password_hash($password, PASSWORD_ARGON2ID);

// Verify
if (!password_verify($inputPassword, $storedHash)) {
    throw new AuthenticationException('Invalid credentials');
}

// Rehash when algorithm/cost changes
if (password_needs_rehash($storedHash, PASSWORD_DEFAULT, ['cost' => 12])) {
    $newHash = password_hash($inputPassword, PASSWORD_DEFAULT, ['cost' => 12]);
}
```

**Never use md5(), sha1(), sha256() for passwords.**

### File Upload Security

```php
// 1. Validate MIME via finfo (not client Content-Type)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($_FILES['upload']['tmp_name']);
if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)) {
    throw new \RuntimeException('Invalid file type');
}

// 2. Whitelist extensions
$ext = strtolower(pathinfo($_FILES['upload']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
    throw new \RuntimeException('Invalid extension');
}

// 3. Random filename -- NEVER use the original
$filename = bin2hex(random_bytes(16)) . '.' . $ext;

// 4. Move to non-public directory
move_uploaded_file($_FILES['upload']['tmp_name'], '/var/app/uploads/' . $filename);
```

### Input Validation

```php
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
if ($email === false) {
    throw new \InvalidArgumentException('Invalid email');
}

$age = filter_var($_POST['age'], FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 150],
]);
```

### Cryptographic Randomness

```php
$token = bin2hex(random_bytes(32));     // secure
$code = random_int(100000, 999999);     // secure

// NEVER for security: rand(), mt_rand(), uniqid()
```

### Dangerous Functions

| Function | Risk | Alternative |
|----------|------|-------------|
| `unserialize()` | Object injection | `json_decode()` for untrusted data |
| `extract()` | Variable overwrite | Explicit assignment |
| `$$variable` | Variable variables | Array access |
| `system()`, `passthru()` | Command injection | `Symfony\Component\Process\Process` |
| `assert()` with string | Code execution | Boolean expressions only |

### Security Headers

```php
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
```

### OWASP Top 10 -- PHP Quick Reference

| Category | PHP Action |
|----------|-----------|
| Broken Access Control | Check authorization server-side on every request |
| Cryptographic Failures | `random_bytes()`, `sodium_*`, never `rand()` |
| Injection | PDO prepared statements, `htmlspecialchars()` |
| Insecure Design | Rate limit login/registration, server-side validation |
| Security Misconfiguration | `expose_php = Off`, `allow_url_include = Off`, `open_basedir` |
| Vulnerable Components | `composer audit`, pin versions |
| Authentication Failures | `password_hash()` / `password_verify()`, `hash_equals()` |
| Data Integrity | `hash_hmac()` for signatures, never `unserialize()` untrusted |
| Logging Failures | Log auth events, never log passwords/tokens |
| SSRF | Whitelist URLs, block private IP ranges |

---

## Error Handling

### Production Configuration

```ini
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log
error_reporting = E_ALL
expose_php = Off
```

### Exception Hierarchy

```php
class OrderNotFoundException extends \RuntimeException {}
class InsufficientStockException extends \DomainException {}

try {
    $order = $this->orderService->findOrFail($id);
} catch (OrderNotFoundException $e) {
    return new Response('Order not found', 404);
}
```

---

## Common Patterns

### Null Coalescing

```php
$name = $_GET['name'] ?? 'default';
$this->cache ??= new ArrayCache();
```

### Array Functions

```php
$active = array_filter($users, fn (User $u) => $u->isActive());
$names = array_map(fn (User $u) => $u->getName(), $users);
$total = array_reduce($items, fn (int $sum, Item $i) => $sum + $i->getPrice(), 0);
```

### String Functions

```php
str_starts_with($path, '/api/');
str_ends_with($file, '.php');
str_contains($text, 'keyword');
$msg = sprintf('User %s (ID: %d) logged in', $name, $id);
```

### Date and Time

```php
// Always DateTimeImmutable (not DateTime)
$now = new \DateTimeImmutable();
$tomorrow = $now->modify('+1 day');
$formatted = $now->format('Y-m-d H:i:s');
$date = \DateTimeImmutable::createFromFormat('d.m.Y', '19.04.2026');
```

---

## Composer

```bash
composer require vendor/package         # install
composer require --dev vendor/package   # dev dependency
composer update vendor/package          # update single
composer audit                          # check vulnerabilities
composer dump-autoload --optimize       # production autoloader
```

---

## Static Analysis

```bash
vendor/bin/phpstan analyse src/ --level=max
vendor/bin/php-cs-fixer fix src/
```

### Safe PHP (thecodingmachine/safe)

PHP's standard library returns `false` on error for hundreds of functions (`file_get_contents`, `json_encode`, `preg_match`, etc.). This is easy to miss and leads to silent failures. [thecodingmachine/safe](https://github.com/thecodingmachine/safe) provides drop-in replacements that **throw exceptions** instead.

```bash
composer require thecodingmachine/safe
composer require --dev thecodingmachine/phpstan-safe-rule
```

**PHPStan configuration** (`phpstan.neon`):
```yaml
includes:
    - vendor/thecodingmachine/phpstan-safe-rule/phpstan-safe-rule.neon
```

The PHPStan rule reports any usage of native PHP functions that have a Safe equivalent, enforcing the switch.

```php
// ❌ Bad — returns false on error, easy to miss
$content = file_get_contents('config.json');
$data = json_decode($content);

// ✅ Good — throws exceptions on error
use function Safe\file_get_contents;
use function Safe\json_decode;

$content = file_get_contents('config.json');  // throws FilesystemException
$data = json_decode($content);                // throws JsonException
```

Safe also provides `Safe\DateTimeImmutable` whose methods throw instead of returning `false`. For migrating existing codebases, Safe ships a Rector config (`vendor/thecodingmachine/safe/rector-migrate.php`) that rewrites native calls automatically.

---

## Common Gotchas

1. **Forget `declare(strict_types=1)`** -- PHP silently coerces types without it.
2. **`empty()` lies** -- `empty('0')` is `true`, `empty(0)` is `true`. Use explicit checks.
3. **`==` vs `===`** -- `0 == 'foo'` has surprising results. Always use `===`.
4. **`in_array` without strict** -- `in_array('0', [false])` is `true`. Always: `in_array($val, $arr, true)`.
5. **`json_encode` fails silently** -- Returns `false`. Use `JSON_THROW_ON_ERROR`.
6. **`DateTime` is mutable** -- `modify()` changes the original. Use `DateTimeImmutable`.
7. **Autoload case sensitivity** -- Linux is case-sensitive. `UserService.php` won't load as `Userservice`.
8. **`header()` after output** -- Headers before any output. Check for BOM, whitespace.
9. **Float comparison** -- Never `===` floats. Use `abs($a - $b) < PHP_FLOAT_EPSILON`.
10. **`str_replace` chain** -- Replaces in sequence, earlier results can be re-replaced. Use `strtr()`.

---

## Documentation References

| Resource | URL |
|----------|-----|
| Official Manual | https://www.php.net/manual/en/ |
| PHP-FIG (PSR Standards) | https://www.php-fig.org/ |
| Security Manual | https://www.php.net/manual/en/security.php |
| Packagist | https://packagist.org/ |
| PHP The Right Way | https://phptherightway.com/ |
| SymfonyCasts | https://symfonycasts.com/ |
| Affenformular (DE) | https://php-de.github.io/jumpto/affenformular/ |