// src/pages/Admin.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Image as ImageIcon, Settings, BarChart3, FileText, Shield,
  LogOut, Bell, Search, ChevronDown, ChevronRight, MoreVertical, X, Check, Clock, User,
  TrendingUp, Activity, AlertCircle, Eye
} from 'lucide-react'
import { resolveAvatarUrl } from '../utils/avatarUtils'

// Import các tab components
import DashboardTab from '../components/admin/DashboardTab'
import FramesTab from '../components/admin/FramesTab'
import UsersTab from '../components/admin/UsersTab'
// import ReportsTab from '../components/admin/ReportsTab'
// import SettingsTab from '../components/admin/SettingsTab'

/* =========================
   Constants & Helpers
========================= */
const API_BASE = import.meta.env.VITE_API_ORIGIN || 'http://localhost:7090'

const getMeFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
}

const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error)
    throw error
  }
}

/* =========================
   Root Admin Page
========================= */
export default function Admin() {
  const navigate = useNavigate()

  // Auth & User State
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalFrames: 0,
    publicFrames: 0,
    totalUsers: 0,
    reportsOpen: 0,
    recentFrames: []
  })

  // Notifications state  
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Layout state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mdUp, setMdUp] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : true
  )

  // Auth check & Load initial data
  useEffect(() => {
    const initializeAdmin = async () => {
      const user = getMeFromStorage()
      setMe(user)

      const isAdmin = user?.vaiTro === 'admin' || user?.role === 'admin' || user?.email === 'admin@example.com'
      if (!user || !isAdmin) {
        navigate('/')
        return
      }

      // Load dashboard stats
      try {
        const statsData = await apiCall('/admin/stats')
        setStats(statsData)
      } catch (error) {
        console.error('Failed to load admin stats:', error)
      }

      setLoading(false)
    }

    initializeAdmin()
  }, [navigate])

  // Hide footer at /admin
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const prev = footer.style.display
    footer.style.display = 'none'
    return () => { footer.style.display = prev || '' }
  }, [])

  // Responsive breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => setMdUp(e.matches)
    mq.addEventListener?.('change', onChange)
    mq.addListener?.(onChange) // Safari cũ
    return () => {
      mq.removeEventListener?.('change', onChange)
      mq.removeListener?.(onChange)
    }
  }, [])

  // Load notifications - Mock data for now (replace with real API when ready)
  useEffect(() => {
    if (me) {
      loadNotifications()
      // Setup real-time notifications (polling every 30s)
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [me])

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      // Call real API to get notifications
      const data = await apiCall('/admin/notifications')

      if (data && data.notifications) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        // Fallback to empty if no data
        setNotifications([])
        setUnreadCount(0)
      }

    } catch (error) {
      console.error('Failed to load notifications:', error)
      // Set empty on error
      setNotifications([])
      setUnreadCount(0)
    }
  }

  // Notification actions with real API
  const markAsRead = async (notificationId) => {
    try {
      await apiCall(`/admin/notifications/${notificationId}/read`, { method: 'PATCH' })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, daDoc: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await apiCall('/admin/notifications/read-all', { method: 'PATCH' })

      setNotifications(prev => prev.map(n => ({ ...n, daDoc: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Helper functions
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Quản trị viên',
      'moderator': 'Điều hành viên',
      'user': 'Người dùng',
      'nguoi_dung': 'Người dùng',
      'quan_tri': 'Quản trị viên',
      'dieu_hanh': 'Điều hành viên'
    }
    return roleMap[role] || 'Người dùng'
  }

  const formatNotificationTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    if (diffDays < 7) return `${diffDays} ngày trước`

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_frame': return <ImageIcon size={16} className="text-blue-600" />
      case 'user_registered': return <User size={16} className="text-green-600" />
      case 'user_login': return <Activity size={16} className="text-purple-600" />
      case 'frame_reported': return <Shield size={16} className="text-red-600" />
      default: return <Bell size={16} className="text-gray-600" />
    }
  }

  const getGreetingMessage = () => {
    const hour = new Date().getHours()
    const roleDisplay = getRoleDisplayName(me?.vaiTro || me?.role)
    const name = me?.name || me?.ten || me?.TenHienThi || 'Admin'

    let timeGreeting = 'Chào bạn'
    if (hour < 12) timeGreeting = 'Chào buổi sáng'
    else if (hour < 17) timeGreeting = 'Chào buổi chiều'
    else timeGreeting = 'Chào buổi tối'

    return `${timeGreeting}, ${roleDisplay} ${name}!`
  }

  const getGreetingIcon = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '🌅'
    if (hour < 17) return '☀️'
    return '🌙'
  }

  // Layout constants
  const SITE_HEADER = 64
  const GAP = 12
  const SIDEBAR_W_EXPANDED = 288
  const SIDEBAR_W_COLLAPSED = 80
  const TOP = SITE_HEADER + GAP
  const LEFT = GAP
  const CONTENT_PT = SITE_HEADER + GAP

  const sidebarWidth = mdUp ? (sidebarOpen ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED) : 0
  const contentLeftMargin = LEFT + sidebarWidth

  // Tab definitions
  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'frames', name: 'Khung hình', icon: ImageIcon },
    { id: 'users', name: 'Người dùng', icon: Users },
    // { id: 'reports', name: 'Báo cáo', icon: FileText },
    // { id: 'settings', name: 'Cài đặt', icon: Settings },
  ]

  // Loading state
  if (loading || !me) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900">Đang tải bảng điều khiển...</h2>
          <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  // Auth check
  const isAdmin = me?.vaiTro === 'admin' || me?.role === 'admin' || me?.email === 'admin@example.com'
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-red-50 via-white to-red-50">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-6">Chỉ Quản trị viên mới có thể truy cập trang này.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[radial-gradient(60%_40%_at_10%_10%,#e0f2fe_0%,transparent_70%),radial-gradient(60%_40%_at_90%_10%,#dcfce7_0%,transparent_70%)]">

      {/* ===== Sidebar cố định (glass) ===== */}
      <aside
        style={{ top: TOP, bottom: GAP, left: LEFT, width: sidebarWidth }}
        className="fixed z-40 hidden md:block transition-[width] duration-300"
      >
        <div className="h-full rounded-3xl overflow-hidden bg-white/65 backdrop-blur-md ring-1 ring-slate-200/70 shadow-[0_6px_24px_rgba(0,0,0,0.08)] flex flex-col">
          {/* Header logo */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="size-10 grid place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            {sidebarOpen && (
              <div>
                <div className="text-[11px] font-medium text-blue-600/80 uppercase tracking-wide leading-none">Dashboard</div>
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">TrendyFrame</div>
              </div>
            )}
          </div>

          {/* Quick Stats - only show when expanded */}
          {sidebarOpen && (
            <div className="px-4 py-3 border-b border-slate-200/60">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <div className="font-semibold text-blue-700">{stats.totalFrames}</div>
                  <div className="text-blue-600">Khung hình</div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center">
                  <div className="font-semibold text-green-700">{stats.totalUsers}</div>
                  <div className="text-green-600">Người dùng</div>
                </div>
              </div>
              {stats.reportsOpen > 0 && (
                <div className="mt-2 bg-red-50 rounded-lg p-2 text-center">
                  <div className="text-xs font-semibold text-red-700">{stats.reportsOpen} báo cáo chờ xử lý</div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {tabs.map((t) => {
              const Icon = t.icon
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 mb-1.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all
                    ${active
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-600/40'
                      : 'text-slate-700 hover:bg-slate-100/80'}`}
                >
                  <span className={`grid place-items-center size-8 rounded-xl
                    ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={18} />
                  </span>
                  {sidebarOpen && <span className="truncate">{t.name}</span>}
                  {sidebarOpen && active && <ChevronRight className="ml-auto opacity-80" size={16} />}
                </button>
              )
            })}
          </nav>

          {/* User card + thu gọn */}
          <div className="border-t border-slate-200/70 bg-white/75 px-3 py-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-3">
              <img
                src={resolveAvatarUrl(me?.picture || me?.avatar, me?.name || me?.TenHienThi || 'Admin')}
                alt="avatar"
                className="size-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {me?.name || me?.TenHienThi || 'Admin'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{me?.email || 'admin@example.com'}</div>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => setSidebarOpen(s => !s)}
                className="rounded-xl py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                {sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('kh_me')
                  navigate('/')
                }}
                className="rounded-xl py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black"
              >
                <LogOut size={14} className="inline -mt-0.5 mr-1" />
                {sidebarOpen ? 'Đăng xuất' : ''}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Nội dung: chỉ trong phần còn lại ===== */}
      <div
        style={{
          paddingTop: CONTENT_PT,
          paddingRight: GAP,
          paddingLeft: GAP,
          marginLeft: contentLeftMargin,
          maxWidth: `calc(100vw - ${contentLeftMargin + GAP}px)`,
        }}
        className="px-4 sm:px-6 overflow-x-clip"
      >
        {/* Topbar cải tiến */}
        <div className="sticky z-20" style={{ top: TOP }}>
          <div className="rounded-2xl backdrop-blur bg-gradient-to-r from-white/95 via-blue-50/80 to-green-50/80 ring-1 ring-slate-200 shadow-lg">
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
              {/* Left section - Welcome message */}
              <div className="flex items-center gap-4 min-w-0">
                <button
                  className="md:hidden rounded-xl bg-white ring-1 ring-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
                  onClick={() => setSidebarOpen(s => !s)}
                >
                  Menu
                </button>

                <div className="hidden md:block">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{getGreetingIcon()}</span>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {new Date().toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {getGreetingMessage()}
                  </div>
                </div>
              </div>

              {/* Right section - Quick Stats + Notifications */}
              <div className="flex items-center gap-3">
                {/* Quick activity indicators */}
                <div className="hidden xl:flex items-center gap-2 text-xs">
                  {stats.reportsOpen > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-full ring-1 ring-red-200/50 shadow-sm">
                      <AlertCircle size={14} className="animate-pulse" />
                      <span className="font-semibold">{stats.reportsOpen}</span>
                      <span className="hidden lg:inline">báo cáo</span>
                    </div>
                  )}
                  {/* <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-full ring-1 ring-blue-200/50 shadow-sm">
                    <Activity size={14} />
                    <span className="font-semibold">{stats.publicFrames}</span>
                    <span className="hidden lg:inline">đang hoạt động</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-full ring-1 ring-green-200/50 shadow-sm">
                    <Users size={14} />
                    <span className="font-semibold">{stats.totalUsers}</span>
                    <span className="hidden lg:inline">người dùng</span>
                  </div> */}
                </div>

                {/* Notifications dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 size-5 grid place-items-center rounded-full bg-rose-500 text-white text-[11px] font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl ring-1 ring-slate-200 z-50">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Thông báo</h3>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Đánh dấu tất cả
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Notifications list */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <Bell size={24} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Không có thông báo mới</p>
                          </div>
                        ) : (
                          <div className="py-2">
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${notification.daDoc
                                  ? 'border-transparent'
                                  : 'border-blue-500 bg-blue-50/30'
                                  }`}
                                onClick={() => !notification.daDoc && markAsRead(notification.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.loai)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className={`text-sm ${notification.daDoc ? 'text-gray-600' : 'text-gray-900 font-medium'
                                        }`}>
                                        {notification.tieuDe}
                                      </p>
                                      {!notification.daDoc && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {notification.noiDung}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-xs text-gray-400">
                                        {formatNotificationTime(notification.thoiGian)}
                                      </span>
                                      {notification.loai === 'new_frame' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-medium">
                                          <ImageIcon size={10} />
                                          Khung mới
                                        </span>
                                      )}
                                      {notification.loai === 'user_login' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium">
                                          <Activity size={10} />
                                          Đăng nhập
                                        </span>
                                      )}
                                      {notification.loai === 'user_registered' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                                          <User size={10} />
                                          Đăng ký mới
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-200 text-center">
                          <button
                            onClick={() => {
                              setActiveTab('reports')
                              setShowNotifications(false)
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Xem tất cả thông báo
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button className="rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 hover:bg-gray-50 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <main className="py-8 w-full min-w-0">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'frames' && <FramesTab />}
          {activeTab === 'users' && <UsersTab />}
          {/* {activeTab === 'reports' && <ReportsTab />} */}
          {/* {activeTab === 'settings' && <SettingsTab />} */}
        </main>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}