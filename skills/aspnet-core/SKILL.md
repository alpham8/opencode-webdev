---
name: aspnet-core
description: Use when developing ASP.NET Core applications - Minimal APIs, dependency injection, middleware, Entity Framework Core, SignalR, authentication (JWT/Identity), configuration, health checks, caching, MassTransit, rate limiting. Triggers on .csproj, Program.cs, DbContext, MapGet/MapPost, IServiceCollection.
---

# ASP.NET Core

## Related Skills

| Need | Skill |
|------|-------|
| C# language reference | `csharp` |
| Svelte/SvelteKit frontend | `svelte` |
| TypeScript for frontend | `typescript` |

---

## Overview

ASP.NET Core is a cross-platform framework for building web APIs, real-time apps, and microservices on .NET. Current version: **9.0**.

**Architecture:** Minimal APIs (no controllers), interface-based services, EF Core Code-First, JWT auth with Identity, SignalR for real-time.

---

## Project Structure

```
src/
  MyApp.Api/
    Configuration/        # Options/settings classes
    Data/
      ActionBuddiesDbContext.cs
      Configurations/     # IEntityTypeConfiguration<T>
      Migrations/
      SeedData/
    Extensions/           # ServiceCollection + WebApplication extensions
      ServiceCollectionExtensions.cs
      WebApplicationExtensions.cs
      AuthEndpoints.cs
      PostEndpoints.cs
      ...
    Hubs/                 # SignalR hubs
    Middleware/            # Custom middleware
    Models/               # Entities, DTOs, requests/responses
    Services/             # Interface + implementation pairs
    Program.cs            # Entry point
    appsettings.json
  MyApp.Api.Tests.Unit/
  MyApp.Api.Tests.Integration/
  frontend/               # SvelteKit app
```

---

## Program.cs (Minimal API Setup)

```csharp
WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Service registration
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddAuthenticationServices(builder.Configuration);
builder.Services.AddCachingServices(builder.Configuration);
builder.Services.AddSignalR();

WebApplication app = builder.Build();

// Middleware pipeline
app.UseSecurityHeaders();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseOutputCache();

// Endpoint mapping
app.MapAuthEndpoints();
app.MapPostEndpoints();
app.MapChatEndpoints();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapHealthChecks("/health");

app.Run();
```

---

## Minimal APIs

### Endpoint Organization

```csharp
// Extensions/PostEndpoints.cs
public static class PostEndpoints
{
    public static void MapPostEndpoints(this WebApplication app)
    {
        RouteGroupBuilder group = app.MapGroup("/api/v1/posts")
            .RequireAuthorization()
            .WithTags("Posts");

        group.MapGet("/", GetFeed);
        group.MapGet("/{id}", GetPost);
        group.MapPost("/", CreatePost);
        group.MapPut("/{id}", UpdatePost);
        group.MapDelete("/{id}", DeletePost);
        group.MapPost("/{id}/like", ToggleLike);
    }

    private static async Task<IResult> GetFeed(
        [FromQuery] int page,
        [FromQuery] string? network,
        IPostService postService,
        ClaimsPrincipal user,
        CancellationToken ct)
    {
        string userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        List<PostDto> posts = await postService.GetFeedAsync(userId, network, page, ct);
        return Results.Ok(posts);
    }

    private static async Task<IResult> CreatePost(
        CreatePostRequest request,
        IPostService postService,
        ClaimsPrincipal user)
    {
        string userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        PostDto post = await postService.CreateAsync(request, userId);
        return Results.Created($"/api/v1/posts/{post.Id}", post);
    }

    private static async Task<IResult> DeletePost(
        string id,
        IPostService postService,
        ClaimsPrincipal user)
    {
        string userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        bool deleted = await postService.DeleteAsync(id, userId);
        return deleted ? Results.NoContent() : Results.NotFound();
    }
}
```

### Common Result Patterns

```csharp
Results.Ok(data);                           // 200
Results.Created($"/api/v1/items/{id}", dto); // 201
Results.NoContent();                         // 204
Results.NotFound();                          // 404
Results.BadRequest("Validation failed");     // 400
Results.Unauthorized();                      // 401
Results.Forbid();                            // 403
Results.Problem("Internal error", statusCode: 500);
```

---

## Dependency Injection

