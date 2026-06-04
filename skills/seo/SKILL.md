---
name: seo
description: Use when writing, reviewing, or optimizing blog posts, landing pages, meta tags, titles, descriptions, headings, URLs, or any user-facing web content for search engines. Triggers on SEO questions, content audits, structured data, Open Graph tags, schema markup, or on-page optimization. Also use for German-language SEO specifics (umlauts, hreflang, Flesch DE).
---

# On-Page SEO — Blog & Content Reference

Concrete limits, rules, and checklists for on-page SEO. All numbers reflect Google's current SERP rendering (2025-2026).

## Title Tag

| Property | Limit | Notes |
|---|---|---|
| **Desktop pixel width** | **580 px** (max ~600 px) | Proportional font — W/M wider than i/l |
| **Mobile pixel width** | ~920 px (smaller font) | More room on mobile |
| **Character guideline** | **50-60 characters** | Covers ~90% of desktop SERPs |
| **Keyword placement** | Primary keyword near the beginning | Natural language, no keyword stuffing |
| **Uniqueness** | One unique title per page | Never duplicate across pages |
| **Brand** | Append brand after separator if space allows | `Primary Keyword — Brand` |

**Quick check:** If your title exceeds 55 characters, verify pixel width with a SERP preview tool.

## Meta Description

| Property | Limit | Notes |
|---|---|---|
| **Desktop pixel width** | ~920 px | |
| **Desktop characters** | 150-160 characters | Google sometimes shows up to 300 |
| **Mobile characters** | ~120 characters | Shorter display on mobile |
| **Safe cross-device** | **120-158 characters** | Most important message within first 120 |
| **Focus keyword** | Must appear in the description | Natural einbauen, nicht erzwingen |
| **CTA** | Include a call-to-action | "Jetzt lesen", "Erfahre mehr" |
| **Uniqueness** | One unique description per page | Never duplicate |

**Rule:** Front-load the value proposition into the first 120 characters — everything after may be truncated on mobile.

## Heading Structure (H1-H6)

| Rule | Detail |
|---|---|
| **One H1 per page** | Contains primary keyword naturally; describes core topic |
| **Sequential nesting** | H1 → H2 → H3 → H4; never skip levels (no H1 → H3) |
| **H2 = major sections** | Secondary keywords and semantically related terms |
| **H3 = subsections** | Break down H2 sections into granular detail |
| **No styling abuse** | Never use heading tags for visual styling; use CSS classes |
| **Subheading distribution** | Max 300 words between two subheadings; long text blocks without heading kill readability and SEO |

## URL / Slug

| Rule | Detail |
|---|---|
| **Length** | 3-5 words (~50-60 characters) |
| **Separator** | Hyphens (`-`), never underscores |
| **Case** | Always lowercase |
| **Keyword** | Main keyword at the beginning |
| **No dates** | `/blog/seo-leitfaden/` not `/blog/2026/03/seo-leitfaden/` |
| **Depth** | Max 2-3 levels; avoid deep nesting |
| **Umlauts** | Replace: ä→ae, ö→oe, ü→ue, ß→ss (never just drop the dots) |
| **Stop words** | Remove unnecessary filler words (und, der, die, das) |

## Image SEO

| Rule | Detail |
|---|---|
| **Alt text length** | 80-140 characters (5-15 words) |
| **Alt text content** | Descriptive, keyword-relevant, unique per image |
| **Decorative images** | `alt=""` (empty, not omitted) |
| **File naming** | Descriptive, hyphen-separated: `blaues-leder-etui.webp` not `IMG_4521.jpg` |
| **Format priority** | AVIF → WebP → JPEG/PNG fallback; use `<picture>` element |
| **Dimensions** | Always set `width` and `height` attributes (prevents CLS) |
| **Lazy loading** | `loading="lazy"` for below-fold; `loading="eager"` + `fetchpriority="high"` for hero/LCP |
| **Responsive** | Use `srcset` for responsive serving |

## Internal Linking

