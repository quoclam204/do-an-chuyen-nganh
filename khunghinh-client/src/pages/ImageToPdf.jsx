import { useRef, useState, useEffect } from "react"
import { Upload, Trash, ArrowUp, ArrowDown, FileDown } from "lucide-react"
import { jsPDF } from "jspdf"

export default function ImageToPdf() {
  const fileRef = useRef(null)
  const [items, setItems] = useState([])  // [{file, url, name}]
  const [pageSize, setPageSize] = useState("a4")          // a4 | letter
  const [orientation, setOrientation] = useState("p")     // p | l
  const [margin, setMargin] = useState(10)                // mm
  const [fitMode, setFitMode] = useState("contain")       // contain | cover
  const [fileName, setFileName] = useState("anh-sang-pdf.pdf")
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)

  const openPicker = () => fileRef.current?.click()

  const onPick = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setLoading(true)
    try {
      const mapped = files.map(f => ({
        file: f,
        url: URL.createObjectURL(f),
        name: f.name
      }))
      setItems(prev => [...prev, ...mapped])
    } finally {
      setLoading(false)
    }
    e.target.value = "" // reset input
  }

  const removeAt = (idx) => {
    setItems(arr => {
      const next = [...arr]
      const it = next[idx]
      // CHỈ revoke khi xóa
      if (it?.url) URL.revokeObjectURL(it.url)
      next.splice(idx, 1)
      return next
    })
  }

  const move = (idx, dir) => {
    setItems(arr => {
      const next = [...arr]
      const j = idx + dir
      if (j < 0 || j >= next.length) return next
      // Swap vị trí KHÔNG revoke URL
      const tmp = next[idx]; next[idx] = next[j]; next[j] = tmp
      return next
    })
  }

  const ensurePdfName = (name) => {
    if (!name || !name.trim()) return "anh-sang-pdf.pdf"
    const n = name.trim()
    return n.toLowerCase().endsWith(".pdf") ? n : `${n}.pdf`
  }

  // ===== Helpers an toàn =====
  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result)
      fr.onerror = reject
      fr.readAsDataURL(file)
    })

  const loadImage = (dataUrl) =>
    new Promise((resolve, reject) => {
      const im = new Image()
      im.onload = () => resolve(im)
      im.onerror = () => reject(new Error("Không đọc được ảnh (có thể là HEIC/HEIF)."))
      im.src = dataUrl
    })

  const renderFittedPng = async (dataUrl, innerWmm, innerHmm, fit = "contain") => {
    const im = await loadImage(dataUrl)

    const scale = 4
    const pxW = Math.max(1, Math.round(innerWmm * scale))
    const pxH = Math.max(1, Math.round(innerHmm * scale))

    const c = document.createElement("canvas")
    c.width = pxW
    c.height = pxH
    const ctx = c.getContext("2d")
    ctx.clearRect(0, 0, pxW, pxH)

    const rw = pxW / im.width
    const rh = pxH / im.height
    let dw, dh, dx, dy

    if (fit === "cover") {
      const r = Math.max(rw, rh)
      dw = im.width * r
      dh = im.height * r
    } else {
      const r = Math.min(rw, rh)
      dw = im.width * r
      dh = im.height * r
    }

    dx = (pxW - dw) / 2
    dy = (pxH - dh) / 2
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(im, dx, dy, dw, dh)

    return c.toDataURL("image/png")
  }

  const onMakePdf = async () => {
    if (!items.length) return
    setBusy(true)
    try {
      const doc = new jsPDF({
        unit: "mm",
        format: pageSize,
        orientation: orientation === "p" ? "portrait" : "landscape",
      })

      const pageW = doc.internal.pageSize.getWidth()
      const pageH = doc.internal.pageSize.getHeight()
      const innerW = Math.max(0, pageW - margin * 2)
      const innerH = Math.max(0, pageH - margin * 2)

      for (let i = 0; i < items.length; i++) {
        if (i > 0) doc.addPage()

        // nền trắng trang
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, pageW, pageH, "F")

        try {
          const dataUrl = await fileToDataURL(items[i].file)
          const pageImage = await renderFittedPng(dataUrl, innerW, innerH, fitMode)
          // chèn ảnh đã fit/crop vào vùng in
          doc.addImage(pageImage, "PNG", margin, margin, innerW, innerH)
        } catch (e) {
          console.error(e)
          alert(`Không thể thêm ảnh "${items[i]?.name}". Có thể định dạng không hỗ trợ (HEIC/HEIF) hoặc ảnh quá lớn.`)
        }
      }

      doc.save(ensurePdfName(fileName))
    } catch (err) {
      console.error(err)
      alert("Tạo PDF thất bại. Vui lòng thử lại hoặc xem Console để biết chi tiết.")
    } finally {
      setBusy(false)
    }
  }

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      items.forEach(it => it.url && URL.revokeObjectURL(it.url))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">Ảnh → PDF</h1>
        <p className="text-center text-gray-600 mt-2">
          Gộp nhiều ảnh thành một file PDF, chọn khổ giấy, lề và cách hiển thị.
        </p>

        {/* Bộ chọn file + đổi tên */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={openPicker}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-blue-400"
          >
            <Upload size={18} /> {loading ? "Đang tải..." : "Chọn ảnh"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Tên file</span>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="border rounded-lg px-3 py-2 w-[260px]"
              placeholder="ten-file.pdf"
            />
          </div>
        </div>

        {/* Danh sách ảnh */}
        {items.length > 0 && (
          <div className="mt-6 grid md:grid-cols-[1fr_360px] gap-8">
            <div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((it, i) => (
                  <li key={i} className="rounded-xl border bg-white shadow p-3">
                    <div className="aspect-[4/3] bg-gray-50 rounded-lg grid place-items-center overflow-hidden">
                      <img src={it.url} alt={it.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="mt-2 text-xs text-gray-600 truncate">{it.name}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => move(i, -1)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border hover:bg-gray-50"
                        title="Lên"
                        disabled={i === 0}
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => move(i, +1)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md border hover:bg-gray-50"
                        title="Xuống"
                        disabled={i === items.length - 1}
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => removeAt(i)}
                        className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-md border hover:bg-red-50 text-red-600"
                        title="Xoá"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tuỳ chọn xuất */}
            <aside className="rounded-2xl border bg-white shadow p-5 h-fit">
              <div className="font-semibold text-lg">Tuỳ chọn PDF</div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <div className="text-gray-700 mb-1">Khổ giấy</div>
                  <select className="border rounded-lg px-3 py-2 w-full" value={pageSize} onChange={e => setPageSize(e.target.value)}>
                    <option value="a4">A4 (210×297mm)</option>
                    <option value="letter">Letter (216×279mm)</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="text-gray-700 mb-1">Chiều giấy</div>
                  <select className="border rounded-lg px-3 py-2 w-full" value={orientation} onChange={e => setOrientation(e.target.value)}>
                    <option value="p">Dọc (Portrait)</option>
                    <option value="l">Ngang (Landscape)</option>
                  </select>
                </label>

                <label className="text-sm">
                  <div className="text-gray-700 mb-1">Lề (mm)</div>
                  <input
                    type="number" min={0} max={50}
                    className="border rounded-lg px-3 py-2 w-full"
                    value={margin}
                    onChange={e => setMargin(Math.max(0, Math.min(50, +e.target.value || 0)))}
                  />
                </label>

                <label className="text-sm">
                  <div className="text-gray-700 mb-1">Cách hiển thị</div>
                  <select className="border rounded-lg px-3 py-2 w-full" value={fitMode} onChange={e => setFitMode(e.target.value)}>
                    <option value="contain">Vừa khung (có viền trắng)</option>
                    <option value="cover">Đầy trang (cắt bớt nếu cần)</option>
                  </select>
                </label>
              </div>

              <button
                onClick={onMakePdf}
                disabled={!items.length || busy}
                className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white ${(!items.length || busy) ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                <FileDown size={18} /> {busy ? "Đang tạo PDF…" : "Tạo & Tải về"}
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
