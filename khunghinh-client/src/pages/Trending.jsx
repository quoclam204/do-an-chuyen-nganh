import { useEffect, useState } from 'react'
import { getTrending } from '../utils/frameService'
import { useNavigate } from 'react-router-dom'

function RankBadge({ rank, size = 'md' }) {
  const base = size === 'lg'
    ? 'absolute -bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 text-xl'
    : 'absolute -bottom-3 left-2 w-8 h-8 text-sm'
  const color =
    rank === 1 ? 'bg-yellow-400 text-white'
      : rank === 2 ? 'bg-blue-500 text-white'
        : rank === 3 ? 'bg-orange-500 text-white'
          : 'bg-gray-300 text-gray-700'
  return (
    <div className={`${base} rounded-full flex items-center justify-center font-bold shadow ${color}`}>
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
    getTrending({ take: 40, signal: ac.signal })
      .then(res => {
        console.log('✅ Trending data:', res)
        setData(res)
      })
      .catch(e => {
        console.error('❌ Trending error:', e)
        if (e.name !== 'AbortError') setErr(e.message)
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const top = data[0]
  const rest = data.slice(1)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 mb-10">
        <span className="text-2xl">🔥</span>
        <h1 className="text-3xl font-bold">Xu hướng 24h</h1>
      </div>

      {loading && <div className="text-center py-12">⏳ Đang tải...</div>}
      {err && <div className="text-red-600 text-sm bg-red-50 p-4 rounded">{err}</div>}

      {!loading && !err && (
        <div className="text-xs text-gray-400 mb-4">
          📊 Tìm thấy {data.length} khung hình
        </div>
      )}

      {!loading && !err && data.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          Chưa có khung hình nào có lượt xem/tải trong 24h
        </div>
      )}

      {!loading && !err && top && (
        <div className="mb-12 flex flex-col items-center">
          <div className="relative">
            <img
              src={top.thumb || top.overlay}
              alt={top.name}
              className="w-72 h-72 object-cover rounded-2xl shadow-lg cursor-pointer"
              onClick={() => nav(`/editor?alias=${top.alias}`)}
            />
            <RankBadge rank={top.rank} size="lg" />
          </div>
          <h2
            className="mt-8 text-xl font-semibold text-center cursor-pointer hover:text-indigo-600 transition"
            onClick={() => nav(`/editor?alias=${top.alias}`)}
          >
            {top.name}
          </h2>
          <div className="mt-3 text-sm text-gray-500 flex items-center gap-4">
            <span>👁 {top.views24h}</span>
            <span>⬇ {top.downloads24h}</span>
            <span>{top.percent}%</span>
          </div>
        </div>
      )}

      {!loading && !err && rest.length > 0 && (
        <div className="space-y-8">
          {rest.map(item => (
            <div key={item.id} className="flex gap-5 pb-8 border-b last:border-b-0">
              <div className="relative shrink-0">
                <img
                  src={item.thumb || item.overlay}
                  alt={item.name}
                  className="w-28 h-28 rounded-xl object-cover shadow cursor-pointer hover:scale-[1.02] transition"
                  onClick={() => nav(`/editor?alias=${item.alias}`)}
                />
                <RankBadge rank={item.rank} />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <h3
                  className="font-medium mb-2 line-clamp-2 cursor-pointer hover:text-indigo-600"
                  onClick={() => nav(`/editor?alias=${item.alias}`)}
                >
                  {item.name}
                </h3>
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-4">
                  <span>👁 {item.views24h}</span>
                  <span>⬇ {item.downloads24h}</span>
                  <span>{item.percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
