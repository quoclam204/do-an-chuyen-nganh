// src/pages/Admin.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Image as ImageIcon, Settings, BarChart3, FileText, Shield,
  LogOut, Bell, Search, ChevronDown, ChevronRight, MoreVertical
} from 'lucide-react'

// Import các tab components
import DashboardTab from '../components/admin/DashboardTab'
import FramesTab from '../components/admin/FramesTab'
import UsersTab from '../components/admin/UsersTab'
import ReportsTab from '../components/admin/ReportsTab'
import SettingsTab from '../components/admin/SettingsTab'

/* =========================
   Helpers
========================= */
const getMeFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
}

/* =========================
   Root Admin Page
========================= */
export default function Admin() {
  const navigate = useNavigate()

  // Auth
  const [me, setMe] = useState(null)
  useEffect(() => {
    const user = getMeFromStorage()
    setMe(user)
    const isAdmin = user?.vaiTro === 'admin' || user?.role === 'admin' || user?.email === 'admin@example.com'
    if (!user || !isAdmin) navigate('/')
  }, [navigate])

  // Hide footer at /admin
  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return
    const prev = footer.style.display
    footer.style.display = 'none'
    return () => { footer.style.display = prev || '' }
  }, [])

  // Layout constants
  const SITE_HEADER = 64           // header ngoài trang
  const GAP = 12                   // khoảng cách viền
  const SIDEBAR_W_EXPANDED = 288   // 18rem
  const SIDEBAR_W_COLLAPSED = 80   // 5rem
  const TOP = SITE_HEADER + GAP
  const LEFT = GAP
  const CONTENT_PT = SITE_HEADER + GAP

  // Sidebar state + breakpoint md
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mdUp, setMdUp] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches
      : true
  )
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

  // Tính khoảng chừa bên trái cho nội dung
  const sidebarWidth = mdUp ? (sidebarOpen ? SIDEBAR_W_EXPANDED : SIDEBAR_W_COLLAPSED) : 0
  const contentLeftMargin = LEFT + sidebarWidth

  // Tabs
  const [activeTab, setActiveTab] = useState('dashboard')
  const tabs = [
    { id: 'dashboard', name: 'Tổng quan', icon: LayoutDashboard },
    { id: 'frames', name: 'Khung hình', icon: ImageIcon },
    { id: 'users', name: 'Người dùng', icon: Users },
    { id: 'reports', name: 'Báo cáo', icon: FileText },
    { id: 'settings', name: 'Cài đặt', icon: Settings },
  ]

  if (!me) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Đang kiểm tra quyền truy cập...</h2>
        </div>
      </div>
    )
  }
  const isAdmin = me?.vaiTro === 'admin' || me?.role === 'admin' || me?.email === 'admin@example.com'
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400" />
          <h2 className="mt-2 text-lg font-semibold text-gray-900">Bạn không có quyền truy cập</h2>
          <p className="text-sm text-gray-500">Chỉ Admin mới có thể truy cập trang quản trị.</p>
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
            <div className="size-10 grid place-items-center rounded-2xl bg-blue-600 text-white shadow-md">
              <BarChart3 size={20} />
            </div>
            {sidebarOpen && (
              <div>
                <div className="text-[12px] text-slate-500 leading-none">Admin</div>
                <div className="text-lg font-extrabold tracking-tight text-slate-900">TrendyFrame</div>
              </div>
            )}
          </div>

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
                src={me?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(me?.name || 'Admin')}&background=0D8ABC&color=fff&size=128&bold=true`}
                alt="avatar"
                className="size-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{me?.name || 'Admin'}</div>
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
                <LogOut size={14} className="inline -mt-0.5 mr-1" /> Đăng xuất
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
        {/* Topbar gọn nhẹ */}
        <div className="sticky z-20" style={{ top: TOP }}>
          <div className="rounded-2xl backdrop-blur bg-white/85 ring-1 ring-slate-200 shadow-sm">
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  className="md:hidden rounded-xl bg-white ring-1 ring-slate-200 px-3 py-1.5 text-sm font-medium"
                  onClick={() => setSidebarOpen(s => !s)}
                >
                  Menu
                </button>
                <div className="hidden md:flex items-center gap-2 rounded-2xl ring-1 ring-slate-200 bg-white px-3 py-1.5">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input className="outline-none text-sm w-[22rem]" placeholder="Tìm kiếm nhanh..." />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="relative rounded-xl ring-1 ring-slate-200 bg-white px-3 py-1.5">
                  <Bell size={18} />
                  <span className="absolute -top-1 -right-1 size-4 grid place-items-center rounded-full bg-rose-500 text-white text-[10px]">3</span>
                </button>
                <button className="rounded-xl ring-1 ring-slate-200 bg-white px-3 py-1.5">
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
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
    </div>
  )
}