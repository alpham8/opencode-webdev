---
name: symfony
description: Use when developing with the Symfony framework or any of its components - service container, forms, serializer, messenger, mailer, security, validator, routing, console commands, Twig, Doctrine integration. Triggers on Symfony bundles, DI configuration, kernel events, PHP attributes for routing/messenger/security.
---

# Symfony Framework

## Related Skills

| Need | Skill |
|------|-------|
| PHP language reference (types, security, PSR standards) | `php` |
| New Symfony project setup (scaffolding, config, Vite, DDEV, deploy) | `symfony-project-setup` |
| Svelte 5 + TypeScript components (in Symfony/Twig apps) | `svelte` |
| Shopware 5/6 plugin development (built on Symfony) | `shopware` |
| DDEV CLI commands for Symfony projects | `ddev-development` |
| Shopware DDEV commands (build, cache, plugins) | `shopware-ddev` |

**Symfony is the foundation of Shopware 6.** All Symfony patterns (DI, events, routing, console, etc.) apply directly inside Shopware plugins.

---

## Overview

Symfony is a set of reusable PHP components and a full-stack web framework. Key design principles: **explicit over magic**, **configuration over convention**, **decoupled components**.

Current LTS: **6.4** | Current stable: **7.4** | Next major: **8.0**

---

## Service Container & Dependency Injection

The heart of every Symfony application. All services are autowired by default.

### Configuration (`services.yaml` / `services.php`)

```yaml
# config/services.yaml
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
```

```php
// config/services.php
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return function (ContainerConfigurator $container): void {
    $services = $container->services()
        ->defaults()
            ->autowire()
            ->autoconfigure();

    $services->load('App\\', '../src/')
        ->exclude('../src/{DependencyInjection,Entity,Kernel.php}');
};
```

### Autowiring & Named Autowiring

```php
// Constructor injection — autowired by type-hint
class OrderService
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly LoggerInterface $logger,
    ) {}
}
```

When multiple implementations exist for an interface, use **named autowiring aliases**:

```yaml
services:
    App\Util\TransformerInterface $rot13Transformer: '@App\Util\Rot13Transformer'
    App\Util\TransformerInterface $uppercaseTransformer: '@App\Util\UppercaseTransformer'
```

Or use `#[Target]` attribute (Symfony 6.3+):

```php
use Symfony\Component\DependencyInjection\Attribute\Target;

class NotificationService
{
    public function __construct(
        #[Target('smsTransport')]
        private readonly TransportInterface $transport,
    ) {}
}
```

### Service Tags & Autoconfigure

```php
// Autoconfigure: classes implementing an interface get tagged automatically
// via #[AutoconfigureTag] on the interface:
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.handler')]
interface HandlerInterface
{
    public function handle(mixed $data): void;
}
```

Common built-in tags:

| Tag | Purpose |
|-----|---------|
| `kernel.event_subscriber` | Auto-registered event subscriber |
| `kernel.event_listener` | Single event listener |
| `console.command` | Console command |
| `twig.extension` | Twig extension |
| `validator.constraint_validator` | Custom constraint validator |
| `serializer.normalizer` | Custom normalizer |
| `form.type` | Custom form type |
| `messenger.message_handler` | Message handler |

### Service Decoration

```php
// config/services.yaml
services:
    App\Service\DecoratedMailer:
        decorates: App\Service\Mailer
        arguments: ['@.inner']
```

```php
// With PHP attributes (Symfony 6.1+):
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\AutowireDecorated;

#[AsDecorator(decorates: Mailer::class)]
class DecoratedMailer implements MailerInterface
{
    public function __construct(
        #[AutowireDecorated]
        private readonly MailerInterface $inner,
    ) {}

    public function send(Email $email): void
    {
        // add logic before/after
        $this->inner->send($email);
    }
}
```

### Compiler Passes

For advanced container manipulation at compile time:

```php
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;

class HandlerCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->has(HandlerRegistry::class)) {
            return;
        }

        $definition = $container->findDefinition(HandlerRegistry::class);
        $taggedServices = $container->findTaggedServiceIds('app.handler');

        foreach ($taggedServices as $id => $tags) {
            $definition->addMethodCall('addHandler', [new Reference($id)]);
        }
    }
}
```

---

## Event Dispatcher

### Event Subscriber (preferred)

```php
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class LocaleSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => [['onKernelRequest', 20]],
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        $request->setLocale($request->query->get('_locale', 'en'));
    }
}
```

### Event Listener (with attribute, Symfony 6.2+)

```php
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;

#[AsEventListener(event: ExceptionEvent::class, priority: 10)]
class ExceptionListener
{
    public function __invoke(ExceptionEvent $event): void
    {
        $exception = $event->getThrowable();
        // handle exception
    }
}
```

### Kernel Events (request lifecycle)

| Event | Constant | When |
|-------|----------|------|
| `kernel.request` | `KernelEvents::REQUEST` | Before controller is resolved |
| `kernel.controller` | `KernelEvents::CONTROLLER` | After controller is resolved, before execution |
| `kernel.controller_arguments` | `KernelEvents::CONTROLLER_ARGUMENTS` | After controller arguments resolved |
| `kernel.view` | `KernelEvents::VIEW` | When controller returns non-Response |
| `kernel.response` | `KernelEvents::RESPONSE` | After Response is created |
| `kernel.finish_request` | `KernelEvents::FINISH_REQUEST` | After response sent to client |
| `kernel.terminate` | `KernelEvents::TERMINATE` | After response sent (for heavy cleanup) |
| `kernel.exception` | `KernelEvents::EXCEPTION` | On uncaught exception |

