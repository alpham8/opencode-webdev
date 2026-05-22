---
name: typescript
description: Use when writing TypeScript code - type system, generics, utility types, type guards, discriminated unions, tsconfig, strict mode, DOM typing, async patterns, module patterns. Triggers on .ts files, tsconfig.json, type annotations, interfaces, generics.
---

# TypeScript

## Related Skills

| Need | Skill |
|------|-------|
| Vue.js components with TypeScript | `vue` |
| Svelte 5 components with TypeScript | `svelte` |
| Shopware 6 plugin development | `shopware` |
| Symfony project setup (Vite + TS build) | `symfony-project-setup` |

---

## Overview

TypeScript is a **typed superset of JavaScript** that compiles to plain JS. It adds static types, interfaces, generics, and advanced type-level programming. Current version: **5.x**.

**Philosophy:** Catch errors at compile time, not runtime. Types are documentation that the compiler enforces.

---

## Type System Fundamentals

### Primitive Types

```typescript
const name: string = 'Alice';
const age: number = 30;
const active: boolean = true;
const id: bigint = 100n;
const sym: symbol = Symbol('key');
const nothing: null = null;
const missing: undefined = undefined;
```

### Arrays & Tuples

```typescript
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ['Alice', 'Bob'];

// Tuple — fixed length and types
const pair: [string, number] = ['age', 30];
const triple: [id: number, name: string, active: boolean] = [1, 'Alice', true]; // labeled

// Readonly tuple
const point: readonly [number, number] = [10, 20];
```

### Object Types & Interfaces

```typescript
// Interface — preferred for object shapes (extendable)
interface User {
    readonly id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string; // optional
}

// Type alias — for unions, intersections, mapped types
type Result<T> = { success: true; data: T } | { success: false; error: string };

// Index signatures
interface Dictionary<T> {
    [key: string]: T;
}

// Record (preferred over index signature)
type Config = Record<string, string | number>;
```

### Enums

```typescript
// String enums (preferred — readable at runtime)
enum Status {
    Active = 'active',
    Inactive = 'inactive',
    Pending = 'pending',
}

// Const enums (inlined at compile time — no runtime object)
const enum Direction {
    Up = 'UP',
    Down = 'DOWN',
}

// Usage
function filter(status: Status): void { /* ... */ }
filter(Status.Active);
```

> **Prefer string enums** over numeric. They produce readable values in logs, JSON, and debugging.

### Union & Intersection Types

```typescript
// Union — one of several types
type StringOrNumber = string | number;

// Discriminated union — tagged with a literal field
interface Square { kind: 'square'; size: number; }
interface Circle { kind: 'circle'; radius: number; }
type Shape = Square | Circle;

function area(shape: Shape): number {
    switch (shape.kind) {
        case 'square': return shape.size ** 2;
        case 'circle': return Math.PI * shape.radius ** 2;
    }
}

// Intersection — combine multiple types
type Timestamped<T> = T & { createdAt: Date; updatedAt: Date };
type TimestampedUser = Timestamped<User>;
```

---

## Generics

### Functions

```typescript
function first<T>(items: T[]): T | undefined {
    return items[0];
}

// With constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
}

// Multiple type parameters
function zip<A, B>(a: A[], b: B[]): [A, B][] {
    return a.map((item, i) => [item, b[i]]);
}
```

### Interfaces & Classes

```typescript
interface Repository<T> {
    findById(id: string): Promise<T | undefined>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<void>;
}

class InMemoryRepository<T extends { id: string }> implements Repository<T> {
    private items: Map<string, T> = new Map();

    async findById(id: string): Promise<T | undefined> {
        return this.items.get(id);
    }

    async findAll(): Promise<T[]> {
        return [...this.items.values()];
    }

    async save(entity: T): Promise<void> {
        this.items.set(entity.id, entity);
    }
}
```

### Generic Constraints

```typescript
// Must have a length property
function longest<T extends { length: number }>(a: T, b: T): T {
    return a.length >= b.length ? a : b;
}

// Must be a constructor
type Constructor<T = {}> = new (...args: any[]) => T;
```

---

## Utility Types

