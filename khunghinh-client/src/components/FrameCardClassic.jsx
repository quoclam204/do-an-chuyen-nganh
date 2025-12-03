// src/components/FrameCardClassic.jsx
import { useNavigate } from "react-router-dom";
import { resolveAvatarUrl } from '../utils/avatarUtils';
import { Eye, ImageDown, Clock } from "lucide-react"

export default function FrameCardClassic({ frame }) {
  const nav = useNavigate()

  const isNew = () => {
    if (typeof frame.isNew === "boolean") return frame.isNew
    const iso = frame.ngayTao || frame.NgayTao || frame.createdAt || frame.date
    if (!iso) return false
    const created = new Date(iso)
    const hours = (Date.now() - created.getTime()) / 36e5
    return hours <= 24
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Mới đăng"

    const now = new Date()
    const createdDate = new Date(dateString)

    if (isNaN(createdDate.getTime())) return "Mới đăng"

    const diffMs = now.getTime() - createdDate.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays === 0) {
      if (diffHours > 0) return `${diffHours} giờ trước`
      if (diffMinutes > 0) return `${diffMinutes} phút trước`
      return diffSeconds > 0 ? `${diffSeconds} giây trước` : "Vừa tạo"
    }

    if (diffDays <= 7) return `${diffDays} ngày trước`

    const day = createdDate.getDate().toString().padStart(2, "0")
    const month = (createdDate.getMonth() + 1).toString().padStart(2, "0")
    const year = createdDate.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div className="shine-safe hover-lift transform-gpu">
      <div className="bg-white rounded-2xl overflow-hidden ring-1 ring-gray-200 hover:ring-blue-300 transition-all shadow-sm hover:shadow-lg">
        {/* Hình ảnh khung */}
        <button
          onClick={() => nav(`/editor?alias=${frame.alias}`)}
          className="relative w-full aspect-square bg-gray-50 overflow-hidden group"
        >
          <img
            src={frame.thumb || frame.overlay}
            alt={frame.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isNew() && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-md animate-pulse">
              NEW
            </div>
          )}
        </button>

        {/* Thông tin khung */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
            {frame.name}
          </h3>

          {/* ✅ THÊM: Thông tin người tạo */}
          {frame.owner && (
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
              <img
                src={resolveAvatarUrl(frame.owner.avatar, frame.owner.name)}
                alt={frame.owner.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">
                  {frame.owner.name}
                </div>
                {frame.ngayTao && (
                  <div className="flex items-center text-gray-500 text-xs mt-0.5">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(frame.ngayTao)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Thống kê */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-semibold">{frame.views || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <ImageDown className="w-4 h-4" />
              <span className="font-semibold">{frame.downloads || 0}</span>
            </div>
          </div>

          {/* Nút sử dụng */}
          <button
            onClick={() => nav(`/editor?alias=${frame.alias}`)}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Sử dụng ngay
          </button>
        </div>
      </div>
    </div>
  )
}
