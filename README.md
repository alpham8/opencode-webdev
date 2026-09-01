# opencode-webdev

A ready-to-use collection of skills, rules, hooks, and configuration for [opencode](https://opencode.ai), optimised for PHP / Symfony / Shopware / JavaScript / TypeScript development on Linux — powered by a local LLM via LiteLLM/vLLM.

This project is a port of [claude-webdev](https://github.com/alpham8/claude-webdev) (a Claude Code setup) to opencode. All skills, rules, and hooks have been carried over; the configuration layer has been rewritten for opencode's format.

## Why This Exists

AI models are trained on the internet. The internet contains plenty of low-quality, insecure, and outdated code. To get consistently better output from AI coding assistants, you need to guide them with tools and instructions.

A single instruction file is not the right approach for implementing all rules and techniques. The ecosystem already has many excellent skills, plugins, and hooks — but they are scattered across dozens of repositories, marketplaces, and blog posts. Finding, evaluating, and combining them takes hours.

**This is a curated, ready-to-use collection with a one-command installer.**

### Top Features

- **Frontend Design Skills** — Animation engineering (timing, easing, springs), UI audit & redesign workflow (anti-AI-slop patterns), typography, colour systems, micro-interactions
- **Shopware 5 & 6 Skills** — Plugin architecture, DAL, events, Admin components, Storefront JS, DDEV setup, dustin/shopware-utils
- **Symfony Skills** — Full framework coverage + project scaffolding blueprint (Vite, DDEV, i18n, CAPTCHA, deploy)
- **PHP Skills** — Modern PHP 8.0–8.4, strict typing, security (OWASP Top 10), PSR standards
- **ECMAScript Skills** — TypeScript type system, Vue 2/3, Svelte 5, async patterns, decorators
- **Content Testing** — Deep assertion skill ensuring tests verify actual content, not just status codes. 4-level depth pyramid, checklists for pages, APIs, feeds, forms, SEO, i18n
- **Accessibility** — WCAG 2.1 AA checklist, keyboard navigation, ARIA, form accessibility
- **20 Coding Rules** — PSR-12 baseline, security, type safety, clean code, performance, testing, git workflow, CSS Box Model ordering, C++ conventions
- **3 German Writing Skills** — Technical colleague voice, product copywriter, marketing copywriter (sales-psychology, trust ladder, anti-AI-slop)
- **SEO Skill** — On-page SEO reference for blog posts and landing pages: SERP limits (title, meta, slug), heading hierarchy, image SEO, structured data (BlogPosting, BreadcrumbList, FAQPage), Open Graph, E-E-A-T, Core Web Vitals, German SEO specifics (umlauts, Flesch DE, hreflang DACH)
- **Hook Plugin** — Format-on-save, static analysis, type checking, destructive command guard (single TypeScript plugin)

## What's Included

| Path | Purpose |
|---|---|
| `AGENTS.md` | Global engineering baseline (coding standards, workflow rules) |
| `opencode.json` | OpenAI-compatible provider config (LiteLLM/vLLM), permissions, MCP servers, skill paths |
| `rules/` | 19 rule files referenced from AGENTS.md |
| `skills/` | 29 domain & process skills + 24 wondelai knowledge skills |
| `plugins/hooks.ts` | Self-contained hook plugin (guard-bash, format, phpstan, tsc) + optional file-guard, static-analysis and self-review hooks |
| `hooks/security-guidance/` | Vendored security-guidance pattern hooks (optional, needs python3) |
| `install.sh` | One-shot installer into `~/.config/opencode` |

### Hook Plugin

The `plugins/hooks.ts` file is a single TypeScript module with a **self-contained core** (no external dependencies) plus an **optional layer** that activates only when the extra tooling is present. Everything fails open, so the core keeps working standalone.

**Self-contained core:**

| Hook | Trigger | Effect |
|---|---|---|
| `guardBash` | Before every Bash command | Blocks destructive patterns (`rm -rf /`, `dd of=/dev/…`, force-push to main, etc.) |
| `formatOnSave` | After Write / Edit | Runs PHP-CS-Fixer (PHP) or Prettier (TS/JS/Vue/CSS) if available in project |
| `phpstanCheck` | After Write / Edit on `*.php` | Runs PHPStan if `vendor/bin/phpstan` exists (warning surfaced to the model) |
| `tscCheck` | After Write / Edit on `*.ts` / `*.tsx` | Runs TypeScript type-check if `tsconfig.json` exists (warning surfaced to the model) |

**Optional layer** (silently skipped when the tool is missing):

| Hook | Needs | Effect |
|---|---|---|
| `file-guard` | `claudekit` | Before Read/Edit/Write: blocks access to sensitive files (`.env`, secrets) |
| `check-any-changed` | `claudekit` | After edit/write: flags `any` types in TypeScript |
| `check-comment-replacement` | `claudekit` | After edit: flags code replaced by explanatory comments |
| security-guidance pattern | `python3` | After edit/write: regex warnings for ~25 dangerous patterns (XSS, SQLi, hardcoded secrets, …) |
| `self-review` | — | On session idle after edits: injects a critical self-review prompt (once per edit-burst) |

### Skills

| Skill | Description |
|---|---|
| `php` | Modern PHP 8.0-8.4, strict typing, enums, readonly, OOP, PSR standards, security (LFI/RFI, SQL injection, XSS, CSRF, sessions, passwords, uploads, OWASP Top 10) |
| `symfony` | Symfony framework components: DI, events, routing, forms, serializer, validator, messenger, mailer, security, cache, console, Twig, Doctrine, real-world patterns |
| `symfony-project-setup` | Project scaffolding blueprint: directory structure, bundles, services, Vite/pentatrion, DDEV, PHPUnit, i18n, Altcha CAPTCHA, deploy scripts |
| `shopware` | Shopware 5 & 6 architecture, DAL, events, templates, CMS elements, version compatibility, Composable Frontends (headless) |
| `shopware-ddev` | Shopware-specific DDEV setup (Elasticsearch, Redis, Varnish, Mailpit) |
| `shopware-utils` | dustin/shopware-utils library (sub-bundles, auto-resources, configuration objects) |
| `vue` | Vue 2 Options API + Vue 3 Composition API, script setup, reactivity, props/emits, slots, Pinia, TypeScript integration, Shopware Admin patterns |
| `svelte` | Svelte 5 runes ($state, $derived, $effect, $props), TypeScript, mounting in Symfony/Twig apps, lifecycle, transitions, real-world patterns |
| `typescript` | Type system, generics, utility types, type guards, discriminated unions, decorators (TC39 + legacy), tsconfig, DOM typing, async patterns |
| `csharp` | Modern C# 12/13, records, pattern matching, nullable refs, LINQ, async/await, sealed classes, primary constructors |
| `aspnet-core` | ASP.NET Core 9 Minimal APIs, DI, middleware, EF Core, SignalR, JWT auth, caching, MassTransit, rate limiting, Docker |
| `ddev-development` | DDEV commands, config reference, PHP/Node/DB version switching, port exposure |
| `mixxx-cpp` | Mixxx DJ software C++ development: architecture patterns, beat system, waveform rendering, protobuf serialization, analyzer pipeline, Track Properties dialog |
| `ui-animation-engineering` | Production-grade animation decisions: timing tables, easing rules, spring vs duration, transform-origin, interruptibility, stagger patterns, Sonner principles (based on Emil Kowalski) |
| `ui-audit-redesign` | Systematic UI audit & upgrade workflow: Scan/Diagnose/Fix, anti-AI-slop patterns, typography/colour/layout/states audit, fix priority order, pre-output checklist (based on Taste Skill & Impeccable) |
| `content-testing` | Deep assertion skill for tests: 4-level assertion depth pyramid (response → structure → content → semantics), checklists for web pages, APIs, RSS/XML, forms, SEO, multilingual, pagination. Prevents status-code-only tests. |
| `tech-colleague-de` | German technical writing voice: PR descriptions, READMEs, bug reports, technical emails. Direct, specific, no filler. Anti-AI-slop rules (no em dash, no uniform sentence length, no passive-as-courtesy). |
| `copywriter-de` | German product copywriter: product descriptions, feature announcements, technical blog posts. Benefit-first, concrete numbers, specific CTAs. Anti-AI-slop pattern kills. |
| `marketing-copywriter-de` | German sales copywriter for non-technical readers: homepage, landing pages, booking pages. 7-step trust ladder (AIDA/PAS/BAB), CRAVENS social proof, objection removal, micro-commitment CTAs. Sales-psychology-driven structure. |
| `seo` | On-page SEO reference: SERP pixel/character limits (title, meta description, slug), heading hierarchy, image SEO, internal/external linking, content structure, structured data (BlogPosting, BreadcrumbList, FAQPage), Open Graph, E-E-A-T, Core Web Vitals, XML sitemap, content freshness, German SEO (umlauts, Flesch DE, hreflang DACH). Includes full blog post checklist. |
| `brainstorming` | Structured ideation before implementation — explores intent, requirements, design (superpowers) |
| `writing-plans` | Turn a spec into a step-by-step implementation plan (superpowers) |
| `test-driven-development` | Red-green-refactor discipline for features and bugfixes (superpowers) |
| `systematic-debugging` | Root-cause-first debugging workflow before proposing fixes (superpowers) |
| `verification-before-completion` | Run verification and confirm output before claiming work is done (superpowers) |
| `requesting-code-review` | Request a structured code review before merging (superpowers) |
| `receiving-code-review` | Handle review feedback with technical rigor, not blind agreement (superpowers) |
| `skill-improver` | Iteratively review and fix skill quality (Trail of Bits) |
| `ask-questions-if-underspecified` | Clarify requirements before implementing when in doubt (Trail of Bits) |
| `agent-browser` | Browser automation CLI: navigate, fill forms, scrape, screenshot, test web apps |
| `wondelai/clean-code` | Clean Code principles (Martin) |
| `wondelai/clean-architecture` | Clean Architecture (Martin) |
| `wondelai/domain-driven-design` | DDD building blocks, bounded contexts |
| `wondelai/refactoring-patterns` | Refactoring catalog (Fowler) |
| `wondelai/software-design-philosophy` | Philosophy of Software Design (Ousterhout) |
| `wondelai/pragmatic-programmer` | Pragmatic Programmer principles |
| `wondelai/release-it` | Production-readiness, stability patterns |
| `wondelai/high-perf-browser` | Browser performance, Core Web Vitals |
| `wondelai/system-design` | System design fundamentals |
| `wondelai/ddia-systems` | Designing Data-Intensive Applications |
| `wondelai/refactoring-ui` | Visual hierarchy, spacing systems, colour palettes (Wathan & Schoger) |
| `wondelai/ux-heuristics` | Usability evaluation: Krug's laws + Nielsen's 10 heuristics |
| `wondelai/web-typography` | Typeface selection, pairing, responsive typography (Santa Maria) |
| `wondelai/design-everyday-things` | Affordances, signifiers, constraints, feedback, conceptual models (Norman) |
| `wondelai/microinteractions` | Triggers, rules, feedback, loops for interaction polish (Saffer) |
| `wondelai/top-design` | Award-winning web design: typography, motion, scroll, composition |
| `wondelai/gestalt-ui` | 13 Gestalt principles applied to UI design (custom) |
| `wondelai/laws-of-ux` | Behavioural UX laws: Fitts, Hick, Miller, Jakob, Doherty, etc. (custom) |
| `wondelai/ui-patterns` | Scanning patterns, component patterns, UI decision reference (custom) |
| `wondelai/ux-design-principles` | Combined UX design theory: hierarchy, scanning, forms, buttons (custom) |
| `wondelai/html-accessibility` | Accessible HTML: labels, ARIA, keyboard nav, WCAG checklist (custom) |
| `wondelai/cro-methodology` | Conversion rate optimisation (Blanks & Jesson) |
| `wondelai/improve-retention` | Behaviour design for retention using B=MAP (Fogg) |
| `wondelai/hooked-ux` | Habit-forming product design: Hook Model (Eyal) |

### MCP Servers

| Server | Package | Purpose |
|---|---|---|
| `context7` | `@upstash/context7-mcp` | Up-to-date library documentation |
| `playwright-chromium` | `@playwright/mcp` | Browser automation (Chromium) |
| `playwright-firefox` | `@playwright/mcp` | Browser automation (Firefox) |
| `mysql` | `@benborla29/mcp-server-mysql` | MySQL / MariaDB queries (read-only by default) |
| `github` | `@modelcontextprotocol/server-github` | GitHub API (issues, PRs, repos) |

---

## System Requirements

Works on **Linux** (Ubuntu, openSUSE, Fedora, etc.) and **macOS**.

### 1 — Install opencode

```bash
brew install sst/tap/opencode
```

Or follow the official instructions at [opencode.ai](https://opencode.ai).

### 2 — Install Homebrew (if not present)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the post-install instructions to add Homebrew to your PATH:

**macOS** (Apple Silicon):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**macOS** (Intel):
```bash
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
source ~/.zprofile
```

**Linux** (Ubuntu, Debian, Fedora, openSUSE, etc.):
```bash
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.bashrc
source ~/.bashrc
```

### 3 — Install System Dependencies

#### Required

**Ubuntu / Debian:**
```bash
sudo apt-get install -y jq nodejs npm
```

**openSUSE:**
```bash
sudo zypper install -y jq nodejs20 npm20
```

**Fedora:**
```bash
sudo dnf install -y jq nodejs npm
```

**macOS:**
```bash
brew install jq node
```

> **Note:** Node.js 20+ is required for MCP servers (npx) and JS/TS projects. If your distro ships an older version, install via [NodeSource](https://github.com/nodesource/distributions) or [nvm](https://github.com/nvm-sh/nvm).

#### Optional (per-project, installed inside DDEV containers)

The hook plugin auto-detects formatters and linters from the project's `vendor/` and `node_modules/` directories. No global installation is needed:

- **PHP-CS-Fixer** — `composer require --dev friendsofphp/php-cs-fixer`
- **PHPStan** — `composer require --dev phpstan/phpstan`
- **Prettier** — `npm install --save-dev prettier`
- **TypeScript** — `npm install --save-dev typescript`

### 4 — Install DDEV (recommended for PHP projects)

**Linux:**
```bash
# Install Docker first if not present
# Ubuntu/Debian:
sudo apt-get install -y docker.io
# openSUSE:
sudo zypper install -y docker
# Fedora:
sudo dnf install -y docker

sudo usermod -aG docker $USER
newgrp docker
```

**macOS:**
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop/
# Or use Colima as a lightweight alternative:
brew install colima docker
colima start
```

**Then install DDEV (all platforms):**
```bash
brew install ddev/ddev/ddev
```

Or follow the official guide: https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/

### 5 — LiteLLM / vLLM Access

opencode-webdev is configured to use a local LLM served via [LiteLLM](https://docs.litellm.ai/) as an OpenAI-compatible proxy. You need a running LiteLLM instance with a model available (e.g. Qwen3-32B via vLLM). The custom `litellm` provider uses `@ai-sdk/openai-compatible`; it does not use opencode's built-in `openai` provider, which targets OpenAI's own API behavior.

Set these environment variables in your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export LITELLM_BASE_URL="https://litellm.your-host.com/v1"
export LITELLM_API_KEY="sk-xxx"
```

The model is configured as `litellm/mai-coding-default` in `opencode.json`. If your proxy uses a different model alias, change both the top-level `model` value and the key under `provider.litellm.models`.

---

## Installation

```bash
git clone https://github.com/alpham8/opencode-webdev.git
cd opencode-webdev
chmod +x install.sh
./install.sh
source ~/.zshrc  # or ~/.bashrc
```

The installer copies all configuration into `~/.config/opencode`:

| Target | Content |
|---|---|
| `~/.config/opencode/opencode.json` | OpenAI-compatible provider config (LiteLLM/vLLM), permissions, MCP servers, skill paths |
| `~/.config/opencode/AGENTS.md` | Global engineering baseline |
| `~/.config/opencode/rules/` | 19 coding rules |
| `~/.config/opencode/skills/` | 18 domain skills + 24 wondelai knowledge skills |
| `~/.config/opencode/plugins/` | Hook plugin (format-on-save, guard-bash, phpstan, tsc) |

---

## Post-Install Configuration

### GitHub MCP Server

The GitHub MCP server needs a personal access token:

1. Create a token at: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Required scopes: `Contents` (read), `Issues` (read/write), `Pull requests` (read/write), `Metadata` (read)
3. Export the token in your shell profile:

```bash
# Linux (bash):
echo 'export GITHUB_TOKEN=ghp_yourtoken' >> ~/.bashrc
source ~/.bashrc

# macOS (zsh):
echo 'export GITHUB_TOKEN=ghp_yourtoken' >> ~/.zprofile
source ~/.zprofile
```

### MySQL MCP Server

The MySQL MCP is pre-configured for DDEV's default credentials (`user: db`, `pass: db`, `host: 127.0.0.1`, `port: 3306`). DDEV maps the database port dynamically — check with `ddev describe` and adjust `MYSQL_PORT` in `opencode.json` if needed.

Write operations are **disabled by default**. To enable, set `ALLOW_INSERT_OPERATION`, `ALLOW_UPDATE_OPERATION`, or `ALLOW_DELETE_OPERATION` to `"true"` in `opencode.json`.

---

## Per-Project Skills

Place project-specific skills in `.opencode/skills/<name>/SKILL.md`, then add the path in your project's `opencode.json`:

```json
{
  "skills": {
    "paths": [".opencode/skills"]
  }
}
```

---

## Updating

To pull the latest configuration from this repo and reinstall:

```bash
git pull
./install.sh
```

---

## Troubleshooting

```bash
opencode debug config   # Validate config
opencode debug skill    # List loaded skills
opencode debug paths    # Show installation paths
```

---

## Acknowledgements

This setup is a port of [claude-webdev](https://github.com/alpham8/claude-webdev) to opencode. It would not exist without the work of dozens of plugin authors, skill writers, designers, and engineers who freely share their craft with the community. **Thank you.** Most of what is in this repository is either a direct copy or a careful adaptation of someone else's idea — the curation is mine, the substance belongs to the people listed below.

If you find this useful, please go and star their original repositories first.

### Skills under `skills/`

| Skill(s) | Origin |
|---|---|
| `wondelai/*` (24 sub-skills: clean-code, clean-architecture, ddia-systems, system-design, refactoring-patterns, software-design-philosophy, pragmatic-programmer, release-it, high-perf-browser, refactoring-ui, ux-heuristics, web-typography, design-everyday-things, microinteractions, top-design, gestalt-ui, laws-of-ux, ui-patterns, ux-design-principles, html-accessibility, cro-methodology, improve-retention, hooked-ux, domain-driven-design) | [wondelai/skills](https://github.com/wondelai/skills) — full collection by Wondelai |
| `ui-audit-redesign` | Inspired by the `/polish` command from [pbakaus/impeccable](https://github.com/pbakaus/impeccable) (see [impeccable.style](https://impeccable.style/)) |
| `ui-animation-engineering` | Based on [Emil Kowalski](https://emilkowal.ski/)'s design engineering writing (Sonner, Vaul) |
| `content-testing` | Authored for this repo |
| `tech-colleague-de`, `copywriter-de`, `marketing-copywriter-de` | Authored for this repo — see *Writing Skills* sources below |
| `seo` | Authored for this repo — see *SEO Skill* sources below |
| `php`, `symfony`, `symfony-project-setup`, `shopware`, `shopware-ddev`, `shopware-utils`, `vue`, `svelte`, `typescript`, `csharp`, `aspnet-core`, `ddev-development`, `mixxx-cpp` | Authored for this repo, distilled from each project's official documentation |
| `brainstorming`, `writing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`, `receiving-code-review` | [superpowers](https://github.com/obra/superpowers) by Jesse Vincent (obra) |
| `skill-improver`, `ask-questions-if-underspecified` | [trailofbits/skills](https://github.com/trailofbits/skills) by Trail of Bits |
| `agent-browser` | The `agent-browser` browser-automation CLI skill (invoked via `npx agent-browser`) |

### Writing Skills — Research Sources

The `rules/19-css.md` and the three German writing skills (`tech-colleague-de`, `copywriter-de`, `marketing-copywriter-de`) draw on:

**Anti-AI-slop pattern research:**
- [anti-ai-slop-writing](https://github.com/jalaalrd/anti-ai-slop-writing) — jalaalrd — 50+ banned words, 35+ banned phrases, 16 banned sentence openers, 10 structural patterns, punctuation tells; based on Carnegie Mellon (2025), Wikipedia's *Signs of AI Writing*, Buffer's 52M post analysis
- [avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing) — Conor Bronsdon — 42 documented pattern categories with before/after examples; 3-tier vocabulary replacement table (109 entries); structural detection v3.4

**Copywriting frameworks:**
- [Copywriting Formulas (Thrive Themes)](https://thrivethemes.com/copywriting-formulas/) — AIDA, PAS, BAB, TMNTU frameworks
- [PAS Framework (SaasFunnelLab)](https://www.saasfunnellab.com/essay/pas-copywriting-framework/) — Problem → Agitation → Solution structure
- [Social Proof & CRAVENS model (CXL)](https://cxl.com/blog/is-social-proof-really-that-important/) — Credible, Relevant, Attractive, Visual, Enumerated, Nearby, Specific
- [Landing Page Copywriting Tips (Jeremy Mac)](https://www.jeremymac.com/blogs/news/20-landing-page-copywriting-tips-that-convert-like-crazy-in-2025-beginner-friendly) — specificity, micro-commitments, hesitation removal

### SEO Skill — Research Sources

The `seo` skill was compiled from Google's official documentation and leading SEO industry sources (2025-2026):

**Google Official Documentation:**
- [Google Search Central — Article Structured Data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Search Central — URL Structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [Google Search Central — Mobile-First Indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Google Search Central — Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Search Central — Hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google Search Central — Google Images Best Practices](https://developers.google.com/search/docs/appearance/google-images)

**Title & Meta Description:**
- [Zyppy — Meta Title Tag Length](https://zyppy.com/title-tags/meta-title-tag-length/) — character and pixel measurements
- [Search Engine Land — Title Tag Length](https://searchengineland.com/title-tag-length-388468) — desktop/mobile pixel limits
- [The Ocean Marketing — Title Tag Length Best Practices](https://theoceanmarketing.com/blog/title-tag-length-for-seo-best-practices/)
- [Scalenut — Meta Title Length Best Practices 2026](https://www.scalenut.com/blogs/meta-title-length-best-practices-2026)
- [MRS Digital — Meta Length Checker](https://mrs.digital/tools/meta-length-checker/) — pixel width tool

**Content Structure & Readability:**
- [SEO.co — Content Length](https://seo.co/content-length/) — word count benchmarks by content type
- [Lovable.dev — Blog Post Length Guide](https://lovable.dev/guides/how-long-should-blog-post-be-data-backed-guide) — data-backed length analysis
- [Yoast — Flesch Reading Ease Score](https://yoast.com/flesch-reading-ease-score/) — readability scoring
- [Yoast — How to Use Headings](https://yoast.com/how-to-use-headings-on-your-site/) — heading hierarchy rules
- [Conductor — Headings for SEO](https://www.conductor.com/academy/headings/) — semantic heading structure

**URL & Slug:**
- [Slug Genius — URL Slug Best Practices](https://sluggenius.com/blog/url-slug-best-practices) — length, format, keyword placement
- [Shopify — SEO-Friendly URLs](https://www.shopify.com/blog/seo-url)

**Structured Data & Open Graph:**
- [Search Engine Zine — Article vs Blog Schema](https://searchenginezine.com/technical/schema/article-vs-blog-schema/) — BlogPosting vs Article schema
- [Open Graph Protocol](https://ogp.me/) — OG specification
- [Ahrefs — Open Graph Meta Tags](https://ahrefs.com/blog/open-graph-meta-tags/) — practical OG guide

**Image SEO:**
- [AltText.ai — Image Alt Text SEO Best Practices](https://alttext.ai/blog/image-alt-text-seo-best-practices) — alt text length and AI citations
- [Digital Applied — Image SEO Guide 2026](https://www.digitalapplied.com/blog/image-seo-complete-optimization-guide-2026) — format priority, lazy loading

**Internal Linking:**
- [Upward Engine — Internal Linking Best Practices](https://upwardengine.com/internal-linking-best-practices-seo/) — density and link equity
- [Traffic Think Tank — Internal Linking](https://trafficthinktank.com/internal-linking-best-practices/) — anchor text strategy

**Core Web Vitals:**
- [CoreWebVitals.io](https://www.corewebvitals.io/core-web-vitals) — current pass rate data
- [Mewa Studio — SEO Core Web Vitals 2026](https://www.mewastudio.com/en/blog/seo-core-web-vitals-2026) — INP, LCP, CLS thresholds

**E-E-A-T:**
- [BKND Development — EEAT SEO Strategy 2026](https://www.bknddevelopment.com/seo-insights/eeat-seo-strategy-2026-content-quality-signals/) — content quality signals
- [Search Engine Land — Google E-E-A-T for SEO](https://searchengineland.com/guide/google-e-e-a-t-for-seo) — comprehensive E-E-A-T guide

**German SEO:**
- [WebCertain — Umlauts in German SEO](https://blog.webcertain.com/do-umlauts-matter-how-to-handle-the-most-annoying-characters-in-german-seo-2/10/04/2014/) — umlaut handling in URLs
- [Nikolai Sroka — Flesch Index Lesbarkeit](https://nikolai-sroka.de/flesch-index-lesbarkeit-verbessern/) — German Flesch adaptation
- [Seokratie — SEO-Faktor Lesbarkeit](https://www.seokratie.de/seo-faktor-lesbarkeit/) — readability as ranking factor
- [Outreach Monks — Hreflang SEO](https://outreachmonks.com/hreflang-seo/) — DACH hreflang implementation

**Existing Claude Code SEO Skills (inspiration):**
- [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) — universal SEO skill with 25 sub-skills
- [aaron-he-zhu/seo-geo-claude-skills](https://github.com/aaron-he-zhu/seo-geo-claude-skills) — 20 SEO & GEO skills with CORE-EEAT framework
- [aevans-eng/seo-skill](https://github.com/aevans-eng/seo-skill) — lightweight SEO skill for static sites

---

### Foundational standards & literature

The `rules/` baseline and several skills draw heavily on:

- [PSR-12 — Extended Coding Style](https://www.php-fig.org/psr/psr-12/)
- [WCAG 2.1 AA](https://www.w3.org/TR/WCAG21/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Refactoring UI](https://www.refactoringui.com/) — Adam Wathan & Steve Schoger
- *Clean Code* / *Clean Architecture* — Robert C. Martin
- *The Pragmatic Programmer* — Hunt & Thomas
- [*A Philosophy of Software Design*](https://web.stanford.edu/~ouster/cgi-bin/book.php) — John Ousterhout
- [*Designing Data-Intensive Applications*](https://dataintensive.net/) — Martin Kleppmann
- [*Refactoring*](https://martinfowler.com/books/refactoring.html) — Martin Fowler
- *Release It!* — Michael T. Nygard
- *Don't Make Me Think* — Steve Krug
- *The Design of Everyday Things* — Don Norman
- *Microinteractions* — Dan Saffer
- *On Web Typography* — Jason Santa Maria
- *Hooked* — Nir Eyal
- *Tiny Habits* / B=MAP behaviour design — BJ Fogg
- [Laws of UX](https://lawsofux.com/) — Jon Yablonski
- [Nielsen Norman Group](https://www.nngroup.com/) — usability heuristics & research
- [Smashing Magazine](https://www.smashingmagazine.com/) — long-form web design articles

### Tooling referenced from skills / hooks

- [opencode](https://opencode.ai) — the host harness this configuration targets
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — the original harness this was ported from (see [claude-webdev](https://github.com/alpham8/claude-webdev))
- [LiteLLM](https://docs.litellm.ai/) — OpenAI-compatible proxy for local/remote LLMs
- [DDEV](https://ddev.com/) — local containerised development
- [Shopware 6 Developer Portal](https://developer.shopware.com/) — official Shopware 6 docs
- [Shopware 5 Developer Portal](https://developers.shopware.com/) — official Shopware 5 docs
- [Enlight Framework — `enlight.de` (Wayback Machine, 2013-01-06)](https://web.archive.org/web/20130106210925/http://www.enlight.de/) — original docs of the open source eCommerce framework that Shopware 5 is built on; recovered from the Internet Archive since the live site is gone
- [Symfony documentation](https://symfony.com/doc/current/index.html)
- [Vue.js](https://vuejs.org/), [Svelte](https://svelte.dev/), [TypeScript](https://www.typescriptlang.org/), [Microsoft Learn (.NET / C#)](https://learn.microsoft.com/en-us/dotnet/)

If your work is referenced here without proper attribution, please open an issue and it will be fixed immediately.

---

## Disclaimer

I do not — and cannot — claim copyright over the contents of this repository. A large portion of it was assembled with the help of AI tooling, and many of the rules, skills, hooks, and configurations are direct or near-direct copies of work originally created by the authors listed in the *Acknowledgements* section above. All credit and rights belong to the respective original authors.

This repository is provided **"as is", without warranty of any kind**, express or implied, including but not limited to fitness for a particular purpose, security, correctness, or non-infringement. **Use of these tools, skills, hooks, and configurations is entirely at your own risk.** You are responsible for reviewing what gets installed into your environment and for the consequences of running it.

If you are an original author and would like your work removed or its attribution corrected, please open an issue on this repository.
