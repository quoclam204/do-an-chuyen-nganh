using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Khunghinh.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FramesController : ControllerBase
    {
        private readonly KhunghinhContext _db;
        private readonly IWebHostEnvironment _env;

        public FramesController(KhunghinhContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] IFormFile file, [FromForm] string title, [FromForm] string alias)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest("Chưa chọn file");

                if (file.ContentType != "image/png" && !file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                    return BadRequest("Chỉ chấp nhận file PNG với nền trong suốt");

                if (file.Length > 2 * 1024 * 1024)
                    return BadRequest("File không được vượt quá 2MB");

                // ✅ LUÔN có webroot + frames dir
                var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                var framesDir = Path.Combine(webRoot, "frames");
                Directory.CreateDirectory(framesDir);

                var fileName = $"{Guid.NewGuid()}.png";
                var path = Path.Combine(framesDir, fileName);
                using (var stream = System.IO.File.Create(path))
                {
                    await file.CopyToAsync(stream);
                }

                // ✅ Lấy email claim robust
                string? userEmail =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                Console.WriteLine($"User email from claims: {userEmail}");
                if (string.IsNullOrWhiteSpace(userEmail))
                    return Unauthorized("Không tìm thấy thông tin email trong phiên đăng nhập");

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == userEmail);
                if (user == null)
                    return Unauthorized("Người dùng không tồn tại");

                // ✅ Kiểm tra alias trùng lặp (trả 409 cho rõ nghĩa)
                if (!string.IsNullOrWhiteSpace(alias))
                {
                    var exists = _db.KhungHinhs.Any(x => x.Alias == alias);
                    if (exists) return Conflict("Alias đã tồn tại");
                }

                var khung = new KhungHinh
                {
                    ChuSoHuuId = user.Id,
                    TieuDe = title,
                    Alias = alias,
                    Loai = "khac",
                    CheDoHienThi = "cong_khai",
                    TrangThai = "dang_hoat_dong",
                    UrlXemTruoc = $"/frames/{fileName}",
                    NgayDang = DateTime.UtcNow
                };

                _db.KhungHinhs.Add(khung);
                await _db.SaveChangesAsync();

                return Ok(new { id = khung.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CreateFrame] ERROR: {ex}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // ✅ Check alias: nên cho ẩn danh (đỡ bị 401 khi FE chưa login)
        [HttpGet("check-alias/{alias}")]
        [AllowAnonymous] // <-- đổi từ [Authorize] nếu bạn muốn cho ai cũng check
        public IActionResult CheckAlias(string alias)
        {
            try
            {
                var exists = _db.KhungHinhs.Any(x => x.Alias == alias);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking alias: {ex.Message}");
                // thận trọng: coi như tồn tại để tránh sinh trùng khi có sự cố DB
                return Ok(new { exists = true });
            }
        }

        [HttpGet("my")]
        [Authorize]
        public IActionResult MyFrames()
        {
            try
            {
                string? email =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == email);
                if (user == null) return Unauthorized();

                var frames = _db.KhungHinhs
                    .Where(x => x.ChuSoHuuId == user.Id)
                    .OrderByDescending(x => x.NgayChinhSua ?? x.NgayDang)
                    .Select(x => new {
                        x.Id,
                        x.TieuDe,
                        x.TrangThai,
                        x.LuotXem,
                        x.LuotTai,
                        x.NgayDang,
                        x.NgayChinhSua,
                        x.UrlXemTruoc
                    }).ToList();

                return Ok(frames);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting user frames: {ex.Message}");
                return StatusCode(500, "Lỗi server");
            }
        }
    }
}