### Service Registration

```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Options pattern -- bind config sections
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<RedisSettings>(configuration.GetSection("Redis"));
        services.Configure<MinioSettings>(configuration.GetSection("Minio"));

        // Scoped services (per-request lifetime)
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IPostService, PostService>();
        services.AddScoped<INotificationService, NotificationService>();

        // Singleton (shared across all requests)
        services.AddSingleton<ICacheService, RedisCacheService>();

        // Transient (new instance every injection)
        services.AddTransient<ITokenService, TokenService>();

        // DbContext
        services.AddDbContext<ActionBuddiesDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention());

        // DbContextFactory (for parallel queries)
        services.AddDbContextFactory<ActionBuddiesDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .UseSnakeCaseNamingConvention());

        return services;
    }
}
```

### Options Pattern

```csharp
// Configuration class
public sealed class JwtSettings
{
    public required string Secret { get; init; }
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public int ExpirationMinutes { get; init; } = 15;
}

// Bind in DI
services.Configure<JwtSettings>(configuration.GetSection("Jwt"));

// Inject via IOptions<T>
public sealed class TokenService(IOptions<JwtSettings> jwtOptions) : ITokenService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;

    public string GenerateToken(ApplicationUser user)
    {
        // use _jwt.Secret, _jwt.Issuer, etc.
    }
}
```

---

## Entity Framework Core

### DbContext

```csharp
public sealed class ActionBuddiesDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Chat> Chats => Set<Chat>();
    public DbSet<Sport> Sports => Set<Sport>();
    public DbSet<Spot> Spots => Set<Spot>();

    public ActionBuddiesDbContext(DbContextOptions<ActionBuddiesDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ActionBuddiesDbContext).Assembly);
    }
}
```

### Entity Configuration

```csharp
public sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Content).HasMaxLength(5000).IsRequired();
        builder.Property(p => p.CreatedAt).IsRequired();

        builder.HasOne(p => p.Author)
            .WithMany()
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Likes)
            .WithOne(l => l.Post)
            .HasForeignKey(l => l.PostId);

        // Compound index
        builder.HasIndex(p => new { p.NetworkSlug, p.CreatedAt })
            .IsDescending(false, true);
    }
}
```

### Querying Patterns

```csharp
// Eager loading with Include
List<Post> posts = await context.Posts
    .Include(p => p.Author)
    .Include(p => p.Likes)
    .Include(p => p.Comments)
        .ThenInclude(c => c.Author)
    .Where(p => p.NetworkSlug == networkSlug)
    .OrderByDescending(p => p.CreatedAt)
    .Take(20)
    .AsNoTracking()
    .ToListAsync(ct);

// Projection (better performance than Include)
List<PostDto> posts = await context.Posts
    .Where(p => p.AuthorId == userId)
    .OrderByDescending(p => p.CreatedAt)
    .Select(p => new PostDto
    {
        Id = p.Id,
        Content = p.Content,
        AuthorName = p.Author.DisplayName,
        LikeCount = p.Likes.Count,
        CommentCount = p.Comments.Count,
    })
    .ToListAsync(ct);

// Pagination
int totalCount = await context.Posts.CountAsync(p => p.NetworkSlug == slug, ct);
List<Post> page = await context.Posts
    .OrderByDescending(p => p.CreatedAt)
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToListAsync(ct);
```

### Migrations

```bash
dotnet ef migrations add AddPostIndexes --project src/MyApp.Api
dotnet ef database update --project src/MyApp.Api
dotnet ef migrations remove --project src/MyApp.Api  # remove last unapplied
```

---

## Authentication (JWT + Identity)

### Setup

```csharp
services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<ActionBuddiesDbContext>()
.AddDefaultTokenProviders();

services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
    };

    // Extract token from cookie or query string (for SignalR)
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["ab_access"]
                ?? context.Request.Query["access_token"];
            return Task.CompletedTask;
        },
    };
});
```

### Auth Endpoints