| Type | Purpose | Example |
|------|---------|---------|
| `Partial<T>` | All properties optional | `Partial<User>` |
| `Required<T>` | All properties required | `Required<Config>` |
| `Readonly<T>` | All properties readonly | `Readonly<User>` |
| `Pick<T, K>` | Subset of properties | `Pick<User, 'name' \| 'email'>` |
| `Omit<T, K>` | Exclude properties | `Omit<User, 'id'>` |
| `Record<K, V>` | Object with typed keys/values | `Record<string, number>` |
| `Exclude<T, U>` | Remove types from union | `Exclude<Status, Status.Pending>` |
| `Extract<T, U>` | Keep matching union members | `Extract<Shape, { kind: 'circle' }>` |
| `NonNullable<T>` | Remove null/undefined | `NonNullable<string \| null>` |
| `ReturnType<T>` | Function's return type | `ReturnType<typeof fetch>` |
| `Parameters<T>` | Function's parameter types | `Parameters<typeof setTimeout>` |
| `Awaited<T>` | Unwrap Promise | `Awaited<Promise<string>>` → `string` |
| `InstanceType<T>` | Class instance type | `InstanceType<typeof Error>` |

### Combining Utility Types

```typescript
// Create DTO from entity (omit id, make all optional)
type UpdateUserDto = Partial<Omit<User, 'id'>>;

// Pick only serializable fields
type UserJson = Pick<User, 'id' | 'name' | 'email'>;

// Readonly config with string keys
type AppConfig = Readonly<Record<string, string | number | boolean>>;
```

---

## Type Narrowing & Guards

### Built-in Narrowing

```typescript
function process(value: string | number): string {
    if (typeof value === 'string') {
        return value.toUpperCase(); // string
    }
    return value.toFixed(2); // number
}

function handleError(error: unknown): string {
    if (error instanceof Error) {
        return error.message; // Error
    }
    return String(error);
}

// in operator
function hasName(obj: unknown): obj is { name: string } {
    return typeof obj === 'object' && obj !== null && 'name' in obj;
}
```

### Custom Type Guards

```typescript
interface Dog { kind: 'dog'; bark(): void; }
interface Cat { kind: 'cat'; meow(): void; }
type Animal = Dog | Cat;

// Type predicate — narrows type in caller scope
function isDog(animal: Animal): animal is Dog {
    return animal.kind === 'dog';
}

const animal: Animal = getAnimal();
if (isDog(animal)) {
    animal.bark(); // TypeScript knows it's Dog
}
```

### Assertion Functions

```typescript
function assertDefined<T>(value: T | null | undefined, msg?: string): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error(msg ?? 'Value is null/undefined');
    }
}

const element = document.getElementById('app');
assertDefined(element, 'Missing #app element');
element.textContent = 'Hello'; // no null check needed
```

---

## Advanced Types

### Conditional Types

```typescript
type IsString<T> = T extends string ? true : false;

// Infer — extract types from other types
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// Distributive conditional types
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>; // string[] | number[]
```

### Mapped Types

```typescript
// Make all properties nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Rename keys with template literals
type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Filter properties by type
type StringKeys<T> = {
    [K in keyof T as T[K] extends string ? K : never]: T[K];
};
```

### Template Literal Types

```typescript
type EventName = `on${Capitalize<'click' | 'focus' | 'blur'>}`;
// → 'onClick' | 'onFocus' | 'onBlur'

type CSSProperty = `${string}-${string}`;
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type APIEndpoint = `/${string}`;
```

### `satisfies` Operator (TS 5.0+)

Validates type without widening:

```typescript
type Color = 'red' | 'green' | 'blue';
type RGB = [number, number, number];

const palette = {
    red: [255, 0, 0],
    green: '#00ff00',
    blue: [0, 0, 255],
} satisfies Record<Color, string | RGB>;

// palette.red is still [number, number, number], not string | RGB
palette.red[0]; // OK — type is preserved
```

---

## Decorators

### TC39 Stage-3 Decorators (TS 5.0+, recommended)

```json
// tsconfig.json — NO extra flag needed for TC39 decorators in TS 5.0+
```