### Custom Events

```php
use Symfony\Contracts\EventDispatcher\Event;

class OrderPlacedEvent extends Event
{
    public function __construct(
        public readonly Order $order,
    ) {}
}

// Dispatch:
$this->eventDispatcher->dispatch(new OrderPlacedEvent($order));
```

---

## Routing

### PHP Attributes (standard since Symfony 6.0)

```php
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/products', name: 'api_product_')]
class ProductController extends AbstractController
{
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): Response
    {
        // ...
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => Requirement::UUID_V4])]
    public function show(string $id): Response
    {
        // ...
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(string $id): Response
    {
        // ...
    }
}
```

### Parameter Conversion (MapEntity)

```php
use Symfony\Bridge\Doctrine\Attribute\MapEntity;

#[Route('/product/{id}', name: 'product_show')]
public function show(
    #[MapEntity] Product $product,
): Response {
    // $product is resolved from DB by {id} automatically
}

// Multiple entities:
#[Route('/product/{product_id}/review/{review_id}')]
public function review(
    #[MapEntity(id: 'product_id')] Product $product,
    #[MapEntity(id: 'review_id')] Review $review,
): Response {}
```

---

## Forms

### Form Type

```php
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'constraints' => [
                    new Assert\NotBlank(),
                    new Assert\Length(min: 2, max: 100),
                ],
            ])
            ->add('email', EmailType::class)
            ->add('submit', SubmitType::class);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => ContactDto::class,
        ]);
    }
}
```

### Controller Usage

```php
#[Route('/contact', name: 'contact')]
public function contact(Request $request): Response
{
    $form = $this->createForm(ContactType::class);
    $form->handleRequest($request);

    if ($form->isSubmitted() && $form->isValid()) {
        /** @var ContactDto $data */
        $data = $form->getData();
        // process $data
        return $this->redirectToRoute('contact_success');
    }

    return $this->render('contact/index.html.twig', [
        'form' => $form,
    ]);
}
```

### Common Form Field Types

| Type | Use |
|------|-----|
| `TextType` | Single-line text input |
| `TextareaType` | Multi-line text |
| `EmailType` | Email field |
| `PasswordType` | Password input |
| `IntegerType` / `NumberType` | Numeric input |
| `ChoiceType` | Select / radio / checkboxes |
| `EntityType` | Doctrine entity select |
| `DateType` / `DateTimeType` | Date/time pickers |
| `FileType` | File upload |
| `CollectionType` | Dynamic list of sub-forms |
| `HiddenType` | Hidden field |

### Data Transformers

```php
use Symfony\Component\Form\DataTransformerInterface;
use Symfony\Component\Form\Exception\TransformationFailedException;

class TagsToStringTransformer implements DataTransformerInterface
{
    /** Entity collection -> string for display */
    public function transform(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        return implode(', ', $value->map(fn (Tag $tag) => $tag->getName())->toArray());
    }

    /** String from form -> entity collection */
    public function reverseTransform(mixed $value): array
    {
        if ($value === '' || $value === null) {
            return [];
        }

        return array_map('trim', explode(',', $value));
    }
}

// In form type:
$builder->get('tags')->addModelTransformer(new TagsToStringTransformer());
```

### Form Events

| Event | Constant | When |
|-------|----------|------|
| `form.pre_set_data` | `FormEvents::PRE_SET_DATA` | Before data is set on form |
| `form.post_set_data` | `FormEvents::POST_SET_DATA` | After data is set |
| `form.pre_submit` | `FormEvents::PRE_SUBMIT` | Before submitted data is applied |
| `form.submit` | `FormEvents::SUBMIT` | During data normalization |
| `form.post_submit` | `FormEvents::POST_SUBMIT` | After data normalization |

```php
$builder->addEventListener(FormEvents::PRE_SET_DATA, function (FormEvent $event): void {
    $data = $event->getData();
    $form = $event->getForm();

    if ($data === null || $data->getId() === null) {
        $form->add('username', TextType::class);
    }
});
```

---

## Serializer

### Basic Usage

```php
use Symfony\Component\Serializer\SerializerInterface;

class ApiController extends AbstractController
{
    #[Route('/api/products/{id}', methods: ['GET'])]
    public function show(Product $product, SerializerInterface $serializer): Response
    {
        $json = $serializer->serialize($product, 'json', ['groups' => ['product:read']]);

        return new JsonResponse($json, json: true);
    }

    #[Route('/api/products', methods: ['POST'])]
    public function create(Request $request, SerializerInterface $serializer): Response
    {
        $product = $serializer->deserialize(
            $request->getContent(),
            Product::class,
            'json',
            ['groups' => ['product:write']],
        );

        // validate & persist
    }
}
```

### Serialization Groups (attributes on entity/DTO)