| Rule | Detail |
|---|---|
| **Density** | 2-5 contextual links per 1,000 words |
| **Total per page** | Keep under 150 links |
| **Click depth** | Key pages within 3 clicks of homepage |
| **Anchor text** | Descriptive, varied; mix exact-match and topically related |
| **Outbound links** | 1-2 autoritäre externe Links pro Beitrag (Quellenangaben, Referenzen) |
| **Topic clusters** | Pillar pages + supporting content |
| **Orphan pages** | Jede Seite braucht mind. einen internen Link, der auf sie zeigt |
| **Table of contents** | Add for posts >1,000 words; anchor links matching H2/H3 |

## Content Structure & Length

| Content Type | Word Count |
|---|---|
| Quick-answer post | 300-500 words |
| Standard blog post | 1,500-2,500 words |
| How-to guide | 1,700-2,500 words |
| Pillar / ultimate guide | 3,000-5,000+ words |

| Rule | Detail |
|---|---|
| **Featured snippets** | Answer-first: direct answer in 40-60 words right after the heading |
| **List snippets** | 6-10 items for list snippets |
| **Table snippets** | 4-6 columns, 5-10 rows |
| **Early content** | 44% of AI citations come from the first 30% of page content |
| **Keyword in first paragraph** | Focus keyword must appear within the first 10% of the text (ideally first sentence) |
| **Keyword density** | 1-2% as rough guideline; focus on natural language, not frequency |
| **Keyword cannibalization** | Each post targets a unique focus keyword — never optimize two pages for the same keyword |
| **Thin content** | Pages with <300 words are flagged as thin content by Google; always exceed this minimum |
| **Readability (DE)** | Flesch-Index 50-60 for German texts (see German SEO section) |
| **Passive voice** | Max 10% passive sentences; active voice ranks and reads better |
| **Transition words (DE)** | Mind. 30% der Sätze mit Übergangswörtern (allerdings, deshalb, beispielsweise, daher, außerdem) |

## Open Graph & Social Meta Tags

| Tag | Specification |
|---|---|
| `og:title` | Under 60 characters |
| `og:type` | `"article"` for blog posts |
| `og:image` | 1200×630 px (1.9:1); JPEG/PNG; absolute HTTPS URL |
| `og:url` | Canonical URL of the page |
| `og:description` | 130-160 characters (safe range) |
| `og:image:alt` | Required if `og:image` is set |
| `twitter:card` | `"summary_large_image"` |

OG uses `property` attribute, Twitter uses `name` attribute. Set both and keep in sync.

## Canonical URL

| Rule | Detail |
|---|---|
| Self-referencing | Every page gets a self-referencing canonical, even without duplicates |
| Absolute URLs | Always use full `https://` URLs |
| One per page | Multiple canonicals cause confusion |
| Paginated pages | Each page gets its own self-referencing canonical |

## XML Sitemap

| Rule | Detail |
|---|---|
| **Blog posts** | Every published blog post must be included in the XML sitemap |
| **lastmod** | Set `<lastmod>` to the actual last modification date (ISO 8601) |
| **Excluded pages** | noindex pages, redirects, and error pages must NOT be in the sitemap |
| **Auto-generation** | Use CMS or plugin to auto-generate; never maintain manually |
| **Submit** | Reference sitemap in `robots.txt` via `Sitemap: https://example.de/sitemap.xml` |

## Content Freshness

| Rule | Detail |
|---|---|
| **"Zuletzt aktualisiert"** | Visible date on the page when content was last reviewed |
| **dateModified** | Must match the visible date in Schema.org JSON-LD |
| **Review cycle** | Audit content at least annually; YMYL topics more frequently |
| **Outdated statistics** | Update numbers, percentages, and year references when refreshing |

## Schema.org / Structured Data (BlogPosting)

Use `BlogPosting` type with JSON-LD format for blog content:

```json
{
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "Titel des Beitrags",
    "image": [
        "https://example.de/bild-16x9.webp",
        "https://example.de/bild-4x3.webp",
        "https://example.de/bild-1x1.webp"
    ],
    "datePublished": "2026-06-04T10:00:00+02:00",
    "dateModified": "2026-06-04T12:00:00+02:00",
    "author": {
        "@type": "Person",
        "name": "Autorenname",
        "url": "https://example.de/ueber-uns/"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Firmenname",
        "url": "https://example.de/"
    }
}
```

