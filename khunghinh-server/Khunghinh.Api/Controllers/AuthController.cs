using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Khunghinh.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : Controller
    {
        private readonly string _spaOrigin;

        public AuthController(IConfiguration cfg)
        {
            // Ví dụ: dev = http://localhost:5173, prod = https://trendyframe.me
            _spaOrigin = cfg["FrontendOrigin"] ?? "http://localhost:5173";
        }

        // B1: mở Google OAuth (popup gọi endpoint này)
        [HttpGet("google")]
        public IActionResult Google()
        {
            var props = new AuthenticationProperties
            {
                RedirectUri = Url.Content("~/api/auth/callback")
            };
            return Challenge(props, "Google");
        }

        // B2: Google redirect về đây -> đóng popup & báo cho SPA
        [Authorize] // giữ Authorize để đảm bảo đã sign-in
        [HttpGet("callback")]
        public ContentResult Callback()
        {
            // Dùng _spaOrigin từ cấu hình, không hardcode
            return Content($@"<!doctype html><script>
try {{
  if (window.opener) {{
    window.opener.postMessage('auth:success','{_spaOrigin}');
  }}
}} catch(e) {{}}
window.close();
</script>", "text/html");
        }

        // B3: SPA gọi để lấy thông tin user
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            string? picture =
                User.Claims.FirstOrDefault(c => c.Type == "picture")?.Value
                ?? User.Claims.FirstOrDefault(c => c.Type == "urn:google:picture")?.Value
                ?? User.Claims.FirstOrDefault(c => c.Type.Contains("picture"))?.Value;

            return Ok(new
            {
                name = User.Identity?.Name,
                email = User.Claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value,
                picture
            });
        }

        // B4: Đăng xuất
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(); // mặc định cookie scheme
            return Ok();
        }
    }
}
