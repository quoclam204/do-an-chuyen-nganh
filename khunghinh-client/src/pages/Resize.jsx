import { useEffect, useMemo, useRef, useState } from "react"
import { Download, Image as ImageIcon, ChevronLeft, Upload } from "lucide-react"

export default function Resize() {
  const fileInputRef = useRef(null)

  // ===== trạng thái =====
  const [buoc, setBuoc] = useState("trong") // trong | chinh-sua | ket-qua
  const [tapTin, setTapTin] = useState(null)
  const [urlAnh, setUrlAnh] = useState("")
  const [kichThuocGoc, setKichThuocGoc] = useState({ w: 0, h: 0 })

  // tùy chọn
  const [giuTyLe, setGiuTyLe] = useState(true)
  const [choPhepPhongTo, setChoPhepPhongTo] = useState(false)
  const [kichThuocMucTieu, setKichThuocMucTieu] = useState({ w: 0, h: 0 })

  // kết quả
  const [urlKetQua, setUrlKetQua] = useState("")
  const [kichThuocKetQua, setKichThuocKetQua] = useState({ w: 0, h: 0 })

  // ===== hàm xử lý =====
  const moChonAnh = () => fileInputRef.current?.click()

  const xuLyChonAnh = (e) => {
    const f = e.target.files?.[0]
    if (!f) return

    // Xóa URL cũ trước khi tạo URL mới
    if (urlAnh) URL.revokeObjectURL(urlAnh)
    if (urlKetQua) URL.revokeObjectURL(urlKetQua)

    setTapTin(f)
    const url = URL.createObjectURL(f)
    setUrlAnh(url)

    const im = new Image()
    im.onload = () => {
      const w = im.naturalWidth
      const h = im.naturalHeight
      setKichThuocGoc({ w, h })
      setKichThuocMucTieu({ w, h })
      setBuoc("chinh-sua")
    }
    im.src = url
  }

  // Chỉ xóa URL khi component bị gỡ
  useEffect(() => {
    return () => {
      if (urlAnh) URL.revokeObjectURL(urlAnh)
      if (urlKetQua) URL.revokeObjectURL(urlKetQua)
    }
  }, [])

  // đổi chiều rộng/cao
  const capNhatChieuRong = (w) => {
    w = Math.max(1, Math.round(+w || 0))
    if (giuTyLe && kichThuocGoc.w) {
      const tyLe = kichThuocGoc.h / kichThuocGoc.w
      setKichThuocMucTieu({ w, h: Math.max(1, Math.round(w * tyLe)) })
    } else setKichThuocMucTieu((t) => ({ ...t, w }))
  }
  const capNhatChieuCao = (h) => {
    h = Math.max(1, Math.round(+h || 0))
    if (giuTyLe && kichThuocGoc.h) {
      const tyLe = kichThuocGoc.w / kichThuocGoc.h
      setKichThuocMucTieu({ h, w: Math.max(1, Math.round(h * tyLe)) })
    } else setKichThuocMucTieu((t) => ({ ...t, h }))
  }

  // Tải nhanh với kích thước đã chọn
  const taiNhanh = async (w, h) => {
    if (!tapTin) return

    const anhGoc = await docAnh(tapTin)
    let chieuRongMoi = w, chieuCaoMoi = h

    // Tính toán kích thước cuối cùng dựa trên tỷ lệ
    if (giuTyLe) {
      const tyLeGoc = kichThuocGoc.w / kichThuocGoc.h
      const tyLeChon = w / h

      if (Math.abs(tyLeGoc - tyLeChon) > 0.06) {
        if (tyLeGoc > tyLeChon) {
          chieuRongMoi = Math.round(h * tyLeGoc)
          chieuCaoMoi = h
        } else {
          chieuRongMoi = w
          chieuCaoMoi = Math.round(w / tyLeGoc)
        }
      }
    }

    if (!choPhepPhongTo) {
      chieuRongMoi = Math.min(chieuRongMoi, kichThuocGoc.w)
      chieuCaoMoi = Math.min(chieuCaoMoi, kichThuocGoc.h)
    }

    const { blob } = await thayDoiKichThuocAnh(anhGoc, chieuRongMoi, chieuCaoMoi)
    const url = URL.createObjectURL(blob)

    // Tạo tên file
    const tenGoc = tapTin.name.replace(/\.[^.]+$/, "")
    const duoiFile = (tapTin.name.split(".").pop() || "png").toLowerCase()
    const tenFile = `${tenGoc}-${chieuRongMoi}x${chieuCaoMoi}.${duoiFile}`

    // Tải xuống
    const a = document.createElement("a")
    a.href = url
    a.download = tenFile
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // thay đổi kích thước bằng canvas
  const xuLyThayDoiKichThuoc = async () => {
    if (!tapTin || !kichThuocMucTieu.w || !kichThuocMucTieu.h) return

    const anhGoc = await docAnh(tapTin)
    let chieuRongMoi = kichThuocMucTieu.w
    let chieuCaoMoi = kichThuocMucTieu.h

    if (!choPhepPhongTo) {
      chieuRongMoi = Math.min(chieuRongMoi, kichThuocGoc.w)
      chieuCaoMoi = Math.min(chieuCaoMoi, kichThuocGoc.h)
    }

    const { blob, w, h } = await thayDoiKichThuocAnh(anhGoc, chieuRongMoi, chieuCaoMoi)
    const url = URL.createObjectURL(blob)
    setUrlKetQua(url)
    setKichThuocKetQua({ w, h })
    setBuoc("ket-qua")
  }

  const datLai = () => {
    // Xóa URLs trước khi đặt lại
    if (urlAnh) URL.revokeObjectURL(urlAnh)
    if (urlKetQua) URL.revokeObjectURL(urlKetQua)

    setTapTin(null)
    setUrlAnh("")
    setUrlKetQua("")
    setBuoc("trong")
  }

  const tenFileDep = useMemo(() => {
    if (!tapTin) return ""
    const tenGoc = tapTin.name.replace(/\.[^.]+$/, "")
    const duoiFile = (tapTin.name.split(".").pop() || "png").toLowerCase()
    return `${tenGoc}-${kichThuocMucTieu.w}x${kichThuocMucTieu.h}.${duoiFile}`
  }, [tapTin, kichThuocMucTieu])

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-b from-sky-50 to-white">
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center mb-6">
          Thay đổi kích thước ảnh
        </h1>

        {/* ===== BƯỚC 1: CHỌN ẢNH ===== */}
        {buoc === "trong" && (
          <div className="text-center">
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tải ảnh JPEG, PNG và thay đổi kích thước dễ dàng với công cụ trực tuyến miễn phí.
            </p>
            <button
              onClick={moChonAnh}
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            >
              <Upload size={18} /> Chọn ảnh của bạn
            </button>
            <input ref={fileInputRef} onChange={xuLyChonAnh} type="file" accept="image/*" hidden />
          </div>
        )}

        {/* ===== BƯỚC 2: CHỈNH SỬA ===== */}
        {buoc === "chinh-sua" && (
          <div className="grid md:grid-cols-[1fr_360px] gap-8">
            {/* xem trước */}
            <div className="mx-auto">
              <div className="card bg-white rounded-2xl border shadow p-4 w-[320px] h-[380px] grid place-items-center">
                {urlAnh && <img src={urlAnh} alt="xem trước" className="max-w-full max-h-56 object-contain" />}
                <div className="w-full text-sm mt-3">
                  <div className="font-semibold truncate">{tapTin?.name}</div>
                  <div className="text-blue-700">
                    {kichThuocGoc.w}x{kichThuocGoc.h} → {kichThuocMucTieu.w}x{kichThuocMucTieu.h}
                  </div>
                </div>
                <button onClick={datLai} className="mt-2 text-red-500 hover:underline text-sm">
                  Xóa ảnh
                </button>
              </div>
            </div>

            {/* bảng điều khiển */}
            <aside className="card bg-white rounded-2xl border shadow p-5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">Tùy chọn</div>
                <button
                  onClick={moChonAnh}
                  className="rounded-lg px-4 py-2 bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Chọn ảnh khác
                </button>
                <input ref={fileInputRef} onChange={xuLyChonAnh} type="file" accept="image/*" hidden />
              </div>

              {/* tùy chọn nhanh */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Tùy chọn nhanh - Tải ngay
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => taiNhanh(1080, 1080)}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-blue-50 hover:border-blue-500 transition flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    1080x1080
                  </button>
                  <button
                    onClick={() => taiNhanh(2048, 2048)}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-blue-50 hover:border-blue-500 transition flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    2048x2048
                  </button>
                  <button
                    onClick={() => taiNhanh(1920, 1080)}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-blue-50 hover:border-blue-500 transition flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    1920x1080
                  </button>
                  <button
                    onClick={() => taiNhanh(1080, 1920)}
                    className="px-3 py-2 rounded-lg border text-sm hover:bg-blue-50 hover:border-blue-500 transition flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    1080x1920
                  </button>
                </div>
              </div>

              {/* tùy chỉnh chi tiết */}
              <div className="mt-5 space-y-4">
                <label className="text-sm font-medium text-gray-700">
                  Hoặc tùy chỉnh kích thước theo ý bạn
                </label>
                <div className="grid grid-cols-[110px_1fr] gap-2 items-center">
                  <span>Chiều rộng</span>
                  <input
                    type="number"
                    min="1"
                    value={kichThuocMucTieu.w || ""}
                    onChange={(e) => capNhatChieuRong(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                  <span>Chiều cao</span>
                  <input
                    type="number"
                    min="1"
                    value={kichThuocMucTieu.h || ""}
                    onChange={(e) => capNhatChieuCao(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                {/* Cảnh báo khi phóng to */}
                {(kichThuocMucTieu.w > kichThuocGoc.w || kichThuocMucTieu.h > kichThuocGoc.h) && !choPhepPhongTo && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    ⚠️ Kích thước bạn chọn lớn hơn ảnh gốc. Hãy bật tùy chọn "Cho phép phóng to" bên dưới.
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="giuTyLe"
                    checked={giuTyLe}
                    onChange={() => setGiuTyLe(v => !v)}
                  />
                  <label htmlFor="giuTyLe" className="cursor-pointer">
                    Giữ nguyên tỷ lệ ảnh (khuyến nghị)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="choPhepPhongTo"
                    checked={choPhepPhongTo}
                    onChange={() => setChoPhepPhongTo(v => !v)}
                  />
                  <label htmlFor="choPhepPhongTo" className="cursor-pointer">
                    Cho phép phóng to ảnh
                    <span className="text-xs text-gray-500 block">
                      (Lưu ý: Phóng to có thể làm ảnh bị mờ/vỡ)
                    </span>
                  </label>
                </div>

                <button
                  onClick={xuLyThayDoiKichThuoc}
                  className="w-full mt-4 inline-flex justify-center items-center gap-2 rounded-xl px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Xem kết quả
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ===== BƯỚC 3: KẾT QUẢ ===== */}
        {buoc === "ket-qua" && (
          <div className="text-center">
            <div className="card bg-white rounded-2xl border shadow p-4 w-[320px] h-[380px] mx-auto grid place-items-center">
              {urlKetQua ? (
                <img src={urlKetQua} alt="kết quả" className="max-w-full max-h-56 object-contain" />
              ) : (
                <div className="text-gray-400 grid place-items-center gap-2">
                  <ImageIcon /> Đang xử lý…
                </div>
              )}
              <div className="text-blue-700 mt-3">
                Kích thước mới: {kichThuocKetQua.w}x{kichThuocKetQua.h}
              </div>

              <a
                href={urlKetQua}
                download={tenFileDep || "anh-da-resize.png"}
                className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                <Download size={18} /> Tải ảnh về máy
              </a>
            </div>

            <button
              onClick={() => setBuoc("chinh-sua")}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              <ChevronLeft size={18} /> Quay lại chỉnh sửa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* Hàm tiện ích */
function docAnh(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

function thayDoiKichThuocAnh(img, chieuRongMoi, chieuCaoMoi, loai = "image/png", chatLuong = 0.92) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(chieuRongMoi))
    canvas.height = Math.max(1, Math.round(chieuCaoMoi))
    const ctx = canvas.getContext("2d")
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      resolve({ blob, w: canvas.width, h: canvas.height })
    }, loai, chatLuong)
  })
}