| Property | Notes |
|---|---|
| `headline` | Same as title tag content |
| `image` | Multiple aspect ratios (1x1, 4x3, 16x9); min 1200 px wide |
| `datePublished` / `dateModified` | ISO 8601 with timezone |
| `author.url` | Link to author bio page (strongly recommended) |

## Additional Schema Types

### BreadcrumbList

Use on every page for navigation path display in SERPs:

```json
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://example.de/blog/" },
        { "@type": "ListItem", "position": 2, "name": "SEO Leitfaden", "item": "https://example.de/blog/seo-leitfaden/" }
    ]
}
```

### FAQPage

Use when the post contains a dedicated FAQ section with question-answer pairs:

```json
{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
        {
            "@type": "Question",
            "name": "Wie lang sollte ein Title-Tag sein?",
            "acceptedAnswer": { "@type": "Answer", "text": "50-60 Zeichen bzw. max 580 Pixel Breite." }
        }
    ]
}
```

Combine multiple schema types on one page by wrapping them in a `@graph` array.

## E-E-A-T Signals

| Dimension | How to Signal |
|---|---|
| **Experience** | Author bios, original photos, real examples, first-person accounts |
| **Expertise** | Niche-focused depth, credentials, structured explanations |
| **Authoritativeness** | Original research, industry recognition, authoritative backlinks |
| **Trustworthiness** | Named bylines with bio links, accurate sources, "zuletzt geprüft" dates |
| **AI content** | Must be reviewed by SME, enriched with original insights, attributed to named author |

## Core Web Vitals

| Metric | Good | What it measures |
|---|---|---|
| **LCP** | ≤ 2.5 s | Largest Contentful Paint — loading speed |
| **INP** | ≤ 200 ms | Interaction to Next Paint — responsiveness |
| **CLS** | ≤ 0.1 | Cumulative Layout Shift — visual stability |

## Mobile-First

