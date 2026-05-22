---
name: vue
description: Use when developing Vue.js components - Vue 2 Options API, Vue 3 Composition API, script setup, reactivity (ref, reactive, computed, watch), props, emits, slots, provide/inject, lifecycle hooks, directives, TypeScript integration. Triggers on .vue files, Vue components, Shopware 6 Administration.
---

# Vue.js

## Related Skills

| Need | Skill |
|------|-------|
| TypeScript language reference | `typescript` |
| Shopware 6 plugin development (Admin uses Vue) | `shopware` |
| Symfony framework (backend) | `symfony` |

**Shopware 6 Administration is built on Vue.** SW 6.4/6.5 use Vue 2 (Options API), SW 6.6+ use Vue 3.

---

## Overview

Vue.js is a **progressive framework** for building user interfaces. It uses a virtual DOM, reactive data binding, and a component-based architecture.

**Vue 3** (current) supports two API styles:
- **Composition API** with `<script setup>` — recommended for new code
- **Options API** — still supported, used in Shopware 6 Admin (≤6.5)

---

## Composition API (`<script setup>`)

### Reactive State

```vue
<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';

// ref — for primitives and single values
const count = ref(0);
const name = ref('');

// reactive — for objects (deep reactivity)
const form = reactive({
    email: '',
    password: '',
    rememberMe: false,
});

// computed — derived values
const isValid = computed(() => form.email !== '' && form.password.length >= 8);

// Access ref value in script: count.value
// In template: {{ count }} (auto-unwrapped)
function increment(): void {
    count.value++;
}
</script>

<template>
    <button @click="increment">Count: {{ count }}</button>
    <p v-if="isValid">Form is valid</p>
</template>
```

### Props

```vue
<script setup lang="ts">
interface Props {
    title: string;
    count?: number;
    items: string[];
    variant?: 'primary' | 'secondary';
}

const props = withDefaults(defineProps<Props>(), {
    count: 0,
    variant: 'primary',
});

// Access: props.title, props.count
</script>
```

### Emits

```vue
<script setup lang="ts">
interface Emits {
    (e: 'update', value: string): void;
    (e: 'delete', id: number): void;
    (e: 'close'): void;
}

const emit = defineEmits<Emits>();

function handleSave(): void {
    emit('update', 'new value');
}
</script>
```

### v-model on Components

```vue
<!-- Parent -->
<SearchInput v-model="query" v-model:filter="activeFilter" />

<!-- SearchInput.vue -->
<script setup lang="ts">
const model = defineModel<string>(); // default v-model
const filter = defineModel<string>('filter'); // named v-model
</script>

<template>
    <input :value="model" @input="model = ($event.target as HTMLInputElement).value" />
    <select :value="filter" @change="filter = ($event.target as HTMLSelectElement).value">
        <option value="all">All</option>
        <option value="active">Active</option>
    </select>
</template>
```

### Watch

```vue
<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';

const query = ref('');
const results = ref<Item[]>([]);

// Watch specific source
watch(query, async (newVal, oldVal) => {
    if (newVal.length >= 3) {
        results.value = await search(newVal);
    }
});

// Watch with options
watch(
    () => form.email,
    (newEmail) => validateEmail(newEmail),
    { immediate: true, deep: false },
);

// watchEffect — auto-tracks dependencies (like Svelte's $effect)
watchEffect(() => {
    console.log(`Query is: ${query.value}`);
});
</script>
```

### Lifecycle Hooks

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, onBeforeMount, onUpdated, nextTick } from 'vue';

onMounted(() => {
    // DOM is ready
    initThirdPartyLib();
});

onUnmounted(() => {
    // Cleanup — remove listeners, destroy instances
    thirdPartyLib.destroy();
});

// Wait for next DOM update
async function scrollToEnd(): Promise<void> {
    await nextTick();
    container.value?.scrollTo(0, container.value.scrollHeight);
}
</script>
```

| Hook | When |
|------|------|
| `onBeforeMount` | Before initial render |
| `onMounted` | After DOM mount |
| `onBeforeUpdate` | Before reactive data re-render |
| `onUpdated` | After reactive data re-render |
| `onBeforeUnmount` | Before component destruction |
| `onUnmounted` | After component removal |
| `onActivated` | `<KeepAlive>` component activated |
| `onDeactivated` | `<KeepAlive>` component deactivated |

### Template Refs

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
    inputRef.value?.focus();
});
</script>

<template>
    <input ref="inputRef" />
</template>
```

