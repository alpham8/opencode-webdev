## 15) Observability & Logging

### Structured Logging

- **JSON format**: Use structured JSON logging in all backend services. Never use unstructured string concatenation for log messages.
- **Correlation IDs**: Every request must carry a correlation ID (trace ID) that propagates through all service calls and appears in every log entry.
- **Standard fields**: Every log entry must include at minimum: `timestamp`, `level`, `component`, `message`, `correlationId`.
- **Log levels**: Use levels consistently — `error` for failures requiring attention, `warn` for degraded but functional states, `info` for significant business events, `debug` for development diagnostics (never in production).

### Data Safety in Logs

- **Never log secrets**: Passwords, tokens, API keys, session IDs, and encryption keys must never appear in logs.
- **Sanitise PII**: Mask or redact personally identifiable information (email, phone, IP, names) before logging. Log user IDs instead of personal data.
- **No request/response body dumps**: Log metadata (status, duration, endpoint) — not full payloads.

### Error Tracking

- **Attach context**: Error reports must include correlation ID, user ID (anonymised), breadcrumbs (recent actions), and relevant metadata.
- **Separate environments**: Use distinct error tracking projects/channels for development, staging, and production.
- **Source maps**: Enable source maps in error tracking for compiled/minified code so stack traces are readable.