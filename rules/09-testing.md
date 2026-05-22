## 9) Testing & Definition of Done

- New or changed core behavior **requires tests** (unit and/or integration as appropriate).

### Unit Tests: No Real API Calls (Non-Negotiable)

**Unit tests must never call real external APIs.** Always use mocked, stubbed, or faked responses that simulate the API's behavior — including edge cases and error scenarios.

- Mock or stub every external dependency (HTTP clients, SDKs, database connections, file systems, mail services).
- Use realistic but **fictional response data** that mirrors the actual API response structure.
- Always cover edge cases with fictional responses: empty results, error codes (4xx, 5xx), rate limits, timeouts, malformed responses, partial data, pagination boundaries.
- The test suite must run fully offline, fast, and deterministically — no network access, no external state.

```php
// ❌ Bad — calls real API
$response = $httpClient->request('GET', 'https://api.example.com/posts');

// ✅ Good — mocked response with realistic structure
$httpClient = $this->createMock(HttpClientInterface::class);
$httpClient->method('request')->willReturn(
    new MockResponse(json_encode(['posts' => [], 'total' => 0]), ['http_code' => 200])
);
```

This rule applies to **all languages and frameworks** — PHP, TypeScript, Python, Bash, etc.

### Definition of Done

- [ ] Typecheck passes (`tsc`, `mypy`, `phpstan`, etc.)
- [ ] Build passes with no new errors
- [ ] All tests pass
- [ ] No new linter warnings
- [ ] Formatting compliant (Prettier / PSR-12 equivalent)
- [ ] No secrets, credentials, or debug output committed
- [ ] End-to-end tests pass
- [ ] All interactive UI elements are within the visible viewport and reachable by the user (no off-screen, hidden, or unreachable controls)
- [ ] No N+1 queries or unbounded result sets introduced (see Section 12)
- [ ] Migrations are reversible — `up` → `down` → `up` verified (see Section 13)
- [ ] Accessibility: keyboard navigable, labels present, contrast sufficient (see Section 16)
- [ ] User-visible strings use translation keys, not hardcoded text (see Section 17)
- [ ] Commit messages follow Conventional Commits format (see Section 18)