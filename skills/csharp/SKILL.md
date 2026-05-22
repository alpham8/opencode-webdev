---
name: csharp
description: Use when writing C# code - modern C# 12/13 features, records, pattern matching, nullable reference types, LINQ, async/await, collections, generics, sealed classes, required properties, file-scoped namespaces. Triggers on .cs files, .csproj, C# classes, interfaces, records.
---

# C#

## Related Skills

| Need | Skill |
|------|-------|
| ASP.NET Core framework (DI, middleware, APIs, EF Core) | `aspnet-core` |
| TypeScript (frontend, similar type system concepts) | `typescript` |

---

## Overview

C# is a strongly-typed, object-oriented language running on .NET. Current version: **C# 13** (.NET 9).

**Key principles:** Nullable reference types enabled, `sealed` by default for services, records for DTOs, async all the way, explicit types over `var`.

---

## Modern C# Features

### File-Scoped Namespaces (C# 10)

```csharp
// One line instead of wrapping the entire file
namespace App.Services;

public sealed class OrderService : IOrderService
{
    // ...
}
```

### Records (C# 9+)

```csharp
// Immutable data transfer objects
public sealed record UserDto(string Id, string DisplayName, string? AvatarUrl);

// Record with additional logic
public sealed record Money(decimal Amount, string Currency)
{
    public Money Add(Money other)
    {
        if (Currency != other.Currency)
        {
            throw new InvalidOperationException("Currency mismatch");
        }
        return this with { Amount = Amount + other.Amount };
    }
}

// Record struct (value type, no heap allocation)
public readonly record struct Coordinate(double Lat, double Lng);

// Positional record with extra properties
public sealed record DetectedFace(float X, float Y, float Width, float Height)
{
    public float Area => Width * Height;
}
```

### Required Properties (C# 11)

```csharp
public sealed class CreatePostRequest
{
    public required string Content { get; init; }
    public required string NetworkSlug { get; init; }
    public List<string>? MediaIds { get; init; }
}
```

### Nullable Reference Types

```csharp
// Enable in .csproj: <Nullable>enable</Nullable>

public sealed class UserService
{
    // Non-nullable: compiler guarantees non-null
    private readonly ILogger<UserService> _logger;

    // Nullable: explicitly optional
    public async Task<UserDto?> FindByEmailAsync(string email)
    {
        ApplicationUser? user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            return null;
        }

        return MapToDto(user);
    }
}
```

### Pattern Matching

```csharp
// Type patterns
public string Describe(object value) => value switch
{
    int i when i > 0 => $"Positive: {i}",
    int i => $"Non-positive: {i}",
    string s => $"String: {s}",
    null => "null",
    _ => $"Unknown: {value.GetType().Name}",
};

// Property patterns
public decimal CalculateDiscount(Order order) => order switch
{
    { Total: > 1000, IsPremium: true } => order.Total * 0.2m,
    { Total: > 500 } => order.Total * 0.1m,
    { IsPremium: true } => order.Total * 0.05m,
    _ => 0m,
};

// List patterns (C# 11)
int[] numbers = [1, 2, 3, 4, 5];
bool isValid = numbers is [1, 2, ..]; // starts with 1, 2

// Relational patterns
string GetCategory(int score) => score switch
{
    >= 90 => "Excellent",
    >= 70 => "Good",
    >= 50 => "Average",
    _ => "Below average",
};
```

### Primary Constructors (C# 12)

```csharp
// Classes with primary constructor (DI-friendly)
public sealed class ChatService(
    ActionBuddiesDbContext context,
    ILogger<ChatService> logger,
    ICacheService cache) : IChatService
{
    public async Task<ChatResponse> CreateDirectChatAsync(string userId, string participantId)
    {
        logger.LogInformation("Creating chat between {UserId} and {ParticipantId}", userId, participantId);
        // context, logger, cache available as fields
    }
}
```

### Collection Expressions (C# 12)

```csharp
// Spread and initialize
List<string> combined = [..existing, "new item", ..more];
int[] numbers = [1, 2, 3, 4, 5];
ReadOnlySpan<byte> buffer = [0x00, 0xFF];
```

### Raw String Literals (C# 11)

```csharp
string json = """
    {
        "name": "ActionBuddies",
        "version": "1.0"
    }
    """;

// Interpolated raw strings
string query = $"""
    SELECT * FROM users
    WHERE email = '{email}'
    AND active = true
    """;
```

### Sealed Classes

