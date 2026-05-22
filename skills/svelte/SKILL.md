---
name: svelte
description: Use when developing Svelte 5 components with TypeScript - both standalone mounting in Symfony/Twig and SvelteKit full-stack apps. Triggers on .svelte files, Svelte 5 runes ($state, $derived, $effect, $props), Vite Svelte plugin, SvelteKit routes/load functions.
---

# Svelte 5 + TypeScript

## Related Skills

| Need | Skill |
|------|-------|
| TypeScript language reference (types, generics, patterns) | `typescript` |
| ASP.NET Core (backend for SvelteKit frontends) | `aspnet-core` |
| Symfony framework (backend for Svelte frontends) | `symfony` |
| Symfony project setup (Vite/pentatrion config) | `symfony-project-setup` |
| DDEV CLI commands (npm run build, dev server) | `ddev-development` |

---

## Overview

Svelte is a **compiler** that converts declarative UI components into efficient vanilla JavaScript. Unlike React/Vue, Svelte has no virtual DOM — it generates surgical DOM updates at build time.

**Svelte 5** introduced **runes** — a new reactivity API replacing the implicit `let` reactivity of Svelte 3/4. All new code should use runes.

This skill covers Svelte 5 as **standalone components** mounted into existing applications (e.g. Symfony/Twig), not SvelteKit.

---

## Runes — Reactive Primitives

### `$state` — Reactive State

```svelte
<script lang="ts">
    let count: number = $state(0);
    let name: string = $state('');
    let items: string[] = $state([]);

    // Deep reactivity — nested mutations trigger updates
    let todos = $state([
        { id: 1, text: 'Learn Svelte', done: false },
    ]);

    function toggle(id: number): void {
        const todo = todos.find(t => t.id === id);
        if (todo) {
            todo.done = !todo.done; // triggers UI update
        }
    }

    function add(text: string): void {
        todos.push({ id: Date.now(), text, done: false }); // reactive
    }
</script>
```

**`$state.raw`** — No deep reactivity (better performance for large datasets):

```svelte
<script lang="ts">
    let largeList = $state.raw<DataItem[]>([]);

    // Must reassign to trigger updates (mutations are ignored)
    largeList = [...largeList, newItem];
</script>
```

**`$state.snapshot`** — Extract plain (non-proxied) data for external APIs:

```svelte
<script lang="ts">
    function save(): void {
        const plain = $state.snapshot(todos);
        localStorage.setItem('todos', JSON.stringify(plain));
    }
</script>
```

### `$derived` — Computed Values

```svelte
<script lang="ts">
    let items = $state([{ price: 10, qty: 2 }, { price: 5, qty: 3 }]);

    // Simple expression
    let itemCount: number = $derived(items.length);

    // Complex computation with $derived.by
    let total: number = $derived.by(() => {
        return items.reduce((sum, item) => sum + item.price * item.qty, 0);
    });

    // Filtered derived state
    let expensive = $derived(items.filter(i => i.price > 8));
</script>

<p>{itemCount} items, total: {total}</p>
```

> **Rule:** Never use `$effect` to set derived state. Use `$derived` instead.

### `$effect` — Side Effects

```svelte
<script lang="ts">
    let query: string = $state('');

    // Runs when dependencies change (auto-tracked)
    $effect(() => {
        if (query.length >= 3) {
            fetchResults(query);
        }
    });

    // Cleanup: return a teardown function
    $effect(() => {
        const handler = (e: KeyboardEvent) => { /* ... */ };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    });

    // Pre-effect: runs before DOM updates
    $effect.pre(() => {
        // measure DOM before update
    });
</script>
```

> **Avoid:** Don't use `$effect` to synchronize state. Prefer `$derived` or event handlers.

### `$props` — Component Properties

```svelte
<script lang="ts">
    interface Props {
        title: string;
        count?: number;
        onchange?: (value: string) => void;
    }

    let { title, count = 0, onchange }: Props = $props();
</script>

<h1>{title} ({count})</h1>
```