```typescript
// Class decorator
function sealed(constructor: Function): void {
    Object.seal(constructor);
    Object.seal(constructor.prototype);
}

@sealed
class UserService {
    // ...
}

// Method decorator
function log(_target: any, context: ClassMethodDecoratorContext): void {
    const methodName = String(context.name);
    context.addInitializer(function (this: any) {
        const original = this[methodName];
        this[methodName] = function (...args: any[]) {
            console.log(`Calling ${methodName} with`, args);
            return original.apply(this, args);
        };
    });
}

class OrderService {
    @log
    process(orderId: string): void {
        // ...
    }
}

// Property decorator (auto-init)
function defaultValue<T>(value: T) {
    return function (_target: undefined, context: ClassFieldDecoratorContext): (initialValue: T) => T {
        return () => value;
    };
}

class Config {
    @defaultValue(3000)
    accessor port: number;

    @defaultValue('localhost')
    accessor host: string;
}
```

### Legacy/Experimental Decorators (Angular, older Vue, NestJS)

```json
// tsconfig.json
{
    "compilerOptions": {
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true
    }
}
```

```typescript
// Parameter types emitted as metadata (requires reflect-metadata)
import 'reflect-metadata';

// Class decorator factory
function Component(options: { selector: string; template: string }) {
    return function <T extends new (...args: any[]) => {}>(constructor: T) {
        return class extends constructor {
            selector = options.selector;
            template = options.template;
        };
    };
}

// Property decorator
function Inject(token: string) {
    return function (target: any, propertyKey: string): void {
        // resolve dependency from DI container
        Object.defineProperty(target, propertyKey, {
            get: () => container.get(token),
        });
    };
}

// Method decorator
function Cacheable(ttl: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
        const original = descriptor.value;
        const cache = new Map<string, { value: any; expires: number }>();

        descriptor.value = function (...args: any[]) {
            const key = JSON.stringify(args);
            const cached = cache.get(key);

            if (cached && cached.expires > Date.now()) {
                return cached.value;
            }

            const result = original.apply(this, args);
            cache.set(key, { value: result, expires: Date.now() + ttl });
            return result;
        };
    };
}

// Parameter decorator
function Required(target: any, propertyKey: string, parameterIndex: number): void {
    const requiredParams: number[] = Reflect.getMetadata('required', target, propertyKey) || [];
    requiredParams.push(parameterIndex);
    Reflect.defineMetadata('required', requiredParams, target, propertyKey);
}
```

### Decorator Usage in Frameworks

| Framework | Decorator Mode | Common Decorators |
|-----------|---------------|-------------------|
| **Angular** | Legacy (`experimentalDecorators`) | `@Component`, `@Injectable`, `@Input`, `@Output`, `@ViewChild` |
| **NestJS** | Legacy (`experimentalDecorators`) | `@Controller`, `@Get`, `@Post`, `@Injectable`, `@Module` |
| **Vue (class-based)** | Legacy (`experimentalDecorators`) | `@Component`, `@Prop`, `@Emit`, `@Watch` (via vue-class-component) |
| **TypeORM** | Legacy (`experimentalDecorators`) | `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, `@ManyToOne` |
| **MobX** | TC39 (TS 5.0+) | `@observable`, `@computed`, `@action` |

> **Rule:** Never mix legacy and TC39 decorators in the same project. Check `tsconfig.json` for `experimentalDecorators` to determine which mode.

---

## `tsconfig.json` Configuration

### Recommended Strict Config

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noImplicitReturns": true,
        "noFallthroughCasesInSwitch": true,
        "exactOptionalPropertyTypes": true,
        "forceConsistentCasingInFileNames": true,
        "isolatedModules": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "resolveJsonModule": true
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules"]
}
```

### For Svelte Projects

```json
{
    "extends": "@tsconfig/svelte/tsconfig.json",
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "allowJs": true,
        "checkJs": true,
        "isolatedModules": true
    },
    "include": ["templates/assets/ts/src/**/*.ts", "templates/assets/ts/src/**/*.svelte"],
    "exclude": ["node_modules"]
}
```

### What `strict: true` Enables

| Flag | Effect |
|------|--------|
| `strictNullChecks` | `null`/`undefined` not assignable to other types |
| `strictFunctionTypes` | Contravariant function parameter checking |
| `strictBindCallApply` | Type-check `bind`, `call`, `apply` |
| `strictPropertyInitialization` | Class properties must be initialized |
| `noImplicitAny` | Error on implicit `any` types |
| `noImplicitThis` | Error on `this` with implicit `any` |
| `alwaysStrict` | Emit `"use strict"` |
| `useUnknownInCatchVariables` | `catch (e)` is `unknown`, not `any` |

---

## DOM Typing

### Element Selection (Defensive)

