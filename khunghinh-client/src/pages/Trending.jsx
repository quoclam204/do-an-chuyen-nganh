import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'

// ✅ Đổi từ VITE_API_URL sang VITE_API_ORIGIN
const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')

// ✅ Mapping loại khung
const FRAME_TYPE_LABELS = {
  'su_kien': 'Sự kiện',
  'le_hoi': 'Lễ hội – Ngày đặc biệt',
  'hoat_dong': 'Hoạt động – Cộng đồng',
  'chien_dich': 'Chiến dịch – Cổ vũ',
  'thuong_hieu': 'Thương hiệu – Tổ chức',
  'giai_tri': 'Giải trí – Fandom',
  'sang_tao': 'Chủ đề sáng tạo',
  'khac': 'Khác'
}

function RankBadge({ rank }) {
  const getColor = () => {
    if (rank === 1) return 'bg-yellow-400 text-white'
    if (rank === 2) return 'bg-blue-500 text-white'
    if (rank === 3) return 'bg-orange-500 text-white'
    return 'bg-gray-400 text-white'
  }

  return (
    <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${getColor()} border-4 border-white z-10`}>
      {rank}
    </div>
  )
}

export default function Trending() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    const ac = new AbortController()

    const fetchTrending = async () => {
      try {
        const res = await fetch(`${BACKEND_ORIGIN}/api/frames/trending?take=10`, {
          credentials: 'include',
          signal: ac.signal
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        console.log('✅ Trending API raw data:', data)

        const transformedData = data.map(item => {
          let imageUrl = item.thumb || item.UrlXemTruoc || item.urlXemTruoc
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${BACKEND_ORIGIN}${imageUrl}`
          }

          return {
            id: item.id || item.Id,
            rank: item.rank || 0,
            name: item.name || item.tieuDe || item.TieuDe || 'Không có tên',
            alias: item.alias || item.Alias,
            loai: item.loai || item.Loai || null, // ✅ Thêm loại khung
            thumb: imageUrl,
            overlay: imageUrl,
            totalViews: item.luotXem || item.LuotXem || 0,
            totalDownloads: item.luotTai || item.LuotTai || 0,
            owner: item.owner
          }
        })

        console.log('✅ Transformed data:', transformedData)
        setData(transformedData)
      } catch (e) {
        console.error('❌ Trending error:', e)
        if (e.name !== 'AbortError') {
          setErr(e.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    return () => ac.abort()
  }, [])

  const top1 = data[0]
  const rest = data.slice(1)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="text-4xl">🔥</span>
          <h1 className="text-3xl font-bold text-gray-900">
            Xu hướng
          </h1>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        )}

        {err && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            ❌ {err}
          </div>
        )}

        {!loading && !err && data.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">Chưa có khung hình nào trong 24h</p>
          </div>
        )}

        {/* Top 1 - Large featured */}
        {!loading && !err && top1 && (
          <div className="flex flex-col items-center mb-12">
            {/* Image với rank badge */}
            <div className="relative group cursor-pointer mb-8" onClick={() => nav(`/editor?alias=${top1.alias}`)}>
              <img
                src={top1.thumb}
                alt={top1.name}
                className="w-80 h-80 object-cover rounded-3xl shadow-lg group-hover:shadow-xl transition-all duration-300 bg-gray-50"
                onError={(e) => {
                  console.error('❌ Image load error:', top1.thumb)
                  e.target.src = '/placeholder.png'
                }}
              />
              <RankBadge rank={1} />
            </div>

            {/* Title */}
            <h2
              className="text-xl font-bold text-gray-900 text-center cursor-pointer hover:text-blue-600 transition max-w-md px-4"
              onClick={() => nav(`/editor?alias=${top1.alias}`)}
            >
              {top1.name}
            </h2>

            {/* ✅ Loại khung cho Top 1 - dưới tên */}
            {top1.loai && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 text-sm font-medium border border-indigo-200">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {FRAME_TYPE_LABELS[top1.loai] || top1.loai}
                </span>
              </div>
            )}

            {/* Stats - lượt xem */}
            <div className="mt-3 flex items-center gap-2 text-gray-500">
              <Eye size={18} />
              <span className="font-medium">{top1.totalViews.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Rest - Horizontal cards */}
        {!loading && !err && rest.length > 0 && (
          <div className="space-y-4">
            {rest.map((item, index) => (
              <div key={item.id}>
                <div
                  className="flex items-start gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => nav(`/editor?alias=${item.alias}`)}
                >
                  {/* Left: Image với rank badge */}
                  <div className="relative flex-shrink-0 mb-6">
                    <img
                      src={item.thumb}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-2xl shadow-md group-hover:shadow-lg transition-all duration-300 bg-gray-50"
                      onError={(e) => {
                        console.error('❌ Image load error:', item.thumb)
                        e.target.src = '/placeholder.png'
                      }}
                    />
                    <RankBadge rank={item.rank} />
                  </div>

                  {/* Right: Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                          {item.name}
                        </h3>

                        {/* Stats - lượt xem */}
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Eye size={16} />
                          <span className="font-medium">{item.totalViews.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* ✅ Loại khung cho các khung còn lại - bên phải */}
                      {item.loai && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 text-xs font-medium border border-indigo-200">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {FRAME_TYPE_LABELS[item.loai] || item.loai}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                {index < rest.length - 1 && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}