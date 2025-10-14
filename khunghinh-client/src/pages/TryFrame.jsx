// src/pages/TryFrame.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Stage, Layer, Image as KImage, Rect, Group } from 'react-konva'
import useImage from 'use-image'
import Konva from 'konva'
import { getFrameByAlias } from '../utils/frameService'

// Preview box
const BOX = 560

function Overlay({ url, size, filters }) {
  const [img] = useImage(url || '', 'anonymous')
  if (!img) return null
  return (
    <KImage
      image={img}
      x={-size / 2}
      y={-size / 2}
      width={size}
      height={size}
      listening={false}
      filters={[
        ...(filters.blur > 0 ? [Konva.Filters.Blur] : []),
        ...(filters.brightness !== 0 ? [Konva.Filters.Brighten] : []),
        ...(filters.contrast !== 0 ? [Konva.Filters.Contrast] : []),
        ...(filters.saturation !== 0 || filters.hue !== 0 || filters.lightness !== 0
          ? [Konva.Filters.HSL]
          : []),
      ]}
      blurRadius={filters.blur}
      brightness={filters.brightness}
      contrast={filters.contrast}
      hue={filters.hue}
      saturation={filters.saturation}
      lightness={filters.lightness}
      opacity={filters.opacity}
    />
  )
}

