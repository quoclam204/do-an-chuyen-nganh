import { useState, useMemo } from 'react'
import { Search, ChevronDown, Plus, Eye, Edit, Trash2 } from 'lucide-react'

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-')

export default function UsersTab() {
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