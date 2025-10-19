    /* ===================== RESET & CREATE DATABASE ===================== */

/* IF DB_ID(N'khunghinh') IS NULL
  CREATE DATABASE [KhunghinhDb];
GO */

-- Azure target
USE [khunghinh];
GO

/* 0) DROP trigger nếu có */
IF OBJECT_ID(N'dbo.trg_SuKienKhung_AfterInsert', N'TR') IS NOT NULL
  DROP TRIGGER dbo.trg_SuKienKhung_AfterInsert;
IF OBJECT_ID(N'dbo.trg_NguoiDung_Delete', N'TR') IS NOT NULL
  DROP TRIGGER dbo.trg_NguoiDung_Delete;
GO

/* 1) XÓA BẢNG THEO THỨ TỰ PHỤ THUỘC (con -> cha) */
IF OBJECT_ID(N'dbo.SuKienKhung',   N'U') IS NOT NULL DROP TABLE dbo.SuKienKhung;
IF OBJECT_ID(N'dbo.ThongKeNgay',   N'U') IS NOT NULL DROP TABLE dbo.ThongKeNgay;
IF OBJECT_ID(N'dbo.BaoCaoViPham',  N'U') IS NOT NULL DROP TABLE dbo.BaoCaoViPham;
IF OBJECT_ID(N'dbo.DangNhapNgoai', N'U') IS NOT NULL DROP TABLE dbo.DangNhapNgoai;
IF OBJECT_ID(N'dbo.KhungBienThe',  N'U') IS NOT NULL DROP TABLE dbo.KhungBienThe;
IF OBJECT_ID(N'dbo.KhungHinh',     N'U') IS NOT NULL DROP TABLE dbo.KhungHinh;
IF OBJECT_ID(N'dbo.CaiDatHeThong', N'U') IS NOT NULL DROP TABLE dbo.CaiDatHeThong;
IF OBJECT_ID(N'dbo.NguoiDung',     N'U') IS NOT NULL DROP TABLE dbo.NguoiDung;
GO

/* ===================== CREATE TABLES ===================== */

/* 2) NguoiDung */
CREATE TABLE dbo.NguoiDung (
  Id               BIGINT IDENTITY(1,1) PRIMARY KEY,
  Email            NVARCHAR(255)  NOT NULL UNIQUE,
  TenHienThi       NVARCHAR(120)  NOT NULL,
  AnhDaiDienUrl    NVARCHAR(500)  NULL,
  VaiTro           NVARCHAR(10)   NOT NULL,   -- 'user' | 'admin'
  TrangThai        NVARCHAR(20)   NOT NULL,   -- 'hoat_dong' | 'khoa' | 'xoa_mem'
  NgayTao          DATETIME2      NOT NULL CONSTRAINT DF_ND_NgayTao DEFAULT SYSUTCDATETIME(),
  NgayCapNhat      DATETIME2      NULL
);
ALTER TABLE dbo.NguoiDung WITH CHECK ADD
  CONSTRAINT CK_ND_VaiTro CHECK (VaiTro IN (N'user', N'admin')),
  CONSTRAINT CK_ND_TrangThai CHECK (TrangThai IN (N'hoat_dong', N'khoa', N'xoa_mem'));
GO