### Provide / Inject (Dependency Injection)

```vue
<!-- Provider (parent/ancestor) -->
<script setup lang="ts">
import { provide, ref } from 'vue';
import type { InjectionKey } from 'vue';

export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme');

const theme = ref('light');
provide(ThemeKey, theme);
</script>

<!-- Consumer (child/descendant) -->
<script setup lang="ts">
import { inject } from 'vue';
import { ThemeKey } from './provider';

const theme = inject(ThemeKey, ref('light')); // with default
</script>
```

### Composables (Reusable Logic)

```typescript
// composables/useCounter.ts
import { ref, type Ref } from 'vue';

interface UseCounterReturn {
    count: Ref<number>;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
}

export function useCounter(initial = 0): UseCounterReturn {
    const count = ref(initial);

    return {
        count,
        increment: () => count.value++,
        decrement: () => count.value--,
        reset: () => { count.value = initial; },
    };
}
```

```vue
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter';

const { count, increment, reset } = useCounter(10);
</script>
```

---

## Options API (Vue 2 / Shopware Admin)

Used in Shopware 6 Administration (≤6.5 = Vue 2, ≥6.6 = Vue 3 but still Options API in many places).

```javascript
export default {
    name: 'sw-example-list',

    inject: ['repositoryFactory'],

    mixins: [Mixin.getByName('listing')],

    props: {
        title: { type: String, required: true },
        limit: { type: Number, default: 25 },
    },

    data() {
        return {
            items: [],
            isLoading: false,
            searchTerm: '',
        };
    },

    computed: {
        repository() {
            return this.repositoryFactory.create('product');
        },

        filteredItems() {
            if (this.searchTerm === '') {
                return this.items;
            }
            return this.items.filter(item =>
                item.name.toLowerCase().includes(this.searchTerm.toLowerCase()),
            );
        },
    },

    watch: {
        searchTerm: {
            handler(newVal) {
                this.loadItems(newVal);
            },
            immediate: false,
        },
    },

    created() {
        this.loadItems();
    },

    methods: {
        async loadItems(search = '') {
            this.isLoading = true;
            const { Criteria } = Shopware.Data;
            const criteria = new Criteria();

            if (search !== '') {
                criteria.addFilter(Criteria.contains('name', search));
            }

            criteria.setLimit(this.limit);
            this.items = await this.repository.search(criteria, Shopware.Context.api);
            this.isLoading = false;
        },
    },
};
```

### Options API Lifecycle

| Hook | When |
|------|------|
| `beforeCreate` | Before instance init |
| `created` | After reactive data setup, before DOM |
| `beforeMount` | Before initial render |
| `mounted` | After DOM mount |
| `beforeUpdate` | Before re-render |
| `updated` | After re-render |
| `beforeDestroy` (Vue 2) / `beforeUnmount` (Vue 3) | Before teardown |
| `destroyed` (Vue 2) / `unmounted` (Vue 3) | After teardown |

---

## Template Syntax

### Directives

```vue
<template>
    <!-- Conditionals -->
    <div v-if="status === 'active'">Active</div>
    <div v-else-if="status === 'pending'">Pending</div>
    <div v-else>Inactive</div>

    <div v-show="isVisible">Toggle visibility (CSS display)</div>

    <!-- Lists -->
    <ul>
        <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>

    <!-- Two-way binding -->
    <input v-model="searchTerm" />
    <input v-model.trim="name" />
    <input v-model.number="age" type="number" />
    <input v-model.lazy="email" />

    <!-- Event handling -->
    <button @click="handleClick">Click</button>
    <button @click.prevent="handleSubmit">Submit</button>
    <input @keyup.enter="search" />
    <div @click.stop="handleInner">Stop propagation</div>

    <!-- Attribute binding -->
    <img :src="imageUrl" :alt="imageAlt" />
    <div :class="{ active: isActive, 'text-danger': hasError }">...</div>
    <div :class="[baseClass, { highlight: isHighlighted }]">...</div>
    <div :style="{ color: textColor, fontSize: size + 'px' }">...</div>

    <!-- Dynamic attributes -->
    <component :is="currentComponent" />
    <div v-bind="$attrs">Spread all attributes</div>

    <!-- Raw HTML (caution: XSS risk) -->
    <div v-html="htmlContent"></div>

    <!-- Once (render once, skip future updates) -->
    <span v-once>{{ staticValue }}</span>
</template>
```

