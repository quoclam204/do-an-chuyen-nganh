// src/pages/Admin.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Image as ImageIcon, Settings, BarChart3, FileText, Shield,
  LogOut, Bell, Search, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Eye, Trash2, Edit, Plus, Filter, MoreVertical, Star, Upload, ToggleRight
} from 'lucide-react'

/* =========================
   Helpers
========================= */
const getMeFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
}
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : n)
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-')

const STATUS_META = {
  active: { label: 'Đang hoạt động', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  pending: { label: 'Chờ duyệt', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  inactive: { label: 'Tạm dừng', chip: 'bg-slate-50 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
}
function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.active
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${meta.chip}`}>
      <span className={`size-2 rounded-full ${meta.dot}`} />{meta.label}
    </span>
  )
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
              <button className="rounded-xl py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-black">
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

        {/* Main content */}
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

/* =========================
   Dashboard
========================= */
function DashboardTab() {
  const statCards = [
    { title: 'Tổng khung hình', value: 5678, diff: +8, icon: ImageIcon, color: 'from-blue-500 to-indigo-500' },
    { title: 'Người dùng', value: 1234, diff: +3, icon: Users, color: 'from-emerald-500 to-teal-500' },
    { title: 'Tạo mới hôm nay', value: 234, diff: +12, icon: Plus, color: 'from-amber-500 to-orange-500' },
    { title: 'Báo cáo chờ xử lý', value: 12, diff: -1, icon: FileText, color: 'from-rose-500 to-pink-500' },
  ]
  const activity = [
    { dot: 'bg-green-500', text: <>Người dùng <b>Nguyễn Văn A</b> tạo khung mới</>, time: '2 phút trước' },
    { dot: 'bg-blue-500', text: <>Tài khoản <b>Trần Thị B</b> vừa đăng ký</>, time: '15 phút trước' },
    { dot: 'bg-amber-500', text: <>Khung <b>"Giáng sinh 2025"</b> được cập nhật</>, time: '1 giờ trước' },
    { dot: 'bg-rose-500', text: <>4 báo cáo mới từ người dùng</>, time: 'Hôm nay' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200/75 shadow-sm">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">{s.title}</div>
                  <div className={`grid place-items-center size-10 rounded-xl text-white shadow bg-gradient-to-br ${s.color}`}>
                    <Icon size={18} />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-bold tracking-tight">{fmt(s.value)}</div>
                <div className={`mt-1 text-xs ${s.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {s.diff >= 0 ? '▲' : '▼'} {Math.abs(s.diff)}% so với hôm qua
                </div>
                <Sparkline values={[7, 9, 12, 8, 10, 14, 12, 15, 18, 16]} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Trending + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Khung thịnh hành</h3>
            <button className="text-sm text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          <TrendingTable />
        </div>

        <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
          <div className="space-y-3">
            {activity.map((a, i) => (
              <div key={i} className="flex items-center text-sm text-slate-700">
                <span className={`size-2 rounded-full ${a.dot} mr-3`} />
                <span className="min-w-0">{a.text}</span>
                <span className="ml-auto text-slate-400 whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Sparkline({ values = [] }) {
  const w = 240, h = 56, pad = 6
  const max = Math.max(...values), min = Math.min(...values)
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1)
    const y = h - pad - ((v - min) * (h - pad * 2)) / (max - min || 1)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full text-blue-500">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((_, i) => {
        const x = pad + (i * (w - pad * 2)) / (values.length - 1)
        const y = h - pad - ((values[i] - min) * (h - pad * 2)) / (max - min || 1)
        return <circle key={i} cx={x} cy={y} r="2" className="fill-current" />
      })}
    </svg>
  )
}

function TrendingTable() {
  const rows = [
    { title: 'Giáng sinh 2025', clicks: 1240, uses: 512, status: 'active' },
    { title: 'Trung thu', clicks: 920, uses: 448, status: 'active' },
    { title: 'Ngày Nhà giáo', clicks: 310, uses: 190, status: 'pending' },
    { title: 'Quốc Khánh', clicks: 150, uses: 70, status: 'inactive' },
  ]
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/75 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr className="*:*:px-4 *:*:py-2">
            <th className="text-left">Khung</th>
            <th className="text-right">Lượt xem</th>
            <th className="text-right">Lượt dùng</th>
            <th className="text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
              <td className="px-4 py-3 text-right font-mono">{fmt(r.clicks)}</td>
              <td className="px-4 py-3 text-right font-mono">{fmt(r.uses)}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* =========================
   Frames Management
========================= */
function FramesTab() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [rows, setRows] = useState(() => ([
    { id: 'f1', title: 'Giáng sinh 2025', author: 'MARKETING VEC', status: 'active', clicks: 1240, uses: 512, createdAt: '2025-10-01', updatedAt: '2025-10-16', featured: true },
    { id: 'f2', title: 'Trung thu', author: 'Admin', status: 'active', clicks: 920, uses: 448, createdAt: '2025-09-10', updatedAt: '2025-10-14', featured: false },
    { id: 'f3', title: 'Ngày Nhà giáo', author: 'Thầy Cô', status: 'pending', clicks: 310, uses: 190, createdAt: '2025-10-12', updatedAt: '2025-10-15', featured: false },
    { id: 'f4', title: 'Quốc Khánh', author: 'Đội thiết kế', status: 'inactive', clicks: 150, uses: 70, createdAt: '2025-05-01', updatedAt: '2025-08-20', featured: false },
  ]))
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(r =>
      (status === 'all' || r.status === status) &&
      (!q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q))
    )
  }, [rows, query, status])

  const approve = (id) => setRows(prev => prev.map(r => r.id === id ? ({ ...r, status: 'active' }) : r))
  const reject = (id) => setRows(prev => prev.map(r => r.id === id ? ({ ...r, status: 'inactive' }) : r))
  const toggleFeatured = (id) => setRows(prev => prev.map(r => r.id === id ? ({ ...r, featured: !r.featured }) : r))
  const remove = (id) => setRows(prev => prev.filter(r => r.id !== id))

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-2xl ring-1 ring-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-blue-400"
              placeholder="Tìm theo tiêu đề/tác giả..."
            />
          </div>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none rounded-2xl ring-1 ring-slate-200 bg-white pl-3 pr-8 py-2 text-sm outline-none focus:ring-blue-400"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="pending">Chờ duyệt</option>
              <option value="inactive">Tạm dừng</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
            <Upload size={16} /> Thêm khung
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white ring-1 ring-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
            <Filter size={16} /> Bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/75 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[920px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="*:*:px-4 *:*:py-3">
                <th className="text-left">Khung</th>
                <th className="text-left">Tác giả</th>
                <th className="text-left">Trạng thái</th>
                <th className="text-right">Lượt xem</th>
                <th className="text-right">Lượt dùng</th>
                <th className="text-left whitespace-nowrap">Ngày tạo</th>
                <th className="text-left whitespace-nowrap">Chỉnh sửa</th>
                <th className="text-left">Nổi bật</th>
                <th className="text-left">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                  <td className="px-4 py-3">{r.author}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-right font-mono">{fmt(r.clicks)}</td>
                  <td className="px-4 py-3 text-right font-mono">{fmt(r.uses)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFeatured(r.id)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ring-1 
                                 ${r.featured ? 'bg-yellow-50 text-amber-700 ring-amber-200' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                      <Star size={14} /> {r.featured ? 'Nổi bật' : 'Bật nổi bật'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {r.status === 'pending' ? (
                        <>
                          <button onClick={() => approve(r.id)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">
                            <CheckCircle2 size={14} /> Duyệt
                          </button>
                          <button onClick={() => reject(r.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700">
                            <XCircle size={14} /> Từ chối
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700">
                            <Eye size={14} /> Xem
                          </button>
                          <button className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600">
                            <Edit size={14} /> Sửa
                          </button>
                          <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600">
                            <Trash2 size={14} /> Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="py-14 text-center text-slate-500">Không có khung phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 text-xs text-slate-600">
          <div>Tổng: <span className="text-slate-900 font-semibold">{filtered.length}</span> khung</div>
          <div>Trang 1 / 1</div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Users Management
========================= */
function UsersTab() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('all')
  const users = [
    { id: 1, name: 'Nguyễn Văn A', email: 'a@email.com', role: 'user', status: 'active', joinDate: '2025-04-10' },
    { id: 2, name: 'Trần Thị B', email: 'b@email.com', role: 'user', status: 'active', joinDate: '2025-06-22' },
    { id: 3, name: 'Admin', email: 'admin@example.com', role: 'admin', status: 'active', joinDate: '2024-12-01' },
  ]
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter(u =>
      (role === 'all' || u.role === role) &&
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    )
  }, [query, role])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-64 rounded-2xl ring-1 ring-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-blue-400"
              placeholder="Tìm theo tên/email..."
            />
          </div>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="appearance-none rounded-2xl ring-1 ring-slate-200 bg-white pl-3 pr-8 py-2 text-sm outline-none focus:ring-blue-400"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị</option>
              <option value="user">Người dùng</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={16} /> Thêm người dùng
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/75 bg-white shadow-sm">
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-[820px] w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr className="*:*:px-4 *:*:py-3">
                <th className="text-left">Người dùng</th>
                <th className="text-left">Vai trò</th>
                <th className="text-left">Trạng thái</th>
                <th className="text-left">Ngày tham gia</th>
                <th className="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{u.name}</div>
                    <div className="text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-700'
                      }`}>
                      {u.role === 'admin' ? 'Quản trị' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Hoạt động</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(u.joinDate)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button className="text-violet-600 hover:text-violet-800"><Eye size={16} /></button>
                      <button className="text-amber-600 hover:text-amber-800"><Edit size={16} /></button>
                      <button className="text-rose-600 hover:text-rose-800"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-14 text-center text-slate-500">Không có người dùng phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Reports
========================= */
function ReportsTab() {
  const rows = [
    { id: 'r1', type: 'Vi phạm nội dung', target: 'Khung Giáng sinh 2025', by: 'user123', createdAt: '2025-10-15', status: 'pending' },
    { id: 'r2', type: 'Spam', target: 'Khung Trung thu', by: 'user567', createdAt: '2025-10-14', status: 'active' },
    { id: 'r3', type: 'Bản quyền', target: 'Khung Quốc Khánh', by: 'user999', createdAt: '2025-10-12', status: 'inactive' },
  ]
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Báo cáo</h2>
        <button className="inline-flex items-center gap-2 rounded-xl bg-white ring-1 ring-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
          <Filter size={16} /> Bộ lọc
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/75 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr className="*:*:px-4 *:*:py-3">
              <th className="text-left">Loại</th>
              <th className="text-left">Đối tượng</th>
              <th className="text-left">Người báo cáo</th>
              <th className="text-left">Ngày</th>
              <th className="text-left">Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{r.type}</td>
                <td className="px-4 py-3">{r.target}</td>
                <td className="px-4 py-3">{r.by}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <button className="text-emerald-600 hover:text-emerald-800"><CheckCircle2 size={16} /></button>
                    <button className="text-rose-600 hover:text-rose-800"><XCircle size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="py-14 text-center text-slate-500">Không có báo cáo</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* =========================
   Settings
========================= */
function SettingsTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Cấu hình chung</h3>
        <div className="grid gap-4">
          <div>
            <label className="text-sm text-slate-600">Tên website</label>
            <input className="mt-1 w-full rounded-2xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-blue-400" defaultValue="TrendyFrame" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Frontend Origin</label>
            <input className="mt-1 w-full rounded-2xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-blue-400" placeholder="https://trendyframe.me" />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
            <div>
              <div className="font-medium">Bật chế độ bảo trì</div>
              <div className="text-xs text-slate-600">Tạm dừng người dùng truy cập frontend</div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">
              <ToggleRight size={16} /> Bật/Tắt
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Tích hợp</h3>
        <div className="grid gap-4">
          <div className="rounded-2xl ring-1 ring-slate-200 p-4">
            <div className="font-medium">Google OAuth</div>
            <div className="text-xs text-slate-600">Client ID / Secret</div>
            <button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Cấu hình
            </button>
          </div>
          <div className="rounded-2xl ring-1 ring-slate-200 p-4">
            <div className="font-medium">Azure Storage</div>
            <div className="text-xs text-slate-600">Kết nối lưu trữ ảnh</div>
            <button className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Kết nối
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
