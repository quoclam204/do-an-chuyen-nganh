import { ImageIcon, Users, Plus, FileText } from 'lucide-react'

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : n)

const STATUS_META = {
    active: { label: 'Đang hoạt động', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    pending: { label: 'Chờ duyệt', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
    inactive: { label: 'Tạm dừng', chip: 'bg-slate-50 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
}

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META.active
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${meta.chip}`}>
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
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

export default function DashboardTab() {
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