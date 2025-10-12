import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, Search, Filter, ChevronDown, Trash2, Pencil, Eye } from 'lucide-react'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')

// ===== helpers =====
const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0D8ABC&color=fff&size=128&bold=true`
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-')

const STATUS_META = {
    active: { label: 'Đang hoạt động', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    inactive: { label: 'Tạm dừng', chip: 'bg-slate-50 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
    pending: { label: 'Chờ duyệt', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' }
}

// A lightweight confirmation dialog (no deps)
function ConfirmDialog({ open, title, description, confirmText = 'Xác nhận', cancelText = 'Hủy', onConfirm, onClose }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {description && <p className="mt-2 text-sm text-gray-600">{description}</p>}
                </div>
                <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
                    <button onClick={onClose} className="px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200">{cancelText}</button>
                    <button onClick={onConfirm} className="px-3 py-2 text-sm font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700">{confirmText}</button>
                </div>
            </div>
        </div>
    )
}

// A tiny badge component
function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META.active
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${meta.chip}`}>
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    )
}

// Skeleton row
function RowSkeleton() {
    return (
        <tr className="animate-pulse">
            {Array.from({ length: 9 }).map((_, i) => (
                <td key={i} className="py-3 px-3">
                    <div className="h-4 rounded bg-gray-200" />
                </td>
            ))}
        </tr>
    )
}