```php
use Symfony\Component\Serializer\Attribute\Groups;

class Product
{
    #[Groups(['product:read'])]
    public int $id;

    #[Groups(['product:read', 'product:write'])]
    public string $name;

    #[Groups(['product:read', 'product:write'])]
    public int $price;

    #[Groups(['product:read'])]
    public \DateTimeImmutable $createdAt;
}
```

### Built-in Normalizers (priority order)

| Normalizer | Purpose |
|------------|---------|
| `UnwrappingDenormalizer` | Unwrap nested data before denormalization |
| `DateTimeNormalizer` | DateTime objects ↔ string |
| `DateTimeZoneNormalizer` | DateTimeZone handling |
| `DateIntervalNormalizer` | DateInterval handling |
| `BackedEnumNormalizer` | PHP enums ↔ scalar |
| `JsonSerializableNormalizer` | JsonSerializable objects |
| `ArrayDenormalizer` | Denormalize arrays of objects |
| `ObjectNormalizer` | General object ↔ array (uses PropertyAccess) |

### Custom Normalizer

```php
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

class MoneyNormalizer implements NormalizerInterface
{
    public function normalize(mixed $object, ?string $format = null, array $context = []): array
    {
        return [
            'amount' => $object->getAmount(),
            'currency' => $object->getCurrency()->getCode(),
        ];
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Money;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [Money::class => true];
    }
}
```

### Context Builders (Symfony 6.3+)

```php
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;

$context = (new ObjectNormalizerContextBuilder())
    ->withGroups(['product:read'])
    ->withCircularReferenceHandler(fn ($object) => $object->getId())
    ->toArray();

$json = $serializer->serialize($product, 'json', $context);
```

---

## Validator

### Constraint Attributes

```php
use Symfony\Component\Validator\Constraints as Assert;

class UserDto
{
    #[Assert\NotBlank]
    #[Assert\Length(min: 3, max: 50)]
    public string $username;

    #[Assert\NotBlank]
    #[Assert\Email(mode: Assert\Email::VALIDATION_MODE_STRICT)]
    public string $email;

    #[Assert\NotBlank]
    #[Assert\PasswordStrength(minScore: Assert\PasswordStrength::STRENGTH_MEDIUM)]
    public string $password;

    #[Assert\Positive]
    public int $age;

    #[Assert\Valid]  // cascade validation into nested objects
    public Address $address;
}
```

### Validation Groups

```php
class RegistrationDto
{
    #[Assert\NotBlank(groups: ['registration'])]
    public string $name;

    #[Assert\NotBlank(groups: ['registration', 'profile'])]
    #[Assert\Email]
    public string $email;
}

// Validate with specific groups:
$violations = $validator->validate($dto, groups: ['registration']);
```

### Custom Constraint

```php
// The constraint:
#[\Attribute]
class UniqueEmail extends Constraint
{
    public string $message = 'The email "{{ value }}" is already registered.';
}

// The validator:
class UniqueEmailValidator extends ConstraintValidator
{
    public function __construct(private readonly UserRepository $userRepository) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if ($value === null || $value === '') {
            return;
        }

        if ($this->userRepository->findOneByEmail($value) !== null) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ value }}', $value)
                ->addViolation();
        }
    }
}
```

---

## Messenger

### Message & Handler

```php
// Message (simple DTO):
class SendWelcomeEmail
{
    public function __construct(
        public readonly int $userId,
    ) {}
}

// Handler:
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class SendWelcomeEmailHandler
{
    public function __construct(
        private readonly MailerInterface $mailer,
        private readonly UserRepository $userRepository,
    ) {}

    public function __invoke(SendWelcomeEmail $message): void
    {
        $user = $this->userRepository->find($message->userId);
        // send email
    }
}
```

### Transport Configuration

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        failure_transport: failed

        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    delay: 1000
                    multiplier: 2
            failed: 'doctrine://default?queue_name=failed'

        routing:
            App\Message\SendWelcomeEmail: async
            App\Message\ProcessOrder: async
```

Common DSNs: `doctrine://default`, `amqp://guest:guest@localhost:5672`, `redis://localhost:6379/messages`, `in-memory://`

### Dispatch

```php
$bus->dispatch(new SendWelcomeEmail($userId));

// With stamps:
use Symfony\Component\Messenger\Stamp\DelayStamp;
$bus->dispatch(new SendWelcomeEmail($userId), [new DelayStamp(60000)]); // 60s delay
```

### Consume

```bash
bin/console messenger:consume async --limit=10 --time-limit=3600
bin/console messenger:failed:show      # inspect failed messages
bin/console messenger:failed:retry     # retry all failed messages
```

### Route via Attribute (Symfony 7.2+)

```php
use Symfony\Component\Messenger\Attribute\AsMessage;

#[AsMessage('async')]
class SmsNotification
{
    public function __construct(public readonly string $phone, public readonly string $text) {}
}
```

---

## Mailer

### Sending Emails

```php
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class NotificationService
{
    public function __construct(private readonly MailerInterface $mailer) {}

    public function sendAlert(string $to, string $subject, string $body): void
    {
        $email = (new Email())
            ->from('noreply@example.com')
            ->to($to)
            ->subject($subject)
            ->text($body)
            ->html("<p>{$body}</p>");

        $this->mailer->send($email);
    }
}
```

### Twig Templated Emails

