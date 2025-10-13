using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ===== Config =====
var frontendOrigin = builder.Configuration["FrontendOrigin"] ?? "http://localhost:5173";
// Nếu API chạy ở subdomain (api.trendyframe.me), cấu hình domain cookie dùng chung gốc:
var cookieDomain = builder.Configuration["Cookie:Domain"]; // ví dụ ".trendyframe.me"

// (khuyến nghị) Đảm bảo webroot là "wwwroot"
builder.WebHost.UseWebRoot("wwwroot");

// ===== Database =====
builder.Services.AddDbContext<KhunghinhContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

// ===== CORS =====
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("spa", p => p
        .WithOrigins(frontendOrigin /* ví dụ https://trendyframe.me */,
                     "http://localhost:5173") // thêm local dev nếu cần
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

        // ✅ BẮT BUỘC khi FE và BE khác origin
        options.Cookie.SameSite = SameSiteMode.None;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

        // ✅ Nếu BE là api.trendyframe.me và FE là trendyframe.me → đặt domain cookie dùng chung
        if (!string.IsNullOrWhiteSpace(cookieDomain))
        {
            options.Cookie.Domain = cookieDomain; // ".trendyframe.me"
        }

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
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ===== Forwarded headers (Azure/App Service proxy) =====
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor
});

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

// ✅ PHỤC VỤ FILE TĨNH (bắt buộc khi bạn lưu ảnh vào wwwroot/frames)
app.UseStaticFiles();

app.UseHttpsRedirection();
app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== Root ping để test nhanh =====
app.MapGet("/", () => Results.Ok("Khunghinh API is running"));

app.Run();
