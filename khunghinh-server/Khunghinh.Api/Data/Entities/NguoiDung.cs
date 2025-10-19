using System;
using System.Collections.Generic;

namespace Khunghinh.Api.Data.Entities;

public partial class NguoiDung
{
    public long Id { get; set; }

    public string Email { get; set; } = null!;

    public string TenHienThi { get; set; } = null!;

    public string? AnhDaiDienUrl { get; set; }

    public string VaiTro { get; set; } = null!;

    public string TrangThai { get; set; } = null!;

    public DateTime NgayTao { get; set; }

    public DateTime? NgayCapNhat { get; set; }

    // ✅ cột mới
    public bool IsSuperAdmin { get; set; }

    public virtual ICollection<BaoCaoViPham> BaoCaoViPhams { get; set; } = new List<BaoCaoViPham>();

    public virtual ICollection<DangNhapNgoai> DangNhapNgoais { get; set; } = new List<DangNhapNgoai>();

    public virtual ICollection<KhungHinh> KhungHinhs { get; set; } = new List<KhungHinh>();

    public virtual ICollection<SuKienKhung> SuKienKhungs { get; set; } = new List<SuKienKhung>();
}
