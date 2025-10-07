using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ===== Config =====
var frontendOrigin = builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173";

// ===== Database =====
builder.Services.AddDbContext<KhunghinhContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ===== CORS =====
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("spa", p => p
        .WithOrigins(frontendOrigin) // phải là https://trendyframe.me
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
        options.Cookie.Name = "kh_auth";
        options.Cookie.HttpOnly = true;
        options.SlidingExpiration = true;
        options.Cookie.SameSite = SameSiteMode.None;             // SPA khác origin
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always; // cần HTTPS
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
        options.CallbackPath = "/signin-google";   // Google Console: https://<api-domain>/signin-google
        options.Scope.Add("profile");
        options.Scope.Add("email");
        options.ClaimActions.MapJsonKey("picture", "picture", "url");

        // ⚠️ Thêm đoạn này
        options.Events = new OAuthEvents
        {
            OnTicketReceived = ctx =>
            {
                // Sau khi xác thực Google xong, chuyển hướng về /api/auth/callback
                ctx.Response.Redirect("/api/auth/callback");
                ctx.HandleResponse(); // Ngăn middleware xử lý thêm
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ===== Forwarded headers (Azure/App Service proxy) =====
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor
});

// ===== Auto-migrate EF (tuỳ bạn dùng hay không) =====
// using (var scope = app.Services.CreateScope())
// {
//     var db = scope.ServiceProvider.GetRequiredService<KhunghinhContext>();
//     db.Database.Migrate();
// }

// ===== Swagger/HSTS =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
    // Nếu muốn bật Swagger ở prod luôn, mở hai dòng dưới:
    //  app.UseSwagger();
    //  app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== Root ping để test nhanh =====
app.MapGet("/", () => Results.Ok("Khunghinh API is running"));

app.Run();

// ===== record demo (nếu còn dùng /weatherforecast) =====
public record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
