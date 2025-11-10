import { useState, useEffect, useMemo } from 'react'
import {
    Search, ChevronDown, Plus, Eye, Edit, Trash2, Shield, Ban,
    UserCheck, UserX, Mail, Calendar, MoreVertical, AlertTriangle,
    Crown, User, Settings, Lock, Unlock, RefreshCw, Star, X
} from 'lucide-react'

// API Configuration - Sử dụng cách tốt hơn
const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'http://localhost:7090').replace(/\/$/, '')

// Helper functions
const fmt = (n) => (typeof n === 'number' ? n.toLocaleString('vi-VN') : n)
const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

// API helper - Sử dụng BACKEND_ORIGIN
const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${BACKEND_ORIGIN}/api${endpoint}`, {
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
        console.error('API Error:', error)
        throw error
    }
}

// Status mapping - Sửa lại để khớp với database
const STATUS_MAPPING = {
    'hoat_dong': {  // Database dùng 'hoat_dong' không phải 'active'
        label: 'Hoạt động',
        chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        dot: 'bg-emerald-500'
    },
    'bi_khoa': {    // Đúng theo database 
        label: 'Bị khóa',
        chip: 'bg-rose-50 text-rose-700 ring-rose-200',
        dot: 'bg-rose-500'
    },
    'khoa': {       // Thêm alias cho 'bi_khoa'
        label: 'Bị khóa',
        chip: 'bg-rose-50 text-rose-700 ring-rose-200',
        dot: 'bg-rose-500'
    },
    'xoa_mem': {    // Thêm trạng thái xóa mềm
        label: 'Đã xóa',
        chip: 'bg-slate-50 text-slate-700 ring-slate-200',
        dot: 'bg-slate-400'
    },
    'inactive': {   // Fallback
        label: 'Không hoạt động',
        chip: 'bg-slate-50 text-slate-700 ring-slate-200',
        dot: 'bg-slate-400'
    }
}

function StatusBadge({ status }) {
    // Fallback to 'hoat_dong' thay vì 'active'
    const meta = STATUS_MAPPING[status] || STATUS_MAPPING['hoat_dong']
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${meta.chip}`}>
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    )
}

// Role Badge with Super Admin support - Sửa logic kiểm tra
function RoleBadge({ role, isSuper }) {
    // Debug log để kiểm tra giá trị
    console.log('RoleBadge:', { role, isSuper, type: typeof isSuper })

    // Kiểm tra Super Admin chính xác hơn
    const isSuperAdmin = isSuper === true || isSuper === 1 || role === 'superadmin'

    if (isSuperAdmin) {
        return (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 ring-1 ring-orange-200">
                <Star size={12} className="text-orange-600" />
                Super Admin
            </span>
        )
    } else if (role === 'admin') {
        return (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
                <Crown size={12} />
                Quản trị viên
            </span>
        )
    } else {
        return (
            <span className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                <User size={12} />
                Người dùng
            </span>
        )
    }
}