**Rest props** (spread remaining to DOM element):

```svelte
<script lang="ts">
    let { class: className, children, ...rest } = $props();
</script>

<div class={className} {...rest}>
    {@render children?.()}
</div>
```

### `$bindable` — Two-Way Binding Props

```svelte
<!-- Input.svelte -->
<script lang="ts">
    let { value = $bindable(''), placeholder = '' } = $props();
</script>

<input bind:value {placeholder} />

<!-- Parent usage: -->
<Input bind:value={searchTerm} placeholder="Search..." />
```

### `$inspect` — Debug (dev only)

```svelte
<script lang="ts">
    let count = $state(0);

    $inspect(count); // logs to console on change

    $inspect(count).with((type, value) => {
        console.log(`${type}: ${value}`);
    });
</script>
```

---

## Props Typing with TypeScript

### Interface Pattern (preferred)

```svelte
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        title: string;
        items: Item[];
        locale?: string;
        showFilters?: boolean;
        children?: Snippet;
        header?: Snippet<[string]>;
        onclick?: (item: Item) => void;
    }

    let {
        title,
        items,
        locale = 'de',
        showFilters = false,
        children,
        header,
        onclick,
    }: Props = $props();
</script>
```

### Data Interfaces

```typescript
// types.ts
export interface Song {
    title: string;
    artist: string;
    genre: string;
    slug: string;
    cover: string;
    file: string;
    duration: number;
    release_year: number;
    release_date: string;
    streaming_links: Record<string, string>;
}
```

---

## Template Syntax

### Conditionals

```svelte
{#if items.length > 0}
    <ul>
        {#each items as item}
            <li>{item.name}</li>
        {/each}
    </ul>
{:else}
    <p>No items found.</p>
{/if}
```

### Each Blocks (with key)

```svelte
{#each filteredSongs as song (song.slug)}
    <SongCard {song} />
{/each}
```

> **Always provide a key** `(song.slug)` for lists with dynamic content to enable efficient DOM diffing.

### Await Blocks

```svelte
{#await fetchData()}
    <p>Loading...</p>
{:then data}
    <ul>
        {#each data as item}
            <li>{item.name}</li>
        {/each}
    </ul>
{:catch error}
    <p>Error: {error.message}</p>
{/await}
```

### Snippets & Render (replaces slots in Svelte 5)

```svelte
<!-- Define a snippet: -->
{#snippet greeting(name: string)}
    <p>Hello {name}!</p>
{/snippet}

{@render greeting('World')}

<!-- Children snippet (replaces <slot />): -->
<script lang="ts">
    let { children } = $props();
</script>

{@render children?.()}
```

**Named snippets for component slots:**

```svelte
<!-- List.svelte -->
<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        items: string[];
        item: Snippet<[string]>;
        empty?: Snippet;
    }

    let { items, item, empty }: Props = $props();
</script>

{#if items.length > 0}
    <ul>
        {#each items as entry}
            <li>{@render item(entry)}</li>
        {/each}
    </ul>
{:else}
    {@render empty?.()}
{/if}

<!-- Usage: -->
<List items={names}>
    {#snippet item(name)}
        <strong>{name}</strong>
    {/snippet}
    {#snippet empty()}
        <em>No names.</em>
    {/snippet}
</List>
```

---

## Event Handling

### DOM Events (Svelte 5 — no more `on:` directive)

```svelte
<button onclick={() => count++}>Click</button>
<input oninput={(e) => query = e.currentTarget.value} />
<form onsubmit|preventDefault={handleSubmit}>...</form>
```

### Callback Props (replaces `createEventDispatcher`)

```svelte
<!-- Child.svelte -->
<script lang="ts">
    let { onselect }: { onselect?: (item: Item) => void } = $props();
</script>

<button onclick={() => onselect?.(item)}>Select</button>

<!-- Parent: -->
<Child onselect={(item) => selected = item} />
```

### Custom Events (cross-component communication)

For independent components that don't share a parent, use `CustomEvent`:

```typescript
// Dispatch from component A:
document.dispatchEvent(
    new CustomEvent('song:play', { detail: { slug: song.slug } }),
);

// Listen in component B:
onMount(() => {
    const handler = (e: CustomEvent<{ slug: string }>) => {
        if (e.detail.slug !== song.slug) {
            pause();
        }
    };
    document.addEventListener('song:play', handler as EventListener);
    return () => document.removeEventListener('song:play', handler as EventListener);
});
```

---

## Lifecycle

```svelte
<script lang="ts">
    import { onMount, onDestroy, tick } from 'svelte';

    let container: HTMLDivElement;

    onMount(() => {
        // DOM is ready — initialize third-party libraries
        const player = new WaveSurfer({ container });

        // Return cleanup function (alternative to onDestroy)
        return () => player.destroy();
    });

    onDestroy(() => {
        // Component removed from DOM — clean up listeners, timers
    });

    // Wait for next DOM update:
    async function scrollToBottom(): Promise<void> {
        await tick();
        container.scrollTop = container.scrollHeight;
    }
</script>

<div bind:this={container}></div>
```

---

## Bindings & Directives

### Element Bindings

```svelte
<input bind:value={name} />
<input type="checkbox" bind:checked={active} />
<select bind:value={selected}>
    {#each options as opt}
        <option value={opt.value}>{opt.label}</option>
    {/each}
</select>
<div bind:this={element}></div>
<div bind:clientWidth={w} bind:clientHeight={h}></div>
```

### Class & Style Directives

```svelte
<div class:active={isActive} class:highlight>...</div>
<div style:color={textColor} style:--custom-property={value}>...</div>

<!-- Conditional classes: -->
<button class={`btn ${variant}`} class:disabled={!enabled}>
    {label}
</button>
```

### use: Actions

```svelte
<script lang="ts">
    import type { Action } from 'svelte/action';

    const tooltip: Action<HTMLElement, string> = (node, text) => {
        const handleEnter = () => showTooltip(node, text);
        const handleLeave = () => hideTooltip();

        node.addEventListener('mouseenter', handleEnter);
        node.addEventListener('mouseleave', handleLeave);

        return {
            update(newText: string) {
                text = newText;
            },
            destroy() {
                node.removeEventListener('mouseenter', handleEnter);
                node.removeEventListener('mouseleave', handleLeave);
            },
        };
    };
</script>

<span use:tooltip={'Help text'}>Hover me</span>
```

---

## Transitions & Animations

```svelte
<script lang="ts">
    import { fade, fly, slide, scale } from 'svelte/transition';
    import { flip } from 'svelte/animate';

    let visible: boolean = $state(true);
</script>

{#if visible}
    <div transition:fade={{ duration: 300 }}>Fade in/out</div>
    <div in:fly={{ y: 20, duration: 200 }} out:fade>Fly in, fade out</div>
{/if}

{#each items as item (item.id)}
    <div animate:flip={{ duration: 300 }}>
        {item.name}
    </div>
{/each}
```

---

## Scoped Styles

```svelte
<style>
    /* Scoped to this component only */
    .card {
        border: 1px solid var(--border-color, #ccc);
        border-radius: 8px;
        padding: 1rem;
    }

    /* Target child components or global selectors */
    :global(.external-class) {
        color: red;
    }
</style>
```

For SCSS within Svelte:

```svelte
<style lang="scss">
    @use '../scss/variables' as *;

    .card {
        background: $card-bg;
        border-radius: $border-radius;
    }
</style>
```

> **Prefer external SCSS** for complex styling (Bootstrap integration, shared variables). Use scoped `<style>` for component-specific adjustments only.

---

## Mounting in Symfony/Twig (Non-SvelteKit)

### Twig Template — Mount Point with Data Attributes

```twig
{# templates/discography.html.twig #}
<div id="song-list-app"
     data-locale="{{ app.request.locale }}"
     data-show-filters="true"
     data-filter-genre="{{ genre|default('') }}"></div>
```

