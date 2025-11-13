// src/pages/Editor.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getFrameByAlias } from '../utils/frameService'
import useImage from 'use-image'
import { Stage, Layer, Image as KImage, Rect, Group, Text as KText, Circle } from 'react-konva'
import NotFound from '../components/NotFound'

// ✅ Thêm BACKEND_ORIGIN
const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')

const EXPORT_SIZE = 1080
const PREVIEW_MAX = 500
const PREVIEW_MIN = 300
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const nearly = (a, b, eps = 2) => Math.abs(a - b) <= eps

// luôn dùng anonymous để cho phép canvas export nếu server trả CORS đúng
const corsMode = () => 'anonymous'

/* ================= Helpers ================= */
function CenterImage({ url, scale, rotation, flipX, dragBound }) {
  const [img] = useImage(url || '', corsMode())
  if (!img) return null
  return (
    <KImage
      image={img}
      x={0}
      y={0}
      offsetX={img.width / 2}
      offsetY={img.height / 2}
      draggable
      dragBoundFunc={dragBound}
      scaleX={scale * (flipX ? -1 : 1)}
      scaleY={scale}
      rotation={rotation}
    />
  )
}

function Overlay({ url, size }) {
  const [img] = useImage(url || '', corsMode())
  return img ? (
    <KImage image={img} x={-size / 2} y={-size / 2} width={size} height={size} listening={false} />
  ) : null
}

/* Hộp kéo-thả upload (dropzone) */
function Dropzone({ onPick, className = '' }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const openPicker = () => inputRef.current?.click()
  const onFiles = (files) => {
    const f = files?.[0]
    if (f) onPick(f)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openPicker()}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files) }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      className={[
        'w-full h-32 sm:h-36 rounded-xl border-2 border-dashed grid place-items-center',
        'transition-colors select-none cursor-pointer',
        dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-white',
        className,
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          className="mx-auto mb-2 h-7 w-7 text-slate-700" fill="currentColor">
          <path d="M7 18a5 5 0 0 1-.75-9.94 6 6 0 0 1 11.5 1.63A4 4 0 1 1 18 18H7Zm6-7v4a1 1 0 1 1-2 0v-4H9.5a1 1 0 0 1-.7-1.7l2.5-2.5a1 1 0 0 1 1.4 0l2.5 2.5a1 1 0 0 1-.7 1.7H13Z" />
        </svg>
        <div className="text-slate-900 font-semibold text-sm">
          Kéo thả hoặc <span className="text-indigo-600">Bấm vào đây</span>
        </div>
        <div className="text-slate-500 text-sm">để đăng tải hình ảnh</div>
      </div>
    </div>
  )
}