export default function MyFrames() {
    const [frames, setFrames] = useState([])
    const [loading, setLoading] = useState(true)
    const [me, setMe] = useState(null)
    const [query, setQuery] = useState('')
    const [status, setStatus] = useState('all') // all | active | inactive | pending
    const [sortKey, setSortKey] = useState('updatedAt') // title | clicks | uses | createdAt | updatedAt
    const [sortDir, setSortDir] = useState('desc') // asc | desc
    const [askDelete, setAskDelete] = useState({ open: false, id: null })

    useEffect(() => {
        try {
            const userData = JSON.parse(localStorage.getItem('kh_me') || 'null') || {
                name: 'Quốc Lâm',
                createdAt: '2025-05-31T00:00:00Z',
                picture: 'https://i.imgur.com/your-custom-avatar.png'
            }
            setMe(userData)
        } catch { }
        fetchMyFrames()
    }, [])

    const fetchMyFrames = async () => {
        try {
            setLoading(true)
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/my-frames`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('kh_token')}` }
            })
            const apiData = await res.json()
            const finalFrames = (Array.isArray(apiData) && apiData.length > 0)
                ? apiData
                : [{
                    id: 'mock-1',
                    title: 'Khung chúc mừng 20/11',
                    status: 'active',
                    clicks: 18,
                    uses: 7,
                    createdAt: '2025-10-12T00:00:00Z',
                    updatedAt: '2025-10-12T00:00:00Z',
                    imageUrl: 'https://i.imgur.com/kS5YdY2.png'
                }]
            setFrames(finalFrames)
        } catch {
            setFrames([])
        } finally {
            setLoading(false)
        }
    }

    const requestDelete = (id) => setAskDelete({ open: true, id })
    const closeDelete = () => setAskDelete({ open: false, id: null })
    const confirmDelete = async () => {
        const id = askDelete.id
        closeDelete()
        if (!id) return
        try {
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('kh_token')}` }
            })
            if (!res.ok) throw new Error()
            setFrames(prev => prev.filter(f => f.id !== id))
        } catch {
            alert('Có lỗi xảy ra khi xóa khung hình')
        }
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        const byStatus = status === 'all' ? frames : frames.filter(f => (f.status || 'active') === status)
        const byText = q ? byStatus.filter(f => `${f.title}`.toLowerCase().includes(q)) : byStatus

        const sorted = [...byText].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1
            const get = (x) => {
                if (sortKey === 'title') return `${x.title || ''}`.toLowerCase()
                return x[sortKey] || 0
            }
            const va = get(a)
            const vb = get(b)
            if (va < vb) return -1 * dir
            if (va > vb) return 1 * dir
            return 0
        })

        return sorted
    }, [frames, query, status, sortKey, sortDir])

    const toggleSort = (key) => {
        if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        else { setSortKey(key); setSortDir('desc') }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
                {/* ===== top profile card ===== */}
                <aside className="mx-auto max-w-xl">
                    <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm">
                        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_10%_10%,#e0f2fe_0%,transparent_60%),radial-gradient(80%_60%_at_90%_10%,#dcfce7_0%,transparent_60%)] opacity-60" />
                        <div className="relative p-6 text-center">
                            <img
                                src={me?.picture || getAvatarUrl(me?.name)}
                                alt="Avatar"
                                className="mx-auto mb-3 size-24 rounded-full object-cover ring-2 ring-white shadow-lg"
                                referrerPolicy="no-referrer"
                            />
                            <div className="font-semibold text-gray-900 text-lg">{me?.name || 'Quốc Lâm'}</div>
                            <div className="mt-1 text-sm text-gray-600">Ngày tạo: {me?.createdAt ? formatDate(me.createdAt) : '31/05/2025'}</div>
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold ring-1 ring-blue-200">
                                ● Chưa xác thực
                            </div>
                        </div>
                    </div>
                </aside>

                {/* spacing */}
                <div className="h-8" />

                {/* ===== toolbar ===== */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative w-full sm:max-w-xs">
                            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-400"><Search size={16} /></span>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Tìm theo tiêu đề..."
                                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm outline-none ring-0 focus:border-blue-400 focus:bg-white"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 py-2 text-sm outline-none focus:border-blue-400"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="inactive">Tạm dừng</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </div>

                    <Link
                        to="/create-frame"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:translate-y-px"
                    >
                        <Plus size={16} /> Tạo mới
                    </Link>
                </div>

                {/* ===== table ===== */}
                <section className="min-w-0">
                    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm">
                        <div className="max-w-full overflow-x-auto">
                            <table className="min-w-[1040px] w-full text-sm">
                                <colgroup>
                                    <col className="w-14" />
                                    <col className="w-28" />
                                    <col />
                                    <col className="w-44" />
                                    <col className="w-28" />
                                    <col className="w-32" />
                                    <col className="w-36" />
                                    <col className="w-40" />
                                    <col className="w-44" />
                                </colgroup>

                                <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur border-b text-slate-700">
                                    <tr className="[&>th]:py-3 [&>th]:px-3 select-none">
                                        <th className="text-left">TT</th>
                                        <th className="text-left">Khung hình</th>
                                        <th className="text-left">
                                            <button onClick={() => toggleSort('title')} className="inline-flex items-center gap-1 font-semibold">
                                                Tiêu đề{sortKey === 'title' && (<span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                            </button>
                                        </th>
                                        <th className="text-left">Trạng thái</th>
                                        <th className="text-right">
                                            <button onClick={() => toggleSort('clicks')} className="inline-flex items-center gap-1 font-semibold">
                                                Lượt click{sortKey === 'clicks' && (<span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                            </button>
                                        </th>
                                        <th className="text-right">
                                            <button onClick={() => toggleSort('uses')} className="inline-flex items-center gap-1 font-semibold">
                                                Lượt thay khung{sortKey === 'uses' && (<span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                            </button>
                                        </th>
                                        <th className="text-left whitespace-nowrap">
                                            <button onClick={() => toggleSort('createdAt')} className="inline-flex items-center gap-1 font-semibold">
                                                Ngày tạo{sortKey === 'createdAt' && (<span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                            </button>
                                        </th>
                                        <th className="text-left whitespace-nowrap">
                                            <button onClick={() => toggleSort('updatedAt')} className="inline-flex items-center gap-1 font-semibold">
                                                Ngày chỉnh sửa{sortKey === 'updatedAt' && (<span className="text-xs">{sortDir === 'asc' ? '▲' : '▼'}</span>)}
                                            </button>
                                        </th>
                                        <th className="text-left">Hành động</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {loading && (
                                        <>
                                            {Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}
                                        </>
                                    )}

                                    {!loading && filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="py-16 text-center">
                                                <div className="inline-flex flex-col items-center gap-2 text-slate-500">
                                                    <div className="text-5xl">📷</div>
                                                    <div className="text-lg">Chưa có khung hình phù hợp</div>
                                                    <p className="text-sm">Hãy thay đổi bộ lọc hoặc tạo khung hình mới.</p>
                                                    <Link to="/create-frame" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                                                        <Plus size={16} /> Tạo khung hình đầu tiên
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && filtered.map((f, idx) => (
                                        <tr key={f.id} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="py-3 px-3 text-slate-600">{idx + 1}</td>
                                            <td className="py-3 px-3">
                                                <Link to={`/frame/${f.id}`} className="inline-block">
                                                    <div className="size-12 overflow-hidden rounded-lg ring-1 ring-slate-200">
                                                        <img
                                                            src={f.imageUrl || '/placeholder-frame.png'}
                                                            alt={f.title}
                                                            className="h-full w-full object-cover"
                                                            loading="lazy"
                                                            onError={(e) => { e.currentTarget.src = '/placeholder-frame.png' }}
                                                        />
                                                    </div>
                                                </Link>
                                            </td>

                                            <td className="py-3 px-3">
                                                <Link to={`/frame/${f.id}`} className="line-clamp-1 font-medium text-gray-900 hover:text-blue-700" title={f.title}>
                                                    {f.title || 'Không có tiêu đề'}
                                                </Link>
                                            </td>

                                            <td className="py-3 px-3"><StatusBadge status={f.status} /></td>

                                            <td className="py-3 px-3 text-right font-mono text-slate-800">{f.clicks ?? 0}</td>
                                            <td className="py-3 px-3 text-right font-mono text-slate-800">{f.uses ?? 0}</td>
                                            <td className="py-3 px-3 whitespace-nowrap text-slate-700">{formatDate(f.createdAt)}</td>
                                            <td className="py-3 px-3 whitespace-nowrap text-slate-700">{formatDate(f.updatedAt)}</td>

                                            <td className="py-3 px-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Link to={`/frame/${f.id}`} className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700 shadow-sm">
                                                        <Eye size={14} /> Xem
                                                    </Link>
                                                    <Link to={`/frame/${f.id}/edit`} className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 shadow-sm">
                                                        <Pencil size={14} /> Sửa
                                                    </Link>
                                                    <button onClick={() => requestDelete(f.id)} className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 shadow-sm">
                                                        <Trash2 size={14} /> Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* footer bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t bg-slate-50 px-6 py-3 text-xs text-slate-600">
                            <div>Tổng cộng: <span className="font-semibold text-slate-900">{filtered.length}</span> khung hình</div>
                            <div>
                                Sắp xếp theo <span className="font-medium">{({ title: 'Tiêu đề', clicks: 'Lượt click', uses: 'Lượt thay', createdAt: 'Ngày tạo', updatedAt: 'Ngày sửa' })[sortKey]}</span> ({sortDir === 'asc' ? 'tăng dần' : 'giảm dần'})
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* confirm delete */}
            <ConfirmDialog
                open={askDelete.open}
                title="Xóa khung hình?"
                description="Hành động này không thể hoàn tác. Khung hình sẽ bị xóa vĩnh viễn."
                confirmText="Xóa"
                onConfirm={confirmDelete}
                onClose={closeDelete}
            />
        </div>
    )
}
