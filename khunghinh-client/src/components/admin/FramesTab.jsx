import { useState, useEffect, useMemo } from 'react'
import {
    Search, ChevronDown, Upload, Filter, CheckCircle2, XCircle,
    Eye, Trash2, Star, ImageIcon, Edit, MoreVertical, ToggleLeft, ToggleRight,
    Calendar, User, TrendingUp, Download, AlertTriangle
} from 'lucide-react'

// API Configuration - Thay đổi dòng này
const API_BASE = import.meta.env.VITE_API_ORIGIN || 'http://localhost:7090'

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

// API helper with credentials
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
        console.error('API Error:', error)
        throw error
    }
}

// Status mapping and styling
const STATUS_MAPPING = {
    'dang_hoat_dong': {
        key: 'active',
        label: 'Đang hoạt động',
        chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        dot: 'bg-emerald-500'
    },
    'cho_duyet': {
        key: 'pending',
        label: 'Chờ duyệt',
        chip: 'bg-amber-50 text-amber-700 ring-amber-200',
        dot: 'bg-amber-500'
    },
    'bi_khoa': {
        key: 'blocked',
        label: 'Bị khóa',
        chip: 'bg-rose-50 text-rose-700 ring-rose-200',
        dot: 'bg-rose-500'
    },
    'da_xoa': {
        key: 'deleted',
        label: 'Đã xóa',
        chip: 'bg-slate-50 text-slate-700 ring-slate-200',
        dot: 'bg-slate-400'
    }
}