/* 3) DangNhapNgoai (Google OAuth) */
CREATE TABLE dbo.DangNhapNgoai (
  Id                BIGINT IDENTITY(1,1) PRIMARY KEY,
  NguoiDungId       BIGINT        NOT NULL,
  NhaCungCap        NVARCHAR(20)  NOT NULL,       -- 'google'
  ProviderUserId    NVARCHAR(255) NOT NULL,       -- Google sub
  EmailXacThuc      BIT           NOT NULL CONSTRAINT DF_DNN_EmailXacThuc DEFAULT 1,
  AccessTokenHash   NVARCHAR(255) NULL,
  RefreshTokenHash  NVARCHAR(255) NULL,
  LanCuoiDangNhap   DATETIME2     NULL,
  CONSTRAINT FK_DNN_ND FOREIGN KEY (NguoiDungId)
    REFERENCES dbo.NguoiDung(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_DNN UNIQUE (NhaCungCap, ProviderUserId),
  CONSTRAINT CK_DNN_Provider CHECK (NhaCungCap = N'google')
);
GO

/* 4) KhungHinh */
CREATE TABLE dbo.KhungHinh (
  Id                BIGINT IDENTITY(1,1) PRIMARY KEY,
  ChuSoHuuId        BIGINT        NOT NULL,     -- FK NguoiDung
  TieuDe            NVARCHAR(200) NOT NULL,
  MoTa              NVARCHAR(500) NULL,
  Alias             NVARCHAR(120) NOT NULL,     -- UNIQUE
  Loai              NVARCHAR(20)  NOT NULL,     -- 'le_hoi' | 'su_kien' | 'chien_dich' | 'khac'
  CheDoHienThi      NVARCHAR(20)  NOT NULL,     -- 'cong_khai' | 'han_che' | 'rieng_tu'
  TrangThai         NVARCHAR(20)  NOT NULL,     -- 'dang_hoat_dong' | 'tam_an' | 'bi_khoa'
  UrlXemTruoc       NVARCHAR(500) NULL,
  QrImageUrl        NVARCHAR(500) NULL,
  NgayDang          DATETIME2     NOT NULL CONSTRAINT DF_KH_NgayDang DEFAULT SYSUTCDATETIME(),
  NgayChinhSua      DATETIME2     NULL,
  LuotXem           BIGINT        NOT NULL CONSTRAINT DF_KH_LuotXem DEFAULT 0,
  LuotTai           BIGINT        NOT NULL CONSTRAINT DF_KH_LuotTai DEFAULT 0,
  CONSTRAINT FK_KH_ND FOREIGN KEY (ChuSoHuuId)
    REFERENCES dbo.NguoiDung(Id) ON DELETE CASCADE,
  CONSTRAINT UQ_KH_Alias UNIQUE (Alias)
);
CREATE INDEX IX_KH_NgayDang ON dbo.KhungHinh(NgayDang);
ALTER TABLE dbo.KhungHinh WITH CHECK ADD
  CONSTRAINT CK_KH_Loai CHECK (Loai IN (N'le_hoi',N'su_kien',N'chien_dich',N'khac')),
  CONSTRAINT CK_KH_CheDo CHECK (CheDoHienThi IN (N'cong_khai',N'han_che',N'rieng_tu')),
  CONSTRAINT CK_KH_TrangThai CHECK (TrangThai IN (N'dang_hoat_dong',N'tam_an',N'bi_khoa'));
GO

/* 5) KhungBienThe (tùy dùng) */
CREATE TABLE dbo.KhungBienThe (
  Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
  KhungHinhId     BIGINT        NOT NULL,
  TenBienThe      NVARCHAR(120) NOT NULL,
  AnhPngUrl       NVARCHAR(500) NOT NULL,
  ThuTu           INT           NOT NULL CONSTRAINT DF_KBT_ThuTu DEFAULT 0,
  TrangThai       NVARCHAR(10)  NOT NULL CONSTRAINT DF_KBT_TrangThai DEFAULT N'hoat_dong', -- 'hoat_dong'|'an'
  CONSTRAINT FK_KBT_KH FOREIGN KEY (KhungHinhId)
    REFERENCES dbo.KhungHinh(Id) ON DELETE CASCADE,
  CONSTRAINT CK_KBT_TrangThai CHECK (TrangThai IN (N'hoat_dong', N'an'))
);
CREATE INDEX IX_KBT_Khung ON dbo.KhungBienThe(KhungHinhId, TrangThai, ThuTu);
GO

/* 6) SuKienKhung  (NO ACTION với NguoiDungId để tránh multiple cascade) */
CREATE TABLE dbo.SuKienKhung (
  Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
  KhungHinhId     BIGINT        NOT NULL,
  NguoiDungId     BIGINT        NULL,
  LoaiSuKien      NVARCHAR(12)  NOT NULL,    -- 'xem'|'tai'|'quet_qr'|'doi_khung'
  ThoiDiem        DATETIME2     NOT NULL CONSTRAINT DF_SK_ThoiDiem DEFAULT SYSUTCDATETIME(),
  IpHash          CHAR(64)      NULL,
  UserAgent       NVARCHAR(400) NULL,
  ThietBi         NVARCHAR(10)  NULL,        -- 'mobile'|'tablet'|'desktop'|'khac'
  HeDieuHanh      NVARCHAR(60)  NULL,
  TrinhDuyet      NVARCHAR(60)  NULL,
  QuocGia         NCHAR(2)      NULL,
  TinhThanh       NVARCHAR(120) NULL,
  ThanhPho        NVARCHAR(120) NULL,
  CONSTRAINT FK_SK_KH FOREIGN KEY (KhungHinhId)
    REFERENCES dbo.KhungHinh(Id) ON DELETE CASCADE,
  CONSTRAINT FK_SK_ND FOREIGN KEY (NguoiDungId)
    REFERENCES dbo.NguoiDung(Id) ON DELETE NO ACTION,
  CONSTRAINT CK_SK_Loai CHECK (LoaiSuKien IN (N'xem',N'tai',N'quet_qr',N'doi_khung'))
);
CREATE INDEX IX_SK_Khung_ThoiDiem ON dbo.SuKienKhung(KhungHinhId, ThoiDiem);
CREATE INDEX IX_SK_Loai ON dbo.SuKienKhung(LoaiSuKien);
GO

/* 7) ThongKeNgay */
CREATE TABLE dbo.ThongKeNgay (
  Ngay         DATE       NOT NULL,
  KhungHinhId  BIGINT     NOT NULL,
  Xem          INT        NOT NULL CONSTRAINT DF_TK_Xem DEFAULT 0,
  Tai          INT        NOT NULL CONSTRAINT DF_TK_Tai DEFAULT 0,
  DoiKhung     INT        NOT NULL CONSTRAINT DF_TK_Doi DEFAULT 0,
  QuetQr       INT        NOT NULL CONSTRAINT DF_TK_Qr DEFAULT 0,
  CONSTRAINT PK_TK PRIMARY KEY (Ngay, KhungHinhId),
  CONSTRAINT FK_TK_KH FOREIGN KEY (KhungHinhId)
    REFERENCES dbo.KhungHinh(Id) ON DELETE CASCADE
);
GO

/* 8) BaoCaoViPham (NO ACTION với NguoiBaoCaoId để tránh multiple cascade) */
CREATE TABLE dbo.BaoCaoViPham (
  Id              BIGINT IDENTITY(1,1) PRIMARY KEY,
  KhungHinhId     BIGINT        NOT NULL,
  NguoiBaoCaoId   BIGINT        NULL,
  LyDo            NVARCHAR(30)  NOT NULL,   -- 'ban_quyen'|'noi_dung_nhay_cam'|'spam'|'khac'
  MoTaThem        NVARCHAR(500) NULL,
  TrangThaiXuLy   NVARCHAR(15)  NOT NULL CONSTRAINT DF_BCVP_TrangThai DEFAULT N'cho_duyet',
  NgayTao         DATETIME2     NOT NULL CONSTRAINT DF_BCVP_NgayTao DEFAULT SYSUTCDATETIME(),
  NgayCapNhat     DATETIME2     NULL,
  CONSTRAINT FK_BCVP_KH  FOREIGN KEY (KhungHinhId)
    REFERENCES dbo.KhungHinh(Id) ON DELETE CASCADE,
  CONSTRAINT FK_BCVP_NBC FOREIGN KEY (NguoiBaoCaoId)
    REFERENCES dbo.NguoiDung(Id) ON DELETE NO ACTION,
  CONSTRAINT CK_BCVP_LyDo CHECK (LyDo IN (N'ban_quyen',N'noi_dung_nhay_cam',N'spam',N'khac')),
  CONSTRAINT CK_BCVP_TrangThai CHECK (TrangThaiXuLy IN (N'cho_duyet',N'dang_xu_ly',N'da_xu_ly',N'bac_bo'))
);
CREATE INDEX IX_BCVP_TrangThai ON dbo.BaoCaoViPham(TrangThaiXuLy);
GO

/* 9) CaiDatHeThong */
CREATE TABLE dbo.CaiDatHeThong (
  Khoa         NVARCHAR(120) PRIMARY KEY,
  GiaTri       NVARCHAR(MAX) NOT NULL,
  GhiChu       NVARCHAR(255) NULL,
  NgayCapNhat  DATETIME2 NOT NULL CONSTRAINT DF_CDT_Ngay DEFAULT SYSUTCDATETIME()
);
GO

/* ===================== TRIGGERS ===================== */

/* 10) Trigger cộng dồn xem/tải */
CREATE TRIGGER dbo.trg_SuKienKhung_AfterInsert
ON dbo.SuKienKhung
AFTER INSERT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE kh SET
      LuotXem = kh.LuotXem + v.CntXem,
      LuotTai = kh.LuotTai + v.CntTai
  FROM dbo.KhungHinh kh
  JOIN (
      SELECT KhungHinhId,
             SUM(CASE WHEN LoaiSuKien = N'xem' THEN 1 ELSE 0 END) AS CntXem,
             SUM(CASE WHEN LoaiSuKien = N'tai' THEN 1 ELSE 0 END) AS CntTai
      FROM inserted
      GROUP BY KhungHinhId
  ) v ON v.KhungHinhId = kh.Id;
END;
GO

/* 11) Trigger xóa User: set NULL các tham chiếu rồi mới xóa */
CREATE TRIGGER dbo.trg_NguoiDung_Delete
ON dbo.NguoiDung
INSTEAD OF DELETE
AS
BEGIN
  SET NOCOUNT ON;

  -- NULL hóa các tham chiếu tới user
  UPDATE s SET NguoiDungId = NULL
  FROM dbo.SuKienKhung s
  JOIN deleted d ON s.NguoiDungId = d.Id;

  UPDATE b SET NguoiBaoCaoId = NULL
  FROM dbo.BaoCaoViPham b
  JOIN deleted d ON b.NguoiBaoCaoId = d.Id;

  -- Xóa KhungHinh của user (sẽ CASCADE xuống các bảng con)
  DELETE kh
  FROM dbo.KhungHinh kh
  JOIN deleted d ON kh.ChuSoHuuId = d.Id;

  -- Xóa liên kết OAuth (CASCADE cũng được, nhưng để tường minh)
  DELETE dnn
  FROM dbo.DangNhapNgoai dnn
  JOIN deleted d ON dnn.NguoiDungId = d.Id;

  -- Cuối cùng: xóa user
  DELETE FROM dbo.NguoiDung WHERE Id IN (SELECT Id FROM deleted);
END;
GO

USE [khunghinh];
GO

/* ========== Người dùng ========== */
INSERT INTO dbo.NguoiDung (Email, TenHienThi, AnhDaiDienUrl, VaiTro, TrangThai)
VALUES
(N'user1@gmail.com', N'Nguyễn Văn A', N'https://example.com/avatars/a.png', N'user', N'hoat_dong'),
(N'user2@gmail.com', N'Trần Thị B', N'https://example.com/avatars/b.png', N'user', N'hoat_dong'),
(N'admin@gmail.com', N'Quản trị viên', N'https://example.com/avatars/admin.png', N'admin', N'hoat_dong');
GO

/* ========== Đăng nhập ngoài (Google OAuth) ========== */
INSERT INTO dbo.DangNhapNgoai (NguoiDungId, NhaCungCap, ProviderUserId, EmailXacThuc)
VALUES
(1, N'google', N'google-uid-111', 1),
(2, N'google', N'google-uid-222', 1),
(3, N'google', N'google-uid-999', 1);
GO

/* ========== Khung hình ========== */
INSERT INTO dbo.KhungHinh (ChuSoHuuId, TieuDe, MoTa, Alias, Loai, CheDoHienThi, TrangThai, UrlXemTruoc, QrImageUrl)
VALUES
(1, N'Tết đoàn viên', N'Khung hình Tết sum vầy', N'tet-doan-vien', N'le_hoi', N'cong_khai', N'dang_hoat_dong',
 N'https://example.com/frames/tet.png', N'https://example.com/qr/tet.png'),

(2, N'Quốc khánh 2-9', N'Khung hình chào mừng Quốc khánh', N'quoc-khanh-2-9', N'su_kien', N'cong_khai', N'dang_hoat_dong',
 N'https://example.com/frames/quockhanh.png', N'https://example.com/qr/quockhanh.png'),

(1, N'Halloween', N'Khung hình hóa trang', N'halloween', N'le_hoi', N'cong_khai', N'dang_hoat_dong',
 N'https://example.com/frames/halloween.png', N'https://example.com/qr/halloween.png');
GO

/* ========== Biến thể khung ========== */
INSERT INTO dbo.KhungBienThe (KhungHinhId, TenBienThe, AnhPngUrl, ThuTu, TrangThai)
VALUES
(1, N'Màu đỏ', N'https://example.com/frames/tet-red.png', 1, N'hoat_dong'),
(1, N'Màu vàng', N'https://example.com/frames/tet-yellow.png', 2, N'hoat_dong'),
(2, N'Có cờ đỏ', N'https://example.com/frames/quockhanh-flag.png', 1, N'hoat_dong'),
(3, N'Ma bí ngô', N'https://example.com/frames/halloween-pumpkin.png', 1, N'hoat_dong');
GO

/* ========== Sự kiện khung (lượt xem/tải) ========== */
INSERT INTO dbo.SuKienKhung (KhungHinhId, NguoiDungId, LoaiSuKien, IpHash, UserAgent, ThietBi, HeDieuHanh, TrinhDuyet, QuocGia, TinhThanh, ThanhPho)
VALUES
(1, 1, N'xem',  'hash-ip-1', N'Chrome', N'desktop', N'Windows', N'Chrome', N'VN', N'Lâm Đồng', N'Đà Lạt'),
(1, 2, N'tai',  'hash-ip-2', N'Firefox', N'mobile',  N'Android', N'Firefox', N'VN', N'Hồ Chí Minh', N'Quận 1'),
(2, 1, N'xem',  'hash-ip-3', N'Edge',   N'desktop', N'Windows', N'Edge',    N'VN', N'Hà Nội', N'Cầu Giấy'),
(3, 2, N'quet_qr', 'hash-ip-4', N'Safari', N'mobile', N'iOS', N'Safari', N'US', N'CA', N'San Jose');
GO

/* ========== Thống kê theo ngày ========== */
INSERT INTO dbo.ThongKeNgay (Ngay, KhungHinhId, Xem, Tai, DoiKhung, QuetQr)
VALUES
('2025-09-10', 1, 10, 3, 2, 1),
('2025-09-11', 2, 15, 5, 0, 2),
('2025-09-12', 3, 8,  2, 1, 4);
GO

/* ========== Báo cáo vi phạm ========== */
INSERT INTO dbo.BaoCaoViPham (KhungHinhId, NguoiBaoCaoId, LyDo, MoTaThem, TrangThaiXuLy)
VALUES
(3, 1, N'noi_dung_nhay_cam', N'Hình ảnh không phù hợp với văn hóa', N'cho_duyet'),
(2, 2, N'ban_quyen', N'Khung hình sử dụng logo quốc kỳ không phép', N'dang_xu_ly');
GO

/* ========== Cài đặt hệ thống ========== */
INSERT INTO dbo.CaiDatHeThong (Khoa, GiaTri, GhiChu)
VALUES
(N'captcha_site_key', N'6LeIxAcTAAAA...', N'Site key reCAPTCHA demo'),
(N'captcha_secret_key', N'6LeIxAcTAAAA...', N'Secret key reCAPTCHA demo'),
(N'salt_ip_hash', N'random-salt-12345', N'Salt để hash IP người dùng');
GO


INSERT INTO dbo.NguoiDung (Email, TenHienThi, AnhDaiDienUrl, VaiTro, TrangThai)
VALUES (
  N'nguyenlequoclam@gmail.com',
  N'Nguyễn Lê Quốc Lâm',
  N'https://example.com/avatars/quoclam.png',  -- có thể đổi link avatar thật của bạn
  N'admin',
  N'hoat_dong'
);
GO

INSERT INTO dbo.NguoiDung (Email, TenHienThi, AnhDaiDienUrl, VaiTro, TrangThai)
VALUES (
  N'truong77766t@gmail.com',
  N'Nguyễn Văn Trường',
  N'https://example.com/avatars/truong.png',
  N'admin',
  N'hoat_dong'
);
GO

SELECT * FROM NguoiDung

SELECT * FROM NguoiDung WHERE Email = 'nguyenlequoclam@gmail.com';

-- 1.1) Thêm cột IsSuperAdmin nếu chưa có
IF COL_LENGTH('dbo.NguoiDung', 'IsSuperAdmin') IS NULL
BEGIN
  ALTER TABLE dbo.NguoiDung
  ADD IsSuperAdmin BIT NOT NULL CONSTRAINT DF_ND_IsSuperAdmin DEFAULT 0;
END
GO

-- 1.2) (khuyến nghị) Index cho các truy vấn lọc theo vai trò/trạng thái
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ND_VaiTro_TrangThai' AND object_id = OBJECT_ID('dbo.NguoiDung'))
  CREATE INDEX IX_ND_VaiTro_TrangThai ON dbo.NguoiDung(VaiTro, TrangThai);
GO

UPDATE dbo.NguoiDung
SET IsSuperAdmin = 1, VaiTro = N'admin', TrangThai = N'hoat_dong', NgayCapNhat = SYSUTCDATETIME()
WHERE Email = N'nguyenlequoclam@gmail.com';
GO

/* 3.1) Cấm thay đổi quyền/trạng thái của Super Admin */
CREATE OR ALTER TRIGGER dbo.trg_ND_ProtectSuperAdmin
ON dbo.NguoiDung
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT 1
    FROM inserted i
    JOIN deleted  d ON i.Id = d.Id
    WHERE d.IsSuperAdmin = 1
      AND (
           i.IsSuperAdmin <> 1            -- gỡ super
        OR i.VaiTro <> d.VaiTro           -- đổi 'admin' -> 'user' hoặc ngược lại
        OR i.TrangThai <> N'hoat_dong'    -- khoá/xoá mềm super
      )
  )
  BEGIN
    RAISERROR (N'Không được phép thay đổi Super Admin.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;
GO

/* 3.2) Luôn đảm bảo hệ thống còn ít nhất 1 Super Admin */
CREATE OR ALTER TRIGGER dbo.trg_ND_EnsureAtLeastOneSuper
ON dbo.NguoiDung
AFTER UPDATE, DELETE
AS
BEGIN
  SET NOCOUNT ON;

  IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung WHERE IsSuperAdmin = 1)
  BEGIN
    RAISERROR (N'Phải luôn có ít nhất 1 Super Admin.', 16, 1);
    ROLLBACK TRANSACTION;
    RETURN;
  END
END;
GO

/*View tiện ích (xem nhanh danh sách quản trị)*/
CREATE OR ALTER VIEW dbo.v_Admins
AS
SELECT Id, Email, TenHienThi, VaiTro, IsSuperAdmin, TrangThai, NgayTao, NgayCapNhat
FROM dbo.NguoiDung
WHERE IsSuperAdmin = 1 OR VaiTro = N'admin';
GO

/*Thăng user thành admin*/
CREATE OR ALTER PROCEDURE dbo.sp_PromoteToAdmin
  @ActorId  BIGINT,
  @TargetId BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @actorIsSuper BIT, @targetIsSuper BIT;

  SELECT @actorIsSuper = IsSuperAdmin FROM dbo.NguoiDung WHERE Id = @ActorId;
  SELECT @targetIsSuper = IsSuperAdmin FROM dbo.NguoiDung WHERE Id = @TargetId;

  IF ISNULL(@actorIsSuper, 0) = 0
    RAISERROR (N'Chỉ Super Admin được thăng quyền.', 16, 1);
  ELSE IF ISNULL(@targetIsSuper, 0) = 1
    RAISERROR (N'Không thao tác lên Super Admin.', 16, 1);
  ELSE
    UPDATE dbo.NguoiDung SET VaiTro = N'admin', NgayCapNhat = SYSUTCDATETIME() WHERE Id = @TargetId;
END;
GO

/*5.2) Hạ admin về user*/
CREATE OR ALTER PROCEDURE dbo.sp_DemoteToUser
  @ActorId  BIGINT,
  @TargetId BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @actorIsSuper BIT, @targetIsSuper BIT, @targetRole NVARCHAR(10);

  SELECT @actorIsSuper = IsSuperAdmin FROM dbo.NguoiDung WHERE Id = @ActorId;
  SELECT @targetIsSuper = IsSuperAdmin, @targetRole = VaiTro FROM dbo.NguoiDung WHERE Id = @TargetId;

  IF ISNULL(@actorIsSuper, 0) = 0
    RAISERROR (N'Chỉ Super Admin được hạ quyền.', 16, 1);
  ELSE IF ISNULL(@targetIsSuper, 0) = 1
    RAISERROR (N'Không thao tác lên Super Admin.', 16, 1);
  ELSE IF @targetRole <> N'admin'
    RAISERROR (N'Chỉ hạ quyền tài khoản admin.', 16, 1);
  ELSE
    UPDATE dbo.NguoiDung SET VaiTro = N'user', NgayCapNhat = SYSUTCDATETIME() WHERE Id = @TargetId;
END;
GO

/*5.3) Khoá / mở khoá tài khoản*/
CREATE OR ALTER PROCEDURE dbo.sp_LockUser
  @ActorId  BIGINT,
  @TargetId BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @actorIsSuper BIT, @targetIsSuper BIT, @targetRole NVARCHAR(10);

  SELECT @actorIsSuper = IsSuperAdmin FROM dbo.NguoiDung WHERE Id = @ActorId;
  SELECT @targetIsSuper = IsSuperAdmin, @targetRole = VaiTro FROM dbo.NguoiDung WHERE Id = @TargetId;

  IF ISNULL(@targetIsSuper, 0) = 1
    RAISERROR (N'Không khoá Super Admin.', 16, 1);
  ELSE IF @targetRole = N'admin' AND ISNULL(@actorIsSuper, 0) = 0
    RAISERROR (N'Chỉ Super Admin được khoá admin.', 16, 1);
  ELSE
    UPDATE dbo.NguoiDung SET TrangThai = N'khoa', NgayCapNhat = SYSUTCDATETIME() WHERE Id = @TargetId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_UnlockUser
  @ActorId  BIGINT,
  @TargetId BIGINT
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE dbo.NguoiDung SET TrangThai = N'hoat_dong', NgayCapNhat = SYSUTCDATETIME() WHERE Id = @TargetId;
END;
GO