```csharp
group.MapPost("/login", async (LoginRequest request, ITokenService tokenService,
    UserManager<ApplicationUser> userManager, HttpContext httpContext) =>
{
    ApplicationUser? user = await userManager.FindByEmailAsync(request.Email);
    if (user is null || !await userManager.CheckPasswordAsync(user, request.Password))
    {
        return Results.Unauthorized();
    }

    string token = tokenService.GenerateToken(user);

    // Set HTTPOnly cookie for SSO
    httpContext.Response.Cookies.Append("ab_access", token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Lax,
        Expires = DateTimeOffset.UtcNow.AddDays(7),
    });

    return Results.Ok(new { token });
});
```

---

## SignalR

### Hub

```csharp
[Authorize]
public sealed class ChatHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        string userId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string chatId, string content)
    {
        string senderId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        // Save message via service, then broadcast
        ChatMessageDto message = await _chatService.SendMessageAsync(chatId, senderId, content);

        await Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", message);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string userId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
        await base.OnDisconnectedAsync(exception);
    }
}
```

### Sending from Services

```csharp
public sealed class NotificationService(IHubContext<NotificationHub> hubContext) : INotificationService
{
    public async Task SendToUserAsync(string userId, NotificationDto notification)
    {
        await hubContext.Clients.Group($"user-{userId}")
            .SendAsync("ReceiveNotification", notification);
    }
}
```

---

## Middleware

```csharp
public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=()");

        if (context.Request.IsHttps)
        {
            context.Response.Headers.Append("Strict-Transport-Security",
                "max-age=31536000; includeSubDomains");
        }

        await next(context);
    }
}

// Registration
app.UseMiddleware<SecurityHeadersMiddleware>();
// Or extension method:
app.UseSecurityHeaders();
```

---

## Caching

### Redis Cache Service

```csharp
public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct = default);
    Task RemoveAsync(string key, CancellationToken ct = default);
}

public sealed class RedisCacheService(IConnectionMultiplexer redis, ILogger<RedisCacheService> logger)
    : ICacheService
{
    private readonly IDatabase _db = redis.GetDatabase();

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct)
    {
        try
        {
            RedisValue value = await _db.StringGetAsync(key);
            return value.IsNullOrEmpty ? default : JsonSerializer.Deserialize<T>(value!);
        }
        catch (RedisConnectionException ex)
        {
            logger.LogWarning(ex, "Redis unavailable, cache miss for {Key}", key);
            return default; // graceful degradation
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct)
    {
        try
        {
            string json = JsonSerializer.Serialize(value);
            await _db.StringSetAsync(key, json, ttl);
        }
        catch (RedisConnectionException ex)
        {
            logger.LogWarning(ex, "Redis unavailable, skipping cache set for {Key}", key);
        }
    }
}
```

### Output Caching

```csharp
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("Sports", builder => builder.Expire(TimeSpan.FromHours(24)));
    options.AddPolicy("Profiles", builder => builder.Expire(TimeSpan.FromMinutes(30)));
});

// Apply to endpoint
group.MapGet("/sports", GetSports).CacheOutput("Sports");
```

---

## Rate Limiting

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.PermitLimit = 10;
        limiter.Window = TimeSpan.FromMinutes(1);
    });

    options.AddFixedWindowLimiter("global", limiter =>
    {
        limiter.PermitLimit = 100;
        limiter.Window = TimeSpan.FromMinutes(1);
    });

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Apply to endpoint group
group.MapPost("/login", Login).RequireRateLimiting("auth");
```

---

## MassTransit (Message Bus)

```csharp
// Message
public sealed record MediaProcessingMessage(string MediaId, string UserId, string FilePath);

// Consumer (handler)
public sealed class MediaProcessingConsumer(
    IMediaService mediaService,
    ILogger<MediaProcessingConsumer> logger) : IConsumer<MediaProcessingMessage>
{
    public async Task Consume(ConsumeContext<MediaProcessingMessage> context)
    {
        MediaProcessingMessage msg = context.Message;
        logger.LogInformation("Processing media {MediaId}", msg.MediaId);
        await mediaService.ProcessAsync(msg.MediaId, msg.FilePath);
    }
}

// Registration
services.AddMassTransit(config =>
{
    config.AddConsumer<MediaProcessingConsumer>();
    config.AddConsumer<ContentModerationConsumer>();

    config.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host(rabbitMqSettings.Host, h =>
        {
            h.Username(rabbitMqSettings.Username);
            h.Password(rabbitMqSettings.Password);
        });
        cfg.ConfigureEndpoints(ctx);
    });
});

