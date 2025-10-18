// src/pages/Login.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Chrome, Loader2, X } from 'lucide-react'
import { authApi } from '../services/authApi'

// ✅ Sử dụng import.meta.env cho Vite
const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || 'https://localhost:7090').replace(/\/$/, '')
const SPA_ORIGIN = (import.meta.env.VITE_SPA_ORIGIN || window.location.origin).replace(/\/$/, '')

// Component Login hiển thị modal đăng nhập
export default function Login({ onClose }) {
  const navigate = useNavigate()

  // state: loading khi mở popup, me = thông tin user (lấy từ localStorage)
  const [loading, setLoading] = useState(false)
  const [me, setMe] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
  })
  const [error, setError] = useState('')

  // ref: popupRef giữ cửa sổ popup Google, closeTimerRef để check popup đóng
  const popupRef = useRef(null)
  const closeTimerRef = useRef(null)

  // Lắng nghe tín hiệu từ popup (AuthController callback)
  useEffect(() => {
    const onMsg = async (e) => {
      console.log('📨 Message from:', e.origin, e.data)

      const backendOrigin = new URL(BACKEND_ORIGIN).origin
      if (e.origin !== backendOrigin) return
      if (e.data !== 'auth:success') return

      try {
        setLoading(true)
        console.log('🔄 Getting user info...')

        // ✅ Sử dụng authApi thay vì fetch trực tiếp
        const user = await authApi.getMe()
        console.log('✅ User info received:', user)

        setMe(user)
        closeModal()

      } catch (error) {
        console.error('❌ Failed to get user info:', error)
        setError('Không thể lấy thông tin người dùng')
      } finally {
        setLoading(false)
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close()
        popupRef.current = null
        if (closeTimerRef.current) {
          clearInterval(closeTimerRef.current)
          closeTimerRef.current = null
        }
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

  // ✅ Sử dụng authApi.loginWithGoogle thay vì openGooglePopup tự viết
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('🚀 Starting Google OAuth...')

      // Sử dụng authApi để mở popup
      await authApi.loginWithGoogle()
      console.log('✅ OAuth popup completed')

      // Lấy thông tin user từ ClaimsTransformer
      const user = await authApi.getMe()
      console.log('✅ User info received:', user)

      setMe(user)
      closeModal()

    } catch (error) {
      console.error('❌ Login error:', error)
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Sử dụng authApi.logout
  const logout = async () => {
    try {
      await authApi.logout()
      setMe(null)
      closeModal()
    } catch (error) {
      console.error('❌ Logout error:', error)
      setError('Đăng xuất thất bại')
    }
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
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Đăng nhập</h1>
                <p className="text-sm text-slate-600 mt-2 mb-6">
                  Đăng nhập để sử dụng đầy đủ tính năng TrendyFrame
                </p>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Google Login Button */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Chrome className="w-5 h-5" />
                  )}
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập bằng Google'}
                </button>

                {/* Footer */}
                <div className="mt-6">
                  <p className="text-xs text-slate-500">
                    Bằng việc đăng nhập, bạn đồng ý với{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">Điều khoản</a>{' '}
                    và{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="text-sm text-gray-500">Bạn đã đăng nhập</div>
                <div className="space-y-2">
                  <div className="font-medium">{me.name || me.tenHienThi}</div>
                  <div className="text-sm text-gray-600">{me.email}</div>
                  {me.vaiTro && (
                    <div className={`text-xs font-medium ${me.vaiTro === 'admin' ? 'text-purple-600' : 'text-blue-600'
                      }`}>
                      {me.vaiTro === 'admin' ? '👑 Quản trị viên' : me.vaiTro}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={logout}
                    className="flex-1 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
                  >
                    Đăng xuất
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
