import { Filter, CheckCircle2, XCircle } from 'lucide-react'

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
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    )
}

export default function ReportsTab() {
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