```php
use Symfony\Bridge\Twig\Mime\TemplatedEmail;

$email = (new TemplatedEmail())
    ->from('noreply@example.com')
    ->to($user->getEmail())
    ->subject('Welcome!')
    ->htmlTemplate('emails/welcome.html.twig')
    ->context([
        'user' => $user,
        'expiration_date' => new \DateTimeImmutable('+7 days'),
    ]);
```

### Transport DSN

```dotenv
# .env
MAILER_DSN=smtp://user:pass@smtp.example.com:587
# or
MAILER_DSN=gmail+smtp://user:pass@default
MAILER_DSN=sendgrid+api://KEY@default
MAILER_DSN=null://null   # disable sending (dev)
```

---

## HttpClient

### Basic Usage

```php
use Symfony\Contracts\HttpClient\HttpClientInterface;

class ApiService
{
    public function __construct(private readonly HttpClientInterface $httpClient) {}

    public function fetchData(int $id): array
    {
        $response = $this->httpClient->request('GET', "https://api.example.com/data/{$id}", [
            'headers' => ['Accept' => 'application/json'],
            'query' => ['page' => 1],
        ]);

        return $response->toArray(); // auto-throws on 4xx/5xx
    }
}
```

### Scoped Clients

```yaml
# config/packages/framework.yaml
framework:
    http_client:
        scoped_clients:
            github.client:
                base_uri: 'https://api.github.com'
                headers:
                    Authorization: 'Bearer %env(GITHUB_TOKEN)%'
                    Accept: 'application/vnd.github.v3+json'
```

Inject by variable name: `HttpClientInterface $githubClient` (autowired from scoped config).

### Retry

```yaml
framework:
    http_client:
        scoped_clients:
            my.client:
                base_uri: 'https://api.example.com'
                retry_failed:
                    max_retries: 3
                    delay: 1000
                    multiplier: 2
                    http_codes: [429, 500, 502, 503]
```

---

## Security

### Authenticator (modern approach, Symfony 6.0+)

```php
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class ApiTokenAuthenticator extends AbstractAuthenticator
{
    public function supports(Request $request): ?bool
    {
        return $request->headers->has('X-API-TOKEN');
    }

    public function authenticate(Request $request): Passport
    {
        $token = $request->headers->get('X-API-TOKEN');

        return new SelfValidatingPassport(
            new UserBadge($token, fn (string $token) => $this->tokenRepository->findUser($token)),
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        return null; // continue to controller
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['error' => 'Invalid token'], 401);
    }
}
```

### Voters (authorization)

```php
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class PostVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        return \in_array($attribute, ['EDIT', 'DELETE'], true) && $subject instanceof Post;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Post $post */
        $post = $subject;

        return match ($attribute) {
            'EDIT' => $post->getAuthor() === $user,
            'DELETE' => $post->getAuthor() === $user || \in_array('ROLE_ADMIN', $user->getRoles(), true),
            default => false,
        };
    }
}

// Usage in controller:
$this->denyAccessUnlessGranted('EDIT', $post);
```

### `#[IsGranted]` Attribute

```php
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[IsGranted('ROLE_ADMIN')]
#[Route('/admin')]
class AdminController extends AbstractController {}

#[Route('/post/{id}/edit')]
#[IsGranted('EDIT', subject: 'post')]
public function edit(Post $post): Response {}
```

---

## Cache

### Cache Contracts (preferred API)

```php
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class ProductService
{
    public function __construct(private readonly CacheInterface $cache) {}

    public function getPopularProducts(): array
    {
        return $this->cache->get('popular_products', function (ItemInterface $item): array {
            $item->expiresAfter(3600);
            $item->tag(['products', 'homepage']);

            return $this->repository->findPopular();
        });
    }
}
```

### Cache Invalidation

```php
use Symfony\Contracts\Cache\TagAwareCacheInterface;

// Inject TagAwareCacheInterface for tag-based invalidation:
$this->cache->invalidateTags(['products']);

// Or delete specific key:
$this->cache->delete('popular_products');
```

### Pool Configuration

```yaml
framework:
    cache:
        default_redis_provider: '%env(REDIS_URL)%'
        pools:
            app.cache:
                adapter: cache.adapter.redis
                default_lifetime: 3600
```

---

## Console Commands

```php
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:import-users',
    description: 'Import users from CSV file',
)]
class ImportUsersCommand extends Command
{
    protected function configure(): void
    {
        $this
            ->addArgument('file', InputArgument::REQUIRED, 'Path to CSV file')
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Do not persist changes');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $file = $input->getArgument('file');
        $dryRun = $input->getOption('dry-run');

        if (!file_exists($file)) {
            $io->error("File not found: {$file}");
            return Command::FAILURE;
        }

        $io->progressStart(100);
        // ... process
        $io->progressFinish();

        $io->success('Import completed.');
        return Command::SUCCESS;
    }
}
```

---

## Twig (Templating)

### Custom Extension

```php
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;

class AppExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('price', $this->formatPrice(...)),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('app_version', $this->getVersion(...)),
        ];
    }

    public function formatPrice(int $cents, string $currency = 'EUR'): string
    {
        return number_format($cents / 100, 2, ',', '.') . ' ' . $currency;
    }

    public function getVersion(): string
    {
        return '2.0.0';
    }
}
```