// Publishing
await publishEndpoint.Publish(new MediaProcessingMessage(mediaId, userId, filePath));
```

---

## Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "postgresql")
    .AddRedis(redisConnection, name: "redis")
    .AddCheck<Neo4jHealthCheck>("neo4j")
    .AddCheck<MinioHealthCheck>("minio");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse,
});
```

---

## Testing

### Unit Tests

```csharp
public sealed class PostServiceTests
{
    private readonly ActionBuddiesDbContext _context;
    private readonly IPostService _sut;
    private readonly ICacheService _cache = Substitute.For<ICacheService>();

    public PostServiceTests()
    {
        DbContextOptions<ActionBuddiesDbContext> options = new DbContextOptionsBuilder<ActionBuddiesDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ActionBuddiesDbContext(options);
        _sut = new PostService(_context, _cache, Substitute.For<ILogger<PostService>>());
    }

    [Fact]
    public async Task Should_CreatePost_When_ValidRequest()
    {
        // Arrange
        CreatePostRequest request = new() { Content = "Hello world", NetworkSlug = "skatebuddies" };

        // Act
        PostDto result = await _sut.CreateAsync(request, "user-123");

        // Assert
        result.Content.Should().Be("Hello world");
        result.AuthorId.Should().Be("user-123");
        (await _context.Posts.CountAsync()).Should().Be(1);
    }
}
```

### Integration Tests

```csharp
public sealed class AuthEndpointsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthEndpointsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Replace real DB with in-memory
                services.RemoveAll<DbContextOptions<ActionBuddiesDbContext>>();
                services.AddDbContext<ActionBuddiesDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task Should_Return401_When_InvalidCredentials()
    {
        HttpResponseMessage response = await _client.PostAsJsonAsync("/api/v1/auth/login",
            new { Email = "wrong@test.com", Password = "wrong" });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

---

## Docker

### Dockerfile (Multi-Stage)

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["src/MyApp.Api/MyApp.Api.csproj", "src/MyApp.Api/"]
RUN dotnet restore "src/MyApp.Api/MyApp.Api.csproj"
COPY . .
RUN dotnet publish "src/MyApp.Api/MyApp.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

### docker-compose.yml (Development)

```yaml
services:
  api:
    build: .
    ports: ["8080:8080"]
    depends_on: [postgres, redis, rabbitmq]
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: actionbuddies
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
  redis:
    image: redis:7-alpine
  rabbitmq:
    image: rabbitmq:3-management
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
  neo4j:
    image: neo4j:5
```

---

## Common Gotchas

1. **DbContext is scoped** -- Never inject `DbContext` into singleton services. Use `IDbContextFactory<T>` for parallel queries or background tasks.
2. **N+1 queries** -- Always use `.Include()` or `.Select()` projections. Never access navigation properties in loops without eager loading.
3. **SignalR query string token** -- WebSocket connections can't send headers. Use `?access_token=` in query string for SignalR auth (MS-documented pattern).
4. **`AsNoTracking()`** -- Always use for read-only queries. Tracked entities consume memory and slow down `SaveChanges()`.
5. **Async in SignalR** -- Hub methods must return `Task`. `async void` will crash the hub silently.
6. **MassTransit retry** -- Configure retry strategy. Without it, failed consumers lose messages permanently.
7. **appsettings.json secrets** -- Never commit real secrets. Use `appsettings.Development.json` (gitignored), environment variables, or User Secrets for dev.
8. **CORS + credentials** -- When using cookies with CORS, set `AllowCredentials()` and list specific origins (no wildcards allowed).
9. **EF migration conflicts** -- When multiple developers add migrations, snapshot conflicts arise. One developer removes their migration, applies the other, then re-creates.
10. **Output caching + auth** -- Output cache does NOT respect authorization by default. Authenticated endpoints must use `VaryByHeaderNames` or skip caching.

---

## Documentation References

| Resource | URL |
|----------|-----|
| ASP.NET Core Docs | https://learn.microsoft.com/en-us/aspnet/core/ |
| Minimal APIs | https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis |
| EF Core | https://learn.microsoft.com/en-us/ef/core/ |
| SignalR | https://learn.microsoft.com/en-us/aspnet/core/signalr/ |
| Identity | https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity |