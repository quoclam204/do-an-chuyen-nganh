using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Khunghinh.Api.Data.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

namespace Khunghinh.Api.Services
{
    public class ClaimsTransformer : IClaimsTransformation
    {
        private readonly KhunghinhContext _db;

        public ClaimsTransformer(KhunghinhContext db)
        {
            _db = db;
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (principal == null) return principal;

            // Tìm email trong claims (linh hoạt với provider)
            var email = principal.Claims.FirstOrDefault(c => c.Type.Contains("email"))?.Value;
            if (string.IsNullOrEmpty(email)) return principal;

            var user = await _db.NguoiDungs.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return principal;

            // Nếu đã có claim role thì không thêm nữa
            if (principal.Claims.Any(c => c.Type == ClaimTypes.Role)) return principal;

            var identity = new ClaimsIdentity();
            
            // ✅ Thêm Role claim
            identity.AddClaim(new Claim(ClaimTypes.Role, string.IsNullOrEmpty(user.VaiTro) ? "user" : user.VaiTro));
            
            // ✅ Thêm IsSuperAdmin claim để dễ kiểm tra
            identity.AddClaim(new Claim("IsSuperAdmin", user.IsSuperAdmin.ToString()));
            
            // ✅ Thêm UserId claim
            identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()));

            principal.AddIdentity(identity);
            return principal;
        }
    }
}