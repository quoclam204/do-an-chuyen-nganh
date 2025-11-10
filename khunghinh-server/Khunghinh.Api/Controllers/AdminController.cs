using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
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
                    isSuper = u.IsSuperAdmin, // ✅ Truy cập trực tiếp property
                    status = u.TrangThai,
                    u.NgayTao,
                    u.NgayCapNhat
                }).AsNoTracking().ToListAsync();

            return Ok(new { total, page, pageSize, items });
        }

        // POST /api/admin/users/{id}/role
        // Body: { "role": "user" | "admin" | "superadmin" }
        [HttpPost("users/{id:long}/role")]
        public async Task<IActionResult> ChangeUserRole(long id, [FromBody] ChangeRoleDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Role)) 
                return BadRequest("role is required");

            var targetUser = await _db.NguoiDungs.FindAsync(id);
            if (targetUser == null) return NotFound();

            // Lấy thông tin caller
            var caller = await GetCallerAsync();
            if (caller == null) return Forbid("Caller information not found.");

            // Chuẩn hóa
            string Norm(string? r) => (r ?? "user").Trim().ToLowerInvariant();
            var callerRole = Norm(caller.VaiTro);
            var targetRole = Norm(targetUser.VaiTro);
            var newRole = Norm(dto.Role.Trim());

            bool callerIsSuper = caller.IsSuperAdmin;
            bool targetIsSuper = targetUser.IsSuperAdmin;

            // ===========================
            // RÀNG BUỘC BẢO MẬT
            // ===========================

            // 1. Không tự thay đổi quyền
            if (caller.Id == targetUser.Id)
                return BadRequest("Không được tự thay đổi quyền của chính bạn qua API.");

            // 2. Chỉ SuperAdmin động SuperAdmin
            if (targetIsSuper && !callerIsSuper)
                return Forbid("Chỉ Super Admin mới có quyền thay đổi Super Admin.");

            // 3. Admin thường chỉ động user
            if (callerRole == "admin" && !callerIsSuper && targetRole != "user")
                return Forbid("Admin chỉ có thể thao tác trên người dùng bình thường.");

            try
            {
                // ===========================
                // XỬ LÝ THAY ĐỔI QUYỀN
                // ===========================

                // CASE 1: Thăng user → admin
                if (newRole == "admin" && targetRole == "user")
                {
                    if (!callerIsSuper) 
                        return Forbid("Chỉ Super Admin mới có quyền thăng admin.");
                    
                    await _db.Database.ExecuteSqlRawAsync(
                        "EXEC dbo.sp_PromoteToAdmin @ActorId = {0}, @TargetId = {1}", 
                        caller.Id, targetUser.Id);
                }
                // CASE 2: Hạ admin → user
                else if (newRole == "user" && targetRole == "admin")
                {
                    if (!callerIsSuper) 
                        return Forbid("Chỉ Super Admin mới có quyền hạ admin.");
                    
                    await _db.Database.ExecuteSqlRawAsync(
                        "EXEC dbo.sp_DemoteToUser @ActorId = {0}, @TargetId = {1}", 
                        caller.Id, targetUser.Id);
                }
                // CASE 3: Đặt SuperAdmin (✅ Cho phép nhiều)
                else if (newRole == "superadmin" && !targetIsSuper)
                {
                    if (!callerIsSuper) 
                        return Forbid("Chỉ Super Admin mới có quyền thăng Super Admin.");
                    
                    await _db.Database.ExecuteSqlRawAsync(
                        "EXEC dbo.sp_SetSuperAdmin @ActorId = {0}, @TargetId = {1}, @IsSuperAdmin = {2}", 
                        caller.Id, targetUser.Id, 1);
                }
                // CASE 4: Gỡ SuperAdmin
                else if (targetIsSuper && newRole != "superadmin")
                {
                    if (!callerIsSuper) 
                        return Forbid("Chỉ Super Admin mới có quyền hạ Super Admin.");
                    
                    await _db.Database.ExecuteSqlRawAsync(
                        "EXEC dbo.sp_SetSuperAdmin @ActorId = {0}, @TargetId = {1}, @IsSuperAdmin = {2}", 
                        caller.Id, targetUser.Id, 0);

                    if (newRole == "user")
                    {
                        await _db.Database.ExecuteSqlRawAsync(
                            "EXEC dbo.sp_DemoteToUser @ActorId = {0}, @TargetId = {1}", 
                            caller.Id, targetUser.Id);
                    }
                }
                // CASE 5: Thay đổi thông thường
                else
                {
                    if (newRole != "user" && newRole != "admin")
                        return BadRequest("role must be 'user', 'admin' or 'superadmin'.");

                    targetUser.VaiTro = newRole;
                    targetUser.NgayCapNhat = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                }

                // Reload
                var updated = await _db.NguoiDungs
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == targetUser.Id);

                return Ok(new
                {
                    success = true,
                    before = new { role = targetRole, isSuper = targetIsSuper },
                    after = new { role = updated?.VaiTro, isSuper = updated?.IsSuperAdmin ?? false }
                });
            }
            catch (DbUpdateException dbex)
            {
                var msg = dbex.InnerException?.Message ?? dbex.Message;
                Console.WriteLine($"[ChangeUserRole] DB error: {msg}");
                return Problem(detail: msg, statusCode: 500);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ChangeUserRole] Exception: {ex}");
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // POST /api/admin/users/{id}/ban
        [HttpPost("users/{id:long}/ban")]
        public async Task<IActionResult> BanUser(long id, [FromBody] BanUserDto dto)
        {
            // 1️⃣ Lấy thông tin target user
            var targetUser = await _db.NguoiDungs.FindAsync(id);
            if (targetUser == null) return NotFound();

            // 2️⃣ Lấy thông tin admin đang thực hiện (caller)
            var caller = await GetCallerAsync();
            if (caller == null) return Forbid("Caller information not found.");

            bool callerIsSuper = caller.IsSuperAdmin;
            bool targetIsSuper = targetUser.IsSuperAdmin;
            string targetRole = (targetUser.VaiTro ?? "user").Trim().ToLowerInvariant();

            // ===========================
            // 3️⃣ KIỂM TRA QUYỀN HẠN
            // ===========================

            // ❌ Không tự khóa bản thân
            if (caller.Id == targetUser.Id)
                return BadRequest("Không thể tự khóa tài khoản của chính bạn qua API.");
            if (callerIsSuper)
            // ❌ SuperAdmin chỉ bị SuperAdmin khác khóa
            if (targetIsSuper && !callerIsSuper)
                return Forbid("Chỉ Super Admin mới có quyền khóa Super Admin khác.");

            // ❌ Admin thường không khóa được admin
            if (targetRole == "admin" && !callerIsSuper)
                return Forbid("Chỉ Super Admin mới có quyền khóa admin.");

            // ===========================
            // 4️⃣ THỰC HIỆN KHÓA
            // ===========================
            try
            {
                // Gọi stored procedure
                await _db.Database.ExecuteSqlRawAsync(
                    "EXEC dbo.sp_LockUser @ActorId = {0}, @TargetId = {1}, @Reason = {2}", 
                    caller.Id, targetUser.Id, dto?.Reason ?? "");

                // Reload để lấy trạng thái mới
                var updated = await _db.NguoiDungs.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
                
                // Ghi log
                Console.WriteLine($"[Admin] {caller.Email} khóa user {targetUser.Email} - Lý do: {dto?.Reason}");
                
                return Ok(new { success = true, status = updated?.TrangThai });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BanUser] Error: {ex}");
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // POST /api/admin/users/{id}/unlock
        [HttpPost("users/{id:long}/unlock")]
        public async Task<IActionResult> UnlockUser(long id)
        {
            // 1️⃣ Lấy thông tin admin đang thực hiện
            var caller = await GetCallerAsync();
            if (caller == null) return Forbid("Caller information not found.");

            // 2️⃣ Thực hiện mở khóa
            try
            {
                // Gọi stored procedure
                await _db.Database.ExecuteSqlRawAsync(
                    "EXEC dbo.sp_UnlockUser @ActorId = {0}, @TargetId = {1}", 
                    caller.Id, id);

                // Reload để lấy trạng thái mới
                var updated = await _db.NguoiDungs.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
                
                return Ok(new { success = true, status = updated?.TrangThai });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UnlockUser] Error: {ex}");
                return Problem(detail: ex.Message, statusCode: 500);
            }
        }

        // ===========================
        // Statistics / Dashboard
        // ===========================

        // GET /api/admin/stats?days=7
        // Trả về số lượng tóm tắt để hiển thị ở dashboard
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] int days = 7)
        {
            days = Math.Clamp(days, 1, 90); // giới hạn 1-90 ngày

            // ===========================
            // 👥 NGƯỜI DÙNG
            // ===========================
            var totalUsers = await _db.NguoiDungs.CountAsync();
            var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var newUsersLast7Days = await _db.NguoiDungs
                .CountAsync(u => u.NgayTao >= sevenDaysAgo);

            var activeUsersLast30Days = await _db.NguoiDungs
                .CountAsync(u => (u.NgayCapNhat != null && u.NgayCapNhat >= thirtyDaysAgo) ||
                                 u.NgayTao >= thirtyDaysAgo);

            // ===========================
            // 🖼️ KHUNG HÌNH
            // ===========================
            var totalFrames = await _db.KhungHinhs.CountAsync();
            var publicFrames = await _db.KhungHinhs
                .CountAsync(x => x.CheDoHienThi == "cong_khai" && x.TrangThai == "dang_hoat_dong");
            var pausedFrames = await _db.KhungHinhs
                .CountAsync(x => x.TrangThai != "dang_hoat_dong");

            // ===========================
            // 📈 BIỂU ĐỒ LƯỢT XEM/TẢI (ThongKeNgay)
            // ===========================
            var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days));
            var endDate = DateOnly.FromDateTime(DateTime.UtcNow);

            var dailyStats = await _db.ThongKeNgays
                .Where(x => x.Ngay >= startDate && x.Ngay <= endDate)
                .GroupBy(x => x.Ngay)
                .Select(g => new
                {
                    date = g.Key,
                    views = g.Sum(x => x.Xem),
                    downloads = g.Sum(x => x.Tai),
                    swaps = g.Sum(x => x.DoiKhung),
                    qrScans = g.Sum(x => x.QuetQr)
                })
                .OrderBy(x => x.date)
                .ToListAsync();

            var totalViewsInPeriod = dailyStats.Sum(x => x.views);
            var totalDownloadsInPeriod = dailyStats.Sum(x => x.downloads);

            // ===========================
            // 🔥 TOP 5 KHUNG PHỔ BIẾN
            // ===========================
            var topFrames = await _db.ThongKeNgays
                .Where(x => x.Ngay >= startDate && x.Ngay <= endDate)
                .GroupBy(x => x.KhungHinhId)
                .Select(g => new
                {
                    frameId = g.Key,
                    views = g.Sum(x => x.Xem),
                    downloads = g.Sum(x => x.Tai)
                })
                .OrderByDescending(x => x.views)
                .Take(5)
                .ToListAsync();

            var topFrameIds = topFrames.Select(x => x.frameId).ToList();
            var topFrameDetails = await _db.KhungHinhs
                .Where(x => topFrameIds.Contains(x.Id))
                .Include(x => x.ChuSoHuu)
                .Select(x => new
                {
                    x.Id,
                    x.TieuDe,
                    x.Alias,
                    x.UrlXemTruoc,
                    owner = x.ChuSoHuu == null ? null : new { x.ChuSoHuu.TenHienThi }
                })
                .AsNoTracking()
                .ToListAsync();

            var topFramesList = topFrames
                .Select(tf =>
                {
                    var frame = topFrameDetails.FirstOrDefault(f => f.Id == tf.frameId);
                    return frame == null ? null : new
                    {
                        id = frame.Id,
                        title = frame.TieuDe,
                        alias = frame.Alias,
                        thumb = frame.UrlXemTruoc,
                        owner = frame.owner?.TenHienThi,
                        views = tf.views,
                        downloads = tf.downloads
                    };
                })
                .Where(x => x != null)
                .ToList();

            // ===========================
            // 📅 HOẠT ĐỘNG GẦN ĐÂY
            // ===========================
            var recentFrames = await _db.KhungHinhs
                .OrderByDescending(x => x.NgayDang)
                .Take(5)
                .Select(x => new { 
                    x.Id, 
                    tieuDe = x.TieuDe,
                    alias = x.Alias,
                    ngayDang = x.NgayDang
                })
                .AsNoTracking()
                .ToListAsync();

            return Ok(new
            {
                // Tổng quan
                users = new
                {
                    total = totalUsers,
                    newLast7Days = newUsersLast7Days,
                    activeLast30Days = activeUsersLast30Days
                },
                frames = new
                {
                    total = totalFrames,
                    public_ = publicFrames,
                    paused = pausedFrames
                },

                // ✅ DỮ LIỆU BIỂU ĐỒ (quan trọng nhất)
                chart = new
                {
                    period = $"{days} days",
                    totalViews = totalViewsInPeriod,
                    totalDownloads = totalDownloadsInPeriod,
                    dailyData = dailyStats
                },

                // Top frames & recent
                topFrames = topFramesList,
                recentFrames
            });
        }

        // ===========================
        // DTOs (internal to this controller)
        // ===========================
        public record ChangeStatusDto(string Status);
        public record ChangeRoleDto(string Role);
        public record BanUserDto(string? Reason);

        // ===========================
        // HELPER METHOD
        // ===========================
        private async Task<NguoiDung?> GetCallerAsync()
        {
            var email = User.Claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value;
            return string.IsNullOrEmpty(email) 
                ? null 
                : await _db.NguoiDungs.FirstOrDefaultAsync(u => u.Email == email);
        }
    } 
}