### Event Modifiers

| Modifier | Effect |
|----------|--------|
| `.prevent` | `event.preventDefault()` |
| `.stop` | `event.stopPropagation()` |
| `.self` | Only trigger if event target is element itself |
| `.once` | Trigger at most once |
| `.capture` | Use capture mode |
| `.passive` | `{ passive: true }` |

### Key Modifiers

```vue
<input @keyup.enter="submit" />
<input @keyup.esc="cancel" />
<input @keyup.tab="nextField" />
<div @keydown.ctrl.s.prevent="save">...</div>
```

---

## Slots

### Default Slot

```vue
<!-- Card.vue -->
<template>
    <div class="card">
        <slot />
    </div>
</template>

<!-- Usage -->
<Card>
    <p>Card content here</p>
</Card>
```

### Named Slots

```vue
<!-- Layout.vue -->
<template>
    <header><slot name="header" /></header>
    <main><slot /></main>
    <footer><slot name="footer" /></footer>
</template>

<!-- Usage -->
<Layout>
    <template #header><h1>Title</h1></template>
    <p>Main content</p>
    <template #footer><small>Footer</small></template>
</Layout>
```

### Scoped Slots (data from child to parent)

```vue
<!-- DataTable.vue -->
<template>
    <table>
        <tr v-for="item in items" :key="item.id">
            <slot name="row" :item="item" :index="index" />
        </tr>
    </table>
</template>

<!-- Usage -->
<DataTable :items="products">
    <template #row="{ item }">
        <td>{{ item.name }}</td>
        <td>{{ item.price }}</td>
    </template>
</DataTable>
```

---

## Custom Directives

```vue
<script setup lang="ts">
import type { Directive } from 'vue';

const vFocus: Directive<HTMLElement> = {
    mounted(el) {
        el.focus();
    },
};

const vClickOutside: Directive<HTMLElement, () => void> = {
    mounted(el, binding) {
        el.__clickOutsideHandler = (event: Event) => {
            if (!el.contains(event.target as Node)) {
                binding.value();
            }
        };
        document.addEventListener('click', el.__clickOutsideHandler);
    },
    unmounted(el) {
        document.removeEventListener('click', el.__clickOutsideHandler);
    },
};
</script>

<template>
    <input v-focus />
    <div v-click-outside="closeDropdown">Dropdown</div>
</template>
```

---

## Transitions

```vue
<template>
    <Transition name="fade">
        <div v-if="visible">Content</div>
    </Transition>

    <TransitionGroup name="list" tag="ul">
        <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </TransitionGroup>
</template>

<style>
.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.list-enter-active, .list-leave-active {
    transition: all 0.3s ease;
}
.list-enter-from, .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
.list-move {
    transition: transform 0.3s ease;
}
</style>
```

---

## Pinia (State Management, Vue 3)

Replaces Vuex. Used in Shopware 6.7+.

```typescript
// stores/counter.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCounterStore = defineStore('counter', () => {
    const count = ref(0);
    const doubleCount = computed(() => count.value * 2);

    function increment(): void {
        count.value++;
    }

    return { count, doubleCount, increment };
});
```

```vue
<script setup lang="ts">
import { useCounterStore } from '@/stores/counter';

const counter = useCounterStore();
</script>

<template>
    <button @click="counter.increment">{{ counter.count }}</button>
</template>
```

---

## Vue 2 → Vue 3 Migration

| Vue 2 | Vue 3 |
|-------|-------|
| `new Vue({ ... })` | `createApp({ ... })` |
| `Vue.component()` | `app.component()` |
| `Vue.use(plugin)` | `app.use(plugin)` |
| `this.$emit('event')` | `emit('event')` (Composition API) |
| `this.$refs.name` | `const name = ref(null)` |
| `data()` function | `ref()` / `reactive()` |
| `computed: { ... }` | `computed(() => ...)` |
| `watch: { ... }` | `watch(source, cb)` |
| `beforeDestroy` | `onBeforeUnmount` |
| `destroyed` | `onUnmounted` |
| `$on` / `$off` / `$once` | Removed — use external event bus or emits |
| `v-model` (single) | `v-model` + `v-model:name` (multiple) |
| Vuex | Pinia |
| Filters (`{{ x \| filter }}`) | Removed — use computed or methods |
| `$set` / `$delete` | Not needed (Proxy-based reactivity) |

