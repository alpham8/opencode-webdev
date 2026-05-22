---
name: content-testing
description: Use when writing or reviewing tests for web pages, API responses, CLI output, or any user-facing output. Ensures tests verify actual content and structure, not just status codes or response types. Triggers on test files, test methods, assertResponseIsSuccessful, assertResponseStatusCodeSame, status code checks, HTTP response tests, controller tests, endpoint tests, integration tests, functional tests.
---

# Content Testing — Deep Assertions

## Core Principle

**A test that only checks a status code proves the server didn't crash. It does not prove the page is correct.**

Every test for user-facing output must assert **what the user actually sees or receives** — not just that "something was returned successfully."

## When This Skill Applies

- Writing or reviewing tests for web pages (HTML responses)
- Writing or reviewing tests for API endpoints (JSON/XML responses)
- Writing or reviewing tests for CLI commands (stdout/stderr output)
- Writing or reviewing tests for email templates, PDF generation, RSS feeds
- Any test that checks a response status code without also checking the response body

## The Rule

```
STATUS CODE + CONTENT ASSERTIONS = VALID TEST
STATUS CODE ONLY = INCOMPLETE TEST
```

A status-code-only test is a **smoke test** — useful as a baseline, but never sufficient on its own.

## Assertion Depth Pyramid

Every test should climb as high on this pyramid as the feature requires:

```
Level 4: Semantic correctness
         (values are correct, relationships hold, business logic works)

Level 3: Content verification
         (text matches, data is present, translations render)

Level 2: Structural verification
         (elements exist, correct nesting, required sections present)

Level 1: Response verification
         (status code, content-type, headers)
```

### Level 1 — Response Verification (Minimum)

Status code, content type, critical headers.

```
✅ Response is 200
✅ Content-Type is text/html (or application/json, application/xml)
✅ Cache headers are set correctly
```

This level alone is **never sufficient** for a content test.

### Level 2 — Structural Verification

The response contains the expected structural elements.

**HTML pages:**
- Required sections/containers exist (navigation, main content, footer)
- Form fields are present and have correct types
- Interactive elements exist (buttons, links, widgets)
- SEO elements exist (meta tags, JSON-LD blocks, hreflang tags)

**JSON APIs:**
- Required keys exist
- Array fields have expected structure
- Nested objects have correct shape

**XML/RSS feeds:**
- Required elements exist (channel, item, entry)
- Each item has required child elements

**CLI output:**
- Expected sections/headers appear
- Table structure is correct

### Level 3 — Content Verification

The content is actually correct, not just structurally present.

**HTML pages:**
- Headings contain expected text
- Navigation links point to correct URLs
- Form labels match the current locale
- Translated strings render (not raw translation keys)
- Company/legal info is present (name, address, tax ID)

**JSON APIs:**
- Values match expected data
- Counts are correct
- Enum values are valid

**XML/RSS feeds:**
- Item titles are non-empty
- Links are valid URLs
- Dates are parseable

### Level 4 — Semantic Correctness

The feature works correctly as a whole.

- Pagination shows different content per page
- Search returns relevant results
- Locale-specific content uses the correct language
- Filtered lists exclude non-matching items
- Related/recommended items are actually related
- SEO structured data contains correct values (not just correct structure)

## Checklist by Feature Type

### Web Page Tests

```
[ ] Status code (200, 301, 404, etc.)
[ ] Page title contains expected text
[ ] H1 heading exists and contains expected text
[ ] Main content section exists
[ ] Navigation exists with correct links
[ ] Footer exists with required content
[ ] Meta tags present (description, og:*, article:*)
[ ] Structured data present (JSON-LD)
[ ] Hreflang tags correct (multilingual sites)
[ ] html lang attribute matches locale
[ ] Forms have all required fields
[ ] Interactive widgets present (CAPTCHA, date pickers, etc.)
[ ] Images have alt attributes
```

### Multilingual Page Tests

```
[ ] Each locale returns correct html lang
[ ] Page title is in the correct language
[ ] H1 is in the correct language
[ ] Navigation labels match locale
[ ] Hreflang tags link to all locales
[ ] x-default hreflang points to default locale
[ ] Language switcher exists and links to other locale
[ ] Translated content renders (not raw keys like 'nav.home')
[ ] Date/number formatting follows locale conventions
```

### Form Tests

```
[ ] All input fields exist (name, type, id)
[ ] Labels are present and associated
[ ] Required fields are marked
[ ] Submit button exists
[ ] CAPTCHA/anti-spam widget present
[ ] Validation errors display for invalid input
[ ] Error messages are user-friendly and localized
[ ] Success page/response has correct content
```

### API Endpoint Tests

```
[ ] Status code correct
[ ] Content-Type header correct
[ ] Response body has expected structure (keys, nesting)
[ ] Array responses have expected item count or range
[ ] Each item has required fields
[ ] Values are of correct type
[ ] Empty results return empty array, not null/error
[ ] Error responses have structured error body
```

### RSS/XML Feed Tests

```
[ ] Content-Type is application/xml or application/rss+xml
[ ] Root element is correct (rss, feed, urlset)
[ ] Channel/feed metadata present (title, link, description)
[ ] Items have required elements (title, link, pubDate/updated)
[ ] Item content is non-empty
[ ] URLs are absolute
[ ] Dates are valid
```

### SEO Tests

```
[ ] Title tag present and non-empty
[ ] Meta description present and non-empty
[ ] Open Graph tags present (og:title, og:description, og:type)
[ ] JSON-LD structured data present and valid type
[ ] Canonical URL correct
[ ] Hreflang tags for all supported locales
[ ] Sitemap contains all public URLs
[ ] noindex on pages that should not be indexed (success pages, admin)
[ ] Breadcrumb JSON-LD on subpages
```

### Pagination Tests

```
[ ] Page 1 returns correct number of items
[ ] Page 2 has different items than page 1
[ ] Out-of-range page numbers are handled (clamped or 404)
[ ] Pagination controls exist (links, buttons)
[ ] Current page is indicated
```

## Anti-Patterns

### Status-Code-Only Test

```
❌ BAD — proves nothing about page content
test('homepage returns 200')
    GET /
    assert status == 200

✅ GOOD — proves the page renders correctly
test('homepage contains hero section and services')
    GET /
    assert status == 200
    assert selector 'section.hero' exists
    assert selector 'section.hero h1' exists
    assert selector '#services' exists
    assert selector '.service-card' count >= 3
```

### Mock-Heavy Content Test

```
❌ BAD — tests the mock, not the page
test('blog shows posts')
    mock BlogService to return [fake post]
    GET /blog
    assert status == 200

✅ GOOD — tests with real data
test('blog listing shows actual posts with structure')
    GET /blog
    assert status == 200
    assert '.blog-card' count > 0
    for each .blog-card:
        assert has date element
        assert has title link
        assert has excerpt
```

### Single-Locale Testing

```
❌ BAD — only tests one language
test('contact page works')
    GET /kontakt
    assert status == 200

✅ GOOD — tests both locales with content
test('contact page DE has German heading')
    GET /kontakt
    assert h1 contains 'Kontakt'

test('contact page EN has English heading')
    GET /en/contact
    assert h1 contains 'Contact'
```

## How to Apply This Skill

When writing or reviewing tests:

1. **Identify the test's purpose** — what user-facing feature does it verify?
2. **Check the assertion depth** — is it Level 1 only? Climb higher.
3. **Walk the checklist** — use the relevant checklist above for the feature type.
4. **Test both/all locales** — if the app is multilingual, every content test needs locale variants.
5. **Verify real content** — use assertions against actual rendered text, DOM structure, or response data. Don't just check that "something" exists.

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| **TDD** | TDD defines *when* to write tests (before code). This skill defines *what depth* to test. |
| **Symfony / PHP** | Framework-specific assertion helpers (assertSelectorExists, assertSelectorTextContains). |
| **Frontend Design** | What to verify in UI tests (sections, components, accessibility). |