export default function TryFrame() {
  const { alias } = useParams()
  const nav = useNavigate()

  const [frame, setFrame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const overlayUrl = useMemo(() => {
    if (!frame?.overlay && !frame?.thumb) return ''

    // Nếu URL từ backend bắt đầu bằng /frames, thêm BACKEND_ORIGIN
    const url = frame.overlay || frame.thumb
    if (url.startsWith('/frames/')) {
      const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')
      return `${BACKEND_ORIGIN}${url}`
    }
    return url
  }, [frame])

  // Hiệu ứng
  const [effects, setEffects] = useState({
    blur: 0,             // 0..20
    brightness: 0,       // -1..1
    contrast: 0,         // -100..100 (Konva dùng -100..100)
    saturation: 0,       // -2..2
    hue: 0,              // -180..180
    lightness: 0,        // -1..1
    opacity: 1,          // 0..1
    tint: '#ffffff',     // phủ màu
    tintAlpha: 0,        // 0..1
    blend: 'multiply',   // chế độ hòa trộn
    scale: 1,            // phóng khung
    rotation: 0,         // xoay khung
  })

  const stageRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getFrameByAlias(alias)
      .then(result => {
        if (result) {
          setFrame(result)
        } else {
          setError('Không tìm thấy khung hình')
        }
      })
      .catch(err => {
        console.error('Error loading frame:', err)
        setError('Lỗi khi tải khung hình')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [alias])

  const downloadPNG = () => {
    const node = stageRef.current
    if (!node) return
    const data = node.toDataURL({ pixelRatio: 2, mimeType: 'image/png' })
    const a = document.createElement('a')
    a.href = data
    a.download = `${alias}-overlay-edited.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-center">
          <div className="text-slate-600">Đang tải khung…</div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !frame) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="text-rose-600 font-semibold mb-3">
            {error || 'Không tìm thấy khung hình'}
          </div>
          <button
            onClick={() => nav('/trending')}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >
            Về trang Xu hướng
          </button>
        </div>
      </div>
    )
  }

  // No overlay URL
  if (!overlayUrl) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="text-rose-600 font-semibold mb-3">Không tìm thấy ảnh khung.</div>
          <button
            onClick={() => nav('/trending')}
            className="px-4 py-2 rounded-lg border hover:bg-slate-50"
          >
            Về trang Xu hướng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Canvas preview */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-3">{frame.name || 'Thử khung'}</h1>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex justify-center">
              <Stage ref={stageRef} width={BOX} height={BOX} className="rounded-md">
                <Layer>
                  {/* Nền caro để thấy vùng trong suốt */}
                  <Group x={0} y={0} listening={false}>
                    <Rect
                      x={0}
                      y={0}
                      width={BOX}
                      height={BOX}
                      fillPatternImage={(() => {
                        const c = document.createElement('canvas')
                        c.width = 24
                        c.height = 24
                        const ct = c.getContext('2d')
                        ct.fillStyle = '#f3f4f6'
                        ct.fillRect(0, 0, 24, 24)
                        ct.fillStyle = '#e5e7eb'
                        ct.fillRect(0, 0, 12, 12)
                        ct.fillRect(12, 12, 12, 12)
                        return c
                      })()}
                    />
                  </Group>

                  <Group
                    x={BOX / 2}
                    y={BOX / 2}
                    scaleX={effects.scale}
                    scaleY={effects.scale}
                    rotation={effects.rotation}
                  >
                    {/* Khung với filters */}
                    <Overlay url={overlayUrl} size={BOX} filters={effects} />

                    {/* Lớp phủ màu (tint) với blend mode */}
                    {effects.tintAlpha > 0 && (
                      <Rect
                        x={-BOX / 2}
                        y={-BOX / 2}
                        width={BOX}
                        height={BOX}
                        fill={effects.tint}
                        opacity={effects.tintAlpha}
                        globalCompositeOperation={effects.blend}
                        listening={false}
                      />
                    )}
                  </Group>
                </Layer>
              </Stage>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => nav(`/editor?alias=${alias}`)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                Dùng khung này
              </button>
              <button
                onClick={downloadPNG}
                className="px-4 py-2 rounded-xl border font-semibold hover:bg-slate-50"
              >
                Tải PNG khung đã chỉnh
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full lg:w-[380px]">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="font-bold mb-3">Hiệu ứng cho khung</h2>

            <div className="space-y-4 text-sm">
              <label className="block">
                <span className="font-medium">Độ mờ (Opacity): {Math.round(effects.opacity * 100)}%</span>
                <input
                  type="range"
                  min="0" max="1" step="0.01"
                  value={effects.opacity}
                  onChange={(e) => setEffects(v => ({ ...v, opacity: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <label className="block">
                <span className="font-medium">Làm mờ (Blur): {effects.blur}px</span>
                <input
                  type="range" min="0" max="20" step="1"
                  value={effects.blur}
                  onChange={(e) => setEffects(v => ({ ...v, blur: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <label className="block">
                <span className="font-medium">Sáng (Brightness): {effects.brightness.toFixed(2)}</span>
                <input
                  type="range" min="-1" max="1" step="0.01"
                  value={effects.brightness}
                  onChange={(e) => setEffects(v => ({ ...v, brightness: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <label className="block">
                <span className="font-medium">Tương phản (Contrast): {effects.contrast}</span>
                <input
                  type="range" min="-100" max="100" step="1"
                  value={effects.contrast}
                  onChange={(e) => setEffects(v => ({ ...v, contrast: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <label className="block">
                <span className="font-medium">Bão hòa (Saturation): {effects.saturation.toFixed(2)}</span>
                <input
                  type="range" min="-2" max="2" step="0.01"
                  value={effects.saturation}
                  onChange={(e) => setEffects(v => ({ ...v, saturation: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <label className="block">
                <span className="font-medium">Hue: {effects.hue}°</span>
                <input
                  type="range" min="-180" max="180" step="1"
                  value={effects.hue}
                  onChange={(e) => setEffects(v => ({ ...v, hue: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <label className="block">
                <span className="font-medium">Lightness: {effects.lightness.toFixed(2)}</span>
                <input
                  type="range" min="-1" max="1" step="0.01"
                  value={effects.lightness}
                  onChange={(e) => setEffects(v => ({ ...v, lightness: +e.target.value }))}
                  className="w-full slider"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-medium">Phủ màu (Tint)</span>
                  <input
                    type="color"
                    value={effects.tint}
                    onChange={(e) => setEffects(v => ({ ...v, tint: e.target.value }))}
                    className="w-full h-9 rounded-md border p-0"
                  />
                </label>
                <label className="block">
                  <span className="font-medium">Độ phủ: {Math.round(effects.tintAlpha * 100)}%</span>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={effects.tintAlpha}
                    onChange={(e) => setEffects(v => ({ ...v, tintAlpha: +e.target.value }))}
                    className="w-full slider"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-medium">Blend mode</span>
                <select
                  value={effects.blend}
                  onChange={(e) => setEffects(v => ({ ...v, blend: e.target.value }))}
                  className="mt-1 w-full rounded-md border px-2 py-2"
                >
                  <option value="multiply">multiply</option>
                  <option value="screen">screen</option>
                  <option value="overlay">overlay</option>
                  <option value="soft-light">soft-light</option>
                  <option value="hard-light">hard-light</option>
                  <option value="normal">normal</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-medium">Scale: {effects.scale.toFixed(2)}x</span>
                  <input
                    type="range" min="0.6" max="1.6" step="0.01"
                    value={effects.scale}
                    onChange={(e) => setEffects(v => ({ ...v, scale: +e.target.value }))}
                    className="w-full slider"
                  />
                </label>
                <label className="block">
                  <span className="font-medium">Rotate: {effects.rotation}°</span>
                  <input
                    type="range" min="-180" max="180" step="1"
                    value={effects.rotation}
                    onChange={(e) => setEffects(v => ({ ...v, rotation: +e.target.value }))}
                    className="w-full slider"
                  />
                </label>
              </div>

              <button
                onClick={() => setEffects({
                  blur: 0, brightness: 0, contrast: 0, saturation: 0, hue: 0,
                  lightness: 0, opacity: 1, tint: '#ffffff', tintAlpha: 0,
                  blend: 'multiply', scale: 1, rotation: 0
                })}
                className="mt-2 w-full px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 font-medium"
              >
                Reset hiệu ứng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
