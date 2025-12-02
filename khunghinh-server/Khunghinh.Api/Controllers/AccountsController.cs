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

                // 1. Validate file size
                if (file.Length > 2 * 1024 * 1024)
                    return BadRequest("File không được vượt quá 2MB");

                // 2. Validate MIME type bằng magic bytes (an toàn hơn)
                var allowedExtensions = new[] { ".png", ".jpg", ".jpeg" };
                var ext = Path.GetExtension(file.FileName)?.ToLowerInvariant();
                if (string.IsNullOrEmpty(ext) || !allowedExtensions.Contains(ext))
                    return BadRequest("Chỉ chấp nhận file PNG/JPG");

                // 3. Kiểm tra magic bytes để chắc chắn là ảnh thật
                using (var stream = file.OpenReadStream())
                {
                    var header = new byte[8];
                    await stream.ReadAsync(header, 0, header.Length);

                    // PNG: 89 50 4E 47 0D 0A 1A 0A
                    // JPEG: FF D8 FF
                    bool isPng = header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
                    bool isJpeg = header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;

                    if (!isPng && !isJpeg)
                        return BadRequest("File không phải là ảnh hợp lệ");
                }

                string? email =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == email);
                if (user == null) return Unauthorized();

                var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var avatarsDir = Path.Combine(webRoot, "avatars");
                Directory.CreateDirectory(avatarsDir);

                // 4. Tạo tên file an toàn
                var safeFileName = $"{Guid.NewGuid()}{ext}";
                var path = Path.Combine(avatarsDir, safeFileName);

                using (var stream = System.IO.File.Create(path))
                {
                    await file.CopyToAsync(stream);
                }

                // 5. Xóa ảnh cũ an toàn (chống Path Traversal)
                if (!string.IsNullOrWhiteSpace(user.AnhDaiDienUrl))
                {
                    try
                    {
                        // Chỉ xóa nếu file nằm trong thư mục avatars
                        var oldFileName = Path.GetFileName(user.AnhDaiDienUrl);
                        if (!string.IsNullOrEmpty(oldFileName))
                        {
                            var fullOld = Path.Combine(avatarsDir, oldFileName);
                            // Đảm bảo file nằm trong avatarsDir (chống path traversal)
                            var canonicalPath = Path.GetFullPath(fullOld);
                            var canonicalDir = Path.GetFullPath(avatarsDir);

                            if (canonicalPath.StartsWith(canonicalDir) && System.IO.File.Exists(fullOld))
                                System.IO.File.Delete(fullOld);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Failed to delete old avatar: {ex.Message}");
                    }
                }

                user.AnhDaiDienUrl = $"/avatars/{safeFileName}";
                await _db.SaveChangesAsync();

                return Ok(new { success = true, avatar = user.AnhDaiDienUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Accounts.UpdateAvatar] ERROR: {ex}");
                return StatusCode(500, "Lỗi server");
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