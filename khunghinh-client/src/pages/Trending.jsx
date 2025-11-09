import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7090'

function RankBadge({ rank }) {
  const getColor = () => {
    if (rank === 1) return 'bg-yellow-400 text-white'
    if (rank === 2) return 'bg-blue-500 text-white'
    if (rank === 3) return 'bg-orange-500 text-white'
    // ✅ Từ rank 4-10 màu xám
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
        const res = await fetch(`${API_URL}/api/frames/trending?take=10`, {
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
            imageUrl = `${API_URL}${imageUrl}`
          }

          return {
            id: item.id || item.Id,
            rank: item.rank || 0,
            name: item.name || item.tieuDe || item.TieuDe || 'Không có tên',
            alias: item.alias || item.Alias,
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