### TypeScript Entry Point — Mount Components

```typescript
// main.ts
import { mount } from 'svelte';
import SongList from './SongList.svelte';
import '../scss/all.scss';

document.addEventListener('DOMContentLoaded', () => {
    const locale = document.documentElement.lang || 'de';

    // Mount Svelte components into Twig-rendered DOM
    const songListTarget = document.getElementById('song-list-app');
    if (songListTarget) {
        mount(SongList, {
            target: songListTarget,
            props: {
                locale: songListTarget.dataset.locale || locale,
                showFilters: songListTarget.dataset.showFilters === 'true',
                filterGenre: songListTarget.dataset.filterGenre || '',
            },
        });
    }

    // Initialize vanilla TS modules for non-Svelte UI
    initBudgetSlider(locale);
    initLocationAutocomplete(locale);
});
```

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import symfonyPlugin from 'vite-plugin-symfony';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [
        symfonyPlugin(),
        svelte(),
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

### TypeScript Config for Svelte

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

### Package Dependencies

```json
{
    "devDependencies": {
        "svelte": "^5.22",
        "@sveltejs/vite-plugin-svelte": "^5.0",
        "@tsconfig/svelte": "^5.0",
        "typescript": "^5.8",
        "vite": "^6.0",
        "vite-plugin-symfony": "^8.0",
        "sass": "^1.80"
    }
}
```

---

## Real-World Patterns

### Lazy Third-Party Library Init

Only initialize heavy libraries on user interaction:

```svelte
<script lang="ts">
    import WaveSurfer from 'wavesurfer.js';

    let { song }: { song: Song } = $props();

    let waveSurfer: WaveSurfer | null = $state(null);
    let isPlaying: boolean = $state(false);
    let isLoading: boolean = $state(false);
    let peaksData: number[] | null = $state(null);

    // Pre-load lightweight peak data, but NOT the audio
    onMount(async () => {
        try {
            const res = await fetch(`/assets/audio/peaks/${song.slug}.peaks.json`);
            peaksData = await res.json();
        } catch { /* peaks are optional */ }
    });

    async function togglePlay(): Promise<void> {
        if (!waveSurfer) {
            isLoading = true;
            waveSurfer = WaveSurfer.create({
                container: waveformContainer,
                url: `/audio/${song.file}`,
                peaks: peaksData ? [peaksData] : undefined,
                height: 48,
                barWidth: 2,
                barGap: 1,
            });
            waveSurfer.on('ready', () => { isLoading = false; waveSurfer!.play(); });
            waveSurfer.on('play', () => { isPlaying = true; });
            waveSurfer.on('pause', () => { isPlaying = false; });
            return;
        }

        waveSurfer.playPause();
    }

    onDestroy(() => waveSurfer?.destroy());
</script>
```

### Exclusive Playback Across Components

Stop other players when one starts:

```svelte
<script lang="ts">
    onMount(() => {
        const handleOtherPlay = (e: Event) => {
            const detail = (e as CustomEvent<{ slug: string }>).detail;
            if (detail.slug !== song.slug && isPlaying) {
                waveSurfer?.pause();
            }
        };

        document.addEventListener('song:play', handleOtherPlay);
        return () => document.removeEventListener('song:play', handleOtherPlay);
    });

    function play(): void {
        // Notify other instances before playing
        document.dispatchEvent(
            new CustomEvent('song:play', { detail: { slug: song.slug } }),
        );
        waveSurfer?.play();
    }
</script>
```

### Reactive Filters with $derived

```svelte
<script lang="ts">
    let songs: Song[] = $state([]);
    let selectedGenre: string = $state('');
    let selectedYear: string = $state('');

    // Auto-extract unique filter options from data
    let genres: string[] = $derived(
        [...new Set(songs.map(s => s.genre))].sort(),
    );
    let years: number[] = $derived(
        [...new Set(songs.map(s => s.release_year))].sort((a, b) => b - a),
    );

    // Filtered list recomputes whenever songs or filters change
    let filteredSongs: Song[] = $derived(
        songs.filter(s => {
            if (selectedGenre !== '' && s.genre !== selectedGenre) return false;
            if (selectedYear !== '' && String(s.release_year) !== selectedYear) return false;
            return true;
        }),
    );
</script>
```

### Fetching Data from Symfony API

```svelte
<script lang="ts">
    let { locale = 'de' }: { locale?: string } = $props();
    let songs: Song[] = $state([]);

    onMount(async () => {
        const response = await fetch(`/api/songs/${locale}`);
        songs = await response.json();
    });
</script>
```

### Animated Vinyl with Playback Progress

CSS-driven animation controlled by Svelte state:

```svelte
<div class="mini-vinyl" class:spinning={isPlaying}>
    <img src="/assets/img/covers/{song.cover}" alt="" />
</div>
<div class="mini-tonearm" class:on-record={isPlaying}
     style:--progress={playbackProgress}></div>
```

```scss
.mini-vinyl {
    animation: spin 1.8s linear infinite;
    animation-play-state: paused;

    &.spinning {
        animation-play-state: running;
    }
}

.mini-tonearm {
    transform: rotate(-30deg);
    transition: transform 0.5s ease;

    &.on-record {
        // Rotate from -10deg to 10deg based on progress (0..1)
        transform: rotate(calc(-10deg + var(--progress, 0) * 20deg));
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

## Svelte 4 → Svelte 5 Migration Quick Reference

| Svelte 4 | Svelte 5 |
|-----------|----------|
| `let count = 0;` (implicit reactive) | `let count = $state(0);` |
| `$: doubled = count * 2;` | `let doubled = $derived(count * 2);` |
| `$: { console.log(count); }` | `$effect(() => { console.log(count); });` |
| `export let title;` | `let { title } = $props();` |
| `<slot />` | `{@render children?.()}` |
| `<slot name="header" />` | `{@render header?.()}` (snippet prop) |
| `createEventDispatcher()` | Callback props: `onclick`, `onchange` |
| `on:click={handler}` | `onclick={handler}` |
| `on:click\|preventDefault` | `onclick\|preventDefault` or manual `e.preventDefault()` |

---

## Common Gotchas

1. **`$state` is a proxy** — Comparisons like `obj === original` may fail. Use `$state.snapshot()` for equality checks or external API calls.
2. **`$effect` runs after DOM update** — If you need to measure DOM before update, use `$effect.pre()`.
3. **Don't set `$state` inside `$derived`** — Derived values must be pure computations. Side effects belong in `$effect`.
4. **`$inspect` is dev-only** — Stripped in production builds. Never rely on it for logic.
5. **Svelte 5 `mount()` returns void** — Unlike Svelte 4's `new Component()`, `mount()` doesn't return component instance. Use `$bindable` props for external control.
6. **Event modifiers** — `|preventDefault`, `|stopPropagation` work on native event handlers. For callback props, call the method manually inside the handler.
7. **TypeScript in templates** — Don't use TS syntax (type casts, generics) inside `{#each}` or `{#if}` blocks. Keep types in `<script lang="ts">` only.
8. **Cleanup listeners** — Always return cleanup functions from `onMount` or `$effect`. Forgetting this causes memory leaks in SPAs.
9. **`bind:this` is null during SSR** — Guard with `if (element)` before accessing bound DOM refs.
10. **External SCSS vs scoped `<style>`** — Use external SCSS for Bootstrap/shared variables. Scoped `<style>` can't access SCSS variables unless imported with `@use`.

---

## Documentation References

| Resource | URL |
|----------|-----|
| Official Docs | https://svelte.dev/docs/svelte |
| Tutorial | https://learn.svelte.dev/ |
| Playground | https://svelte.dev/playground |
| Svelte 5 Runes | https://svelte.dev/docs/svelte/$state |
| Migration Guide | https://svelte.dev/docs/svelte/v5-migration-guide |
| Wikipedia (DE) | https://de.wikipedia.org/wiki/Svelte_(Framework) |