```typescript
// getElementById returns HTMLElement | null — always guard
const app = document.getElementById('app');
if (app === null) {
    throw new Error('Missing #app element');
}
app.textContent = 'Ready';

// querySelector with type parameter
const input = document.querySelector<HTMLInputElement>('#search');
if (input !== null) {
    input.value = '';
}

// querySelectorAll returns NodeListOf
const buttons = document.querySelectorAll<HTMLButtonElement>('.btn');
buttons.forEach(btn => btn.disabled = true);
```

### Event Handling (Typed)

```typescript
function initSearch(container: HTMLElement): void {
    const input = container.querySelector<HTMLInputElement>('input');
    if (input === null) return;

    input.addEventListener('input', (e: Event) => {
        const target = e.currentTarget as HTMLInputElement;
        handleSearch(target.value);
    });

    input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            input.value = '';
        }
    });
}
```

### Data Attributes

```typescript
// Read from Twig-rendered mount points
const element = document.getElementById('song-list-app');
if (element !== null) {
    const locale: string = element.dataset.locale ?? 'de';
    const showFilters: boolean = element.dataset.showFilters === 'true';
    const maxItems: number = parseInt(element.dataset.maxItems ?? '10', 10);
}
```

---

## Async Patterns

### Fetch with Type Safety

```typescript
interface ApiResponse<T> {
    data: T;
    total: number;
}

async function fetchSongs(locale: string): Promise<Song[]> {
    const response = await fetch(`/api/songs/${locale}`);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<Song[]> = await response.json();
    return result.data;
}
```

### AbortController (Cancel Requests)

```typescript
let abortController: AbortController | null = null;

async function search(query: string): Promise<SearchResult[]> {
    // Cancel previous request
    abortController?.abort();
    abortController = new AbortController();

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            signal: abortController.signal,
        });

        if (!response.ok) {
            return [];
        }

        return await response.json();
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return []; // cancelled — not an error
        }
        throw error;
    }
}
```

### Debounce (Typed)

```typescript
function debounce<T extends (...args: any[]) => void>(
    fn: T,
    delay: number,
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>): void => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Usage
const DEBOUNCE_MS = 800;
const debouncedSearch = debounce((query: string) => search(query), DEBOUNCE_MS);
```

---

## Module Patterns

### Named Exports (preferred — no default exports)

```typescript
// budgetSlider.ts
interface BudgetStep {
    label: Record<string, string>;
    value: string;
}

const BUDGET_STEPS: readonly BudgetStep[] = [
    { label: { de: 'Kein Budget', en: 'No budget' }, value: '' },
    { label: { de: '500 - 1.000 €', en: '500 - 1,000 €' }, value: '500-1000' },
] as const;

function initBudgetSlider(locale: string): void {
    const slider = document.getElementById('budget-slider') as HTMLInputElement | null;
    if (slider === null) return;

    slider.addEventListener('input', () => {
        const step = BUDGET_STEPS[parseInt(slider.value, 10)];
        updateLabel(step.label[locale] ?? step.label['de']);
    });
}

export { initBudgetSlider };
export type { BudgetStep };
```

### Entry Point (Orchestrator)

```typescript
// main.ts — mounts all modules based on DOM
import { initBudgetSlider } from './budgetSlider';
import { initLocationAutocomplete } from './locationAutocomplete';
import { initConsentPlayer } from './consentPlayer';

document.addEventListener('DOMContentLoaded', () => {
    const locale = document.documentElement.lang || 'de';

    if (document.getElementById('budget-slider') !== null) {
        initBudgetSlider(locale);
    }

    if (document.getElementById('location-input') !== null) {
        initLocationAutocomplete(locale);
    }

    document.querySelectorAll<HTMLElement>('[data-consent-player]').forEach(el => {
        initConsentPlayer(el);
    });
});
```

---

## Error Handling

### `unknown` in Catch Blocks

```typescript
try {
    await riskyOperation();
} catch (error: unknown) {
    // Narrow before using
    if (error instanceof Error) {
        console.error(error.message);
    } else if (typeof error === 'string') {
        console.error(error);
    } else {
        console.error('Unknown error', error);
    }
}
```

### Result Type Pattern (no exceptions)

