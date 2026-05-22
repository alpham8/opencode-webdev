## 12) Performance (Non-Negotiable)

**Write code that performs well by default.** Fix performance problems when you see them.

### Database

- **No N+1 queries**: Never execute database queries inside loops. Use eager loading, joins, or batch fetches.
- **Index awareness**: Every `WHERE`, `JOIN`, and `ORDER BY` column should have an index or a documented reason why not.
- **Limit result sets**: Always paginate or limit queries that could return unbounded rows.

### Algorithmic Complexity

- **Flag O(n^2) and worse**: If a nested loop operates on collections that grow with input, use hash maps, sets, or sorted structures instead.
- **Avoid redundant computation**: Do not recalculate values inside loops that could be computed once outside.

### Frontend / Bundle

- **Lazy load** routes, heavy components, and images that are not immediately visible.
- **Code split** vendor libraries from application code.
- **No unoptimised assets**: Compress images, use modern formats (WebP/AVIF), set appropriate cache headers.

### Memory

- **Clean up subscriptions**: Remove event listeners, clear timers, and unsubscribe observables in component teardown / destructors.
- **Avoid unbounded caches**: Every in-memory cache must have a maximum size or TTL.
- **Stream large data**: Process large files, datasets, or API responses as streams — never load entirely into memory.