```csharp
// Sealed prevents inheritance -- use for services, handlers, DTOs
public sealed class NotificationService : INotificationService
{
    // Cannot be subclassed -- explicit design intent
}
```

### Target-Typed New

```csharp
List<UserDto> users = new();
Dictionary<string, int> counts = new();
CancellationTokenSource cts = new(TimeSpan.FromSeconds(30));
```

---

## Type System

### Value Types vs Reference Types

```csharp
// Value types (stack-allocated)
int count = 0;
decimal price = 9.99m;
bool active = true;
DateTime now = DateTime.UtcNow;
Guid id = Guid.NewGuid();
Status status = Status.Active;    // enum
Coordinate point = new(48.1, 11.5); // record struct

// Reference types (heap-allocated)
string name = "Alice";
List<int> numbers = [1, 2, 3];
UserDto? user = null;
```

### Enums

```csharp
public enum ModerationAction
{
    Warn,
    Suspend7Days,
    Suspend30Days,
    Ban,
    Escalate,
}

// String backing (for JSON serialization)
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NotificationType
{
    Like,
    Comment,
    Follow,
    Mention,
    EventInvite,
}
```

### Interfaces

```csharp
public interface IChatService
{
    Task<ChatResponse> CreateDirectChatAsync(string currentUserId, string participantUserId);
    Task<List<ChatMessageDto>> GetMessagesAsync(string chatId, string userId, int page, int pageSize);
    Task<ChatMessageDto> SendMessageAsync(string chatId, string senderId, string content);
    Task DeleteMessageAsync(string chatId, string messageId, string userId);
}
```

### Generics

```csharp
public interface IRepository<T> where T : class
{
    Task<T?> FindByIdAsync(int id);
    Task<List<T>> FindAllAsync(CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
}

// Generic constraints
public sealed class CachedService<TKey, TValue>(ICacheService cache)
    where TKey : notnull
    where TValue : class
{
    public async Task<TValue?> GetOrSetAsync(TKey key, Func<Task<TValue>> factory, TimeSpan ttl)
    {
        string cacheKey = $"{typeof(TValue).Name}:{key}";
        TValue? cached = await cache.GetAsync<TValue>(cacheKey);

        if (cached is not null)
        {
            return cached;
        }

        TValue value = await factory();
        await cache.SetAsync(cacheKey, value, ttl);
        return value;
    }
}
```

---

## LINQ

```csharp
// Query syntax (less common in modern C#)
var result = from u in users
             where u.IsActive
             orderby u.Name
             select new UserDto(u.Id, u.Name, u.AvatarUrl);

// Method syntax (preferred)
List<UserDto> activeUsers = await context.Users
    .Where(u => u.IsActive)
    .OrderBy(u => u.DisplayName)
    .Select(u => new UserDto(u.Id, u.DisplayName, u.AvatarUrl))
    .ToListAsync();

// Common operators
int count = items.Count(i => i.IsValid);
UserDto? first = items.FirstOrDefault(i => i.Id == targetId);
bool any = items.Any(i => i.Score > 90);
bool all = items.All(i => i.Score >= 0);
decimal avg = items.Average(i => i.Price);
decimal sum = items.Sum(i => i.Amount);
List<string> distinct = items.Select(i => i.Category).Distinct().ToList();

// Grouping
Dictionary<string, List<Post>> byNetwork = posts
    .GroupBy(p => p.NetworkSlug)
    .ToDictionary(g => g.Key, g => g.ToList());

// Projection with index
List<(int Index, string Name)> indexed = items
    .Select((item, index) => (index, item.Name))
    .ToList();
```

---

## Async / Await

```csharp
// Async all the way -- never .Result or .Wait()
public async Task<PostDto> CreatePostAsync(CreatePostRequest request, string userId)
{
    Post post = new()
    {
        Content = request.Content,
        AuthorId = userId,
        CreatedAt = DateTime.UtcNow,
    };

    context.Posts.Add(post);
    await context.SaveChangesAsync();

    return MapToDto(post);
}

// Parallel async
public async Task<SearchResult> SearchAsync(string query)
{
    Task<List<UserDto>> usersTask = SearchUsersAsync(query);
    Task<List<PostDto>> postsTask = SearchPostsAsync(query);
    Task<List<SpotDto>> spotsTask = SearchSpotsAsync(query);
    Task<List<EventDto>> eventsTask = SearchEventsAsync(query);

    await Task.WhenAll(usersTask, postsTask, spotsTask, eventsTask);

    return new SearchResult
    {
        Users = usersTask.Result,
        Posts = postsTask.Result,
        Spots = spotsTask.Result,
        Events = eventsTask.Result,
    };
}

// CancellationToken propagation
public async Task<List<PostDto>> GetFeedAsync(string userId, int page, CancellationToken ct)
{
    return await context.Posts
        .Where(p => p.NetworkSlug == networkSlug)
        .OrderByDescending(p => p.CreatedAt)
        .Skip((page - 1) * 20)
        .Take(20)
        .Select(p => MapToDto(p))
        .ToListAsync(ct);
}
```

