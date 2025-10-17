using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Khunghinh.Api.Controllers
{
    // Controller dành riêng cho admin — yêu cầu user có claim Role = "admin"
    // Ghi chú: đảm bảo khi user đăng nhập bạn đã thêm ClaimTypes.Role vào cookie principal.
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly KhunghinhContext _db;
        private readonly IWebHostEnvironment _env;

        public AdminController(KhunghinhContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        // ===========================
        // Frames (Khung hình)
        // ===========================

        // GET /api/admin/frames?page=1&pageSize=20&status=dang_hoat_dong&search=text
        // Trả về danh sách có phân trang, filter theo trạng thái và tìm kiếm trên title/alias/owner
        [HttpGet("frames")]
        public async Task<IActionResult> GetFrames([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
            [FromQuery] string? status = null, [FromQuery] string? search = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);

            var q = _db.KhungHinhs.Include(x => x.ChuSoHuu).AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                q = q.Where(x => x.TrangThai == status);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(x =>
                    EF.Functions.Like(x.TieuDe, $"%{s}%") ||
                    EF.Functions.Like(x.Alias, $"%{s}%") ||
                    (x.ChuSoHuu != null && EF.Functions.Like(x.ChuSoHuu.TenHienThi, $"%{s}%"))
                );
            }

            var total = await q.CountAsync();
            var items = await q.OrderByDescending(x => x.NgayDang)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new
                {
                    x.Id,
                    x.TieuDe,
                    x.Alias,
                    x.TrangThai,
                    x.CheDoHienThi,
                    x.LuotXem,
                    x.LuotTai,
                    x.NgayDang,
                    x.NgayChinhSua,
                    urlXemTruoc = x.UrlXemTruoc,
                    owner = x.ChuSoHuu == null ? null : new
                    {
                        x.ChuSoHuu.Id,
                        name = x.ChuSoHuu.TenHienThi,
                        avatar = x.ChuSoHuu.AnhDaiDienUrl,
                        email = x.ChuSoHuu.Email
                    }
                }).AsNoTracking().ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // GET /api/admin/frames/{id}
        // Lấy chi tiết 1 khung hình
        [HttpGet("frames/{id:long}")]
        public async Task<IActionResult> GetFrame(long id)
        {
            var frame = await _db.KhungHinhs
                .Include(x => x.ChuSoHuu)
                .Include(x => x.KhungBienThes)
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.TieuDe,
                    x.Alias,
                    x.MoTa,
                    x.TrangThai,
                    x.CheDoHienThi,
                    x.LuotXem,
                    x.LuotTai,
                    x.NgayDang,
                    x.NgayChinhSua,
                    urlXemTruoc = x.UrlXemTruoc,
                    variants = x.KhungBienThes.Select(v => new { v.Id, v.TenBienThe, v.AnhPngUrl, v.TrangThai }),
                    owner = x.ChuSoHuu == null ? null : new
                    {
                        x.ChuSoHuu.Id,
                        name = x.ChuSoHuu.TenHienThi,
                        avatar = x.ChuSoHuu.AnhDaiDienUrl,
                        email = x.ChuSoHuu.Email
                    }
                }).AsNoTracking().FirstOrDefaultAsync();

            if (frame == null) return NotFound();
            return Ok(frame);
        }

        // POST /api/admin/frames/{id}/status
        // Body: { "status": "bi_khoa" }
        // Thay đổi trạng thái khung (ví dụ: bi_khoa, dang_hoat_dong, da_xoa)
        [HttpPost("frames/{id:long}/status")]
        public async Task<IActionResult> ChangeFrameStatus(long id, [FromBody] ChangeStatusDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest("status is required");

            var frame = await _db.KhungHinhs.FindAsync(id);
            if (frame == null) return NotFound();

            var before = new { frame.TrangThai };
            frame.TrangThai = dto.Status;
            frame.NgayChinhSua = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            // TODO: ghi audit log nếu cần
            return Ok(new { success = true, before, after = new { frame.TrangThai } });
        }

        // DELETE /api/admin/frames/{id}
        // Xóa vĩnh viễn (hoặc bạn có thể soft-delete bằng cách set TrangThai)
        [HttpDelete("frames/{id:long}")]
        public async Task<IActionResult> DeleteFrame(long id)
        {
            var frame = await _db.KhungHinhs.FindAsync(id);
            if (frame == null) return NotFound();

            // xóa file vật lý nếu có
            if (!string.IsNullOrWhiteSpace(frame.UrlXemTruoc))
            {
                try
                {
                    var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var filePath = Path.Combine(webRoot, frame.UrlXemTruoc.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Admin DeleteFrame] unable to delete file: {ex}");
                }
            }

            _db.KhungHinhs.Remove(frame);
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // POST /api/admin/frames/{id}/replace-image  (multipart/form-data)
        // Thay ảnh khung của 1 frame (upload file PNG)
        [HttpPost("frames/{id:long}/replace-image")]
        public async Task<IActionResult> ReplaceFrameImage(long id, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("File required");
            if (file.ContentType != "image/png" && !file.FileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Only PNG allowed");
            if (file.Length > 5 * 1024 * 1024) return BadRequest("File too large");

            var frame = await _db.KhungHinhs.FindAsync(id);
            if (frame == null) return NotFound();

            // xóa file cũ
            if (!string.IsNullOrWhiteSpace(frame.UrlXemTruoc))
            {
                try
                {
                    var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var oldPath = Path.Combine(webRoot, frame.UrlXemTruoc.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                    if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Admin ReplaceImage] delete old file failed: {ex}");
                }
            }

            // lưu file mới
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
            frame.NgayChinhSua = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { success = true, urlXemTruoc = frame.UrlXemTruoc });
        }

        // ===========================
        // Users (Người dùng)
        // ===========================

        // GET /api/admin/users?page=1&pageSize=20&search=
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);

            var q = _db.NguoiDungs.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(u => EF.Functions.Like(u.Email, $"%{s}%") || EF.Functions.Like(u.TenHienThi, $"%{s}%"));
            }

            var total = await q.CountAsync();
            var items = await q.OrderByDescending(u => u.NgayTao)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    name = u.TenHienThi,
                    avatar = u.AnhDaiDienUrl,
                    role = u.VaiTro,
                    status = u.TrangThai,
                    u.NgayTao,
                    u.NgayCapNhat
                }).AsNoTracking().ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // POST /api/admin/users/{id}/role  body: { "role": "admin" }
        [HttpPost("users/{id:long}/role")]
        public async Task<IActionResult> ChangeUserRole(long id, [FromBody] ChangeRoleDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Role)) return BadRequest("role is required");

            var user = await _db.NguoiDungs.FindAsync(id);
            if (user == null) return NotFound();

            var before = user.VaiTro;
            user.VaiTro = dto.Role;
            user.NgayCapNhat = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            // NOTE: if your app relies on cookie claims, user should re-login to get new role claims,
            // or you implement IClaimsTransformation to refresh claims on each request.

            return Ok(new { success = true, before, after = user.VaiTro });
        }

        // POST /api/admin/users/{id}/ban  body: { "reason": "..." }
        [HttpPost("users/{id:long}/ban")]
        public async Task<IActionResult> BanUser(long id, [FromBody] BanUserDto dto)
        {
            var user = await _db.NguoiDungs.FindAsync(id);
            if (user == null) return NotFound();

            var before = user.TrangThai;
            user.TrangThai = "bi_khoa";
            user.NgayCapNhat = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            // Optionally save a record/reason in a separate table (not implemented here)
            return Ok(new { success = true, before, after = user.TrangThai });
        }

        // ===========================
        // Reports (Báo cáo vi phạm)
        // ===========================

        // GET /api/admin/reports?page=1&pageSize=20&status=
        [HttpGet("reports")]
        public async Task<IActionResult> GetReports([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? status = null)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 200);

            var q = _db.BaoCaoViPhams.Include(r => r.NguoiBaoCao).Include(r => r.KhungHinh).AsQueryable();
            if (!string.IsNullOrWhiteSpace(status)) q = q.Where(r => r.TrangThaiXuLy == status);

            var total = await q.CountAsync();
            var items = await q.OrderByDescending(r => r.NgayTao)
                .Skip((page - 1) * pageSize).Take(pageSize)
                .Select(r => new
                {
                    r.Id,
                    r.KhungHinhId,
                    frameTitle = r.KhungHinh.TieuDe,
                    r.NguoiBaoCaoId,
                    reporter = r.NguoiBaoCao == null ? null : new { r.NguoiBaoCao.Id, name = r.NguoiBaoCao.TenHienThi, email = r.NguoiBaoCao.Email },
                    r.LyDo,
                    r.MoTaThem,
                    r.TrangThaiXuLy,
                    r.NgayTao,
                    r.NgayCapNhat
                }).AsNoTracking().ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // POST /api/admin/reports/{id}/resolve  body: { "action": "dismiss"|"remove"|"warn", "note": "..." }
        [HttpPost("reports/{id:long}/resolve")]
        public async Task<IActionResult> ResolveReport(long id, [FromBody] ResolveReportDto dto)
        {
            var report = await _db.BaoCaoViPhams.Include(r => r.KhungHinh).FirstOrDefaultAsync(r => r.Id == id);
            if (report == null) return NotFound();

            // Ví dụ xử lý cơ bản: nếu action == remove -> set frame.TrangThai = "bi_khoa"
            if (dto.Action == "remove")
            {
                if (report.KhungHinh != null)
                {
                    report.KhungHinh.TrangThai = "bi_khoa";
                    report.KhungHinh.NgayChinhSua = DateTime.UtcNow;
                }
                report.TrangThaiXuLy = "da_xu_ly";
            }
            else if (dto.Action == "dismiss")
            {
                report.TrangThaiXuLy = "da_xu_ly";
            }
            else if (dto.Action == "warn")
            {
                report.TrangThaiXuLy = "da_xu_ly";
                // TODO: implement warning mechanism
            }
            report.NgayCapNhat = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new { success = true, action = dto.Action });
        }

        // ===========================
        // Statistics / Dashboard
        // ===========================

        // GET /api/admin/stats
        // Trả về số lượng tóm tắt để hiển thị ở dashboard
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalFrames = await _db.KhungHinhs.CountAsync();
            var publicFrames = await _db.KhungHinhs.CountAsync(x => x.CheDoHienThi == "cong_khai" && x.TrangThai == "dang_hoat_dong");
            var totalUsers = await _db.NguoiDungs.CountAsync();
            var reportsOpen = await _db.BaoCaoViPhams.CountAsync(r => r.TrangThaiXuLy != "da_xu_ly");

            // simple recent activity: last 5 frames
            var recentFrames = await _db.KhungHinhs.OrderByDescending(x => x.NgayDang).Take(5)
                .Select(x => new { x.Id, x.TieuDe, x.Alias, x.NgayDang }).AsNoTracking().ToListAsync();

            return Ok(new
            {
                totalFrames,
                publicFrames,
                totalUsers,
                reportsOpen,
                recentFrames
            });
        }

        // ===========================
        // DTOs (internal to this controller)
        // ===========================
        public record ChangeStatusDto(string Status);
        public record ChangeRoleDto(string Role);
        public record BanUserDto(string? Reason);
        public record ResolveReportDto(string Action, string? Note);
    }
}