using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ===== Config =====
var frontendOrigin = (builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173").TrimEnd('/');

// ===== Database =====
builder.Services.AddDbContext<KhunghinhContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ===== CORS =====
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("spa", p => p
        .WithOrigins(frontendOrigin)       // ví dụ: https://trendyframe.me
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// ===== Controllers & Swagger =====
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    o.JsonSerializerOptions.WriteIndented = false;
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ===== Authentication (Cookie + Google) =====
builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        // Dùng __Host. để tăng bảo mật (chỉ over HTTPS, không set Domain)
        options.Cookie.Name = "__Host.kh_auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.None;             // SPA khác origin
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // bắt buộc HTTPS
        options.SlidingExpiration = true;

        // Trả mã 401/403 thay vì redirect (hợp với SPA)
        options.Events = new CookieAuthenticationEvents
        {
            OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; },
            OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; }
        };
    })
    .AddGoogle("Google", options =>
    {
        options.ClientId = builder.Configuration["Auth:Google:ClientId"]!;
        options.ClientSecret = builder.Configuration["Auth:Google:ClientSecret"]!;
        // Nếu dùng endpoint mặc định của Google handler:
        options.CallbackPath = "/signin-google"; // Google Console: https://<api-domain>/signin-google
        options.Scope.Add("profile");
        options.Scope.Add("email");
        options.ClaimActions.MapJsonKey("picture", "picture", "url");
        options.SaveTokens = true;

        // Nếu OAuth fail thì trả về JSON page đơn giản
        options.Events.OnRemoteFailure = ctx =>
        {
            ctx.Response.Redirect("/api/auth/failure");
            ctx.HandleResponse();
            return Task.CompletedTask;
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ===== Forwarded headers (Azure/App Service proxy) =====
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor
});

// ===== Auto-migrate EF (LOCAL & AZURE) =====
// Chạy ở cả Dev lẫn Prod để đảm bảo Azure tạo bảng khi khởi động
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<KhunghinhContext>();
    db.Database.Migrate();
    Console.WriteLine("✅ EF Migrate: done");
}
catch (Exception ex)
{
    Console.Error.WriteLine("❌ EF Migrate failed: " + ex);
    // Không throw để app vẫn chạy; đọc chi tiết trong Log Stream
}

// ===== Swagger/HSTS =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Thứ tự: CORS -> Auth -> Controllers
app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== Health check & ping =====
app.MapGet("/healthz", () => Results.Ok(new { ok = true, time = DateTimeOffset.UtcNow }));
app.MapGet("/", () => Results.Ok("Khunghinh API is running"));

app.Run();

// (Tuỳ dự án) Nếu còn dùng /weatherforecast thì giữ record dưới:
public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
