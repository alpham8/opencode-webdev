## 2) Security (Non-Negotiable)

**Never trust user input.** Always validate input and escape output where applicable.

### Core Principles

- **Input validation everywhere**: Validate all user input on both frontend and backend. Validate type, length, format, and allowed values. Reject invalid input early with guard clauses.
- **Output escaping**: Escape all user-controlled data before rendering in HTML, JavaScript, SQL, shell commands, or any other output context.
- **Secure database queries**: In any database context (relational, graph, document, etc.), always use the secure query mechanisms provided by the database driver — prepared statements, parameterized queries, ORM/ODM query builders, or equivalent. For graph databases (e.g. Neo4j), use parameterized Cypher queries. Never concatenate user input into query strings, regardless of database technology.
- **Injection prevention**: Avoid any form of injection — SQL injection, command injection (never pass user input to shell commands), XSS, LDAP injection, template injection, header injection, etc.
- **API input validation**: Validate and escape all data received from public APIs and webhooks. External data is untrusted data.
- **Frontend + backend validation**: If there is a frontend and backend, validate and escape user input on **both sides**. Frontend validation is for UX; backend validation is for security. Never rely on frontend validation alone.
- **Rate limiting**: Use API rate limiting mechanisms on all public-facing endpoints (authentication, webhooks, API routes) to prevent abuse and brute-force attacks.
- **Token / secret handling**: Encrypt sensitive tokens at rest (e.g. OAuth tokens). Never log secrets or include them in error messages. Never commit secrets to version control.
- **CSRF protection**: Use CSRF tokens on server-rendered HTML forms (login, contact, admin panels). For JSON APIs, CSRF tokens are unnecessary and counterproductive — instead rely on `SameSite=Lax` cookies, Origin/Referer header validation, `Content-Type: application/json` enforcement, and custom auth headers (which browsers cannot set cross-origin). Never add token-based CSRF to pure API endpoints — it breaks parallel requests and creates chicken-and-egg problems with SPAs.
- **Authentication hardening**: Log failed login attempts. Use constant-time comparison for secrets and tokens.

### Quick Checklist

| Area | Rule |
|---|---|
| User input | Validate type, length, format, allowed values |
| Database queries | Use secure driver mechanisms (prepared statements, parameterized queries, etc.) |
| HTML output | Escape with context-appropriate encoding |
| Shell commands | Never pass user input; use safe APIs instead |
| API endpoints | Rate limiting on all public routes |
| Webhooks | Verify signatures, validate payload structure |
| Frontend forms | Validate on client AND server |
| OAuth tokens | Encrypt at rest, never log |
| Error messages | Never expose internal details or stack traces to users |