// User Detail Modal - ✅ CẬP NHẬT PROPS
function UserDetailModal({
    user,
    isOpen,
    onClose,
    onRoleChange,
    onBanUser,      // Hàm để mở modal ban
    onUnlockUser,   // Hàm unlock trực tiếp
    users,          // ✅ THÊM: Danh sách users để check quyền
    currentUserEmail // ✅ THÊM: Email user hiện tại
}) {
    if (!isOpen || !user) return null

    const isSuper = user.isSuper || user.role === 'superadmin'

    // ✅ Tính callerIsSuper trong modal
    const currentUser = users?.find(u => u.email === currentUserEmail)
    const callerIsSuper = currentUser?.isSuper === true || currentUser?.isSuper === 1

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header - giữ nguyên */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 grid place-items-center relative">
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-full h-full rounded-xl object-cover"
                                        onError={(e) => {
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=48`
                                        }}
                                    />
                                ) : (
                                    <User size={20} className="text-blue-600" />
                                )}
                                {isSuper && (
                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full grid place-items-center">
                                        <Star size={12} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{user.name}</h3>
                                <p className="text-sm text-gray-500">ID: {user.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* User Avatar - giữ nguyên */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-3 text-gray-900">Ảnh đại diện</h4>
                                    <div className="aspect-square w-48 mx-auto rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-white shadow-lg relative">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=192`
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center">
                                                <div className="text-center">
                                                    <User size={48} className="text-slate-400 mx-auto mb-2" />
                                                    <p className="text-slate-500">Chưa có ảnh</p>
                                                </div>
                                            </div>
                                        )}
                                        {isSuper && (
                                            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full grid place-items-center shadow-lg">
                                                <Star size={16} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="space-y-6">
                                {/* Basic Info - giữ nguyên */}
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <h4 className="font-semibold mb-4 text-gray-900">Thông tin cơ bản</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-slate-500" />
                                            <div>
                                                <span className="text-slate-600">Email:</span>
                                                <div className="font-medium text-slate-900">{user.email}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Shield size={16} className="text-slate-500" />
                                            <div>
                                                <span className="text-slate-600">Vai trò:</span>
                                                <div className="mt-1">
                                                    <RoleBadge role={user.role} isSuper={user.isSuper} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 grid place-items-center">
                                                <div className={`w-2 h-2 rounded-full ${STATUS_MAPPING[user.status]?.dot || 'bg-slate-400'}`} />
                                            </div>
                                            <div>
                                                <span className="text-slate-600">Trạng thái:</span>
                                                <div className="mt-1">
                                                    <StatusBadge status={user.status} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps - giữ nguyên */}
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Thời gian</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                <span className="text-slate-600">Ngày tham gia:</span>
                                            </div>
                                            <span className="font-medium">{formatDate(user.ngayTao)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Edit size={14} className="text-slate-500" />
                                                <span className="text-slate-600">Cập nhật:</span>
                                            </div>
                                            <span className="font-medium">{formatDate(user.ngayCapNhat)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Super Admin Warning - giữ nguyên */}
                                {isSuper && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border border-yellow-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Star size={16} className="text-orange-600" />
                                            <h4 className="font-semibold text-orange-800">Super Admin</h4>
                                        </div>
                                        <p className="text-sm text-orange-700">
                                            Người dùng này có quyền hạn cao nhất trong hệ thống. Chỉ Super Admin khác mới có thể thay đổi quyền hạn của họ.
                                        </p>
                                    </div>
                                )}

                                {/* Quick Actions - ✅ SỬA LẠI PHẦN NÀY */}
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-3 text-gray-900">Hành động nhanh</h4>
                                    <div className="grid gap-2">
                                        {/* Role Change buttons - giữ nguyên */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {isSuper ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            onRoleChange(user.id, 'admin')
                                                            onClose()
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                                                    >
                                                        <Crown size={16} /> Hạ xuống Admin
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onRoleChange(user.id, 'user')
                                                            onClose()
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                                                    >
                                                        <User size={16} /> Hạ xuống User
                                                    </button>
                                                </>
                                            ) : user.role === 'admin' ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            onRoleChange(user.id, 'superadmin')
                                                            onClose()
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
                                                    >
                                                        <Star size={16} /> Thăng Super Admin
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onRoleChange(user.id, 'user')
                                                            onClose()
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                                                    >
                                                        <User size={16} /> Hạ xuống User
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            onRoleChange(user.id, 'admin')
                                                            onClose()
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                                                    >
                                                        <Crown size={16} /> Thăng Admin
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onRoleChange(user.id, 'superadmin')
                                                            onClose()
                                                        }}
                                                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-colors"
                                                    >
                                                        <Star size={16} /> Thăng Super Admin
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        {/* ✅ SỬA: Ban/Unban button - CHỈ HIỂN THỊ CHO SUPER ADMIN */}
                                        {callerIsSuper && (
                                            user.status === 'bi_khoa' ? (
                                                <button
                                                    onClick={() => {
                                                        onUnlockUser(user.id)
                                                        onClose()
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                                                >
                                                    <Unlock size={16} /> Mở khóa tài khoản
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        onBanUser(user.id)
                                                        onClose()
                                                    }}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
                                                >
                                                    <Ban size={16} /> Khóa tài khoản
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Ban User Modal
function BanUserModal({ user, isOpen, onClose, onConfirm }) {
    const [reason, setReason] = useState('')
    const [banning, setBanning] = useState(false)

    if (!isOpen || !user) return null

    const isSuper = user.isSuper || user.role === 'superadmin'

    const handleBan = async () => {
        setBanning(true)
        try {
            await onConfirm(reason)
            onClose()
        } catch (error) {
            console.error('Ban failed:', error)
        } finally {
            setBanning(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-rose-100 grid place-items-center">
                                <Ban size={24} className="text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Khóa tài khoản</h3>
                                <p className="text-sm text-gray-600">Tài khoản sẽ bị tạm ngừng hoạt động</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=48`}
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full"
                                    />
                                    {isSuper && (
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full grid place-items-center">
                                            <Star size={10} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-medium truncate">{user.name}</div>
                                    <div className="text-sm text-slate-600">{user.email}</div>
                                    <RoleBadge role={user.role} isSuper={user.isSuper} />
                                </div>
                            </div>
                        </div>

                        {isSuper && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <AlertTriangle size={16} />
                                    <span className="font-medium text-sm">Cảnh báo</span>
                                </div>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Bạn đang khóa một Super Admin. Hành động này cần được thận trọng.
                                </p>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do khóa tài khoản *
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400"
                                rows={3}
                                placeholder="Nhập lý do khóa tài khoản..."
                                required
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={banning}
                                className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleBan}
                                disabled={banning || !reason.trim()}
                                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                                {banning ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang khóa...
                                    </span>
                                ) : (
                                    'Khóa tài khoản'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Add User Modal - Enhanced
function AddUserModal({ isOpen, onClose, onAdd }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user'
    })
    const [adding, setAdding] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name.trim() || !formData.email.trim()) return

        setAdding(true)
        try {
            await onAdd(formData)
            setFormData({ name: '', email: '', role: 'user' })
            onClose()
        } catch (error) {
            console.error('Add user failed:', error)
        } finally {
            setAdding(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-blue-100 grid place-items-center">
                                <Plus size={24} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Thêm người dùng</h3>
                                <p className="text-sm text-gray-600">Tạo tài khoản mới</p>
                            </div>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên hiển thị *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Nhập tên người dùng"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="email@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vai trò
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="user">👤 Người dùng</option>
                                    <option value="admin">👑 Quản trị viên</option>
                                    <option value="superadmin">⭐ Super Admin</option>
                                </select>
                                {formData.role === 'superadmin' && (
                                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        Cấp quyền Super Admin cần được thận trọng
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={adding}
                                className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={adding || !formData.name.trim() || !formData.email.trim()}
                                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {adding ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang tạo...
                                    </span>
                                ) : (
                                    'Tạo tài khoản'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Main UsersTab Component
export default function UsersTab() {
    // State management
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter states
    const [query, setQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0
    })

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showBanModal, setShowBanModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    // Load users from API
    const loadUsers = async (page = pagination.page, search = query) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pagination.pageSize.toString()
            })

            if (search.trim()) params.append('search', search.trim())

            const data = await apiCall(`/admin/users?${params}`)

            setUsers(data.items || [])
            setPagination(prev => ({
                ...prev,
                page: data.page || page,
                total: data.total || 0
            }))
        } catch (err) {
            setError(err.message)
            console.error('Failed to load users:', err)
        } finally {
            setLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        loadUsers()
    }, [])

    // Search handler
    const handleSearch = () => {
        loadUsers(1, query)
    }

    // Filter users by role - Sửa lại logic filter
    const filtered = useMemo(() => {
        return users.filter(u => {
            if (roleFilter === 'all') return true
            if (roleFilter === 'superadmin') return u.isSuper === true || u.isSuper === 1
            if (roleFilter === 'admin') return u.role === 'admin' && !(u.isSuper === true || u.isSuper === 1)
            if (roleFilter === 'user') return u.role === 'user' || (!u.role && !(u.isSuper === true || u.isSuper === 1))
            return false
        })
    }, [users, roleFilter])

    // User actions - CẬP NHẬT LOGIC PHÂN QUYỀN
    const changeUserRole = async (userId, newRole) => {
        try {
            // Validate trước khi gọi API
            const targetUser = users.find(u => u.id === userId)
            if (!targetUser) {
                alert('❌ Không tìm thấy người dùng')
                return
            }

            // ✅ Lấy thông tin user hiện tại từ localStorage
            const currentUserData = getCurrentUser()
            if (!currentUserData) {
                alert('❌ Không xác định được người dùng hiện tại.\n\nVui lòng đăng nhập lại.')
                return
            }

            // ✅ Tìm currentUser trong danh sách users (để có đầy đủ thông tin)
            const currentUser = users.find(u => u.email === currentUserData.email)
            if (!currentUser) {
                alert('❌ Không tìm thấy thông tin người dùng hiện tại trong hệ thống.')
                return
            }

            // ✅ Chuẩn hóa quyền
            const callerIsSuper = currentUser.isSuper === true || currentUser.isSuper === 1 || currentUser.role === 'superadmin'
            const targetIsSuper = targetUser.isSuper === true || targetUser.isSuper === 1 || targetUser.role === 'superadmin'

            console.log('🔍 Role Check:', {
                currentUser: currentUser.email,
                callerRole: currentUser.role,
                callerIsSuper,
                targetUser: targetUser.email,
                targetRole: targetUser.role,
                targetIsSuper,
                newRole
            })

            // ===========================
            // FRONTEND VALIDATION (giống backend)
            // ===========================

            // 1. Không tự thay đổi quyền
            if (currentUser.id === userId) {
                alert('🚫 Không được tự thay đổi quyền của chính bạn qua API.')
                return
            }

            // 2. Chỉ SuperAdmin động SuperAdmin
            if (targetIsSuper && !callerIsSuper) {
                alert('🚫 Chỉ Super Admin mới có quyền thay đổi Super Admin khác.\n\n' +
                    'Bạn cần quyền Super Admin để thực hiện hành động này.')
                return
            }

            // 3. Admin thường chỉ động user
            if (currentUser.role === 'admin' && !callerIsSuper && targetUser.role !== 'user') {
                alert('🚫 Admin chỉ có thể thao tác trên người dùng bình thường.\n\n' +
                    'Chỉ Super Admin mới có quyền thay đổi quyền Admin.')
                return
            }

            // 4. Chỉ Super Admin mới thăng admin
            if (newRole === 'admin' && targetUser.role === 'user' && !callerIsSuper) {
                alert('🚫 Chỉ Super Admin mới có quyền thăng admin.')
                return
            }

            // 5. Chỉ Super Admin mới hạ admin
            if (newRole === 'user' && targetUser.role === 'admin' && !callerIsSuper) {
                alert('🚫 Chỉ Super Admin mới có quyền hạ admin.')
                return
            }

            // 6. Chỉ Super Admin mới thăng/hạ Super Admin
            if ((newRole === 'superadmin' || targetIsSuper) && !callerIsSuper) {
                alert('🚫 Chỉ Super Admin mới có quyền thăng/hạ Super Admin.')
                return
            }

            // ===========================
            // CONFIRM ACTION
            // ===========================
            const confirmMsg = getConfirmMessage(targetUser, newRole)
            if (!confirm(confirmMsg)) return

            // ===========================
            // GỌI API
            // ===========================
            const response = await apiCall(`/admin/users/${userId}/role`, {
                method: 'POST',
                body: JSON.stringify({ role: newRole })
            })

            // ===========================
            // XỬ LÝ KẾT QUẢ
            // ===========================
            await loadUsers() // Reload danh sách
            setShowDetailModal(false)

            if (response.success && response.before && response.after) {
                const { before, after } = response
                const beforeText = getRoleText(before.role, before.isSuper)
                const afterText = getRoleText(after.role, after.isSuper)

                alert(`✅ Đã cập nhật vai trò thành công!\n\n` +
                    `Người dùng: ${targetUser.name}\n` +
                    `Trước: ${beforeText}\n` +
                    `Sau: ${afterText}\n\n` +
                    `Thay đổi đã được ghi nhận vào hệ thống.`)
            } else {
                alert('✅ Đã cập nhật vai trò thành công!')
            }
        } catch (error) {
            console.error('❌ Failed to change role:', error)
            handleRoleChangeError(error)
        }
    }

    // Helper: Get current user email from localStorage
    const getCurrentUserEmail = () => {
        try {
            const me = JSON.parse(localStorage.getItem('kh_me') || 'null')
            return me?.email || null
        } catch {
            return null
        }
    }

    // Helper: Get current user full info
    const getCurrentUser = () => {
        try {
            const me = JSON.parse(localStorage.getItem('kh_me') || 'null')
            return me || null
        } catch {
            return null
        }
    }

    // Helper: Get role text for display
    const getRoleText = (role, isSuper) => {
        if (isSuper === true || isSuper === 1) return '⭐ Super Admin'
        if (role === 'admin') return '👑 Admin'
        return '👤 User'
    }

    // Helper: Get confirmation message
    const getConfirmMessage = (user, newRole) => {
        const current = getRoleText(user.role, user.isSuper)
        const target = getRoleText(newRole, newRole === 'superadmin' ? 1 : 0)

        let warning = ''
        if (newRole === 'superadmin') {
            warning = '\n\n⚠️ CHÚ Ý: Super Admin có toàn quyền trong hệ thống!\n' +
                'Hành động này cần được thận trọng và có thẩm quyền phê duyệt.'
        } else if (user.isSuper && newRole !== 'superadmin') {
            warning = '\n\n⚠️ Bạn đang hạ quyền một Super Admin.\n' +
                'Điều này sẽ ảnh hưởng đến quyền quản trị của họ.'
        }

        return `🔄 Xác nhận thay đổi vai trò\n\n` +
            `Người dùng: ${user.name}\n` +
            `Email: ${user.email}\n\n` +
            `Vai trò hiện tại: ${current}\n` +
            `Vai trò mới: ${target}${warning}\n\n` +
            `Bạn có chắc chắn muốn thực hiện thay đổi này?`
    }

    // Helper: Handle role change errors
    const handleRoleChangeError = (error) => {
        let errorMessage = 'Có lỗi xảy ra khi thay đổi vai trò'

        const errorStr = error.message || ''

        if (errorStr.includes('500') || errorStr.includes('Internal Server Error')) {
            errorMessage = '❌ Lỗi server nội bộ.\n\n' +
                'Có thể do:\n' +
                '• Stored procedure từ chối thay đổi\n' +
                '• Ràng buộc về phân quyền trong database\n' +
                '• Trigger database từ chối thay đổi\n\n' +
                'Vui lòng liên hệ quản trị viên hệ thống.'
        } else if (errorStr.includes('403') || errorStr.includes('Forbid')) {
            errorMessage = '🚫 Bạn không có quyền thực hiện hành động này.\n\n' +
                'Chỉ Super Admin mới có thể:\n' +
                '• Thăng/hạ quyền Admin ↔ User\n' +
                '• Quản lý Super Admin khác\n' +
                '• Thay đổi cấu trúc phân quyền\n\n' +
                'Vui lòng liên hệ Super Admin nếu bạn cần hỗ trợ.'
        } else if (errorStr.includes('404') || errorStr.includes('Not Found')) {
            errorMessage = '❓ Không tìm thấy người dùng.\n\n' +
                'Người dùng có thể đã bị xóa hoặc không tồn tại trong hệ thống.'
        } else if (errorStr.includes('400') || errorStr.includes('BadRequest')) {
            errorMessage = '⚠️ Yêu cầu không hợp lệ.\n\n' +
                'Lỗi có thể do:\n' +
                '• Không được tự thay đổi quyền của chính mình\n' +
                '• Vai trò mới không hợp lệ (phải là user/admin/superadmin)\n' +
                '• Dữ liệu gửi đi không đúng định dạng'
        } else if (errorStr.includes('Unauthorized') || errorStr.includes('401')) {
            errorMessage = '🔐 Phiên đăng nhập đã hết hạn.\n\n' +
                'Vui lòng đăng nhập lại để tiếp tục.'
        }

        alert(errorMessage + '\n\n💡 Chi tiết kỹ thuật:\n' + errorStr)
    }

    // Ban user - ✅ CẬP NHẬT ĐỂ KHỚP VỚI BACKEND
    const banUser = async (userId, reason) => {
        try {
            const targetUser = users.find(u => u.id === userId)
            if (!targetUser) {
                alert('❌ Không tìm thấy người dùng')
                return
            }

            // ✅ Lấy thông tin user hiện tại
            const currentUserData = getCurrentUser()
            if (!currentUserData) {
                alert('❌ Không xác định được người dùng hiện tại.\n\nVui lòng đăng nhập lại.')
                return
            }

            const currentUser = users.find(u => u.email === currentUserData.email)
            if (!currentUser) {
                alert('❌ Không tìm thấy thông tin người dùng hiện tại trong hệ thống.')
                return
            }

            const callerIsSuper = currentUser.isSuper === true || currentUser.isSuper === 1 || currentUser.role === 'superadmin'
            const targetIsSuper = targetUser.isSuper === true || targetUser.isSuper === 1 || targetUser.role === 'superadmin'

            // ===========================
            // FRONTEND VALIDATION (KHỚP VỚI BACKEND)
            // ===========================

            // ❌ Rule 1: Không tự khóa bản thân
            if (currentUser.id === userId) {
                alert('🚫 KHÔNG THỂ TỰ KHÓA CHÍNH MÌNH\n\n' +
                    'Bạn không thể tự khóa tài khoản của chính bạn qua API.\n\n' +
                    '💡 Nếu cần vô hiệu hóa tài khoản của bạn, vui lòng:\n' +
                    '• Liên hệ Super Admin khác\n' +
                    '• Hoặc sử dụng chức năng đăng xuất')
                return
            }

            // ❌ Rule 2: Chỉ Super Admin khóa Super Admin khác
            if (targetIsSuper && !callerIsSuper) {
                alert('🚫 KHÔNG THỂ KHÓA SUPER ADMIN\n\n' +
                    'Chỉ Super Admin mới có quyền khóa Super Admin khác.\n\n' +
                    '💡 Hành động này yêu cầu quyền cao nhất để đảm bảo an ninh.')
                return
            }

            // ❌ Rule 3: Chỉ Super Admin khóa Admin
            if (targetUser.role === 'admin' && !callerIsSuper) {
                alert('🚫 KHÔNG THỂ KHÓA ADMIN\n\n' +
                    'Chỉ Super Admin mới có quyền khóa tài khoản Admin.\n\n' +
                    '💡 Admin thường không thể khóa Admin khác để tránh xung đột quyền hạn.')
                return
            }

            // ✅ Confirm trước khi khóa
            let confirmMsg = '🔒 XÁC NHẬN KHÓA TÀI KHOẢN\n\n'
            confirmMsg += `Người dùng: ${targetUser.name}\n`
            confirmMsg += `Email: ${targetUser.email}\n`
            confirmMsg += `Vai trò: ${getRoleText(targetUser.role, targetUser.isSuper)}\n`
            confirmMsg += `Lý do: ${reason || 'Không có'}\n\n`

            if (targetIsSuper) {
                confirmMsg += '⚠️ CHÚ Ý: Bạn đang khóa một Super Admin!\n'
                confirmMsg += 'Hành động này sẽ:\n'
                confirmMsg += '• Vô hiệu hóa toàn bộ quyền của họ\n'
                confirmMsg += '• Ngăn họ đăng nhập vào hệ thống\n'
                confirmMsg += '• Có thể ảnh hưởng đến hoạt động quản trị\n\n'
            } else if (targetUser.role === 'admin') {
                confirmMsg += '⚠️ CHÚ Ý: Bạn đang khóa một Admin!\n'
                confirmMsg += 'Điều này sẽ ảnh hưởng đến khả năng quản lý của họ.\n\n'
            }

            confirmMsg += 'Bạn có chắc chắn muốn tiếp tục?'

            if (!confirm(confirmMsg)) return

            // ===========================
            // GỌI API KHÓA TÀI KHOẢN
            // ===========================
            console.log(`[BanUser] Calling API to ban user ${userId}...`)

            const response = await apiCall(`/admin/users/${userId}/ban`, {
                method: 'POST',
                body: JSON.stringify({ reason: reason || '' })
            })

            console.log('[BanUser] API Response:', response)

            await loadUsers()
            setShowBanModal(false)

            if (response.success) {
                alert(`✅ ĐÃ KHÓA TÀI KHOẢN THÀNH CÔNG!\n\n` +
                    `Người dùng: ${targetUser.name}\n` +
                    `Email: ${targetUser.email}\n` +
                    `Lý do: ${reason || 'Không có'}\n` +
                    `Trạng thái mới: ${response.status || 'bi_khoa'}\n\n` +
                    `🔔 Người dùng này sẽ không thể đăng nhập cho đến khi được mở khóa.`)
            }
        } catch (error) {
            console.error('❌ Failed to ban user:', error)
            handleBanError(error)
        }
    }

    // Helper: Handle ban errors - ✅ CẬP NHẬT
    const handleBanError = (error) => {
        const errorStr = error.message || ''
        console.error('🔴 Ban Error Details:', {
            message: errorStr,
            stack: error.stack,
            fullError: error
        })

        let errorMessage = '❌ Có lỗi xảy ra khi khóa tài khoản'

        if (errorStr.includes('500') || errorStr.includes('Internal Server Error')) {
            errorMessage = '🔧 LỖI SERVER - Stored Procedure\n\n' +
                '📌 NGUYÊN NHÂN:\n' +
                '• Stored procedure sp_LockUser chưa tồn tại\n' +
                '• SP có lỗi logic hoặc validation\n' +
                '• Trigger database từ chối thay đổi\n' +
                '• Ràng buộc phân quyền trong database\n\n' +
                '🔨 CÁCH SỬA:\n' +
                '1. Kiểm tra SP: SELECT OBJECT_ID(\'dbo.sp_LockUser\')\n' +
                '2. Tạo SP nếu chưa có (xem hướng dẫn)\n' +
                '3. Test SP: EXEC sp_LockUser @ActorId=1, @TargetId=5, @Reason=\'Test\'\n' +
                '4. Xem error log: EXEC sp_readerrorlog\n\n' +
                '💡 Liên hệ quản trị viên hệ thống để fix stored procedure.'
        } else if (errorStr.includes('403') || errorStr.includes('Forbid')) {
            errorMessage = '🚫 KHÔNG CÓ QUYỀN KHÓA TÀI KHOẢN\n\n' +
                '📌 Quy tắc phân quyền:\n' +
                '• Chỉ Super Admin mới có quyền khóa tài khoản\n' +
                '• Admin thường KHÔNG thể khóa bất kỳ ai\n' +
                '• Super Admin khóa được: User, Admin, Super Admin khác\n' +
                '• KHÔNG ai có thể tự khóa chính mình\n\n' +
                '💡 Nếu bạn cần khóa tài khoản này, vui lòng:\n' +
                '• Liên hệ Super Admin\n' +
                '• Yêu cầu quyền Super Admin (nếu phù hợp)'
        } else if (errorStr.includes('400') || errorStr.includes('BadRequest')) {
            errorMessage = '⚠️ YÊU CẦU KHÔNG HỢP LỆ\n\n' +
                '📌 Lỗi có thể do:\n' +
                '• Không thể tự khóa tài khoản của chính mình qua API.\n' +
                '• Lý do khóa không hợp lệ\n' +
                '• Dữ liệu gửi đi sai định dạng\n\n' +
                '💡 Vui lòng kiểm tra lại thông tin và thử lại.'
        } else if (errorStr.includes('404') || errorStr.includes('Not Found')) {
            errorMessage = '❓ KHÔNG TÌM THẤY NGƯỜI DÙNG\n\n' +
                'Người dùng này có thể:\n' +
                '• Đã bị xóa khỏi hệ thống\n' +
                '• Không tồn tại trong database\n' +
                '• ID không hợp lệ\n\n' +
                '💡 Vui lòng làm mới danh sách và thử lại.'
        } else if (errorStr.includes('Unauthorized') || errorStr.includes('401')) {
            errorMessage = '🔐 PHIÊN ĐĂNG NHẬP HẾT HẠN\n\n' +
                'Vui lòng đăng nhập lại để tiếp tục.\n\n' +
                '💡 Bạn sẽ được chuyển đến trang đăng nhập.'
        }

        alert(errorMessage + '\n\n🔍 Chi tiết kỹ thuật:\n' + errorStr)
    }

    // Unlock user - ✅ CẬP NHẬT
    const unlockUser = async (userId) => {
        try {
            const targetUser = users.find(u => u.id === userId)
            if (!targetUser) {
                alert('❌ Không tìm thấy người dùng')
                return
            }

            // Confirm trước khi mở khóa
            if (!confirm(
                `🔓 XÁC NHẬN MỞ KHÓA TÀI KHOẢN\n\n` +
                `Người dùng: ${targetUser.name}\n` +
                `Email: ${targetUser.email}\n` +
                `Vai trò: ${getRoleText(targetUser.role, targetUser.isSuper)}\n\n` +
                `Sau khi mở khóa, người dùng này sẽ có thể đăng nhập trở lại.\n\n` +
                `Bạn có chắc chắn muốn mở khóa?`
            )) return

            console.log(`[UnlockUser] Calling API to unlock user ${userId}...`)

            const response = await apiCall(`/admin/users/${userId}/unlock`, {
                method: 'POST'
            })

            console.log('[UnlockUser] API Response:', response)

            await loadUsers()
            setShowDetailModal(false)

            if (response.success) {
                alert(`✅ ĐÃ MỞ KHÓA TÀI KHOẢN THÀNH CÔNG!\n\n` +
                    `Người dùng: ${targetUser.name}\n` +
                    `Email: ${targetUser.email}\n` +
                    `Trạng thái mới: ${response.status || 'hoat_dong'}\n\n` +
                    `🔔 Người dùng này đã có thể đăng nhập trở lại.`)
            }
        } catch (error) {
            console.error('❌ Failed to unlock user:', error)

            let errorMessage = 'Có lỗi xảy ra khi mở khóa tài khoản'
            const errorStr = error.message || ''

            if (errorStr.includes('500')) {
                errorMessage = '❌ Lỗi server khi thực thi stored procedure sp_UnlockUser.\n\n' +
                    'Vui lòng kiểm tra:\n' +
                    '• SP sp_UnlockUser có tồn tại không\n' +
                    '• Log server để xem chi tiết lỗi\n\n' +
                    'Liên hệ quản trị viên hệ thống.'
            } else if (errorStr.includes('403') || errorStr.includes('Forbid')) {
                errorMessage = '🚫 Bạn không có quyền mở khóa tài khoản này.\n\n' +
                    'Chỉ Super Admin mới có thể mở khóa tài khoản.'
            } else if (errorStr.includes('404')) {
                errorMessage = '❓ Không tìm thấy người dùng.\n\nVui lòng làm mới danh sách.'
            }

            alert(errorMessage + '\n\n💡 Chi tiết: ' + errorStr)
        }
    }

    const viewUserDetail = (user) => {
        setSelectedUser(user)
        setShowDetailModal(true)
    }

    const addUser = async (userData) => {
        // This would need a create user endpoint
        console.log('Adding user:', userData)
        // Mock implementation - replace with actual API call
        alert('Chức năng thêm người dùng đang được phát triển')
    }

    // Calculate stats
    const stats = useMemo(() => {
        const total = pagination.total
        const superAdminCount = users.filter(u => u.isSuper || u.role === 'superadmin').length
        const adminCount = users.filter(u => u.role === 'admin' && !(u.isSuper === true || u.isSuper === 1)).length
        const userCount = users.filter(u => u.role === 'user' || (!u.role && !(u.isSuper === true || u.isSuper === 1))).length
        const activeCount = users.filter(u => u.status === 'active').length
        const bannedCount = users.filter(u => u.status === 'bi_khoa').length

        return { total, superAdmin: superAdminCount, admin: adminCount, user: userCount, active: activeCount, banned: bannedCount }
    }, [users, pagination.total])

    // Render loading state
    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải danh sách người dùng...</p>
                </div>
            </div>
        )
    }

    // Render error state
    if (error && users.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => loadUsers()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{fmt(stats.total)}</div>
                            <div className="text-sm text-slate-500">Tổng số</div>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <User size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{fmt(stats.superAdmin)}</div>
                            <div className="text-sm text-slate-500">Super Admin</div>
                        </div>
                        <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-600">
                            <Star size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{fmt(stats.admin)}</div>
                            <div className="text-sm text-slate-500">Admin</div>
                        </div>
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <Crown size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-600">{fmt(stats.user)}</div>
                            <div className="text-sm text-slate-500">User</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-100 text-slate-600">
                            <User size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-emerald-600">{fmt(stats.active)}</div>
                            <div className="text-sm text-slate-500">Hoạt động</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <UserCheck size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-rose-600">{fmt(stats.banned)}</div>
                            <div className="text-sm text-slate-500">Bị khóa</div>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                            <UserX size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-72 rounded-2xl ring-1 ring-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-blue-400 focus:ring-2 transition-all"
                            placeholder="Tìm theo tên hoặc email..."
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none rounded-2xl ring-1 ring-slate-200 bg-white pl-3 pr-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                        >
                            <option value="all">Tất cả vai trò</option>
                            <option value="superadmin">⭐ Super Admin</option>
                            <option value="admin">👑 Quản trị viên</option>
                            <option value="user">👤 Người dùng</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>

                    <button
                        onClick={handleSearch}
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        Tìm kiếm
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                        <Plus size={16} /> Thêm người dùng
                    </button>
                    <button
                        onClick={() => loadUsers()}
                        className="inline-flex items-center gap-2 rounded-xl bg-white ring-1 ring-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw size={16} /> Làm mới
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/75 bg-white shadow-sm">
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[900px] w-full text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold">Người dùng</th>
                                <th className="text-left px-4 py-4 font-semibold">Vai trò</th>
                                <th className="text-left px-4 py-4 font-semibold">Trạng thái</th>
                                <th className="text-left px-4 py-4 font-semibold">Ngày tham gia</th>
                                <th className="text-left px-4 py-4 font-semibold">Cập nhật</th>
                                <th className="text-right px-6 py-4 font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span className="text-slate-500">Đang tải...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && filtered.map(user => {
                                // Sửa lại cách kiểm tra Super Admin
                                const isSuper = user.isSuper === true || user.isSuper === 1

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img
                                                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&size=48`}
                                                        alt={user.name}
                                                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                                                    />
                                                    {isSuper && (
                                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full grid place-items-center">
                                                            <Star size={10} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-slate-900 truncate max-w-xs">{user.name}</div>
                                                    <div className="text-xs text-slate-500 truncate max-w-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <RoleBadge role={user.role} isSuper={user.isSuper} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(user.ngayTao)}</td>
                                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(user.ngayCapNhat)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => viewUserDetail(user)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={14} /> Chi tiết
                                                </button>

                                                {isSuper ? (
                                                    <button
                                                        onClick={() => changeUserRole(user.id, 'admin')}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-yellow-600 hover:to-orange-600 transition-colors"
                                                        title="Hạ xuống Admin"
                                                    >
                                                        <Crown size={14} /> Hạ quyền
                                                    </button>
                                                ) : user.role === 'admin' ? (
                                                    <>
                                                        <button
                                                            onClick={() => changeUserRole(user.id, 'superadmin')}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-yellow-600 hover:to-orange-600 transition-colors"
                                                            title="Thăng Super Admin"
                                                        >
                                                            <Star size={14} /> Super
                                                        </button>
                                                        <button
                                                            onClick={() => changeUserRole(user.id, 'user')}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                                                            title="Hạ xuống User"
                                                        >
                                                            <User size={14} /> Hạ quyền
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => changeUserRole(user.id, 'admin')}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                                                        title="Thăng Admin"
                                                    >
                                                        <Crown size={14} /> Thăng Admin
                                                    </button>
                                                )}

                                                {/* Ban/Unban button - CHỈ HIỂN THỊ CHO SUPER ADMIN */}
                                                {(() => {
                                                    const currentUserData = getCurrentUser()
                                                    const currentUser = users.find(u => u.email === currentUserData?.email)
                                                    const callerIsSuper = currentUser?.isSuper === true || currentUser?.isSuper === 1

                                                    // ❌ Không phải Super Admin → KHÔNG hiển thị nút
                                                    if (!callerIsSuper) {
                                                        return null
                                                    }

                                                    // ✅ Super Admin → Hiển thị nút dựa trên trạng thái
                                                    return user.status === 'bi_khoa' ? (
                                                        <button
                                                            onClick={() => unlockUser(user.id)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                                                            title="Mở khóa tài khoản"
                                                        >
                                                            <Unlock size={14} /> Mở khóa
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user)
                                                                setShowBanModal(true)
                                                            }}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                                                            title="Khóa tài khoản"
                                                        >
                                                            <Ban size={14} /> Khóa
                                                        </button>
                                                    )
                                                })()}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}

                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có người dùng</h3>
                                        <p className="text-gray-500">Không tìm thấy người dùng phù hợp với bộ lọc hiện tại.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.total > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t">
                        <div className="text-sm text-slate-600">
                            Hiển thị <span className="font-semibold">{((pagination.page - 1) * pagination.pageSize) + 1}</span> đến{' '}
                            <span className="font-semibold">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> trong tổng số{' '}
                            <span className="font-semibold">{pagination.total}</span> người dùng
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => loadUsers(pagination.page - 1, query)}
                                disabled={pagination.page <= 1}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Trước
                            </button>

                            <div className="flex items-center gap-1">
                                {(() => {
                                    const totalPages = Math.ceil(pagination.total / pagination.pageSize)
                                    const maxVisible = 5
                                    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2))
                                    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

                                    if (endPage - startPage + 1 < maxVisible) {
                                        startPage = Math.max(1, endPage - maxVisible + 1)
                                    }

                                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                                        const page = startPage + i
                                        const isActive = page === pagination.page
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => loadUsers(page, query)}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-slate-200 bg-white hover:bg-slate-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        )
                                    })
                                })()}
                            </div>

                            <button
                                onClick={() => loadUsers(pagination.page + 1, query)}
                                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals - ✅ CẬP NHẬT PROPS */}
            <UserDetailModal
                user={selectedUser}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onRoleChange={changeUserRole}
                onBanUser={(userId) => {
                    // Mở modal ban
                    setSelectedUser(users.find(u => u.id === userId))
                    setShowBanModal(true)
                }}
                onUnlockUser={unlockUser}
                users={users}                              // ✅ THÊM: Truyền users
                currentUserEmail={getCurrentUserEmail()}   // ✅ THÊM: Truyền email hiện tại
            />

            <BanUserModal
                user={selectedUser}
                isOpen={showBanModal}
                onClose={() => setShowBanModal(false)}
                onConfirm={(reason) => banUser(selectedUser?.id, reason)}
            />

            <AddUserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={addUser}
            />
        </div>
    )
}