### Template Patterns

```twig
{# Template inheritance #}
{% extends 'base.html.twig' %}

{% block title %}Product Detail{% endblock %}

{% block body %}
    <h1>{{ product.name }}</h1>
    <p>{{ product.price|price }}</p>

    {# Conditionals #}
    {% if product.stock > 0 %}
        <span class="badge bg-success">{{ 'product.in_stock'|trans }}</span>
    {% endif %}

    {# Loops #}
    {% for review in product.reviews %}
        <div>{{ review.text|nl2br }}</div>
    {% else %}
        <p>{{ 'product.no_reviews'|trans }}</p>
    {% endfor %}

    {# Include partial #}
    {{ include('product/_sidebar.html.twig') }}
{% endblock %}
```

---

## Doctrine Integration

### Entity

```php
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ProductRepository::class)]
#[ORM\Table(name: 'product')]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $name;

    #[ORM\Column]
    private int $price;

    #[ORM\ManyToOne(targetEntity: Category::class, inversedBy: 'products')]
    #[ORM\JoinColumn(nullable: false)]
    private Category $category;

    #[ORM\OneToMany(targetEntity: Review::class, mappedBy: 'product', cascade: ['persist', 'remove'])]
    private Collection $reviews;
}
```

### Repository (custom queries)

```php
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Product> */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /** @return Product[] */
    public function findActiveByCategory(Category $category): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.category = :category')
            ->andWhere('p.active = :active')
            ->setParameter('category', $category)
            ->setParameter('active', true)
            ->orderBy('p.name', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
```

### Migrations

```bash
bin/console make:migration                    # generate migration from entity changes
bin/console doctrine:migrations:migrate       # run pending migrations
bin/console doctrine:migrations:migrate prev  # rollback one migration
```

---

## Scheduler (Symfony 6.3+)

```php
use Symfony\Component\Scheduler\Attribute\AsSchedule;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\ScheduleProviderInterface;

#[AsSchedule('default')]
class AppScheduleProvider implements ScheduleProviderInterface
{
    public function getSchedule(): Schedule
    {
        return (new Schedule())
            ->add(RecurringMessage::every('1 hour', new CleanupTempFiles()))
            ->add(RecurringMessage::cron('0 3 * * *', new GenerateReports()));
    }
}
```

Consume: `bin/console messenger:consume scheduler_default`

---

## Workflow

```yaml
# config/packages/workflow.yaml
framework:
    workflows:
        order:
            type: state_machine
            marking_store:
                type: method
                property: status
            supports:
                - App\Entity\Order
            initial_marking: new
            places:
                - new
                - processing
                - shipped
                - delivered
                - cancelled
            transitions:
                process:
                    from: new
                    to: processing
                ship:
                    from: processing
                    to: shipped
                deliver:
                    from: shipped
                    to: delivered
                cancel:
                    from: [new, processing]
                    to: cancelled
```

```php
use Symfony\Component\Workflow\WorkflowInterface;

class OrderService
{
    public function __construct(
        #[Target('orderStateMachine')]
        private readonly WorkflowInterface $workflow,
    ) {}

    public function ship(Order $order): void
    {
        if ($this->workflow->can($order, 'ship')) {
            $this->workflow->apply($order, 'ship');
        }
    }
}
```

### Workflow Events

Listen to: `workflow.order.enter.shipped`, `workflow.order.transition.ship`, `workflow.order.guard.cancel` etc.

---

## Lock

```php
use Symfony\Component\Lock\LockFactory;

class ImportService
{
    public function __construct(private readonly LockFactory $lockFactory) {}

    public function import(): void
    {
        $lock = $this->lockFactory->createLock('import-products', ttl: 300);

        if (!$lock->acquire()) {
            return; // another process is running
        }

        try {
            // ... do import
        } finally {
            $lock->release();
        }
    }
}
```

---

## Notifier

```php
use Symfony\Component\Notifier\Notification\Notification;
use Symfony\Component\Notifier\NotifierInterface;
use Symfony\Component\Notifier\Recipient\Recipient;

$notification = (new Notification('New Order', ['email', 'sms']))
    ->content('Order #123 has been placed.')
    ->importance(Notification::IMPORTANCE_HIGH);

$recipient = new Recipient('admin@example.com', '+49123456789');
$this->notifier->send($notification, $recipient);
```

---

## AssetMapper (Modern JS without Webpack)

Since Symfony 6.3, AssetMapper replaces Webpack Encore for projects that don't need a build step.

```bash
bin/console importmap:require lodash               # add JS dependency
bin/console asset-map:compile                       # compile for production
```

```twig
{# base.html.twig #}
{% block importmap %}{{ importmap('app') }}{% endblock %}
```

```javascript
// assets/app.js
import './bootstrap.js';
import { debounce } from 'lodash';
```

---

## Useful Console Commands

