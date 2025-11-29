using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Khunghinh.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountsController : ControllerBase
    {
        private readonly KhunghinhContext _db;
        private readonly IWebHostEnvironment _env;

        public AccountsController(KhunghinhContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // Lấy thông tin cơ bản của user hiện tại (email, tên hiển thị, avatar, tổng số khung)
        [HttpGet("me")]
        [Authorize]
        public IActionResult Me()
        {
            try
            {
                string? email =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized();

                var user = _db.NguoiDungs
                    .Where(u => u.Email == email)
                    .Select(u => new
                    {
                        u.Id,
                        u.Email,
                        u.TenHienThi,
                        avatar = u.AnhDaiDienUrl,
                        framesCount = _db.KhungHinhs.Count(k => k.ChuSoHuuId == u.Id)
                    })
                    .FirstOrDefault();

                if (user == null) return Unauthorized();

                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Accounts.Me] ERROR: {ex}");
                return StatusCode(500, "Lỗi server");
            }
        }

        // Cập nhật tên hiển thị
        [HttpPost("display-name")]
        [Authorize]
        public async Task<IActionResult> UpdateDisplayName([FromForm] string displayName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(displayName))
                    return BadRequest("Tên hiển thị không được để trống");

                if (displayName.Length > 100)
                    return BadRequest("Tên hiển thị không được vượt quá 100 ký tự");

                string? email =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == email);
                if (user == null) return Unauthorized();

                user.TenHienThi = displayName;
                await _db.SaveChangesAsync();

                return Ok(new { success = true, displayName = user.TenHienThi });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Accounts.UpdateDisplayName] ERROR: {ex}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // Thay đổi ảnh đại diện
        [HttpPost("avatar")]
        [Authorize]
        public async Task<IActionResult> UpdateAvatar([FromForm] IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("Chưa chọn file");

                // Cho phép png hoặc jpg/jpeg
                var allowedContentTypes = new[] { "image/png", "image/jpeg", "image/jpg" };
                if (!allowedContentTypes.Contains(file.ContentType) &&
                    !(file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase)
                      || file.FileName.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase)
                      || file.FileName.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase)))
                {
                    return BadRequest("Chỉ chấp nhận file PNG/JPG");
                }

                if (file.Length > 2 * 1024 * 1024)
                    return BadRequest("File không được vượt quá 2MB");

                string? email =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == email);
                if (user == null) return Unauthorized();

                var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var avatarsDir = Path.Combine(webRoot, "avatars");
                Directory.CreateDirectory(avatarsDir);

                var ext = Path.GetExtension(file.FileName);
                if (string.IsNullOrWhiteSpace(ext))
                    ext = file.ContentType == "image/png" ? ".png" : ".jpg";

                var fileName = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(avatarsDir, fileName);
                using (var stream = System.IO.File.Create(path))
                {
                    await file.CopyToAsync(stream);
                }

                // Xóa ảnh cũ nếu có và nằm trong thư mục wwwroot
                if (!string.IsNullOrWhiteSpace(user.AnhDaiDienUrl))
                {
                    try
                    {
                        var oldPath = user.AnhDaiDienUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                        var fullOld = Path.Combine(webRoot, oldPath);
                        if (System.IO.File.Exists(fullOld))
                            System.IO.File.Delete(fullOld);
                    }
                    catch (Exception ex)
                    {
                        // Không block thao tác chính nếu xóa file cũ thất bại
                        Console.WriteLine($"Failed to delete old avatar: {ex.Message}");
                    }
                }

                user.AnhDaiDienUrl = $"/avatars/{fileName}";
                await _db.SaveChangesAsync();

                return Ok(new { success = true, avatar = user.AnhDaiDienUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Accounts.UpdateAvatar] ERROR: {ex}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // Lấy số lượng khung hình của user đang đăng nhập
        [HttpGet("frames-count")]
        [Authorize]
        public IActionResult GetFramesCount()
        {
            try
            {
                string? email =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == email);
                if (user == null) return Unauthorized();

                var count = _db.KhungHinhs.Count(x => x.ChuSoHuuId == user.Id);
                return Ok(new { count });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Accounts.GetFramesCount] ERROR: {ex}");
                return StatusCode(500, "Lỗi server");
            }
        }
    }
}