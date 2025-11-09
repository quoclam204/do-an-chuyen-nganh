// src/pages/Home.jsx
import { Image as ImgIcon, ImageDown, Maximize2, Eye, Clock, User } from 'lucide-react'
import FrameGrid from '../components/FrameGrid'
import FrameCardClassic from '../components/FrameCardClassic'
import { useEffect, useMemo, useState } from 'react'
import { getFrames } from '../utils/frameService'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MotionCard, MotionStagger, fadeUp } from '../components/Anim'
import { Play } from "lucide-react";
import { FileDown } from 'lucide-react'

import { Link } from "react-router-dom";

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')

/* ===== NỀN XANH KIỂU CUBE (nâng cấp) ===== */
function BlueCubesBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* lớp gradient nền mềm hơn */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200" />

      {/* vệt sáng mềm */}
      <div className="absolute -top-24 left-1/4 h-[340px] w-[340px] rounded-full bg-sky-300/30 blur-3xl animate-float" />
      <div className="absolute bottom-[-140px] right-[18%] h-[420px] w-[420px] rounded-full bg-sky-400/25 blur-3xl animate-float-slow" />

      {/* pattern cube */}
      <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 1440 700">
        <defs>
          <linearGradient id="cube" x1="0" x2="1">
            <stop stopColor="#8DD6FF" stopOpacity=".35" />
            <stop offset="1" stopColor="#60A5FA" stopOpacity=".25" />
          </linearGradient>
        </defs>
        {[
          { x: 80, y: 110, w: 80, h: 80, d: 9 },
          { x: 220, y: 240, w: 120, h: 120, d: 11 },
          { x: 420, y: 150, w: 90, h: 90, d: 10 },
          { x: 620, y: 90, w: 70, h: 70, d: 8 },
          { x: 730, y: 260, w: 180, h: 180, d: 13 },
          { x: 980, y: 80, w: 140, h: 140, d: 12 },
          { x: 1160, y: 220, w: 90, h: 90, d: 10 },
          { x: 340, y: 360, w: 70, h: 70, d: 8 },
          { x: 520, y: 410, w: 160, h: 160, d: 12 },
          { x: 840, y: 340, w: 110, h: 110, d: 11 },
        ].map((c, i) => (
          <g key={i}>
            <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="12" fill="url(#cube)" stroke="#fff" strokeOpacity=".35" />
            <path d={`M ${c.x} ${c.y} l ${c.d} -${c.d} h ${c.w} l -${c.d} ${c.d} z`} fill="#ffffff" opacity=".10" />
            <rect x={c.x} y={c.y + c.h} width={c.w} height="6" fill="#60A5FA" opacity=".10" />
          </g>
        ))}
      </svg>
    </div>
  )
}
/* ===== HẾT NỀN ===== */