```bash
# Debug
bin/console debug:container                # list all services
bin/console debug:container --tag=kernel.event_subscriber
bin/console debug:router                   # list all routes
bin/console debug:event-dispatcher         # list all listeners
bin/console debug:config framework         # show framework config
bin/console debug:autowiring               # list autowirable types
bin/console debug:messenger                # show message routing

# Cache
bin/console cache:clear
bin/console cache:pool:clear cache.app

# Database
bin/console doctrine:schema:validate
bin/console doctrine:query:sql "SELECT COUNT(*) FROM product"
bin/console make:migration

# Messenger
bin/console messenger:consume async -vv
bin/console messenger:failed:show
bin/console messenger:failed:retry
bin/console messenger:stop-workers

# Profiler
bin/console server:dump     # dump server for dump() output
```

---

## Real-World Patterns

Patterns derived from production Symfony 6 projects.

### Custom PHP Attributes with Doctrine Lifecycle Listeners

Cross-cutting concerns (encryption, auditing, soft-delete) via custom attributes + Doctrine event listeners:

```php
// Custom attribute:
#[\Attribute(\Attribute::TARGET_PROPERTY)]
class Encrypted {}

// Entity usage:
class Contact
{
    #[Encrypted]
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $phone = null;

    #[Encrypted]
    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $email = null;
}

// Doctrine listener — auto-encrypts/decrypts marked properties:
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Events;

#[AsDoctrineListener(event: Events::prePersist)]
#[AsDoctrineListener(event: Events::preUpdate)]
#[AsDoctrineListener(event: Events::postLoad)]
class EncryptionSubscriber
{
    public function __construct(private readonly EncryptionService $encryption) {}

    public function prePersist(PrePersistEventArgs $args): void
    {
        $this->encryptFields($args->getObject());
    }

    public function postLoad(PostLoadEventArgs $args): void
    {
        $this->decryptFields($args->getObject());
    }

    private function encryptFields(object $entity): void
    {
        $reflection = new \ReflectionClass($entity);

        foreach ($reflection->getProperties() as $property) {
            if (count($property->getAttributes(Encrypted::class)) === 0) {
                continue;
            }

            $value = $property->getValue($entity);
            if ($value !== null && $value !== '') {
                $property->setValue($entity, $this->encryption->encrypt($value));
            }
        }
    }
}
```

### Custom Serializer Encoder/Decoder

Implement both `EncoderInterface` + `DecoderInterface` for custom formats (e.g. .eml, CSV, vCard):

```php
use Symfony\Component\Serializer\Encoder\DecoderInterface;
use Symfony\Component\Serializer\Encoder\EncoderInterface;

class EmlMessageEncoder implements EncoderInterface, DecoderInterface
{
    public function encode(mixed $data, string $format, array $context = []): string
    {
        // Build RFC 5322 MIME string from array
        $headers = "From: {$data['from']}\r\nTo: {$data['to']}\r\n";
        $headers .= "Subject: {$data['subject']}\r\n";
        // ... multipart handling, quoted-printable encoding
        return $headers . "\r\n" . $data['body'];
    }

    public function decode(string $data, string $format, array $context = []): array
    {
        // Parse MIME headers and body into associative array
        // Map headers dynamically: ucfirst($headerName) → set{Name}()
        return ['from' => $from, 'to' => $to, 'subject' => $subject, 'body' => $body];
    }

    public function supportsEncoding(string $format): bool { return $format === 'eml'; }
    public function supportsDecoding(string $format): bool { return $format === 'eml'; }
}
```

Combined with bidirectional normalizers (`NormalizerInterface` + `DenormalizerInterface`), this enables full pipelines: `eml ↔ object ↔ json`.

### Context-Aware Denormalization

Pass parent references through serializer context for nested object relationships:

```php
class AttachmentNormalizer implements NormalizerInterface, DenormalizerInterface
{
    public function denormalize(mixed $data, string $type, ?string $format = null, array $context = []): Attachment
    {
        $attachment = new Attachment();
        $attachment->setName($data['name']);
        $attachment->setContent(base64_decode($data['content']));

        // Inject parent from context
        if (isset($context['parent_message'])) {
            $attachment->setMessage($context['parent_message']);
        }

        return $attachment;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [Attachment::class => true];
    }
}

// In parent normalizer, pass context down:
$attachments = $serializer->denormalize(
    $data['attachments'],
    Attachment::class . '[]',
    $format,
    array_merge($context, ['parent_message' => $message]),
);
```

### CacheWarmerInterface — Pre-Generate at Deploy Time

Run expensive operations during `cache:clear` / `cache:warmup` instead of on first request:

```php
use Symfony\Component\HttpKernel\CacheWarmer\CacheWarmerInterface;

class BlogCacheWarmer implements CacheWarmerInterface
{
    public function __construct(
        private readonly BlogService $blogService,
        private readonly BlogHtmlCacheService $htmlCache,
    ) {}

    public function isOptional(): bool
    {
        return true; // false = required for app to boot
    }

    public function warmUp(string $cacheDir, ?string $buildDir = null): array
    {
        // Pre-parse all blog posts into cache
        $this->blogService->warmCache();

        // Pre-render static HTML + gzip + brotli compressed versions
        $this->htmlCache->generateAll();

        return []; // return list of preloaded classes if any
    }
}
```

### Multi-Layer Caching Strategy

Layer 1 (data cache) → Layer 2 (pre-rendered static files) → Layer 3 (compressed variants):

