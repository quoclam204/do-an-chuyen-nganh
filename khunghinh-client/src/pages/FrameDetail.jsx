import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Eye, Calendar, User, Loader2, Heart, Copy, Check } from 'lucide-react'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')

const STATUS_META = {
    active: { label: 'Đang hoạt động', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
    inactive: { label: 'Tạm dừng', chip: 'bg-slate-50 text-slate-700 ring-slate-200', dot: 'bg-slate-400' },
    pending: { label: 'Chờ duyệt', chip: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' }
}

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '-')
const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=0D8ABC&color=fff&size=128&bold=true`

function StatusBadge({ status }) {
    const meta = STATUS_META[status] || STATUS_META.active
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
    const [searchParams] = useSearchParams() // ✅ Thêm để đọc query params
    const isPreview = searchParams.get('preview') === 'true' // ✅ Kiểm tra preview mode

    const [frame, setFrame] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchFrameDetail()
    }, [id, isPreview]) // ✅ Thêm isPreview vào dependency

    async function fetchFrameDetail() {
        try {
            setLoading(true)
            setError(null)

            // ✅ Sử dụng endpoint GET /api/Frames/{id} (không tăng view)
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
            console.log('API response:', data)

            // Map dữ liệu từ API
            const mappedFrame = {
                id: data.id ?? data.Id,
                title: data.tieuDe ?? data.TieuDe ?? 'Không có tiêu đề',
                alias: data.alias ?? data.Alias,
                status: mapStatus(data.trangThai ?? data.TrangThai),
                clicks: data.luotXem ?? data.LuotXem ?? 0,
                uses: data.luotTai ?? data.LuotTai ?? 0,
                createdAt: data.ngayDang ?? data.NgayDang,
                imageUrl: data.urlXemTruoc ?? data.UrlXemTruoc ? withBackendOrigin(data.urlXemTruoc ?? data.UrlXemTruoc) : '/placeholder-frame.png',
                downloadUrl: data.urlXemTruoc ?? data.UrlXemTruoc ? withBackendOrigin(data.urlXemTruoc ?? data.UrlXemTruoc) : null,
                author: {
                    id: data.owner?.id ?? data.Owner?.Id,
                    name: data.owner?.name ?? data.Owner?.Name ?? 'Ẩn danh',
                    avatar: data.owner?.avatar ?? data.Owner?.Avatar
                }
            }

            setFrame(mappedFrame)

            // ✅ Chỉ tăng lượt xem khi KHÔNG phải preview mode
            if (!isPreview) {
                incrementView()
            }

        } catch (e) {
            console.error('fetchFrameDetail error:', e)
            setError('Có lỗi xảy ra khi tải khung hình')
        } finally {
            setLoading(false)
        }
    }

    async function incrementView() {
        try {
            // ✅ Gọi POST /api/Frames/view/{id}?preview=false
            await fetch(`${BACKEND_ORIGIN}/api/Frames/view/${id}?preview=false`, {
                method: 'POST',
                credentials: 'include'
            })
        } catch (e) {
            console.error('incrementView error:', e)
        }
    }

    async function handleDownload() {
        if (!frame?.downloadUrl) return

        try {
            // ✅ Chỉ tăng lượt tải khi KHÔNG phải preview mode
            if (!isPreview) {
                await fetch(`${BACKEND_ORIGIN}/api/Frames/download/${id}?preview=false`, {
                    method: 'POST',
                    credentials: 'include'
                })
            }

            // Tải file
            const link = document.createElement('a')
            link.href = frame.downloadUrl
            link.download = `${frame.title}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            // ✅ Chỉ cập nhật UI khi không phải preview
            if (!isPreview) {
                setFrame(prev => prev ? { ...prev, uses: prev.uses + 1 } : null)
            }

        } catch (e) {
            console.error('handleDownload error:', e)
            alert('Có lỗi xảy ra khi tải khung hình')
        }
    }

    async function handleShare() {
        const url = window.location.href

        if (navigator.share) {
            try {
                await navigator.share({
                    title: frame?.title,
                    text: `Xem khung hình: ${frame?.title}`,
                    url: url
                })
            } catch (e) {
                copyToClipboard(url)
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
            // Fallback
            const textarea = document.createElement('textarea')
            textarea.value = text
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    function mapStatus(dbStatus) {
        if (!dbStatus) return 'active'
        const s = String(dbStatus).toLowerCase()
        if (s.includes('tam') || s.includes('inactive')) return 'inactive'
        if (s.includes('cho') || s.includes('pending')) return 'pending'
        return 'active'
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
                        onClick={() => navigate('/my-frames')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                    >
                        <ArrowLeft size={20} />
                        Quay lại danh sách
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
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                    >
                        <ArrowLeft size={20} />
                        Quay lại
                    </button>

                    <div className="flex items-center gap-3">
                        <Link
                            to={`/frame/${frame.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600"
                        >
                            Chỉnh sửa
                        </Link>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Image */}
                    <div className="space-y-4">
                        <div className="aspect-square overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 shadow-lg">
                            <img
                                src={frame.imageUrl}
                                alt={frame.title}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = '/placeholder-frame.png' }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleDownload}
                                disabled={!frame.downloadUrl}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={20} />
                                Tải xuống
                            </button>

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
                            >
                                {copied ? <Check size={20} /> : <Share2 size={20} />}
                                {copied ? 'Đã sao chép!' : 'Chia sẻ'}
                            </button>
                        </div>
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
                            <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-violet-100 rounded-lg">
                                        <Eye className="text-violet-600" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{frame.clicks}</div>
                                        <div className="text-sm text-gray-600">Lượt xem</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Download className="text-green-600" size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{frame.uses}</div>
                                        <div className="text-sm text-gray-600">Lượt tải</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Author */}
                        <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tác giả</h3>
                            <div className="flex items-center gap-3">
                                <img
                                    src={frame.author.avatar || getAvatarUrl(frame.author.name)}
                                    alt={frame.author.name}
                                    className="size-12 rounded-full object-cover ring-2 ring-white shadow"
                                    referrerPolicy="no-referrer"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900">{frame.author.name}</div>
                                    <div className="text-sm text-gray-600">Người tạo khung hình</div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông tin</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={16} />
                                    <span>Ngày tạo: {formatDate(frame.createdAt)}</span>
                                </div>
                                {frame.alias && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span>Alias: {frame.alias}</span>
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