function StatusBadge({ status }) {
    const meta = STATUS_MAPPING[status] || STATUS_MAPPING['bi_khoa']
    return (
        <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-medium ring-1 ${meta.chip}`}>
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    )
}

// Enhanced Frame Detail Modal
function FrameDetailModal({ frame, isOpen, onClose, onStatusChange }) {
    if (!isOpen || !frame) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 grid place-items-center">
                                <ImageIcon size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{frame.tieuDe}</h3>
                                <p className="text-sm text-gray-500">ID: {frame.id} • /{frame.alias}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle size={20} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Image Preview */}
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold mb-3 text-gray-900">Ảnh xem trước</h4>
                                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 ring-2 ring-white shadow-lg">
                                        {frame.urlXemTruoc ? (
                                            <img
                                                src={`${API_BASE}${frame.urlXemTruoc}`}
                                                alt={frame.tieuDe}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://via.placeholder.com/400x400/e2e8f0/64748b?text=No+Image`
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full grid place-items-center">
                                                <div className="text-center">
                                                    <ImageIcon size={48} className="text-slate-400 mx-auto mb-2" />
                                                    <p className="text-slate-500">Chưa có ảnh</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Variants Preview */}
                                {frame.variants && frame.variants.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 text-gray-900">
                                            Biến thể ({frame.variants.length})
                                        </h4>
                                        <div className="grid grid-cols-3 gap-3">
                                            {frame.variants.map((variant, idx) => (
                                                <div key={variant.id || idx} className="group">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                                                        {variant.anhPngUrl ? (
                                                            <img
                                                                src={`${API_BASE}${variant.anhPngUrl}`}
                                                                alt={variant.tenBienThe}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                onError={(e) => {
                                                                    e.target.src = `https://via.placeholder.com/120x120/e2e8f0/64748b?text=${variant.tenBienThe?.charAt(0) || 'V'}`
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full grid place-items-center">
                                                                <ImageIcon size={20} className="text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 text-xs text-slate-600 truncate">
                                                        {variant.tenBienThe || `Biến thể ${idx + 1}`}
                                                    </div>
                                                    <StatusBadge status={variant.trangThai} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Frame Details */}
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <h4 className="font-semibold mb-4 text-gray-900">Thông tin cơ bản</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Trạng thái:</span>
                                            <StatusBadge status={frame.trangThai} />
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Chế độ hiển thị:</span>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${frame.cheDoHienThi === 'cong_khai'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {frame.cheDoHienThi === 'cong_khai' ? 'Công khai' : 'Riêng tư'}
                                            </span>
                                        </div>
                                        {frame.moTa && (
                                            <div className="col-span-2">
                                                <span className="text-slate-600">Mô tả:</span>
                                                <p className="mt-1 text-slate-900 bg-white rounded-lg p-3 text-sm">
                                                    {frame.moTa}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Statistics */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4">
                                    <h4 className="font-semibold mb-4 text-gray-900">Thống kê sử dụng</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-xl p-3 text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Eye size={16} className="text-blue-600" />
                                                <span className="text-xs font-medium text-slate-600">Lượt xem</span>
                                            </div>
                                            <div className="text-xl font-bold text-blue-600">{fmt(frame.luotXem || 0)}</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-3 text-center">
                                            <div className="flex items-center justify-center gap-2 mb-1">
                                                <Download size={16} className="text-emerald-600" />
                                                <span className="text-xs font-medium text-slate-600">Lượt tải</span>
                                            </div>
                                            <div className="text-xl font-bold text-emerald-600">{fmt(frame.luotTai || 0)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Info */}
                                {frame.owner && (
                                    <div className="bg-slate-50 rounded-2xl p-4">
                                        <h4 className="font-semibold mb-3 text-gray-900">Thông tin tác giả</h4>
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={frame.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(frame.owner.name || 'User')}&size=48`}
                                                alt={frame.owner.name}
                                                className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900">{frame.owner.name}</div>
                                                <div className="text-sm text-gray-600 truncate">{frame.owner.email}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Timestamps */}
                                <div className="bg-slate-50 rounded-2xl p-4">
                                    <h4 className="font-semibold mb-3 text-gray-900">Thời gian</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                <span className="text-slate-600">Ngày tạo:</span>
                                            </div>
                                            <span className="font-medium">{formatDate(frame.ngayDang)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Edit size={14} className="text-slate-500" />
                                                <span className="text-slate-600">Cập nhật:</span>
                                            </div>
                                            <span className="font-medium">{formatDate(frame.ngayChinhSua)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="pt-4 border-t">
                                    <h4 className="font-semibold mb-3 text-gray-900">Hành động nhanh</h4>
                                    <div className="grid gap-2">
                                        {frame.trangThai === 'cho_duyet' ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => onStatusChange(frame.id, 'dang_hoat_dong')}
                                                    className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                                                >
                                                    <CheckCircle2 size={16} /> Duyệt
                                                </button>
                                                <button
                                                    onClick={() => onStatusChange(frame.id, 'bi_khoa')}
                                                    className="flex items-center justify-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors"
                                                >
                                                    <XCircle size={16} /> Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {frame.trangThai === 'dang_hoat_dong' ? (
                                                    <button
                                                        onClick={() => onStatusChange(frame.id, 'bi_khoa')}
                                                        className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
                                                    >
                                                        <ToggleLeft size={16} /> Tạm khóa
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => onStatusChange(frame.id, 'dang_hoat_dong')}
                                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                                                    >
                                                        <ToggleRight size={16} /> Kích hoạt
                                                    </button>
                                                )}
                                                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                                    <Upload size={16} /> Thay ảnh
                                                </button>
                                            </div>
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

// Delete Confirmation Modal
function DeleteConfirmModal({ frame, isOpen, onClose, onConfirm }) {
    const [deleting, setDeleting] = useState(false)

    if (!isOpen || !frame) return null

    const handleDelete = async () => {
        setDeleting(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error('Delete failed:', error)
        } finally {
            setDeleting(false)
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
                                <AlertTriangle size={24} className="text-rose-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Xóa khung hình</h3>
                                <p className="text-sm text-gray-600">Hành động này không thể hoàn tác</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                {frame.urlXemTruoc && (
                                    <img
                                        src={`${API_BASE}${frame.urlXemTruoc}`}
                                        alt={frame.tieuDe}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="min-w-0">
                                    <div className="font-medium truncate">{frame.tieuDe}</div>
                                    <div className="text-sm text-slate-600">/{frame.alias}</div>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa khung hình "<strong>{frame.tieuDe}</strong>" không?
                            Tất cả dữ liệu và file liên quan sẽ bị xóa vĩnh viễn.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 text-slate-700 bg-slate-100 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                                {deleting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xóa...
                                    </span>
                                ) : (
                                    'Xóa vĩnh viễn'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Main FramesTab Component
export default function FramesTab() {
    // State management
    const [frames, setFrames] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter states
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 20,
        total: 0
    })

    // Modal states
    const [selectedFrame, setSelectedFrame] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Load frames from API
    const loadFrames = async (page = pagination.page, search = query, status = statusFilter) => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pagination.pageSize.toString()
            })

            if (search.trim()) params.append('search', search.trim())
            if (status !== 'all') params.append('status', status)

            const data = await apiCall(`/admin/frames?${params}`)

            setFrames(data.items || [])
            setPagination(prev => ({
                ...prev,
                page: data.page || page,
                total: data.total || 0
            }))
        } catch (err) {
            setError(err.message)
            console.error('Failed to load frames:', err)
        } finally {
            setLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        loadFrames()
    }, [])

    // Search handler
    const handleSearch = () => {
        loadFrames(1, query, statusFilter)
    }

    // Status filter handler
    const handleStatusFilter = (newStatus) => {
        setStatusFilter(newStatus)
        loadFrames(1, query, newStatus)
    }

    // Pagination handler
    const handlePageChange = (newPage) => {
        loadFrames(newPage, query, statusFilter)
    }

    // Frame actions
    const changeFrameStatus = async (frameId, newStatus) => {
        try {
            await apiCall(`/admin/frames/${frameId}/status`, {
                method: 'POST',
                body: JSON.stringify({ status: newStatus })
            })

            // Refresh current page
            loadFrames()

            // Close modal if open
            setShowDetailModal(false)

            alert('Đã cập nhật trạng thái thành công!')
        } catch (error) {
            console.error('Failed to change status:', error)
            alert('Có lỗi xảy ra: ' + error.message)
        }
    }

    const deleteFrame = async (frameId) => {
        try {
            await apiCall(`/admin/frames/${frameId}`, {
                method: 'DELETE'
            })

            // Refresh current page
            loadFrames()
            alert('Đã xóa khung hình thành công!')
        } catch (error) {
            console.error('Failed to delete frame:', error)
            alert('Có lỗi xảy ra: ' + error.message)
        }
    }

    const viewFrameDetail = async (frameId) => {
        try {
            const frame = await apiCall(`/admin/frames/${frameId}`)
            setSelectedFrame(frame)
            setShowDetailModal(true)
        } catch (error) {
            console.error('Failed to load frame detail:', error)
            alert('Không thể tải chi tiết khung: ' + error.message)
        }
    }

    // Calculate stats
    const stats = useMemo(() => {
        const total = pagination.total
        const activeCount = frames.filter(f => f.trangThai === 'dang_hoat_dong').length
        const pendingCount = frames.filter(f => f.trangThai === 'cho_duyet').length
        const blockedCount = frames.filter(f => f.trangThai === 'bi_khoa').length

        return { total, active: activeCount, pending: pendingCount, blocked: blockedCount }
    }, [frames, pagination.total])

    // Render loading state
    if (loading && frames.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Đang tải danh sách khung hình...</p>
                </div>
            </div>
        )
    }

    // Render error state
    if (error && frames.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không thể tải dữ liệu</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={() => loadFrames()}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{fmt(stats.total)}</div>
                            <div className="text-sm text-slate-500">Tổng số khung</div>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <ImageIcon size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-emerald-600">{fmt(stats.active)}</div>
                            <div className="text-sm text-slate-500">Đang hoạt động</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-amber-600">{fmt(stats.pending)}</div>
                            <div className="text-sm text-slate-500">Chờ duyệt</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                            <Upload size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-rose-600">{fmt(stats.blocked)}</div>
                            <div className="text-sm text-slate-500">Bị khóa</div>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                            <XCircle size={20} />
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
                            placeholder="Tìm theo tiêu đề, alias hoặc tác giả..."
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="appearance-none rounded-2xl ring-1 ring-slate-200 bg-white pl-3 pr-10 py-2.5 text-sm outline-none focus:ring-blue-400 focus:ring-2 transition-all"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="dang_hoat_dong">Đang hoạt động</option>
                            <option value="cho_duyet">Chờ duyệt</option>
                            <option value="bi_khoa">Bị khóa</option>
                            <option value="da_xoa">Đã xóa</option>
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
                    <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors">
                        <Upload size={16} /> Thêm khung
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-xl bg-white ring-1 ring-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors">
                        <Filter size={16} /> Bộ lọc nâng cao
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/75 bg-white shadow-sm">
                <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[1200px] w-full text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="text-left px-6 py-4 font-semibold">Khung hình</th>
                                <th className="text-left px-4 py-4 font-semibold">Tác giả</th>
                                <th className="text-left px-4 py-4 font-semibold">Trạng thái</th>
                                <th className="text-left px-4 py-4 font-semibold">Chế độ</th>
                                <th className="text-right px-4 py-4 font-semibold">Lượt xem</th>
                                <th className="text-right px-4 py-4 font-semibold">Lượt tải</th>
                                <th className="text-left px-4 py-4 font-semibold">Ngày tạo</th>
                                <th className="text-left px-4 py-4 font-semibold">Cập nhật</th>
                                <th className="text-right px-6 py-4 font-semibold">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={9} className="py-8 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            <span className="text-slate-500">Đang tải...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {!loading && frames.map(frame => (
                                <tr key={frame.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                {frame.urlXemTruoc ? (
                                                    <img
                                                        src={`${API_BASE}${frame.urlXemTruoc}`}
                                                        alt={frame.tieuDe}
                                                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-sm"
                                                        onError={(e) => {
                                                            e.target.src = `https://via.placeholder.com/64x64/e2e8f0/64748b?text=${frame.tieuDe?.charAt(0) || 'K'}`
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-slate-100 grid place-items-center">
                                                        <ImageIcon size={20} className="text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-slate-900 truncate max-w-xs">{frame.tieuDe}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-xs">/{frame.alias}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        {frame.owner ? (
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={frame.owner.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(frame.owner.name)}&size=32`}
                                                    alt={frame.owner.name}
                                                    className="w-8 h-8 rounded-full"
                                                />
                                                <div>
                                                    <div className="font-medium text-slate-900">{frame.owner.name}</div>
                                                    <div className="text-xs text-slate-500">{frame.owner.email}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">Không có</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={frame.trangThai} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${frame.cheDoHienThi === 'cong_khai'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {frame.cheDoHienThi === 'cong_khai' ? 'Công khai' : 'Riêng tư'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(frame.luotXem || 0)}</td>
                                    <td className="px-4 py-4 text-right font-mono text-slate-600">{fmt(frame.luotTai || 0)}</td>
                                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(frame.ngayDang)}</td>
                                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{formatDate(frame.ngayChinhSua)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {frame.trangThai === 'cho_duyet' ? (
                                                <>
                                                    <button
                                                        onClick={() => changeFrameStatus(frame.id, 'dang_hoat_dong')}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                                                        title="Duyệt khung"
                                                    >
                                                        <CheckCircle2 size={14} /> Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => changeFrameStatus(frame.id, 'bi_khoa')}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
                                                        title="Từ chối khung"
                                                    >
                                                        <XCircle size={14} /> Từ chối
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => viewFrameDetail(frame.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={14} /> Xem
                                                    </button>

                                                    {frame.trangThai === 'dang_hoat_dong' ? (
                                                        <button
                                                            onClick={() => changeFrameStatus(frame.id, 'bi_khoa')}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
                                                            title="Tạm khóa khung"
                                                        >
                                                            <ToggleLeft size={14} /> Khóa
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => changeFrameStatus(frame.id, 'dang_hoat_dong')}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                                                            title="Kích hoạt khung"
                                                        >
                                                            <ToggleRight size={14} /> Bật
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setSelectedFrame(frame)
                                                            setShowDeleteModal(true)
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 transition-colors"
                                                        title="Xóa vĩnh viễn"
                                                    >
                                                        <Trash2 size={14} /> Xóa
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!loading && frames.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-16 text-center">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có khung hình</h3>
                                        <p className="text-gray-500">Không tìm thấy khung phù hợp với bộ lọc hiện tại.</p>
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
                            <span className="font-semibold">{pagination.total}</span> khung hình
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
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
                                                onClick={() => handlePageChange(page)}
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
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <FrameDetailModal
                frame={selectedFrame}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                onStatusChange={changeFrameStatus}
            />

            <DeleteConfirmModal
                frame={selectedFrame}
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => deleteFrame(selectedFrame?.id)}
            />
        </div>
    )
}