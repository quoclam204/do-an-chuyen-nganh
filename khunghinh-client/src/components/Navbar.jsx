import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, User, Image, LogOut, RefreshCw } from 'lucide-react'
import Login from '../pages/Login'
import { authApi } from '../services/authApi'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [me, setMe] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false) // ✅ Thêm loading state
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // đọc user từ localStorage
  const readMe = () => {
    try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
  }

  // ✅ Verify và refresh thông tin user với API
  const refreshUserInfo = async () => {
    try {
      setRefreshing(true)
      const user = await authApi.getMe()
      setMe(user)
      console.log('✅ User info refreshed:', user)
    } catch (error) {
      console.error('❌ Failed to refresh user info:', error)
      // Xóa thông tin cũ nếu không thể verify
      setMe(null)
      localStorage.removeItem('kh_me')
    } finally {
      setRefreshing(false)
    }
  }

  // ✅ Mount: Đọc localStorage trước, sau đó verify với API
  useEffect(() => {
    const localUser = readMe()
    setMe(localUser)

    // Nếu có user trong localStorage, verify với server
    if (localUser) {
      refreshUserInfo()
    }
  }, [])

  // đổi route → đồng bộ me từ localStorage (nhanh)
  useEffect(() => {
    const localUser = readMe()
    if (JSON.stringify(localUser) !== JSON.stringify(me)) {
      setMe(localUser)
    }
  }, [location.pathname])

  // lắng nghe thay đổi từ Login.jsx (custom event) & từ tab khác (storage)
  useEffect(() => {
    const sync = () => {
      const localUser = readMe()
      setMe(localUser)
      console.log('🔄 User synced from event:', localUser)
    }

    window.addEventListener('kh_me_changed', sync)
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('kh_me_changed', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  // hiệu ứng scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // đóng menu khi đổi route
  useEffect(() => {
    setOpen(false)
    setDropdownOpen(false)
  }, [location.pathname])

  // 🔍 DEBUG: Kiểm tra dữ liệu user
  useEffect(() => {
    console.log('=== DEBUG USER DATA ===')
    console.log('localStorage:', readMe())
    console.log('me state:', me)
    console.log('vaiTro:', me?.vaiTro)
    console.log('email:', me?.email)

    const isAdmin = me?.vaiTro === "admin" // ✅ Dựa trên ClaimsTransformer từ API
    console.log('isAdmin:', isAdmin)
  }, [me])

  // khóa cuộn khi mở menu
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // auto đóng khi resize lên desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // ✅ Logout với API thực
  const handleLogout = async () => {
    try {
      await authApi.logout() // Gọi API logout
      setMe(null)
      setDropdownOpen(false)
      navigate('/')
      console.log('✅ Logout successful')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Vẫn clear local data dù API có lỗi
      setMe(null)
      setDropdownOpen(false)
      navigate('/')
    }
  }

  const name = me?.name || me?.tenHienThi || 'User'

  // ✅ Logic phân quyền dựa trên ClaimsTransformer
  const isAdmin = me?.vaiTro === "admin"
  const isLoggedIn = !!me

  const avatarUrl =
    me?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=96`

  return (
    <>
      <header
        className={[
          'fixed top-0 inset-x-0 z-50',
          'transition-all duration-300',
          'bg-white/30',
          'supports-[backdrop-filter]:bg-white/20 supports-[backdrop-filter]:backdrop-blur-xl',
          scrolled ? 'shadow-md' : 'shadow-none'
        ].join(' ')}
      >
        <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 select-none" aria-label="Khung Hình">
            <img src="/frames/logo.png" alt="Logo Khung Hình" className="h-14 w-14 object-contain" />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-8 text-gray-800 font-medium">
            {/* Luôn hiện */}
            <NavLink to="/tools" className="hover:text-blue-600 transition">Công cụ</NavLink>
            <NavLink to="/trending" className="hover:text-blue-600 transition">Xu hướng</NavLink>

            {/* Chỉ hiện khi đã đăng nhập */}
            {isLoggedIn && (
              <NavLink to="/create-frame" className="hover:text-blue-600 transition">Tạo khung</NavLink>
            )}

            {/* Chỉ hiện khi là admin (từ ClaimsTransformer) */}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="hover:text-purple-700 transition text-purple-600 font-semibold flex items-center gap-1"
              >
                👑 Quản trị
              </NavLink>
            )}

            {/* Nút đăng nhập hoặc dropdown user */}
            {!isLoggedIn ? (
              <button
                onClick={() => setLoginModalOpen(true)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Đăng nhập
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100/50 transition"
                >
                  <img
                    src={avatarUrl}
                    alt={`Avatar của ${name}`}
                    className="w-10 h-10 rounded-full border object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/frames/icon/default-avatar.png'
                    }}
                  />
                  {/* ✅ Loading indicator khi refresh */}
                  {refreshing ? (
                    <RefreshCw size={16} className="text-blue-600 animate-spin" />
                  ) : (
                    <ChevronDown
                      size={16}
                      className={`text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* Tam giác nhỏ */}
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>

                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{name}</div>
                      <div className="text-sm text-gray-500">{me?.email}</div>
                      {/* ✅ Hiển thị role từ ClaimsTransformer */}
                      {me?.vaiTro && (
                        <div className={`text-xs font-medium mt-1 ${me.vaiTro === 'admin' ? 'text-purple-600' : 'text-blue-600'
                          }`}>
                          {me.vaiTro === 'admin' ? '👑 Quản trị viên' : `📝 ${me.vaiTro}`}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} />
                      <span>Tài khoản</span>
                    </Link>

                    <Link
                      to="/my-frames"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Image size={16} />
                      <span>Khung hình của tôi</span>
                    </Link>

                    {/* ✅ Admin link trong dropdown nếu là admin */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-purple-600 hover:bg-purple-50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="text-sm">👑</span>
                        <span>Trang quản trị</span>
                      </Link>
                    )}

                    {/* ✅ Refresh button */}
                    <button
                      onClick={async () => {
                        setDropdownOpen(false)
                        await refreshUserInfo()
                      }}
                      disabled={refreshing}
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition w-full text-left disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                      <span>Làm mới thông tin</span>
                    </button>

                    <hr className="my-2" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Nút mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-200/60 transition"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Menu Mobile */}
        {open && (
          <div
            id="mobile-menu"
            className="md:hidden px-6 pb-5 pt-2 space-y-4 bg-white/95 supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:backdrop-blur-md border-t border-gray-200"
          >
            {/* Luôn hiển thị */}
            <NavLink onClick={() => setOpen(false)} to="/tools" className="block text-gray-800 py-2">
              Công cụ
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/trending" className="block text-gray-800 py-2">
              Xu hướng
            </NavLink>

            {/* Chỉ hiển thị khi đăng nhập */}
            {isLoggedIn && (
              <NavLink onClick={() => setOpen(false)} to="/create-frame" className="block text-gray-800 py-2">
                Tạo khung
              </NavLink>
            )}

            {/* Chỉ hiển thị khi là admin */}
            {isAdmin && (
              <NavLink onClick={() => setOpen(false)} to="/admin" className="block text-purple-600 font-semibold py-2">
                👑 Quản trị
              </NavLink>
            )}

            {!isLoggedIn ? (
              <button
                onClick={() => {
                  setOpen(false)
                  setLoginModalOpen(true)
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg inline-block"
              >
                Đăng nhập
              </button>
            ) : (
              <div className="space-y-3 pt-3">
                {/* ✅ User info với role */}
                <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                  <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full border object-cover" referrerPolicy="no-referrer" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{name}</div>
                    <div className="text-sm text-gray-500 truncate">{me?.email}</div>
                    {me?.vaiTro && (
                      <div className={`text-xs font-medium ${me.vaiTro === 'admin' ? 'text-purple-600' : 'text-blue-600'
                        }`}>
                        {me.vaiTro === 'admin' ? '👑 Quản trị viên' : me.vaiTro}
                      </div>
                    )}
                  </div>
                  {/* ✅ Refresh button mobile */}
                  <button
                    onClick={refreshUserInfo}
                    disabled={refreshing}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </div>

                <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 text-gray-700 py-2">
                  <User size={16} />
                  <span>Tài khoản</span>
                </Link>

                <Link to="/my-frames" onClick={() => setOpen(false)} className="flex items-center gap-3 text-gray-700 py-2">
                  <Image size={16} />
                  <span>Khung hình của tôi</span>
                </Link>

                <button onClick={handleLogout} className="flex items-center gap-3 text-red-600 py-2 w-full text-left">
                  <LogOut size={16} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="h-[64px]" />

      {/* Login Modal */}
      {loginModalOpen && (
        <Login onClose={() => setLoginModalOpen(false)} />
      )}
    </>
  )
}
