using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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
            if (file == null || file.Length == 0)
                return BadRequest("Chưa chọn file");
            if (!file.FileName.EndsWith(".png"))
                return BadRequest("Chỉ nhận file PNG");

            // Lưu file vào wwwroot/frames/
            var fileName = $"{Guid.NewGuid()}.png";
            var path = Path.Combine(_env.WebRootPath, "frames", fileName);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            using (var stream = System.IO.File.Create(path))
            {
                await file.CopyToAsync(stream);
            }

            // Lưu thông tin vào DB
            var userEmail = User.Claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value;
            var user = _db.NguoiDungs.FirstOrDefault(x => x.Email == userEmail);
            if (user == null) return Unauthorized();

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

        // Lay danh sách khung hình của user hiện tại
        [HttpGet("my")]
        [Authorize]
        public IActionResult MyFrames()
        {
            var email = User.Claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value;
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
    }
}
