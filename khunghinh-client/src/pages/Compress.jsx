// src/pages/Compress.jsx
import { useRef, useState } from 'react'
import { Download } from 'lucide-react'

/* ===== Helpers ===== */
function fmtBytes(n) {
  if (n === 0) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(n) / Math.log(k))
  return `${(n / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

async function loadBitmap(file) {
  try {
    return await createImageBitmap(file)
  } catch {
    return new Promise((res, rej) => {
      const img = new Image()
      img.onload = () => res(img)
      img.onerror = rej
      img.src = URL.createObjectURL(file)
    })
  }
}

/** Nén ảnh client-side (PNG -> WebP để giảm dung lượng; giữ alpha) */
async function compressImage(file, quality = 0.8, keepType = false) {
  const bmp = await loadBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bmp.width
  canvas.height = bmp.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bmp, 0, 0)

  const t = file.type.toLowerCase()
  let outType = 'image/webp'
  if (keepType) outType = t || 'image/webp'
  else if (t.includes('jpeg') || t.includes('jpg')) outType = 'image/jpeg'

  const dataUrl = canvas.toDataURL(outType, quality)
  const blob = await (await fetch(dataUrl)).blob()
  const name =
    file.name.replace(/\.[^.]+$/, '') +
    (outType.includes('jpeg') ? '.jpg' : outType.includes('png') ? '.png' : '.webp')

  return new File([blob], name, { type: outType })
}

/* ===== UI ===== */
export default function Compress() {
  const inputRef = useRef(null)
  const [items, setItems] = useState([]) // {file, outFile, saving, thumb}

  const onPick = async (files) => {
    const list = Array.from(files || [])
    if (!list.length) return

    const withThumb = list.map(f => ({
      file: f,
      outFile: null,
      saving: true,
      thumb: URL.createObjectURL(f),
    }))
    setItems(prev => [...prev, ...withThumb])

    for (const f of list) {
      try {
        const out = await compressImage(f, 0.85, false)
        setItems(prev => prev.map(it => it.file === f ? { ...it, outFile: out, saving: false } : it))
      } catch (e) {
        console.error(e)
        setItems(prev => prev.map(it => it.file === f ? { ...it, outFile: null, saving: false } : it))
      }
    }
  }

  const onDrop = (e) => { e.preventDefault(); onPick(e.dataTransfer.files) }

  const totalSaved = items.reduce((acc, it) => {
    if (!it.outFile) return acc
    return acc + (it.file.size - it.outFile.size)
  }, 0)

  return (
    // NỀN GRADIENT XANH NHẠT
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Title */}
        <h1 className="text-[42px] md:text-[48px] font-black text-[#0f172a] text-center mb-8">
          Nén hình ảnh
        </h1>

        {/* Upload panel */}
        <div
          className="rounded-3xl bg-white ring-1 ring-slate-200 p-8 md:p-10 mx-auto max-w-4xl
                     shadow-[0_20px_60px_-20px_rgba(0,0,0,.06)]
                     relative overflow-hidden"
          onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files) }}
          onDragOver={(e) => e.preventDefault()}
        >
          {/* caro nền rất nhẹ */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.35] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(0deg, rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative grid place-items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl
     bg-[#2563eb] text-white font-semibold hover:bg-[#1d4ed8]
     shadow-[0_8px_22px_rgba(37,99,235,.35)]"
            >
              Chọn hình
            </button>

            <div className="text-sm text-slate-500">Hỗ trợ định dạng PNG / JPG / WebP</div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onPick(e.target.files)}
              onClick={(e) => { e.target.value = '' }} // cho phép chọn lại cùng file
            />
          </div>
        </div>

        {/* Result summary */}
        <div className="max-w-4xl mx-auto mt-6 flex items-center justify-end">
          <div className="text-emerald-600 font-extrabold text-xl">
            {totalSaved > 0 ? `-${(
              (totalSaved /
                (totalSaved + items.reduce((a, i) => a + (i.outFile?.size || 0), 0))) *
              100
            ).toFixed(1)}%` : '-0%'}
            <span className="ml-2 text-sm font-semibold text-slate-500">
              ({fmtBytes(totalSaved)} đã giảm)
            </span>
          </div>
        </div>

        {/* File list */}
        <div className="max-w-4xl mx-auto mt-4 space-y-3">
          {items.map((it, idx) => {
            const before = it.file.size
            const after = it.outFile?.size ?? before
            const saved = Math.max(0, before - after)
            const pct = before ? Math.round((saved / before) * 100) : 0

            return (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 px-4 py-3"
              >
                {/* thumb */}
                <div className="w-12 h-12 rounded-lg overflow-hidden ring-1 ring-slate-200 shrink-0 bg-slate-50">
                  <img src={it.thumb} alt="" className="w-full h-full object-cover" />
                </div>

                {/* name + sizes */}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800 truncate">
                    {it.outFile?.name || it.file.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {fmtBytes(before)} <span className="mx-1">→</span> {fmtBytes(after)}
                  </div>
                </div>

                {/* badge % giảm */}
                <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-md text-xs font-bold
                                 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  -{pct}%
                </span>

                {/* action */}
                {it.saving ? (
                  <div className="text-sm text-slate-500">Đang nén…</div>
                ) : it.outFile ? (
                  <a
                    href={URL.createObjectURL(it.outFile)}
                    download={it.outFile.name}
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl
             bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8]
             shadow-[0_8px_22px_rgba(37,99,235,.35)]"
                  >
                    <Download size={16} /> Tải về
                  </a>

                ) : (
                  <div className="text-rose-600 text-sm">Lỗi</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
