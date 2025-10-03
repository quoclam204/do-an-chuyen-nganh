// src/pages/Login.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

// Lấy domain API / SPA origin từ env (local hoặc deploy)
// Tự chọn giá trị để chạy được cho cả local và deploy.
const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')
const SPA_ORIGIN = (import.meta.env.VITE_SPA_ORIGIN || window.location.origin).replace(/\/$/, '')

// Component Login hiển thị modal đăng nhập
export default function Login({ onClose }) {
  const navigate = useNavigate()

  // state: loading khi mở popup, me = thông tin user (lấy từ localStorage)
  const [loading, setLoading] = useState(false)
  const [me, setMe] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
  })

  // ref: popupRef giữ cửa sổ popup Google, closeTimerRef để check popup đóng
  const popupRef = useRef(null)
  const closeTimerRef = useRef(null)

  // Lắng nghe tín hiệu từ popup (AuthController callback)
  useEffect(() => {
    const onMsg = async (e) => {
      console.log('message from', e.origin, e.data)

      // chỉ xử lý nếu message gửi từ backend và nội dung = "auth:success"
      if (e.origin !== new URL(BACKEND_ORIGIN).origin) return
      if (e.data !== 'auth:success') return

      try {
        // gọi API /api/auth/me để lấy thông tin user
        const res = await fetch(`${BACKEND_ORIGIN}/api/auth/me`, {
          credentials: 'include',
        })
        if (res.ok) {
          const user = await res.json()
          localStorage.setItem('kh_me', JSON.stringify(user)) // lưu user
          setMe(user)             // cập nhật state               
          window.dispatchEvent(new Event('kh_me_changed'))  // thông báo user đã thay đổi
          closeModal()         // đóng modal
        }
      } finally {
        setLoading(false)
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close()
        popupRef.current = null
        if (closeTimerRef.current) { clearInterval(closeTimerRef.current); closeTimerRef.current = null }
      }
    }

    window.addEventListener('message', onMsg)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('message', onMsg)
      document.body.style.overflow = 'auto'
      if (closeTimerRef.current) clearInterval(closeTimerRef.current)
    }
  }, [])

  // Hàm đóng modal: nếu có onClose thì dùng nó, không thì navigate
  const closeModal = () => {
    if (onClose) {
      onClose()
    } else {
      if (window.history.length > 1) navigate(-1)
      else navigate('/')
    }
  }

  // Đóng modal khi bấm ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Mở popup Google OAuth
  const openGooglePopup = () => {
    setLoading(true)
    const w = 520, h = 620
    const y = window.top.outerHeight / 2 + window.top.screenY - h / 2
    const x = window.top.outerWidth / 2 + window.top.screenX - w / 2

    const url = `${BACKEND_ORIGIN}/api/auth/google`
    popupRef.current = window.open(url, 'google_oauth', `width=${w},height=${h},left=${x},top=${y}`)

    if (!popupRef.current || popupRef.current.closed) {
      window.location.href = url
      return
    }

    closeTimerRef.current = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        setLoading(false)
        clearInterval(closeTimerRef.current)
        closeTimerRef.current = null
      }
    }, 500)
  }

  // Hàm logout: gọi API /api/auth/logout, xóa user, đóng modal
  const logout = async () => {
    await fetch(`${BACKEND_ORIGIN}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    localStorage.removeItem('kh_me')
    setMe(null)
    window.dispatchEvent(new Event('kh_me_changed'))
    closeModal()
  }

  // Render modal
  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        onClick={closeModal}
      />

      <div className="absolute left-1/2 -translate-x-1/2 top-16 sm:top-20 md:top-24 w-full max-w-md px-4">
        <div className="relative rounded-2xl bg-white shadow-xl">
          <button
            onClick={closeModal}
            className="absolute right-3 top-3 p-2 rounded-full hover:bg-black/5"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>

          <div className="p-6 pt-10">
            {!me ? (
              <button
                type="button"
                onClick={openGooglePopup}
                disabled={loading}
                className="mx-auto block w-[360px] max-w-full overflow-hidden rounded-md shadow
                           text-white font-medium transition active:scale-[0.99]
                           bg-blue-600 hover:bg-blue-700 disabled:opacity-70"
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-14 h-12 bg-blue-700">
                    <span className="font-bold text-lg leading-none">G</span>
                  </div>
                  <div className="flex-1 text-center text-sm sm:text-base">
                    {loading ? 'Đang mở Google…' : 'Đăng nhập qua Google'}
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-3 text-center">
                <div className="text-sm text-gray-500">Bạn đã đăng nhập</div>
                <div className="font-medium">{me.name}</div>
                <div className="text-sm">{me.email}</div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={logout}
                    className="w-full border rounded py-2 hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`.shadow-xl{box-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1)}`}
      </style>
    </div>
  )
}
