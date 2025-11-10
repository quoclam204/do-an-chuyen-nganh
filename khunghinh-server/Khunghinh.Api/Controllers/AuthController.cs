using Khunghinh.Api.Data.Entities;
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

        private readonly KhunghinhContext _db;

        public AuthController(KhunghinhContext db, IConfiguration cfg)
        {
            _db = db;
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
        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            var email = User.Claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value;
            var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == email);

            // ✅ Thêm kiểm tra trạng thái
            if (user?.TrangThai == "bi_khoa")
            {
                HttpContext.SignOutAsync();
                return Unauthorized(new
                {
                    error = "Tài khoản đã bị khóa",
                    reason = "Liên hệ admin để biết thêm chi tiết"
                });
            }

            if (user == null)
            {
                user = new NguoiDung
                {
                    Email = email,
                    TenHienThi = User.Identity?.Name ?? "User",
                    VaiTro = "user",
                    TrangThai = "hoat_dong",
                    NgayTao = DateTime.UtcNow
                };
                _db.NguoiDungs.Add(user);
                _db.SaveChanges();
            }

            // cập nhật ảnh đại diện của người dùng trong database mỗi khi họ đăng nhập bằng Google,
            // đảm bảo avatar luôn mới nhất từ Google.
            var avatar = User.FindFirst("picture")?.Value;
            if (user != null && !string.IsNullOrEmpty(avatar))
            {
                user.AnhDaiDienUrl = avatar;
                _db.SaveChanges();
            }

            string? picture = User.Claims.FirstOrDefault(c => c.Type.Contains("picture"))?.Value;

            return Ok(new
            {
                id = user.Id,
                name = user.TenHienThi,
                email = user.Email,
                picture = picture,
                vaiTro = user.VaiTro // ✅ Trả về vai trò
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
