using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

                var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.UtcNow, 
                    TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
                );

                var khung = new KhungHinh
                {
                    ChuSoHuuId = user.Id,
                    TieuDe = title,
                    Alias = alias,
                    Loai = "khac",
                    CheDoHienThi = "cong_khai",
                    TrangThai = "dang_hoat_dong",
                    UrlXemTruoc = $"/frames/{fileName}",
                    NgayDang = vietnamTime
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

        [HttpDelete("{id:long}")]
        [Authorize]
        public async Task<IActionResult> Delete(long id)
        {
            try
            {
                // Lấy email user từ claims
                string? userEmail =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == userEmail);
                if (user == null) return Unauthorized();

                // Tìm khung hình thuộc về user
                var frame = _db.KhungHinhs.FirstOrDefault(x => x.Id == id && x.ChuSoHuuId == user.Id);
                if (frame == null) return NotFound("Không tìm thấy khung hình hoặc bạn không có quyền xóa.");

                // Xóa file vật lý nếu có
                if (!string.IsNullOrWhiteSpace(frame.UrlXemTruoc))
                {
                    var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var filePath = Path.Combine(webRoot, frame.UrlXemTruoc.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(filePath))
                        System.IO.File.Delete(filePath);
                }

                _db.KhungHinhs.Remove(frame);
                await _db.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DeleteFrame] ERROR: {ex}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }

        // Khung hình theo alias 
        [HttpGet("alias/{alias}")]
        [AllowAnonymous]
        public IActionResult GetByAlias(string alias)
        {
            var frame = _db.KhungHinhs
                .Where(x => x.Alias == alias && x.TrangThai == "dang_hoat_dong")
                .Select(x => new {
                    x.Id,
                    x.TieuDe,
                    x.Alias,
                    x.UrlXemTruoc,
                    x.NgayDang,
                    x.LuotXem,  // ✅ Thêm
                    x.LuotTai,  // ✅ Thêm
                    owner = x.ChuSoHuu == null ? null : new
                    {
                        id = x.ChuSoHuu.Id,
                        name = x.ChuSoHuu.TenHienThi,
                        avatar = x.ChuSoHuu.AnhDaiDienUrl
                    }
                })
                .FirstOrDefault();

            if (frame == null)
                return NotFound();

            return Ok(frame);
        }

        // Lấy 10 khung công khai mới nhất và hiển thị trên web
        [HttpGet("public")]
        [AllowAnonymous]
        public IActionResult GetPublicFrames()
        {
            try
            {
                var nowUtc = DateTime.UtcNow;
                var frames = _db.KhungHinhs
                    .Where(x => x.TrangThai == "dang_hoat_dong" && x.CheDoHienThi == "cong_khai")
                    .OrderByDescending(x => x.NgayDang)
                    .Take(10)
                    .Select(x => new {
                        x.Id,
                        x.TieuDe,
                        x.Alias,
                        x.UrlXemTruoc,
                        NgayDang = x.NgayDang, // để serializer xuất ISO-8601
                        isNew = (nowUtc - x.NgayDang).TotalHours <= 24, // ⭐ cờ NEW
                        owner = x.ChuSoHuu == null ? null : new
                        {
                            id = x.ChuSoHuu.Id,
                            name = x.ChuSoHuu.TenHienThi,
                            avatar = x.ChuSoHuu.AnhDaiDienUrl
                        }
                    })
                    .AsNoTracking()
                    .ToList();

                return Ok(frames);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting public frames: {ex.Message}");
                return StatusCode(500, "Lỗi server");
            }
        }

        // Tăng lượt tải và trả về thông tin khung hình
        [HttpPost("view/{id:long}")]
        [AllowAnonymous]
        public async Task<IActionResult> ViewFrame(long id)
        {
            var frame = await _db.KhungHinhs.FirstOrDefaultAsync(x => x.Id == id && x.TrangThai == "dang_hoat_dong");
            if (frame == null) return NotFound();

            frame.LuotXem += 1;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                frame.Id,
                frame.TieuDe,
                frame.Alias,
                frame.UrlXemTruoc,
                frame.LuotXem,
                frame.LuotTai
            });
        }

        // Tăng lượt tải
        [HttpPost("download/{id:long}")]
        [AllowAnonymous]
        public async Task<IActionResult> DownloadFrame(long id)
        {
            var frame = await _db.KhungHinhs.FirstOrDefaultAsync(x => x.Id == id && x.TrangThai == "dang_hoat_dong");
            if (frame == null) return NotFound();

            frame.LuotTai += 1;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                frame.Id,
                frame.TieuDe,
                frame.Alias,
                frame.UrlXemTruoc,
                frame.LuotXem,
                frame.LuotTai
            });
        }

        // Xem Chi tiết khung hình theo ID
        [HttpGet("{id:long}")]
        [AllowAnonymous]
        public IActionResult GetFrameDetail(long id)
        {
            var frame = _db.KhungHinhs
                .Include(x => x.ChuSoHuu)
                .Where(x => x.Id == id && x.TrangThai == "dang_hoat_dong")
                .Select(x => new {
                    x.Id,
                    x.TieuDe,
                    x.Alias,
                    x.UrlXemTruoc,
                    x.LuotXem,
                    x.LuotTai,
                    x.NgayDang,
                    owner = x.ChuSoHuu == null ? null : new {
                        id = x.ChuSoHuu.Id,
                        name = x.ChuSoHuu.TenHienThi,
                        avatar = x.ChuSoHuu.AnhDaiDienUrl
                    }
                })
                .FirstOrDefault();

            if (frame == null)
                return NotFound();

            return Ok(frame);
        }


        // Sửa khung hình
        [HttpPost("update/{id:long}")]
        [Authorize]
        public async Task<IActionResult> Update(long id, [FromForm] string? title, [FromForm] string? alias, [FromForm] IFormFile? file)
        {
            try
            {
                // Lấy email user từ claims
                string? userEmail =
                    User.FindFirst(ClaimTypes.Email)?.Value ??
                    User.FindFirst("email")?.Value ??
                    User.FindFirst("preferred_username")?.Value;

                var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == userEmail);
                if (user == null) return Unauthorized();

                // Tìm khung hình thuộc về user
                var frame = _db.KhungHinhs.FirstOrDefault(x => x.Id == id && x.ChuSoHuuId == user.Id);
                if (frame == null) return NotFound("Không tìm thấy khung hình hoặc bạn không có quyền sửa.");

                // Sửa tiêu đề
                if (!string.IsNullOrWhiteSpace(title))
                    frame.TieuDe = title;

                // Sửa alias (nếu khác và không trùng)
                if (!string.IsNullOrWhiteSpace(alias) && alias != frame.Alias)
                {
                    var exists = _db.KhungHinhs.Any(x => x.Alias == alias && x.Id != id);
                    if (exists) return Conflict("Alias đã tồn tại");
                    frame.Alias = alias;
                }

                // Sửa ảnh (nếu có file mới)
                if (file != null && file.Length > 0)
                {
                    if (file.ContentType != "image/png" && !file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                        return BadRequest("Chỉ chấp nhận file PNG với nền trong suốt");
                    if (file.Length > 2 * 1024 * 1024)
                        return BadRequest("File không được vượt quá 2MB");

                    // Xóa file cũ
                    if (!string.IsNullOrWhiteSpace(frame.UrlXemTruoc))
                    {
                        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                        var filePath = Path.Combine(webRoot, frame.UrlXemTruoc.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                        if (System.IO.File.Exists(filePath))
                            System.IO.File.Delete(filePath);
                    }

                    // Lưu file mới
                    var webRootNew = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var framesDir = Path.Combine(webRootNew, "frames");
                    Directory.CreateDirectory(framesDir);
                    var fileName = $"{Guid.NewGuid()}.png";
                    var path = Path.Combine(framesDir, fileName);
                    using (var stream = System.IO.File.Create(path))
                    {
                        await file.CopyToAsync(stream);
                    }
                    frame.UrlXemTruoc = $"/frames/{fileName}";
                }

                var vietnamTime = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.UtcNow, 
                    TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time")
                );
                frame.NgayChinhSua = vietnamTime;
                await _db.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UpdateFrame] ERROR: {ex}");
                return StatusCode(500, $"Lỗi server: {ex.Message}");
            }
        }
    }
}