---

## Collections

```csharp
// Immutable collections
IReadOnlyList<string> names = ["Alice", "Bob"];
IReadOnlyDictionary<string, int> scores = new Dictionary<string, int>
{
    ["Alice"] = 95,
    ["Bob"] = 87,
};

// Frozen collections (.NET 8+ -- optimized for read-heavy)
FrozenDictionary<string, Sport> sportsLookup = sports.ToFrozenDictionary(s => s.Slug);

// Array slicing
int[] arr = [1, 2, 3, 4, 5];
int[] slice = arr[1..3];      // [2, 3]
int last = arr[^1];           // 5
int[] lastTwo = arr[^2..];    // [4, 5]
```

---

## String Handling

```csharp
// Interpolation
string msg = $"User {user.DisplayName} (ID: {user.Id}) logged in";

// Verbatim + interpolation
string path = $@"C:\Users\{username}\Documents";

// String.Join, Split
string csv = string.Join(", ", items.Select(i => i.Name));
string[] parts = input.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

// StringBuilder for loops
StringBuilder sb = new();
foreach (string item in items)
{
    sb.AppendLine(item);
}

// Span-based (zero allocation)
ReadOnlySpan<char> span = input.AsSpan();
bool startsWith = span.StartsWith("prefix");
```

---

## Error Handling

```csharp
// Specific exceptions
public sealed class PostNotFoundException : Exception
{
    public PostNotFoundException(string postId)
        : base($"Post with ID '{postId}' was not found") { }
}

// Guard clauses with ArgumentException helpers (.NET 8+)
public void SetName(string name)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(name);
    ArgumentOutOfRangeException.ThrowIfGreaterThan(name.Length, 100);
    _name = name;
}

// Try pattern (no exceptions for expected failures)
public bool TryGetUser(string id, out UserDto? user)
{
    user = _cache.Get<UserDto>(id);
    return user is not null;
}
```

---

## Common Gotchas

1. **`var` hides types** -- Use explicit types for clarity, especially in service code. `var` is acceptable for `new()` and LINQ where the type is obvious.
2. **Async void** -- Never use `async void` except in event handlers. Always return `Task` or `Task<T>`.
3. **`.Result` / `.Wait()` deadlocks** -- Never block on async code. Use `await` all the way up.
4. **`string.IsNullOrEmpty` vs `IsNullOrWhiteSpace`** -- Prefer `IsNullOrWhiteSpace` to also catch `"   "`.
5. **`DateTime.Now` vs `DateTime.UtcNow`** -- Always use `UtcNow` for storage and comparison. Convert to local only for display.
6. **EF Core tracking** -- Use `.AsNoTracking()` for read-only queries to avoid memory and performance overhead.
7. **`IEnumerable` multiple enumeration** -- Materialize with `.ToList()` if you iterate more than once.
8. **Sealed classes** -- Seal service implementations. Unsealed classes have virtual dispatch overhead and invite uncontrolled inheritance.
9. **Dispose pattern** -- `IDisposable` / `IAsyncDisposable` resources need `using` statements or DI lifetime management.
10. **`ConfigureAwait(false)`** -- Not needed in ASP.NET Core (no SynchronizationContext). Required in library code targeting multiple platforms.
11. **Nullable warnings** -- Never suppress with `!` without justification. Use `is not null` checks or `??` instead.
12. **Mutable records** -- Records with `{ get; set; }` lose immutability benefits. Use `{ get; init; }` or positional records.

---

## Documentation References

| Resource | URL |
|----------|-----|
| C# Language Reference | https://learn.microsoft.com/en-us/dotnet/csharp/ |
| .NET API Browser | https://learn.microsoft.com/en-us/dotnet/api/ |
| C# What's New | https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/ |
| .NET Source Browser | https://source.dot.net/ |