export default function Home() {
  const [frames, setFrames] = useState([])
  const [trendingFrames, setTrendingFrames] = useState([])
  const nav = useNavigate()

  useEffect(() => {
    getFrames().then(setFrames)

    const fetchTrending = async () => {
      try {
        const res = await fetch(`${BACKEND_ORIGIN}/api/frames/trending?take=4`, {
          credentials: 'include'
        })

        if (res.ok) {
          const data = await res.json()
          console.log('✅ Trending API response:', data)

          const mapped = data.map(item => {
            let imageUrl = item.thumb || item.UrlXemTruoc || item.urlXemTruoc
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `${BACKEND_ORIGIN}${imageUrl}`
            }

            return {
              id: item.id || item.Id,
              alias: item.alias || item.Alias,
              name: item.name || item.tieuDe || item.TieuDe,
              thumb: imageUrl,
              overlay: imageUrl,

              // ✅ Lấy từ backend
              views: item.luotXem || item.LuotXem || 0,
              downloads: item.luotTai || item.LuotTai || 0,
              createdAt: item.ngayDang || item.NgayDang,

              tag: 'Chiến dịch',

              // ✅ Lấy owner từ backend
              author: item.owner?.name || 'MARKETING VEC',
              authorAvatar: item.owner?.avatar
            }
          })

          console.log('✅ Mapped trending data:', mapped)
          setTrendingFrames(mapped)
        }
      } catch (e) {
        console.error('❌ Fetch trending error:', e)
      }
    }

    fetchTrending()
  }, [])

  // Top 4 khung nổi bật
  const featuredFrames = useMemo(() => {
    if (!frames?.length) return []
    const scored = frames.map(f => ({
      ...f,
      _score: (f.used24h || f.views24h || 0) + (f.featured ? 100 : 0),
    }))
    return scored.sort((a, b) => b._score - a._score).slice(0, 4)
  }, [frames])

  // Lọc khung cho campaign A80
  const a80Frames = useMemo(() => {
    if (!frames?.length) return [];
    return frames.filter(f =>
      (f.campaign && String(f.campaign).toLowerCase().includes('a80')) ||
      (Array.isArray(f.tags) && f.tags.some(t => String(t).toLowerCase().includes('a80')))
    ).slice(0, 10);
  }, [frames]);

  const tools = [
    { t: 'Nén ảnh', d: 'Giảm dung lượng ảnh dễ dàng', to: '/compress', icon: <ImageDown className="w-6 h-6" /> },
    { t: 'Thay đổi kích thước', d: 'Resize ảnh theo kích thước mong muốn', to: '/resize', icon: <Maximize2 className="w-6 h-6" /> },
    { t: 'Ảnh → PDF', d: 'Gộp nhiều ảnh thành một PDF', to: '/image-to-pdf', icon: <FileDown className="w-6 h-6" /> },
  ];

  const isNew = (f) => {
    if (typeof f.isNew === 'boolean') return f.isNew;

    const iso =
      f.ngayDang || f.NgayDang || f.ngayTao || f.NgayTao ||
      f.createdAt || f.date;
    if (!iso) return false;

    const created = new Date(iso);
    const hours = (Date.now() - created.getTime()) / 36e5;
    return hours <= 24;
  };

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden min-h-[70vh] flex items-center bg-gradient-to-b from-blue-50 to-white">
        <BlueCubesBackground />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center px-6 py-16">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium ring-1 ring-blue-300/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Nơi khung hình được chia sẻ
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Tạo{' '}
              <span className="relative inline-block px-1">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-500 italic">
                  khung hình
                </span>
                <span className="absolute -bottom-1 left-0 w-full h-2 bg-blue-300/40 rounded-sm" />
              </span>
              <br />
              online – nhanh, đẹp và tiện lợi
            </h1>

            <p className="text-gray-700 text-lg leading-relaxed">
              Cung cấp công cụ trực tuyến giúp bạn tạo khung hình và lan toả thông điệp
              cho chiến dịch, sự kiện hay hoạt động của mình chỉ trong vài phút.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/editor"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
              >
                TẠO NGAY
              </a>
              <a
                href="/trending"
                className="px-6 py-3 rounded-xl font-semibold text-gray-800 ring-1 ring-gray-300 hover:bg-gray-50 transition"
              >
                XU HƯỚNG
              </a>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <img
              src="/frames/khung-home.png"
              alt="Khung hình minh hoạ"
              className="w-full max-w-md md:max-w-lg drop-shadow-xl rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* ============ CAMPAIGN STRIP (A80) ============ */}
      {a80Frames.length > 0 && (
        <section className="relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#0d47a1] via-[#1976d2] to-[#1565c0]" />
          <div aria-hidden className="absolute inset-0 opacity-[.08] [background:radial-gradient(80%_80%_at_20%_10%,#fff,transparent_60%)]" />
          <div className="absolute -top-20 left-1/4 h-[280px] w-[280px] rounded-full bg-sky-300/30 blur-3xl animate-float" />
          <div className="absolute bottom-[-120px] right-[15%] h-[360px] w-[360px] rounded-full bg-sky-400/25 blur-3xl animate-float-slow" />

          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-md">
              KHUNG HÌNH MỚI NHẤT NĂM <span className="opacity-90">2025</span>
            </h2>

            <div className="mt-4 rounded-3xl bg-white/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,.25)] ring-1 ring-blue-200/60 p-4 backdrop-blur">
              <div className="px-3 pb-2">
                <div className="text-[15px] font-semibold text-blue-700">Khung hình Đại hội Đảng</div>
              </div>

              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100 hover:scrollbar-thumb-blue-500">
                <ul className="flex gap-4 min-w-max px-2 pb-2">
                  {a80Frames.map((f, i) => (
                    <li key={f.alias || i} className="shrink-0">
                      <button
                        onClick={() => nav(`/editor?alias=${f.alias}`)}
                        className="block w-[220px] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white shadow-[0_10px_25px_-12px_rgba(0,0,0,.25)] transition-shadow hover:shadow-lg"
                        title={f.name || 'Khung'}
                      >
                        <div className="relative aspect-square bg-white grid place-items-center">
                          <img
                            src={f.overlay || f.thumb}
                            alt={f.name || 'frame'}
                            className="max-w-full max-h-full object-contain select-none [image-rendering:auto] [image-rendering:-webkit-optimize-contrast]"
                            width="512" height="512" decoding="async" loading="lazy"
                          />

                          {isNew(f) && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-md animate-pulse">
                              NEW
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5" />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ TOOLS ============ */}
      <section className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-6">Các công cụ tiện lợi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tools.map((it, i) => (
              <MotionCard i={i} key={it.t}>
                <div className="group rounded-2xl p-6 bg-white/80 ring-1 ring-gray-200 hover:ring-blue-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,.25)] shine hover-lift">
                  <div className="inline-grid place-items-center w-10 h-10 rounded-xl bg-blue-50 ring-1 ring-blue-200/60 text-blue-700">
                    {it.icon}
                  </div>
                  <h3 className="font-semibold mt-3 mb-1">{it.t}</h3>
                  <p className="text-sm text-gray-600">{it.d}</p>

                  <Link
                    to={it.to}
                    className="mt-4 inline-block px-4 py-2 rounded-lg text-blue-700 font-medium ring-1 ring-blue-200 hover:bg-blue-50"
                  >
                    Thử ngay
                  </Link>
                </div>
              </MotionCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED ============ */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-blue-600 font-semibold">Xu hướng</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Các khung hình nổi bật</h2>
            <p className="text-sm text-gray-600 mt-1">
              Danh sách khung hình nhận được nhiều tương tác nhất trong 24 giờ qua.
            </p>
          </motion.div>

          <motion.button
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="px-4 py-2 rounded-xl font-semibold text-gray-800 ring-1 ring-gray-300/70 hover:bg-white hover-lift"
            onClick={() => nav('/trending')}
          >
            Xem thêm
          </motion.button>
        </div>

        {trendingFrames.length > 0 ? (
          <MotionStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingFrames.map((f, idx) => (
              <MotionCard i={idx} key={f.alias} className="h-full">
                <div className="shine-safe hover-lift transform-gpu">
                  <FrameCardClassic
                    frame={{
                      ...f,
                      date: f.createdAt ? formatDate(f.createdAt) : '2 ngày trước',
                    }}
                    rank={idx + 1}
                    theme="blue"
                    onUse={() => nav(`/editor?alias=${f.alias}`)}
                  />
                </div>
              </MotionCard>
            ))}
          </MotionStagger>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Đang tải khung hình xu hướng...
          </div>
        )}
      </section>

      {/* ============ FOLLOW ============ */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#0d47a1] via-[#1976d2] to-[#1565c0]" />
        <div aria-hidden className="absolute inset-0 opacity-[.08] [background:radial-gradient(80%_80%_at_20%_10%,#fff,transparent_60%)]" />
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl animate-float-slow" />

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-md">
            THEO DÕI CHÚNG TÔI ĐỂ NHẬN MẪU MỚI HẰNG NGÀY
          </h2>

          <div className="mt-4 rounded-3xl bg-white/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,.25)] ring-1 ring-blue-200/60 p-6 md:p-8 backdrop-blur">
            <div className="text-center">
              <div className="flex justify-center gap-4 flex-wrap">
                <a
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook Page
                </a>
                <a
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  Facebook Group
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Câu hỏi thường gặp
          </h2>
          <p className="text-gray-600 mt-2">
            Những thắc mắc phổ biến về dịch vụ của chúng tôi
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Tôi có thể tạo bao nhiêu khung hình?',
              a: 'Không giới hạn! Bạn có thể tạo và tải về miễn phí không giới hạn số lượng.'
            },
            {
              q: 'Khung hình có bản quyền không?',
              a: 'Tất cả khung hình do chúng tôi cung cấp đều miễn phí sử dụng cho mục đích cá nhân và phi thương mại.'
            },
            {
              q: 'Tôi có thể đóng góp khung hình không?',
              a: 'Có! Bạn có thể đăng ký tài khoản và đăng tải khung hình của riêng mình để chia sẻ với cộng đồng.'
            },
            {
              q: 'Làm sao để tải ảnh chất lượng cao?',
              a: 'Sau khi chỉnh sửa, click nút "Tải về" để xuất ảnh với độ phân giải 1080x1080 pixels.'
            }
          ].map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl bg-white ring-1 ring-gray-200 hover:ring-blue-300 transition-all"
            >
              <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 flex items-center justify-between">
                {item.q}
                <span className="text-blue-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

// ✅ Helper function format ngày
function formatDate(dateString) {
  if (!dateString) return '2 ngày trước'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`
  return date.toLocaleDateString('vi-VN')
}