### Shopware-Specific Vue 2→3 Changes

| SW 6.5 (Vue 2) | SW 6.6+ (Vue 3) |
|----------------|-----------------|
| `v-model="val"` | `v-model:value="val"` on custom components |
| `vue-meta` for page titles | Removed — use `title` property |
| Vuex stores | Pinia stores (SW 6.7) |
| Webpack 4 | Webpack 5 (SW 6.6) / Vite (SW 6.7) |

---

## TypeScript with Vue

### Component Typing

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

interface User {
    id: number;
    name: string;
    email: string;
}

const users = ref<User[]>([]);
const selectedId = ref<number | null>(null);

const selectedUser = computed<User | undefined>(() =>
    users.value.find(u => u.id === selectedId.value),
);
</script>
```

### Props with Complex Types

```vue
<script setup lang="ts">
import type { PropType } from 'vue';

interface Column {
    key: string;
    label: string;
    sortable?: boolean;
}

// Generic props with defineProps
const props = defineProps<{
    columns: Column[];
    data: Record<string, unknown>[];
    loading?: boolean;
}>();
```

### Typed Template Refs

```vue
<script setup lang="ts">
import { ref } from 'vue';
import MyComponent from './MyComponent.vue';

const inputRef = ref<HTMLInputElement | null>(null);
const childRef = ref<InstanceType<typeof MyComponent> | null>(null);
</script>
```

### Typed Provide/Inject

```typescript
import type { InjectionKey, Ref } from 'vue';

interface UserContext {
    user: Ref<User | null>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const UserKey: InjectionKey<UserContext> = Symbol('user');
```

---

## Common Gotchas

1. **`ref` vs `reactive`** — Use `ref` for primitives and single values, `reactive` for objects. Don't destructure `reactive()` — it loses reactivity. Use `toRefs()` if needed.
2. **`.value` in script, not in template** — `ref.value` is needed in `<script>`, but auto-unwrapped in `<template>`. Forgetting `.value` in script is the #1 Vue bug.
3. **`v-if` vs `v-show`** — `v-if` removes from DOM (toggle cost), `v-show` uses CSS display (initial render cost). Use `v-show` for frequent toggles.
4. **`v-for` needs `:key`** — Always provide a unique `:key`. Never use array index as key for dynamic lists.
5. **`v-if` + `v-for`** — Never use on same element. `v-if` has higher priority in Vue 3 (opposite from Vue 2). Use a `<template>` wrapper or computed filter.
6. **Props are readonly** — Never mutate props. Use `emit` to signal changes to parent, or use `defineModel` for two-way binding.
7. **`watch` vs `watchEffect`** — `watch` is explicit about sources and gives old/new values. `watchEffect` auto-tracks but no old value. Use `watch` for most cases.
8. **Reactivity lost** — Reassigning a `reactive` object (`obj = newObj`) breaks reactivity. Use `Object.assign(obj, newObj)` or switch to `ref`.
9. **`$attrs` inheritance** — In Vue 3, `$attrs` includes `class` and `style`. Disable with `inheritAttrs: false` on multi-root components.
10. **Shopware `$super`** — In Shopware Admin overrides, call `this.$super('methodName')` to invoke the original. Standard Vue has no `$super`.
11. **Shopware criteria** — When overriding `categoryCriteria` or similar computed, always call `this.$super()` first, then add associations.
12. **Async setup** — `<script setup>` cannot be async. Use `onMounted` for async initialization.

---

## Documentation References

| Resource | URL |
|----------|-----|
| Official Docs | https://vuejs.org/guide/introduction.html |
| API Reference | https://vuejs.org/api/ |
| Playground | https://play.vuejs.org/ |
| Pinia (State) | https://pinia.vuejs.org/ |
| Vue Router | https://router.vuejs.org/ |
| TypeScript Guide | https://vuejs.org/guide/typescript/overview.html |
| Migration Guide | https://v3-migration.vuejs.org/ |