/* ================= Page ================= */
export default function Editor() {
  const navigate = useNavigate()
  const { alias: aliasFromPath } = useParams()
  const [params] = useSearchParams()

  // Nếu người dùng vào /editor?alias=abc → redirect sang /abc (URL đẹp)
  useEffect(() => {
    const q = params.get('alias')
    if (!aliasFromPath && q) {
      navigate(`/${q}`, { replace: true })
    }
  }, [aliasFromPath, params, navigate])

  // Alias sử dụng trong Editor (mặc định nếu đang ở /editor không có alias)
  const alias = aliasFromPath || 'quockhanh'

  const [frame, setFrame] = useState(null)
  const [frameError, setFrameError] = useState('')
  const [frameLoading, setFrameLoading] = useState(true) // ✅ Thêm loading state

  const [userUrl, setUserUrl] = useState('')

  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipX, setFlipX] = useState(false)
  const [maskCircle, setMaskCircle] = useState(false)

  // Văn bản
  const [textMode, setTextMode] = useState(false)
  const [text, setText] = useState('Tự hào Việt Nam')
  const [textSize, setTextSize] = useState(28)
  const [textColor, setTextColor] = useState('#0f172a')
  const [textFont, setTextFont] = useState('Arial')
  const [textStyle, setTextStyle] = useState('normal') // ✅ Thêm kiểu chữ
  const [textWeight, setTextWeight] = useState('normal') // ✅ Thêm độ đậm

  // ✅ Danh sách font chữ phong phú hơn
  const fontOptions = [
    // Sans-serif
    { value: 'Arial', label: 'Arial', category: 'Sans-serif' },
    { value: 'Helvetica', label: 'Helvetica', category: 'Sans-serif' },
    { value: 'Verdana', label: 'Verdana', category: 'Sans-serif' },
    { value: 'Tahoma', label: 'Tahoma', category: 'Sans-serif' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS', category: 'Sans-serif' },
    { value: 'Calibri', label: 'Calibri', category: 'Sans-serif' },

    // Serif
    { value: 'Times New Roman', label: 'Times New Roman', category: 'Serif' },
    { value: 'Georgia', label: 'Georgia', category: 'Serif' },
    { value: 'Palatino', label: 'Palatino', category: 'Serif' },
    { value: 'Garamond', label: 'Garamond', category: 'Serif' },
    { value: 'Bookman', label: 'Bookman', category: 'Serif' },

    // Monospace
    { value: 'Courier New', label: 'Courier New', category: 'Monospace' },
    { value: 'Lucida Console', label: 'Lucida Console', category: 'Monospace' },
    { value: 'Monaco', label: 'Monaco', category: 'Monospace' },
    { value: 'Consolas', label: 'Consolas', category: 'Monospace' },

    // Display
    { value: 'Comic Sans MS', label: 'Comic Sans MS', category: 'Display' },
    { value: 'Impact', label: 'Impact', category: 'Display' },
    { value: 'Brush Script MT', label: 'Brush Script MT', category: 'Display' },
    { value: 'Copperplate', label: 'Copperplate', category: 'Display' },
  ]

  // trạng thái sẵn sàng export
  const [ready, setReady] = useState(false)
  const [lastObjectUrl, setLastObjectUrl] = useState(null)

  // Preview size
  const [viewSize, setViewSize] = useState(PREVIEW_MAX)
  const boxRef = useRef(null)
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const w = boxRef.current?.clientWidth || (PREVIEW_MAX + 40)
      const s = Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, Math.floor(w - 40)))
      setViewSize(s)
    })
    if (boxRef.current) ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [])

  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      // Ẩn thông báo sau 1.5s
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error(e);
      alert('Không thể sao chép liên kết.');
    }
  };

  // lấy khung theo alias
  useEffect(() => {
    let alive = true
    setFrame(null)
    setFrameError('')
    setFrameLoading(true)

    // Gọi API: -> chạy hàm GetByAlias(backend)
    getFrameByAlias(alias)
      .then((f) => {
        if (alive) {
          setFrame(f || null)
          if (!f) {
            setFrameError('Không tìm thấy khung cho alias này.')
          }
          setFrameLoading(false)

          // ✅ Gọi API tăng lượt xem SAU KHI có frame
          if (f?.id) {
            fetch(`${BACKEND_ORIGIN}/api/Frames/view/${f.id}`, {
              method: 'POST',
              credentials: 'include'
            })
              .then(res => res.json())
              .then(data => {
                console.log('✅ View counted:', data)
                // ✅ Backend trả về camelCase
                if (data.luotXem !== undefined) {
                  setFrame(prev => prev ? { ...prev, clicks: data.luotXem } : prev)
                }
              })
              .catch(err => console.error('❌ View count failed:', err))
          }
        }
      })
      .catch(() => {
        if (alive) {
          setFrameError('Không tải được khung (overlay).')
          setFrameLoading(false)
        }
      })

    return () => { alive = false }
  }, [alias])

  // update tiêu đề trang theo alias
  useEffect(() => {
    const old = document.title
    document.title = `Editor – ${alias}`
    return () => { document.title = old }
  }, [alias])

  // Reset state khi đổi alias
  useEffect(() => {
    setUserUrl('')
    setScale(1)
    setRotation(0)
    setFlipX(false)
    setTextMode(false)
    setMaskCircle(false)
  }, [alias])

  const overlayUrl = useMemo(() => frame?.overlay || frame?.thumb || null, [frame])

  const stageRef = useRef(null)
  const fileInputRef = useRef(null)
  const shareRef = useRef(null)
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${alias}` : ''

  // sẵn sàng khi có ảnh người dùng và overlay đã xác định
  useEffect(() => {
    setReady(!!userUrl && !!overlayUrl)
  }, [userUrl, overlayUrl])

  // cursor + wheel zoom (chỉ bật khi có ảnh)
  const setStageCursor = (cur) => {
    const c = stageRef.current?.container()
    if (c) c.style.cursor = cur
  }
  const wheelTimerRef = useRef(null)
  const handleWheel = (e) => {
    if (!userUrl) return
    e.evt.preventDefault()
    const out = e.evt.deltaY > 0
    setStageCursor(out ? 'zoom-out' : 'zoom-in')
    clearTimeout(wheelTimerRef.current)
    wheelTimerRef.current = setTimeout(
      () => setStageCursor(textMode ? 'text' : 'grab'), 120
    )
    const factor = out ? 0.95 : 1.05
    setScale((s) => clamp(s * factor, 0.2, 3))
  }

  // phím tắt tiện dụng
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === '[') setRotation((r) => r - 5)
      if (e.key === ']') setRotation((r) => r + 5)
      if (e.key === '+' || e.key === '=') setScale((s) => clamp(+(s + 0.05).toFixed(3), 0.2, 3))
      if (e.key === '-' || e.key === '_') setScale((s) => clamp(+(s - 0.05).toFixed(3), 0.2, 3))
      if (e.key.toLowerCase() === 'r') resetAll()
      if (e.key.toLowerCase() === 'f') setFlipX((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // snap rotation về 0° nếu gần
  useEffect(() => {
    if (nearly(rotation % 360, 0)) {
      if (!nearly(rotation, 0)) setRotation(0)
    }
  }, [rotation])

  // tính drag-bound để ảnh không bị kéo mất khỏi viewport
  const dragBound = (pos) => {
    const limit = viewSize * 0.6
    return { x: clamp(pos.x, -limit, limit), y: clamp(pos.y, -limit, limit) }
  }

  const downloadPNG = async () => {
    const node = stageRef.current
    if (!node) return

    const pixelRatio = EXPORT_SIZE / viewSize

    try {
      const dataURL = node.toDataURL({ pixelRatio, mimeType: 'image/png', quality: 1 })

      // ✅ Chuyển dataURL sang Blob
      const response = await fetch(dataURL)
      const blob = await response.blob()

      // ✅ Dùng showSaveFilePicker (Chrome 86+)
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: `${alias}.png`,
            types: [{
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] }
            }]
          })

          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()

          // ✅ Chỉ tăng lượt tải SAU KHI file đã lưu thành công
          if (frame?.id) {
            const res = await fetch(`${BACKEND_ORIGIN}/api/Frames/download/${frame.id}`, {
              method: 'POST',
              credentials: 'include'
            })
            const data = await res.json()
            console.log('✅ Download counted:', data)

            if (data.luotTai !== undefined) {
              setFrame(prev => prev ? { ...prev, uses: data.luotTai } : prev)
            }
          }

        } catch (err) {
          // Người dùng nhấn Cancel
          console.log('❌ User cancelled download')
          return
        }
      } else {
        // ⚠️ Fallback cho browser cũ: dùng <a> download (không detect cancel)
        const a = document.createElement('a')
        a.href = dataURL
        a.download = `${alias}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()

        // Tăng lượt tải với delay
        setTimeout(async () => {
          if (frame?.id) {
            const res = await fetch(`${BACKEND_ORIGIN}/api/Frames/download/${frame.id}`, {
              method: 'POST',
              credentials: 'include'
            })
            const data = await res.json()
            if (data.luotTai !== undefined) {
              setFrame(prev => prev ? { ...prev, uses: data.luotTai } : prev)
            }
          }
        }, 500)
      }

    } catch (err) {
      console.error('Save failed:', err)
      alert('Không thể tải ảnh.')
    }
  }

  const resetAll = () => { setScale(1); setRotation(0); setFlipX(false); setTextMode(false) }
  const hasImage = !!userUrl

  const pickFile = (file) => {
    if (!file) return
    const nextUrl = URL.createObjectURL(file)
    if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl)
    setLastObjectUrl(nextUrl)
    setUserUrl(nextUrl)
  }

  // thu hồi khi unmount
  useEffect(() => {
    return () => { if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl) }
  }, [lastObjectUrl])

  // Thêm hàm formatTimeAgo (nếu chưa có)
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Mới đăng';

    const now = new Date();
    const createdDate = new Date(dateString);
    const diffMs = now.getTime() - createdDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays === 0) {
      if (diffHours > 0) return `${diffHours} giờ trước`;
      if (diffMinutes > 0) return `${diffMinutes} phút trước`;
      return diffSeconds > 0 ? `${diffSeconds} giây trước` : 'Vừa tạo';
    }

    if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    }

    const day = createdDate.getDate().toString().padStart(2, '0');
    const month = (createdDate.getMonth() + 1).toString().padStart(2, '0');
    const year = createdDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ✅ Hiển thị loading
  if (frameLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Đang tải khung...</p>
        </div>
      </div>
    )
  }

  // ✅ Hiển thị 404 khi không tìm thấy khung
  if (frameError && !frame) {
    return (
      <NotFound
        message={`Không tìm thấy khung với alias "${alias}". Khung có thể đã bị xóa hoặc không tồn tại.`}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* TIÊU ĐỀ KHUNG HÌNH THEO KHUNG ĐÃ TẠO*/}
      <h1 className="text-3xl font-extrabold text-center mb-3">
        {frame?.name || alias}
      </h1>

      {/* ✅ HIỂN THỊ LƯỢT XEM VÀ LƯỢT TẢI - Kiểu badge đẹp hơn */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full px-3 py-1.5 border border-blue-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-bold text-sm">{frame?.clicks || 0}</span>
          <span className="text-xs">lượt xem</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1.5 border border-green-200">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="font-bold text-sm">{frame?.uses || 0}</span>
          <span className="text-xs">lượt tải</span>
        </div>
      </div>

      {/* KHUNG NÉT ĐỨT CHÍNH */}
      <div
        ref={boxRef}
        className="max-w-[560px] mx-auto border-2 border-dashed border-gray-300 rounded-xl p-4 bg-white"
      >
        {/* Preview */}
        <div className="flex justify-center">
          <Stage
            key={alias}
            ref={stageRef}
            width={viewSize}
            height={viewSize}
            className="rounded-md"
            onMouseEnter={() => setStageCursor(hasImage ? (textMode ? 'text' : 'grab') : 'default')}
            onMouseLeave={() => setStageCursor('default')}
            onMouseDown={(e) => {
              if (!hasImage) return
              if (e.target?.draggable?.() || e.target?.attrs?.draggable) setStageCursor('grabbing')
            }}
            onMouseUp={() => setStageCursor(hasImage ? (textMode ? 'text' : 'grab') : 'default')}
            onDragStart={() => hasImage && setStageCursor('grabbing')}
            onDragEnd={() => setStageCursor(hasImage ? (textMode ? 'text' : 'grab') : 'default')}
            onWheel={handleWheel}
          >
            <Layer>
              {!hasImage && (
                <Rect x={0} y={0} width={viewSize} height={viewSize} fill="#f3f4f6" />
              )}

              {/* Nhóm nội dung ở giữa khung */}
              <Group x={viewSize / 2} y={viewSize / 2}>
                {/* Mask tròn (tùy chọn) */}
                {maskCircle ? (
                  <>
                    <Group clipFunc={(ctx) => {
                      ctx.arc(0, 0, viewSize / 2, 0, Math.PI * 2, false)
                    }}>
                      {hasImage && (
                        <CenterImage url={userUrl} scale={scale} rotation={rotation} flipX={flipX} dragBound={dragBound} />
                      )}
                    </Group>
                    {/* Viền tròn nhẹ để người dùng thấy mask */}
                    <Circle x={0} y={0} radius={viewSize / 2} stroke="#e5e7eb" strokeWidth={1} />
                  </>
                ) : (
                  hasImage && (
                    <CenterImage url={userUrl} scale={scale} rotation={rotation} flipX={flipX} dragBound={dragBound} />
                  )
                )}

                {/* ✅ Overlay trước văn bản */}
                {overlayUrl && <Overlay url={overlayUrl} size={viewSize} />}

                {/* ✅ Văn bản SAU overlay để hiển thị trên cùng */}
                {textMode && hasImage && (
                  <KText
                    text={text}
                    fontSize={textSize}
                    fill={textColor}
                    fontFamily={textFont}
                    fontStyle={textStyle}
                    fontVariant={textWeight === 'bold' ? 'bold' : 'normal'}
                    x={0}
                    y={-viewSize * 0.18}
                    align="center"
                    width={viewSize}
                    offsetX={viewSize / 2}
                    draggable
                  />
                )}
              </Group>
            </Layer>
          </Stage>
        </div>

        {/* THÔNG BÁO nếu thiếu overlay */}
        {frameError && (
          <p className="mt-3 text-center text-sm text-amber-700 bg-amber-50 rounded-md px-3 py-2">
            {frameError}
          </p>
        )}

        {/* CHƯA CÓ ẢNH → Dropzone to */}
        {!hasImage && (
          <div className="mt-4">
            <Dropzone onPick={pickFile} />
          </div>
        )}

        {/* ĐÃ CÓ ẢNH → Controls + NÚT ĐỔI HÌNH */}
        {hasImage && (
          <>
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFlipX((v) => !v)}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm flex items-center gap-2"
                >
                  <img src="/icon/fliptheimage.png" alt="Lật hình" className="w-4 h-4" />
                  <span>Lật hình</span>
                </button>

                <button
                  onClick={() => setTextMode((v) => !v)}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 ${textMode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                >
                  <img src="/icon/text.png" alt="Văn bản" className="w-4 h-4" />
                  <span>Văn bản</span>
                </button>

                <button
                  onClick={() => setMaskCircle((v) => !v)}
                  className={`px-3 py-1.5 rounded-md text-sm ${maskCircle
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  title="Bật/Tắt mask tròn"
                >
                  Mặt nạ tròn
                </button>
              </div>

              <button
                onClick={resetAll}
                className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-sm flex items-center gap-2"
              >
                <img src="/icon/reset.png" alt="Reset" className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* sliders */}
            <div className="mt-3 grid gap-3 text-sm">
              {/* Zoom slider */}
              <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
                <button
                  onClick={() => setScale((s) => clamp(+(s - 0.05).toFixed(3), 0.2, 3))}
                  className="h-8 w-8 rounded-md border bg-white hover:bg-slate-50 flex items-center justify-center"
                  title="Thu nhỏ"
                >
                  <img src="/icon/tru.png" alt="Thu nhỏ" className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="0.2"
                  max="3"
                  step="0.01"
                  value={scale}
                  onChange={(e) => setScale(+e.target.value)}
                  className="slider-soft"
                  style={{ '--percent': `${((scale - 0.2) / (3 - 0.2)) * 100}%` }}
                />

                <button
                  onClick={() => setScale((s) => clamp(+(s + 0.05).toFixed(3), 0.2, 3))}
                  className="h-8 w-8 rounded-md border bg-white hover:bg-slate-50 flex items-center justify-center"
                  title="Phóng to"
                >
                  <img src="/icon/cong.png" alt="Phóng to" className="w-4 h-4" />
                </button>
              </div>

              {/* Rotation slider */}
              <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
                <button
                  onClick={() => setRotation((r) => r - 5)}
                  className="h-8 w-8 rounded-md border bg-white hover:bg-slate-50"
                  title="Xoay trái"
                >
                  ↶
                </button>

                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(+e.target.value)}
                  className="slider-soft"
                  style={{ '--percent': `${((rotation - (-180)) / (180 - (-180))) * 100}%` }}
                />

                <button
                  onClick={() => setRotation((r) => r + 5)}
                  className="h-8 w-8 rounded-md border bg-white hover:bg-slate-50"
                  title="Xoay phải"
                >
                  ↷
                </button>
              </div>
            </div>

            {/* hàng nút dưới */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) pickFile(f)
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 font-medium text-sm flex items-center gap-2"
                >
                  <img src="/icon/image.png" alt="Đổi hình" className="w-4 h-4" />
                  <span>Đổi hình</span>
                </button>
              </div>

              <button
                onClick={downloadPNG}
                disabled={!ready}
                aria-disabled={!ready}
                className={`px-3.5 py-1.5 rounded-md text-sm flex items-center gap-2 border transition-colors
                ${ready
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                    : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                title={ready ? 'Xuất ảnh PNG' : 'Hãy chờ ảnh/khung sẵn sàng'}
              >
                <img src="/icon/download2.png" alt="Tải về" className={`w-4 h-4 ${ready ? '' : 'opacity-60'}`} />
                <span className="font-bold">Tải về</span>
              </button>
            </div>

            {textMode && (
              <div className="mt-4 space-y-3">
                {/* ✅ Input văn bản */}
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Nhập nội dung văn bản..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />

                {/* ✅ Font chữ */}
                <select
                  value={textFont}
                  onChange={(e) => setTextFont(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  style={{ fontFamily: textFont }}
                >
                  {fontOptions.map((font) => (
                    <option
                      key={font.value}
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label} ({font.category})
                    </option>
                  ))}
                </select>

                {/* ✅ Size + Kiểu chữ (Bold/Italic) */}
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="number"
                    min={14}
                    max={72}
                    value={textSize}
                    onChange={(e) => setTextSize(+e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                    placeholder="Cỡ chữ"
                  />

                  <button
                    onClick={() => setTextWeight(w => w === 'bold' ? 'normal' : 'bold')}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition-all ${textWeight === 'bold'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-gray-300 hover:border-indigo-400'
                      }`}
                    title="Chữ đậm"
                  >
                    B
                  </button>

                  <button
                    onClick={() => setTextStyle(s => s === 'italic' ? 'normal' : 'italic')}
                    className={`rounded-lg border px-3 py-2.5 text-sm italic transition-all ${textStyle === 'italic'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-gray-300 hover:border-indigo-400'
                      }`}
                    title="Chữ nghiêng"
                  >
                    I
                  </button>
                </div>

                {/* ✅ Color Picker */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <label className="text-sm font-medium text-gray-700 min-w-fit">
                    Màu chữ
                  </label>

                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-10 w-16 rounded-md border border-gray-300 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Thông tin người tạo khung */}
      {frame?.owner && (
        <div className="mt-8 mb-6 flex flex-col items-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-sm w-full">
            <div className="flex flex-col items-center text-center">
              <img
                src={frame.owner.avatar || '/icon/default-avatar.png'}
                alt={frame.owner.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 mb-3 shadow-sm"
              />
              <div className="font-bold text-lg text-slate-900 mb-2">
                {frame.owner.name}
              </div>
              {frame.ngayTao && (
                <div className="flex items-center text-gray-500 text-sm bg-gray-50 rounded-full px-3 py-1.5">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                  </svg>
                  {formatTimeAgo(frame.ngayTao)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHẦN CHIA SẺ */}
      <div ref={shareRef} className="mt-6 flex flex-col items-center">

        <div className="mt-4 w-full max-w-[520px] rounded-xl border border-dashed border-gray-300 p-3">
          <div className="text-gray-600 font-medium mb-2 text-sm">Chia sẻ</div>

          <div className="relative">
            {/* Ô hiển thị link – bấm vào là copy */}
            <input
              readOnly
              value={shareUrl}
              onClick={copyLink}
              className="w-full rounded-md border border-indigo-200 bg-indigo-50/40 px-3 py-2 pr-20 outline-none text-sm cursor-pointer"
              title="Bấm để sao chép liên kết"
            />

            {/* Nút copy */}
            <button
              onClick={copyLink}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-indigo-600 text-white text-xs hover:bg-indigo-700"
              title="Sao chép"
            >
              ⧉
            </button>

            {/* Thông báo đã sao chép */}
            <div
              aria-live="polite"
              className={`absolute right-12 top-1/2 -translate-y-1/2 text-xs
          transition-opacity duration-200
          ${copied ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5 shadow-sm">
                Đã sao chép ✓
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <img
              alt="qr"
              width="120"
              height="120"
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                shareUrl
              )}`}
              className="rounded-md"
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const url = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
                    shareUrl
                  )}`;
                  try {
                    const res = await fetch(url);
                    const blob = await res.blob();
                    const blobUrl = URL.createObjectURL(blob);

                    // 👉 dùng alias nếu có, mặc định "qr"
                    const fileName = alias ? `qr-${alias}.png` : "qr.png";

                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(blobUrl);
                  } catch (err) {
                    alert("Không tải được mã QR");
                    console.error(err);
                  }
                }}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                Tải mã QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