```typescript
type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

function parseJson<T>(text: string): Result<T> {
    try {
        return { ok: true, value: JSON.parse(text) };
    } catch (error: unknown) {
        return { ok: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
}

const result = parseJson<Config>(raw);
if (result.ok) {
    useConfig(result.value);
} else {
    log(result.error.message);
}
```

---

## Real-World Patterns

### GDPR Consent Player (Lazy Iframe)

```typescript
interface ConsentPlayerOptions {
    type: 'mixcloud' | 'youtube';
    embedUrl: string;
    cookieName: string;
    cookieDays: number;
}

function initConsentPlayer(container: HTMLElement): void {
    const options: ConsentPlayerOptions = {
        type: (container.dataset.type as ConsentPlayerOptions['type']) ?? 'youtube',
        embedUrl: container.dataset.embedUrl ?? '',
        cookieName: container.dataset.cookieName ?? 'consent_player',
        cookieDays: parseInt(container.dataset.cookieDays ?? '365', 10),
    };

    if (hasConsent(options.cookieName)) {
        loadIframe(container, options.embedUrl);
        return;
    }

    showConsentBanner(container, () => {
        setConsent(options.cookieName, options.cookieDays);
        loadIframe(container, options.embedUrl);
    });
}
```

### Location Autocomplete with Abort

```typescript
interface PhotonFeature {
    properties: {
        name?: string;
        street?: string;
        housenumber?: string;
        postcode?: string;
        city?: string;
        country?: string;
    };
    geometry: { coordinates: [number, number] };
}

let controller: AbortController | null = null;

async function searchLocation(query: string): Promise<PhotonFeature[]> {
    controller?.abort();
    controller = new AbortController();

    const url = new URL('https://photon.komoot.io/api/');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', '5');
    url.searchParams.set('lang', 'de');
    url.searchParams.set('layer', 'house,street,city');

    try {
        const res = await fetch(url.toString(), { signal: controller.signal });
        if (!res.ok) return [];

        const data = await res.json();
        return data.features ?? [];
    } catch {
        return []; // abort or network error — silent
    }
}
```

### Cookie Utilities (Typed)

```typescript
function setCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match !== null ? decodeURIComponent(match[1]) : null;
}

function hasConsent(cookieName: string): boolean {
    return getCookie(cookieName) === '1';
}
```

---

## Common Gotchas

1. **`any` vs `unknown`** — Never use `any`. Use `unknown` and narrow with type guards. `any` disables all type checking.
2. **Object index access** — Enable `noUncheckedIndexedAccess` in tsconfig. Without it, `obj[key]` never returns `undefined` even when the key doesn't exist.
3. **`==` vs `===`** — Always use strict equality. TypeScript won't catch `null == undefined` being `true` with loose equality.
4. **Type assertions (`as`)** — Avoid when possible. Prefer type guards or generics. `as` bypasses the type checker.
5. **Enum pitfalls** — Numeric enums allow any number at runtime. Use string enums for safety.
6. **`catch (e: unknown)`** — Since TS 4.4 with `useUnknownInCatchVariables`, catch variables are `unknown`. Always narrow before using.
7. **`!` non-null assertion** — Only use after a null check. Never use to suppress errors you haven't investigated.
8. **`ReturnType<typeof fn>`** — Use `typeof` when referencing value-level functions in type position. `ReturnType<fn>` is a type error.
9. **Mutable vs readonly** — Use `readonly` arrays and `Readonly<T>` objects for data that shouldn't change. Prevents accidental mutation.
10. **`as const`** — Use for literal arrays and objects to get the narrowest possible type. `['a', 'b'] as const` is `readonly ['a', 'b']`, not `string[]`.
11. **DOM null checks** — `getElementById`, `querySelector` always return `T | null`. Never skip the null check.
12. **Import type** — Use `import type { X }` for type-only imports. Prevents runtime imports of type-only modules and enables `isolatedModules`.

---

## Documentation References

| Resource | URL |
|----------|-----|
| Official Handbook | https://www.typescriptlang.org/docs/handbook/ |
| Playground | https://www.typescriptlang.org/play |
| tsconfig Reference | https://www.typescriptlang.org/tsconfig |
| Release Notes | https://www.typescriptlang.org/docs/handbook/release-notes/overview.html |
| Utility Types | https://www.typescriptlang.org/docs/handbook/utility-types.html |
| Wikipedia (DE) | https://de.wikipedia.org/wiki/TypeScript |