```yaml
# config/packages/cache.yaml
framework:
    cache:
        pools:
            cache.blog:
                adapter: cache.adapter.filesystem
                default_lifetime: 2592000  # 30 days
            cache.api:
                adapter: cache.adapter.redis
                default_lifetime: 60
```

```php
// Layer 1: Cache pool with mtime invalidation
$cacheKey = 'blog_post_' . md5($filename);
$cachedItem = $this->cache->getItem($cacheKey);

if ($cachedItem->isHit()) {
    $cached = $cachedItem->get();
    if ($cached['mtime'] === filemtime($filepath)) {
        return $cached['post'];
    }
}

// Layer 2: Static HTML files served by webserver/controller
// Layer 3: .gz + .br pre-compressed for nginx gzip_static/brotli_static
file_put_contents($path . '.html', $html);
file_put_contents($path . '.html.gz', gzencode($html, 9));
file_put_contents($path . '.html.br', brotli_compress($html, 11));
```

### Custom Form Type with Widget Template

Create reusable form types with custom Twig widget rendering:

```php
// Form type:
class AltchaWidgetType extends AbstractType
{
    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'mapped' => false,
            'constraints' => [new AltchaChallenge()],
        ]);
    }

    public function getBlockPrefix(): string
    {
        return 'altcha_widget';
    }
}
```

```twig
{# templates/form/altcha_widget.html.twig #}
{% block altcha_widget_widget %}
    <altcha-widget challengeurl="{{ path('app_contact_challenge') }}" hidelogo></altcha-widget>
    {{ form_widget(form, {type: 'hidden'}) }}
{% endblock %}
```

```yaml
# config/packages/twig.yaml
twig:
    form_themes:
        - 'form/altcha_widget.html.twig'
```

### Custom Validator with External Service

Constraints that depend on injected services (API calls, DB lookups, HMAC verification):

```php
#[\Attribute]
class AltchaChallenge extends Constraint {}

class AltchaChallengeValidator extends ConstraintValidator
{
    public function __construct(
        #[Autowire('%env(ALTCHA_HMAC_KEY)%')]
        private readonly string $hmacKey,
    ) {}

    public function validate(mixed $value, Constraint $constraint): void
    {
        if ($value === null || $value === '') {
            $this->context->buildViolation('captcha.missing')
                ->addViolation();
            return;
        }

        $payload = json_decode(base64_decode($value), true);
        if ($payload === null || !Altcha::verifySolution($payload, $this->hmacKey)) {
            $this->context->buildViolation('captcha.invalid')
                ->addViolation();
        }
    }
}
```

### Login Form Authenticator with Badges

Full custom login using `AbstractLoginFormAuthenticator` with CSRF, remember-me, and throttling:

```php
use Symfony\Component\Security\Http\Authenticator\AbstractLoginFormAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\CsrfTokenBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\RememberMeBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Credentials\PasswordCredentials;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;

class AppAuthenticator extends AbstractLoginFormAuthenticator
{
    public function authenticate(Request $request): Passport
    {
        $email = $request->request->get('email', '');
        $request->getSession()->set(SecurityRequestAttributes::LAST_USERNAME, $email);

        return new Passport(
            new UserBadge($email),
            new PasswordCredentials($request->request->get('password', '')),
            [
                new CsrfTokenBadge('authenticate', $request->request->get('_csrf_token')),
                new RememberMeBadge(),
            ],
        );
    }

    protected function getLoginUrl(Request $request): string
    {
        return $this->urlGenerator->generate('app_login');
    }
}
```

```yaml
# config/packages/security.yaml
security:
    firewalls:
        main:
            custom_authenticator: App\Security\AppAuthenticator
            login_throttling:
                max_attempts: 3
                interval: '15 minutes'
            remember_me:
                secret: '%kernel.secret%'
                lifetime: 604800  # 7 days
```

### Security Headers Subscriber

Add CSP, HSTS, and other security headers to all responses:

```php
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [KernelEvents::RESPONSE => 'onKernelResponse'];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }
}
```

### Process Component — Subprocess Execution

Run external tools (FFmpeg, ImageMagick, wkhtmltopdf) safely:

```php
use Symfony\Component\Process\Process;

class WaveformPeakService
{
    public function generatePeaks(string $audioPath, int $peakCount = 200): array
    {
        // Extract raw PCM via FFmpeg
        $process = new Process([
            'ffmpeg', '-i', $audioPath,
            '-ac', '1',           // mono
            '-f', 's16le',        // raw 16-bit signed PCM
            '-acodec', 'pcm_s16le',
            'pipe:1',             // output to stdout
        ]);
        $process->setTimeout(30);
        $process->run();

        if (!$process->isSuccessful()) {
            throw new \RuntimeException('FFmpeg failed: ' . $process->getErrorOutput());
        }

        $rawData = $process->getOutput();
        $samples = unpack('v*', $rawData); // 16-bit little-endian

        // Downsample into peaks (RMS per chunk)
        $chunkSize = (int) floor(count($samples) / $peakCount);
        $peaks = [];

        for ($i = 0; $i < $peakCount; $i++) {
            $chunk = array_slice($samples, $i * $chunkSize, $chunkSize);
            $rms = sqrt(array_sum(array_map(fn ($s) => $s * $s, $chunk)) / count($chunk));
            $peaks[] = round($rms / 32768, 4); // normalize to 0..1
        }

        return $peaks;
    }
}
```