/*5.4) Cấp / bỏ cờ Super Admin (chỉ gọi khi thật cần thiết)*/
CREATE OR ALTER PROCEDURE dbo.sp_SetSuperAdmin
  @ActorId      BIGINT,
  @TargetId     BIGINT,
  @IsSuperAdmin BIT
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @actorIsSuper BIT;

  SELECT @actorIsSuper = IsSuperAdmin FROM dbo.NguoiDung WHERE Id = @ActorId;

  IF ISNULL(@actorIsSuper, 0) = 0
    RAISERROR (N'Chỉ Super Admin được cấp/bỏ Super Admin.', 16, 1);
  ELSE
  BEGIN
    UPDATE dbo.NguoiDung
    SET IsSuperAdmin = @IsSuperAdmin, VaiTro = N'admin', NgayCapNhat = SYSUTCDATETIME()
    WHERE Id = @TargetId;

    -- Sau UPDATE, trigger trg_ND_EnsureAtLeastOneSuper vẫn bảo vệ không cho hệ thống mất sạch Super Admin
  END
END;
GO

-- Xem danh sách quản trị
SELECT * FROM dbo.v_Admins;

-- Thử thăng quyền bởi Super Admin
-- EXEC dbo.sp_PromoteToAdmin  @ActorId =  <Id_Super>, @TargetId = <Id_User>;

-- Thử hạ quyền bởi admin thường (kỳ vọng lỗi)
-- EXEC dbo.sp_DemoteToUser    @ActorId =  <Id_AdminThuong>, @TargetId = <Id_AdminKhac>;

-- Kiểm tra bản ghi của user cụ thể
SELECT * FROM dbo.NguoiDung WHERE Email = N'nguyenlequoclam@gmail.com';

-- Kiểm tra 10 bản ghi mới cập nhật nhất
SELECT TOP 10 * FROM dbo.NguoiDung ORDER BY NgayCapNhat DESC;

-- Kiểm tra số lượng admin / superadmin
SELECT COUNT(*) AS TotalAdmins FROM dbo.NguoiDung WHERE VaiTro = N'admin';
SELECT COUNT(*) AS TotalSuper FROM dbo.NguoiDung WHERE IsSuperAdmin = 1;