| Rule | Detail |
|---|---|
| Content parity | Identical content, meta tags, structured data on mobile and desktop |
| Touch targets | Minimum 48×48 CSS px; 8 px spacing between targets |
| Viewport meta | Required: `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Page speed | 53% of mobile users leave if page takes >3 seconds |

## Robots Meta

| Directive | Effect |
|---|---|
| `index, follow` | Default; no need to specify |
| `noindex` | Page removed from index (must allow crawling for Google to see tag) |
| `max-snippet:[n]` | Limit snippet to N characters |
| `max-image-preview:large` | Allow large image previews in SERPs |

---

## German SEO Specifics

### Umlauts in URLs

| Character | URL replacement |
|---|---|
| ä | ae |
| ö | oe |
| ü | ue |
| ß | ss |

Google treats "ue" the same as "ü" for keyword matching. Never just drop the dots (ü→u is wrong).

### Flesch-Index (German Adaptation — Amstad 1978)

Formula: `180 - SL - (58.5 × WL)` (SL = sentence length in words, WL = avg syllables per word)

| Score | Interpretation |
|---|---|
| 60-70 | Gut lesbar für breites Publikum |
| **50-60** | **Empfohlen für SEO-Texte (YOAST)** |
| 30-50 | Anspruchsvoll, Fachpublikum |
| 0-30 | Wissenschaftlich/technisch |

German words are inherently longer (compound nouns), so scores are naturally lower than English.

### Hreflang (DACH)

| Tag | Market |
|---|---|
| `hreflang="de-DE"` | Germany |
| `hreflang="de-AT"` | Austria |
| `hreflang="de-CH"` | Switzerland |
| `hreflang="de"` | Language-only fallback |
| `hreflang="x-default"` | Fallback for non-matching users |

Requirements: Bidirectional linking (all versions link to all others + self); absolute URLs; all return HTTP 200.

### Legal Requirements (Trust Signals)

German sites require **Impressum** and **Datenschutzerklärung** — both affect trust signals and are legally mandatory.

### Domain & Market

- `.de` ccTLD provides strong geo-targeting signal for Germany
- Google.de has ~90%+ market share in Germany
- "Sie" vs "du" — consistency matters; trend 2025-2026 is "du" for B2C

---

## Verlinkung mit Copywriter-Skills

Beim Schreiben von Texten gelten SEO-Limits UND Tonalitätsregeln gemeinsam:

| Textart | Zusätzlich laden |
|---|---|
| Technische Blogbeiträge, Produkttexte, Feature-Ankündigungen | `copywriter-de` |
| Landing Pages, Service-Seiten, Booking-Seiten, Sales Copy | `marketing-copywriter-de` |

**Kein Widerspruch:** Die Copywriter-Skills bestimmen Stimme, Rhythmus und Struktur. Dieser Skill bestimmt die technischen Limits (Zeichenlängen, Pixel, Heading-Hierarchie, Schema). Beide ergänzen sich.

**Wichtig:** Die H1 auf der Seite darf emotionaler und länger sein als der Title-Tag. Der Title-Tag ist für die SERPs optimiert (50-60 Zeichen), die H1 für den Leser auf der Seite.

## Blog Post SEO Checklist

Use this checklist when writing or reviewing a blog post:

**Content & Keywords:**
- [ ] Focus keyword appears in title, H1, meta description, URL slug, and first paragraph
- [ ] Focus keyword is unique to this post (no keyword cannibalization)
- [ ] Keyword density 1-2%, naturally distributed
- [ ] Content length appropriate for type (see table above), minimum 300 words
- [ ] Featured snippet paragraph (40-60 words) after key heading

**Structure & Readability:**
- [ ] One H1 per page, heading hierarchy sequential (H1→H2→H3)
- [ ] Max 300 words between subheadings
- [ ] Flesch-Index 50-60 for German texts
- [ ] Max 10% passive voice
- [ ] Mind. 30% of sentences with transition words
- [ ] Sentence length varies visibly

**Meta & SERP:**
- [ ] Title: 50-60 characters, primary keyword near beginning, ≤580 px
- [ ] Meta description: 120-158 characters, focus keyword included, CTA, value in first 120 chars
- [ ] URL/slug: 3-5 words, lowercase, hyphens, keyword first, umlauts replaced
- [ ] Canonical URL: Self-referencing, absolute HTTPS

**Links:**
- [ ] Internal links: 2-5 per 1,000 words, descriptive anchor text
- [ ] Outbound links: 1-2 authoritative external sources
- [ ] No orphan pages — at least one internal link points to this post
- [ ] Table of contents for posts >1,000 words

**Images:**
- [ ] Alt text (80-140 chars), descriptive filenames, keyword-relevant
- [ ] WebP/AVIF format, width/height attributes set
- [ ] Hero image: `loading="eager"` + `fetchpriority="high"`; rest: `loading="lazy"`

**Technical:**
- [ ] Schema.org: `BlogPosting` JSON-LD with headline, image, dates, author, publisher
- [ ] Schema.org: `BreadcrumbList` JSON-LD for navigation path
- [ ] Schema.org: `FAQPage` JSON-LD if post contains FAQ section
- [ ] Open Graph: og:title, og:description, og:image (1200×630), og:type="article"
- [ ] XML Sitemap: Post included with correct `<lastmod>`
- [ ] Content freshness: "Zuletzt aktualisiert" date visible + `dateModified` in Schema

**E-E-A-T:**
- [ ] Author byline with bio link
- [ ] Specific claims backed by data or sources
- [ ] "Zuletzt aktualisiert" date visible on page
- [ ] Impressum and Datenschutzerklärung accessible

**Mobile:**
- [ ] Content parity with desktop
- [ ] Touch targets ≥48 px, viewport meta set
- [ ] Page load <3 seconds on mobile

---

## Sources

This skill was compiled from the following references (2025-2026):

**Google Official:**
- [Google Search Central — Article Structured Data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google Search Central — URL Structure](https://developers.google.com/search/docs/crawling-indexing/url-structure)
- [Google Search Central — Mobile-First Indexing](https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing)
- [Google Search Central — Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google Search Central — Hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google Search Central — Google Images Best Practices](https://developers.google.com/search/docs/appearance/google-images)

**Title & Meta:**
- [Zyppy — Meta Title Tag Length](https://zyppy.com/title-tags/meta-title-tag-length/)
- [Search Engine Land — Title Tag Length](https://searchengineland.com/title-tag-length-388468)
- [The Ocean Marketing — Title Tag Length Best Practices](https://theoceanmarketing.com/blog/title-tag-length-for-seo-best-practices/)
- [Scalenut — Meta Title Length Best Practices 2026](https://www.scalenut.com/blogs/meta-title-length-best-practices-2026)
- [MRS Digital — Meta Length Checker](https://mrs.digital/tools/meta-length-checker/)

**Content & Readability:**
- [SEO.co — Content Length](https://seo.co/content-length/)
- [Lovable.dev — Blog Post Length Guide](https://lovable.dev/guides/how-long-should-blog-post-be-data-backed-guide)
- [Yoast — Flesch Reading Ease Score](https://yoast.com/flesch-reading-ease-score/)
- [Yoast — How to Use Headings](https://yoast.com/how-to-use-headings-on-your-site/)
- [Conductor — Headings for SEO](https://www.conductor.com/academy/headings/)

**URL & Slug:**
- [Slug Genius — URL Slug Best Practices](https://sluggenius.com/blog/url-slug-best-practices)
- [Shopify — SEO-Friendly URLs](https://www.shopify.com/blog/seo-url)

**Structured Data:**
- [Search Engine Zine — Article vs Blog Schema](https://searchenginezine.com/technical/schema/article-vs-blog-schema/)
- [Open Graph Protocol](https://ogp.me/)
- [Ahrefs — Open Graph Meta Tags](https://ahrefs.com/blog/open-graph-meta-tags/)

**Image SEO:**
- [AltText.ai — Image Alt Text SEO Best Practices](https://alttext.ai/blog/image-alt-text-seo-best-practices)
- [Digital Applied — Image SEO Guide 2026](https://www.digitalapplied.com/blog/image-seo-complete-optimization-guide-2026)

**Internal Linking:**
- [Upward Engine — Internal Linking Best Practices](https://upwardengine.com/internal-linking-best-practices-seo/)
- [Traffic Think Tank — Internal Linking](https://trafficthinktank.com/internal-linking-best-practices/)

**Core Web Vitals:**
- [CoreWebVitals.io](https://www.corewebvitals.io/core-web-vitals)
- [Mewa Studio — SEO Core Web Vitals 2026](https://www.mewastudio.com/en/blog/seo-core-web-vitals-2026)

**E-E-A-T:**
- [BKND Development — EEAT SEO Strategy 2026](https://www.bknddevelopment.com/seo-insights/eeat-seo-strategy-2026-content-quality-signals/)
- [Search Engine Land — Google E-E-A-T for SEO](https://searchengineland.com/guide/google-e-e-a-t-for-seo)

**German SEO:**
- [WebCertain — Umlauts in German SEO](https://blog.webcertain.com/do-umlauts-matter-how-to-handle-the-most-annoying-characters-in-german-seo-2/10/04/2014/)
- [Nikolai Sroka — Flesch Index Lesbarkeit](https://nikolai-sroka.de/flesch-index-lesbarkeit-verbessern/)
- [Seokratie — SEO-Faktor Lesbarkeit](https://www.seokratie.de/seo-faktor-lesbarkeit/)
- [Outreach Monks — Hreflang SEO](https://outreachmonks.com/hreflang-seo/)

**Existing Claude Code SEO Skills (inspiration):**
- [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo)
- [aaron-he-zhu/seo-geo-claude-skills](https://github.com/aaron-he-zhu/seo-geo-claude-skills)
- [aevans-eng/seo-skill](https://github.com/aevans-eng/seo-skill)