### Synthetic RequestStack for Background Rendering

When rendering Twig templates outside HTTP context (cache warmup, CLI commands), inject a synthetic Request:

```php
class BlogHtmlCacheService
{
    public function __construct(
        private readonly Environment $twig,
        private readonly RequestStack $requestStack,
    ) {}

    public function renderPost(BlogPost $post, string $locale): string
    {
        // Twig's app.request.locale needs a Request on the stack
        $syntheticRequest = new Request();
        $syntheticRequest->setLocale($locale);
        $syntheticRequest->attributes->set('_route', 'app_blog_show');

        $this->requestStack->push($syntheticRequest);

        try {
            return $this->twig->render('blog/show.html.twig', [
                'post' => $post,
            ]);
        } finally {
            $this->requestStack->pop();
        }
    }
}
```

### Vite Integration (pentatrion/vite-bundle)

Modern alternative to Webpack Encore for Symfony projects:

```yaml
# config/packages/pentatrion_vite.yaml
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

```twig
{# base.html.twig #}
{% block stylesheets %}
    {{ vite_entry_link_tags('main') }}
{% endblock %}
{% block javascripts %}
    {{ vite_entry_script_tags('main') }}
{% endblock %}
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import symfonyPlugin from 'vite-plugin-symfony';

export default defineConfig({
    plugins: [symfonyPlugin()],
    build: {
        rollupOptions: {
            input: { main: './templates/assets/ts/src/main.ts' },
        },
    },
});
```

### Heuristic Validation Service

Business-logic validation that goes beyond simple constraints:

```php
class ContactPlausibilityService
{
    private const KEYBOARD_PATTERNS = ['qwerty', 'asdf', 'zxcv', 'qwertz'];

    public function validateName(string $name): ?string
    {
        // Must contain at least one vowel
        if (preg_match('/[aeiouäöü]/i', $name) !== 1) {
            return 'contact.error.name_implausible';
        }

        // No excessive consecutive consonants (5+)
        if (preg_match('/[^aeiouäöü\s]{5,}/i', $name) === 1) {
            return 'contact.error.name_implausible';
        }

        // No repeated characters (3+ same char)
        if (preg_match('/(.)\1{2,}/', $name) === 1) {
            return 'contact.error.name_implausible';
        }

        // No keyboard mash patterns
        $lower = mb_strtolower($name);
        foreach (self::KEYBOARD_PATTERNS as $pattern) {
            if (str_contains($lower, $pattern)) {
                return 'contact.error.name_implausible';
            }
        }

        return null; // valid
    }
}
```

---

## Common Gotchas

1. **Autowiring ambiguity** — When multiple classes implement the same interface, define named aliases or use `#[Target]`.
2. **Circular references** — Use `#[Lazy]` attribute (Symfony 6.3+) or inject `ContainerInterface` as last resort.
3. **Serializer circular refs** — Set `circular_reference_handler` in context, or use serialization groups to avoid cycles.
4. **Form CSRF in API** — Disable CSRF for JSON API endpoints: `'csrf_protection' => false` in form options.
5. **Messenger retry loop** — Always configure `failure_transport` and `max_retries`. Unhandled messages retry infinitely by default.
6. **Doctrine lazy loading** — Use `JOIN` fetches or `addSelect()` in QueryBuilder to avoid N+1 queries. Never access lazy-loaded associations outside the request scope.
7. **Event priority** — Higher priority = earlier execution. Default is 0. Kernel subscribers often use high values (e.g. 255).
8. **Cache stampede** — Use `cache.adapter.redis` with `lock_factory` or the built-in locking in CacheContracts.
9. **Validator groups** — If you specify groups, `Default` group is NOT included automatically. Add it explicitly if needed.
10. **Service decoration order** — Decorators wrap in registration order. The last registered decorator is the outermost.
11. **Predis over phpredis** — Use `predis/predis` (pure PHP) instead of the phpredis C extension when stability matters. The C extension can cause segfaults in long-running workers.
12. **Twig `{% set %}` in child templates** — Variables set with `{% set %}` outside blocks in child templates cannot access parent template variables. Use `app.request.locale` or pass data via controller instead.
13. **Double encryption** — When using Doctrine lifecycle listeners for encryption, guard against double-encrypting on `preUpdate` if the entity was already encrypted. Check if the value looks encrypted before re-encrypting.
14. **Cache warmup without RequestStack** — Twig templates accessing `app.request.locale` fail during CLI cache warmup. Push a synthetic `Request` onto the `RequestStack` (see Real-World Patterns).
15. **Messenger worker shutdown** — Suppress curl/HTTP warnings on `WorkerRunningEvent` with `$event->getWorker()->stop()` for graceful shutdown. Long-running workers need `--time-limit` or `--memory-limit`.

---

## Documentation References

| Resource | URL |
|----------|-----|
| Official Docs | https://symfony.com/doc/current/index.html |
| Components | https://symfony.com/doc/current/components/index.html |
| Best Practices | https://symfony.com/doc/current/best_practices.html |
| Cookbook | https://symfony.com/doc/current/the-fast-track/en/index.html |
| SymfonyCasts | https://symfonycasts.com/ |
| API Reference | https://api.symfony.com/ |