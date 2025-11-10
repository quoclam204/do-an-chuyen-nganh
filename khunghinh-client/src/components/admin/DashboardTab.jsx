import { useState, useEffect } from 'react'
import { ImageIcon, Users, Plus, Activity, TrendingUp, Clock } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

// ✅ Giống Editor.jsx - loại bỏ trailing slash
const API_BASE = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:7090').replace(/\/$/, '')

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
    if (!values || values.length === 0) return null
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

// ===== CHART: LƯỢT XEM & TẢI =====
function ViewDownloadChart({ data, period }) {
    if (!data || !data.dailyData || data.dailyData.length === 0) {
        return (
            <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">📈 Xu hướng tương tác</h3>
                <div className="text-center py-12 text-slate-500">Chưa có dữ liệu</div>
            </div>
        )
    }

    const chartData = {
        labels: data.dailyData.map(d => {
            const date = new Date(d.date)
            return `${date.getDate()}/${date.getMonth() + 1}`
        }),
        datasets: [
            {
                label: 'Lượt xem',
                data: data.dailyData.map(d => d.views),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y',
            },
            {
                label: 'Lượt tải',
                data: data.dailyData.map(d => d.downloads),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                yAxisID: 'y1',
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1e293b',
                bodyColor: '#64748b',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y.toLocaleString('vi-VN')}`
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: '#f1f5f9' },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    callback: function (value) {
                        return value.toLocaleString('vi-VN')
                    }
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: {
                    color: '#64748b',
                    font: { size: 11 },
                    callback: function (value) {
                        return value.toLocaleString('vi-VN')
                    }
                }
            }
        }
    }

    return (
        <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">📈 Xu hướng tương tác</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Lượt xem và tải xuống trong {data.period}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-right">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{fmt(data.totalViews)}</div>
                        <div className="text-xs text-slate-500">Tổng lượt xem</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600">{fmt(data.totalDownloads)}</div>
                        <div className="text-xs text-slate-500">Tổng lượt tải</div>
                    </div>
                </div>
            </div>
            <div style={{ height: '300px' }}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    )
}

// ===== USER & FRAME STATS =====
function StatsGrid({ users, frames }) {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* User Stats */}
            <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">👥 Thống kê người dùng</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-blue-100 text-blue-600 grid place-items-center">
                                <Users size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Tổng số người dùng</div>
                                <div className="text-2xl font-bold">{fmt(users?.total || 0)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-emerald-100 text-emerald-600 grid place-items-center">
                                <Activity size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Hoạt động 30 ngày qua</div>
                                <div className="text-2xl font-bold">{fmt(users?.activeLast30Days || 0)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-amber-100 text-amber-600 grid place-items-center">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-600">Mới trong 7 ngày</div>
                                <div className="text-2xl font-bold">{fmt(users?.newLast7Days || 0)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Frame Stats */}
            <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🖼️ Thống kê khung hình</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500" />
                            <span className="text-sm text-slate-700">Tổng số khung</span>
                        </div>
                        <span className="font-semibold text-slate-900">{fmt(frames?.total || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span className="text-sm text-emerald-700 font-medium">Công khai & hoạt động</span>
                        </div>
                        <span className="font-semibold text-emerald-900">{fmt(frames?.public_ || 0)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-slate-400" />
                            <span className="text-sm text-slate-700">Tạm dừng / Không hoạt động</span>
                        </div>
                        <span className="font-semibold text-slate-900">{fmt(frames?.paused || 0)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ===== TOP FRAMES TABLE =====
function TrendingTable({ frames }) {
    if (!frames || frames.length === 0) {
        return <div className="text-center py-8 text-slate-500">Chưa có dữ liệu</div>
    }

    return (
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/75 shadow-sm bg-white">
            <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                    <tr>
                        <th className="text-left px-4 py-3 font-semibold">Khung</th>
                        <th className="text-right px-4 py-3 font-semibold">Lượt xem</th>
                        <th className="text-right px-4 py-3 font-semibold">Lượt tải</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {frames.map((frame, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    {frame.thumb && (
                                        <img
                                            src={`${API_BASE}${frame.thumb}`}
                                            alt={frame.title}
                                            className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <div className="font-medium text-slate-900 truncate">{frame.title}</div>
                                        <div className="text-xs text-slate-500">/{frame.alias}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                {fmt(frame.views)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-slate-700">
                                {fmt(frame.downloads)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// ===== RECENT ACTIVITY =====
function RecentActivity({ frames }) {
    if (!frames || frames.length === 0) {
        return (
            <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
                <div className="text-center py-8 text-slate-500">Chưa có hoạt động</div>
            </div>
        )
    }

    const formatTimeAgo = (dateStr) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Vừa xong'
        if (diffMins < 60) return `${diffMins} phút trước`
        if (diffHours < 24) return `${diffHours} giờ trước`
        return `${diffDays} ngày trước`
    }

    return (
        <div className="rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
                {frames.map((frame, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="size-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <div className="text-slate-700">
                                {/* ✅ Sửa từ TieuDe -> tieuDe (camelCase) */}
                                Khung <b className="text-slate-900">{frame.tieuDe}</b> được tạo mới
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <Clock size={12} />
                                {/* ✅ Sửa từ NgayDang -> ngayDang (camelCase) */}
                                {formatTimeAgo(frame.ngayDang)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== MAIN COMPONENT =====
export default function DashboardTab() {
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [period, setPeriod] = useState(7) // 7 hoặc 30 ngày

    useEffect(() => {
        loadDashboardData()
    }, [period])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)

            // ✅ Gọi API với endpoint chuẩn
            const response = await fetch(`${API_BASE}/api/admin/stats?days=${period}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`HTTP ${response.status}: ${errorText}`)
            }

            const data = await response.json()
            console.log('✅ Dashboard data loaded:', data)
            setDashboardData(data)
        } catch (error) {
            console.error('❌ Dashboard load error:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-rose-600 text-lg font-semibold mb-2">⚠️ Lỗi tải dữ liệu</div>
                    <p className="text-slate-600 mb-4">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    // ✅ Chỉ còn 3 stat cards (đã bỏ "Báo cáo chờ xử lý")
    const statCards = [
        {
            title: 'Tổng khung hình',
            value: dashboardData?.frames?.total || 0,
            diff: 0,
            icon: ImageIcon,
            color: 'from-blue-500 to-indigo-500',
            sparkline: [5, 8, 6, 10, 12, 9, 15, 11, 14, dashboardData?.frames?.total || 0]
        },
        {
            title: 'Người dùng',
            value: dashboardData?.users?.total || 0,
            diff: 0,
            icon: Users,
            color: 'from-emerald-500 to-teal-500',
            sparkline: [10, 15, 12, 18, 20, 17, 22, 19, 24, dashboardData?.users?.total || 0]
        },
        {
            title: 'Mới 7 ngày qua',
            value: dashboardData?.users?.newLast7Days || 0,
            diff: 0,
            icon: Plus,
            color: 'from-amber-500 to-orange-500',
            sparkline: [2, 3, 5, 4, 6, 8, 7, 9, 10, dashboardData?.users?.newLast7Days || 0]
        }
    ]

    return (
        <div className="space-y-8">
            {/* Stats Cards - ✅ Grid 3 cột thay vì 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                                <Sparkline values={s.sparkline} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Period Selector */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setPeriod(7)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${period === 7
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    7 ngày
                </button>
                <button
                    onClick={() => setPeriod(30)}
                    className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${period === 30
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                >
                    30 ngày
                </button>
            </div>

            {/* Chart */}
            <ViewDownloadChart data={dashboardData?.chart} period={period} />

            {/* User & Frame Stats */}
            <StatsGrid users={dashboardData?.users} frames={dashboardData?.frames} />

            {/* Trending + Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl ring-1 ring-slate-200/75 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Khung thịnh hành</h3>
                        <span className="text-xs text-slate-500">Top 5 trong {period} ngày</span>
                    </div>
                    <TrendingTable frames={dashboardData?.topFrames} />
                </div>

                <RecentActivity frames={dashboardData?.recentFrames} />
            </div>
        </div>
    )
}