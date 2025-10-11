// src/pages/Home.jsx
import { Image as ImgIcon, ImageDown, Maximize2 } from 'lucide-react'
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
  const nav = useNavigate()

  useEffect(() => {
    getFrames().then(setFrames)
  }, [])

  // Top 4 khung nổi bật (ưu tiên used24h)
  const featuredFrames = useMemo(() => {
    if (!frames?.length) return []
    const scored = frames.map(f => ({
      ...f,
      _score: (f.used24h || f.views24h || 0) + (f.featured ? 100 : 0),
    }))
    return scored.sort((a, b) => b._score - a._score).slice(0, 4)
  }, [frames])

  // Lọc khung cho campaign A80 (đổi điều kiện theo dữ liệu của bạn)
  const a80Frames = useMemo(() => {
    if (!frames?.length) return [];
    return frames.filter(f =>
      (f.campaign && String(f.campaign).toLowerCase().includes('a80')) ||
      (Array.isArray(f.tags) && f.tags.some(t => String(t).toLowerCase().includes('a80')))
    ).slice(0, 20);
  }, [frames]);

  const tools = [
    { t: 'Nén ảnh', d: 'Giảm dung lượng ảnh dễ dàng', to: '/compress', icon: <ImageDown className="w-6 h-6" /> },
    { t: 'Thay đổi kích thước', d: 'Resize ảnh theo kích thước mong muốn', to: '/resize', icon: <Maximize2 className="w-6 h-6" /> },
    { t: 'Ảnh → PDF', d: 'Gộp nhiều ảnh thành một PDF', to: '/image-to-pdf', icon: <FileDown className="w-6 h-6" /> },
  ];



  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[75vh] flex items-center">
        <BlueCubesBackground />

        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6 py-12">
          {/* Cột trái */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium ring-1 ring-blue-200/60 shadow-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Nơi khung hình được chia sẻ
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              Tạo{' '}
              <span className="relative inline-block px-1">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 italic">
                  khung hình
                </span>
                {/* gạch nhấn */}
                <span className="absolute -bottom-1 left-0 w-full h-3 bg-blue-300/50 rounded-sm -z-0" />
                <span className="absolute -left-3 -top-2 h-3 w-3 border-t-4 border-l-4 border-blue-600/90 rounded-sm" />
                <span className="absolute -right-3 -top-2 h-3 w-3 border-t-4 border-r-4 border-blue-600/90 rounded-sm" />
              </span>
              <br />
              online – nhanh, đẹp và tiện lợi
            </h1>

            <p className="mt-4 text-gray-700 text-lg">
              Cung cấp các công cụ để tạo khung hình và lan toả thông điệp cho chiến dịch, sự kiện, hoạt động… đến mọi người.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/editor"
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 active:translate-y-[1px] shadow-lg shadow-blue-600/20 ring-1 ring-blue-700/50 btn-breathe"
              >
                TẠO NGAY
              </a>
              <a
                href="/trending"
                className="px-6 py-3 rounded-xl font-semibold text-gray-800 ring-1 ring-gray-300/70 hover:bg-white transition"
              >
                XU HƯỚNG
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ============ CAMPAIGN STRIP (A80) ============ */}
      {a80Frames.length > 0 && (
        <section className="relative overflow-hidden">
          {/* Nền xanh gradient + trang trí */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#0d47a1] via-[#1976d2] to-[#1565c0]" />
          <div aria-hidden className="absolute inset-0 opacity-[.08] [background:radial-gradient(80%_80%_at_20%_10%,#fff,transparent_60%)]" />
          <div className="absolute -top-20 left-1/4 h-[280px] w-[280px] rounded-full bg-sky-300/30 blur-3xl animate-float" />
          <div className="absolute bottom-[-120px] right-[15%] h-[360px] w-[360px] rounded-full bg-sky-400/25 blur-3xl animate-float-slow" />

          <div className="relative max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-white text-2xl md:text-3xl font-extrabold tracking-wide drop-shadow-md">
              KHUNG HÌNH MỚI NHẤT NĂM <span className="opacity-90">2025</span>
            </h2>

            {/* Container carousel */}
            <div className="mt-4 rounded-3xl bg-white/90 shadow-[0_10px_40px_-10px_rgba(0,0,0,.25)] ring-1 ring-blue-200/60 p-4 backdrop-blur">
              <div className="px-3 pb-2">
                <div className="text-[15px] font-semibold text-blue-700">Khung hình Đại hội Đảng</div>
              </div>

              <div className="overflow-x-auto no-scrollbar thin-scrollbar">
                <ul className="flex gap-4 min-w-max px-2 pb-2">
                  {a80Frames.map((f, i) => (
                    <li key={f.alias || i} className="shrink-0">
                      <button
                        onClick={() => nav(`/editor?alias=${f.alias}`)} // hoặc nav(`/${f.alias}`) nếu dùng route alias ngắn
                        className="block w-[220px] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white
                     shadow-[0_10px_25px_-12px_rgba(0,0,0,.25)] transition-shadow hover:shadow-lg"
                        title={f.name || 'Khung'}
                      >
                        {/* Ô xem trước: VUÔNG, nền trắng để nhìn thấy vùng trong suốt của PNG */}
                        <div className="relative aspect-square bg-white grid place-items-center">
                          <img
                            src={f.overlay || f.thumb}
                            alt={f.name || 'frame'}
                            className="max-w-full max-h-full object-contain select-none
                         [image-rendering:auto] [image-rendering:-webkit-optimize-contrast]"
                            width="512" height="512"      // hint kích thước giúp nội suy ảnh nét hơn
                            decoding="async"
                            loading="lazy"
                          />
                          <div className="pointer-events-none absolute inset-0 ring-1 ring-black/5" />
                        </div>
                        {/* BỎ phần text/info bên dưới */}
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
        {/* radial background rất nhẹ để tách section */}
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

        <MotionStagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredFrames.map((f, idx) => (
            <MotionCard i={idx} key={f.alias} className="h-full">
              {/* KHÔNG dùng .shine cũ, dùng .shine-safe và KHÔNG đặt overflow-hidden ở đây */}
              <div className="shine-safe hover-lift transform-gpu">
                <FrameCardClassic
                  frame={{
                    ...f,
                    tag: f.tag || 'Chiến dịch',
                    author: f.author || 'MARKETING VEC',
                    date: f.date || '2 ngày trước',
                  }}
                  rank={idx + 1}
                  theme="blue"
                  onUse={() => nav(`/editor?alias=${f.alias}`)}
                />
              </div>
            </MotionCard>
          ))}
        </MotionStagger>

      </section>

      {/* ============ TEMPLATES ============ */}
      <section className="relative overflow-hidden">
        {/* Nền xanh gradient A80 */}
        <div
          aria-hidden
          className="absolute inset-0 
               bg-gradient-to-b from-[#0d47a1] via-[#1976d2] to-[#1565c0]"
        />

        {/* Glow radial nhẹ */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[.08]
               [background:radial-gradient(80%_80%_at_20%_10%,#fff,transparent_60%)]"
        />

        {/* Floating blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl animate-float-slow" />

        {/* Nội dung */}
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.35)]">
              Trang web tham khảo thiết kế
            </h2>
          </div>

          {/* Danh sách website - nền trắng giữ nguyên */}
          <div className="rounded-3xl p-10 bg-white ring-1 ring-gray-200 shadow-lg flex flex-col items-center justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 justify-items-center items-center w-full max-w-3xl">
              {[
                {
                  logo: "/logo-webthamkhao/logo-kh-text.svg",
                  url: "https://khunghinh.net",
                },
                {
                  logo: "/logo-webthamkhao/image.png",
                  url: "https://263.id.vn",
                },
              ].map((site) => (
                <a
                  key={site.url}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-52 h-24 md:w-60 md:h-28 transition-transform hover:scale-110 duration-300"
                >
                  <img
                    src={site.logo}
                    alt={site.url}
                    className="max-w-full max-h-full object-contain"
                    style={{ imageRendering: "crisp-edges" }}
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>

        </div>

      </section>



      {/* ============ FOLLOW ============ */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="rounded-2xl p-6 text-center bg-white/80 ring-1 ring-gray-200 shadow-[0_10px_40px_-12px_rgba(0,0,0,.08)]">
          <div className="text-gray-700 font-semibold mb-2">Theo dõi chúng tôi để nhận mẫu mới hằng ngày</div>
          <div className="flex justify-center gap-3">
            <a className="px-4 py-2 rounded-xl font-medium text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50" href="#">
              Facebook Page
            </a>
            <a className="px-4 py-2 rounded-xl font-medium text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50" href="#">
              Facebook Group
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
