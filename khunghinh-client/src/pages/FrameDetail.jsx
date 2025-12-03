import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Eye, Calendar, User, Loader2, Heart, Copy, Check, Edit } from 'lucide-react'
import { resolveAvatarUrl } from '../utils/avatarUtils'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')


const STATUS_META = {
    'dang_hoat_dong': { label: 'Đang hoạt động', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    'tam_dung': { label: 'Tạm dừng', chip: 'bg-slate-50 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
    'cho_duyet': { label: 'Chờ duyệt', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' }
}

// Mapping loại khung
const FRAME_TYPE_LABELS = {
    'su_kien': 'Sự kiện',
    'le_hoi': 'Lễ hội – Ngày đặc biệt',
    'hoat_dong': 'Hoạt động – Cộng đồng',
    'chien_dich': 'Chiến dịch – Cổ vũ',
    'thuong_hieu': 'Thương hiệu – Tổ chức',
    'giai_tri': 'Giải trí – Fandom',
    'sang_tao': 'Chủ đề sáng tạo',
    'khac': 'Khác'
}

const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META['dang_hoat_dong']
    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ring-1 ${meta.chip}`}>
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
        </span>
    )
}

function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 animate-spin text-blue-600" />
                <p className="text-gray-600">Đang tải khung hình...</p>
            </div>
        </div>
    )
}

export default function FrameDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const isPreview = searchParams.get('preview') === 'true'

    const [frame, setFrame] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)
    const [isOwner, setIsOwner] = useState(false)

    useEffect(() => {
        fetchFrameDetail()
    }, [id])

    async function fetchFrameDetail() {
        try {
            setLoading(true)
            setError(null)

            // ✅ Gọi API GET /api/Frames/{id}
            const res = await fetch(`${BACKEND_ORIGIN}/api/Frames/${id}`, {
                credentials: 'include'
            })

            if (res.status === 404) {
                setError('Khung hình không tồn tại')
                return
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`)
            }

            const data = await res.json()
            console.log('✅ Frame detail API response:', data)

            // ✅ Map dữ liệu (hỗ trợ cả PascalCase và camelCase)

            const mappedFrame = {
                id: data.id ?? data.Id,
                title: data.tieuDe ?? data.TieuDe ?? 'Không có tiêu đề',
                alias: data.alias ?? data.Alias,
                status: data.trangThai ?? data.TrangThai ?? 'dang_hoat_dong',
                clicks: data.luotXem ?? data.LuotXem ?? 0,
                uses: data.luotTai ?? data.LuotTai ?? 0,
                createdAt: data.ngayDang ?? data.NgayDang,
                imageUrl: data.urlXemTruoc ?? data.UrlXemTruoc ? withBackendOrigin(data.urlXemTruoc ?? data.UrlXemTruoc) : '/placeholder-frame.png',
                downloadUrl: data.urlXemTruoc ?? data.UrlXemTruoc ? withBackendOrigin(data.urlXemTruoc ?? data.UrlXemTruoc) : null,
                type: data.loai ?? data.Loai ?? data.type ?? data.Type ?? null, // Thêm loại khung
                owner: data.owner ? {
                    id: data.owner.id ?? data.owner.Id,
                    name: data.owner.name ?? data.owner.Name ?? 'Ẩn danh',
                    avatar: data.owner.avatar ?? data.owner.Avatar
                } : null
            }

            setFrame(mappedFrame)

            // ✅ Kiểm tra quyền sở hữu
            checkOwnership()

            // ✅ Chỉ tăng view khi KHÔNG phải preview mode
            if (!isPreview) {
                incrementView()
            }

        } catch (e) {
            console.error('❌ fetchFrameDetail error:', e)
            setError('Có lỗi xảy ra khi tải khung hình')
        } finally {
            setLoading(false)
        }
    }

    async function checkOwnership() {
        try {
            const res = await fetch(`${BACKEND_ORIGIN}/api/auth/me`, {
                credentials: 'include'
            })
            if (res.ok) {
                const user = await res.json()
                setIsOwner(user.id === frame?.owner?.id)
            }
        } catch (e) {
            console.error('checkOwnership error:', e)
        }
    }

    async function incrementView() {
        try {
            await fetch(`${BACKEND_ORIGIN}/api/Frames/view/${id}`, {
                method: 'POST',
                credentials: 'include'
            })
            console.log('✅ View incremented')
        } catch (e) {
            console.error('❌ incrementView error:', e)
        }
    }

    async function handleDownload() {
        if (!frame?.downloadUrl) return

        try {
            // ✅ Chỉ tăng download count khi KHÔNG phải preview
            if (!isPreview) {
                await fetch(`${BACKEND_ORIGIN}/api/Frames/download/${id}`, {
                    method: 'POST',
                    credentials: 'include'
                })
                console.log('✅ Download incremented')
            }

            // Tải file
            const link = document.createElement('a')
            link.href = frame.downloadUrl
            link.download = `${frame.alias || frame.title}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // Cập nhật UI local
            if (!isPreview) {
                setFrame(prev => prev ? { ...prev, uses: prev.uses + 1 } : null)
            }

        } catch (e) {
            console.error('❌ handleDownload error:', e)
            alert('Có lỗi xảy ra khi tải khung hình')
        }
    }

    async function handleShare() {
        const url = `${window.location.origin}/editor?alias=${frame.alias}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: frame?.title,
                    text: `Xem khung hình: ${frame?.title}`,
                    url: url
                })
            } catch (e) {
                if (e.name !== 'AbortError') {
                    copyToClipboard(url)
                }
            }
        } else {
            copyToClipboard(url)
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }).catch(() => {
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    function withBackendOrigin(url) {
        if (!url) return url
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
    }

    if (loading) return <LoadingSpinner />

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
                    <p className="text-gray-600 mb-6">Khung hình có thể đã bị xóa hoặc không tồn tại.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                    >
                        <ArrowLeft size={20} />
                        Về trang chủ
                    </button>
                </div>
            </div>
        )
    }

    if (!frame) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </button>

                    {/* ✅ Chỉ hiện nút Edit nếu là owner */}
                    {isOwner && (
                        <Link
                            to={`/frame/${frame.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
                        >
                            <Edit size={18} />
                            Chỉnh sửa
                        </Link>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-lg">
                            <img
                                src={frame.imageUrl}
                                alt={frame.title}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.currentTarget.src = '/placeholder-frame.png' }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={!frame.downloadUrl}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/30"
                            >
                                <Download size={20} />
                                Tải xuống
                            </button>

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 ring-1 ring-gray-200 transition"
                            >
                                {copied ? <Check size={20} className="text-green-600" /> : <Share2 size={20} />}
                                {copied ? 'Đã sao chép!' : 'Chia sẻ'}
                            </button>
                        </div>

                        {/* ✅ Thêm nút "Dùng khung này" */}
                        <button
                            onClick={() => navigate(`/editor?alias=${frame.alias}`)}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition shadow-lg shadow-purple-500/30"
                        >
                            <Heart size={20} />
                            Dùng khung này
                        </button>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-6">
                        {/* Title & Status */}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-3">{frame.title}</h1>
                            <StatusBadge status={frame.status} />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 ring-1 ring-violet-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow">
                                        <Eye className="text-violet-600" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{frame.clicks.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Lượt xem</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 ring-1 ring-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow">
                                        <Download className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{frame.uses.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">Lượt tải</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Author */}
                        {frame.owner && (
                            <div className="bg-white rounded-xl p-5 ring-1 ring-slate-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tác giả</h3>
                                <div className="flex items-center gap-3">
                                    <img
                                        src={resolveAvatarUrl(frame.owner.avatar, frame.owner.name)}
                                        alt={frame.owner.name}
                                        className="size-12 rounded-full object-cover ring-2 ring-white shadow"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{frame.owner.name}</div>
                                        <div className="text-sm text-gray-600">Người tạo khung hình</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Metadata */}
                        <div className="bg-white rounded-xl p-5 ring-1 ring-slate-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={16} className="text-blue-600" />
                                    <span className="font-medium">Ngày tạo:</span>
                                    <span>{formatDate(frame.createdAt)}</span>
                                </div>
                                {frame.type && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="font-medium">Loại khung:</span>
                                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-1 text-xs font-medium border border-indigo-200">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            {FRAME_TYPE_LABELS[frame.type] || frame.type}
                                        </span>
                                    </div>
                                )}
                                {frame.alias && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="font-medium">Alias:</span>
                                        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{frame.alias}</code>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}