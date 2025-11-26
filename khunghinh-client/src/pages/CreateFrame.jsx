import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image, Info } from 'lucide-react'
import useRequireAuth from '../hooks/useRequireAuth'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')
const URL_PREFIX = 'https://trendyframe.me/'

export default function CreateFrame() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const { user, loading } = useRequireAuth()

    const [formData, setFormData] = useState({
        title: '',
        url: URL_PREFIX,
        type: 'khac' // ✅ Loại khung mặc định
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loadingSubmit, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [success, setSuccess] = useState(null) // ✅ trạng thái thông báo
    const [frameTypes, setFrameTypes] = useState([]) // ✅ Danh sách loại khung

    // ✅ Auto ẩn thông báo sau 5 giây
    useEffect(() => {
        if (!success) return
        const t = setTimeout(() => setSuccess(null), 10000)
        return () => clearTimeout(t)
    }, [success])

    // ✅ Lấy danh sách loại khung từ API
    useEffect(() => {
        const fetchFrameTypes = async () => {
            try {
                const res = await fetch(`${BACKEND_ORIGIN}/api/frames/types`, {
                    credentials: 'include'
                })
                if (res.ok) {
                    const data = await res.json()
                    setFrameTypes(data)
                }
            } catch (error) {
                console.error('Error fetching frame types:', error)
            }
        }
        fetchFrameTypes()
    }, [])

    // Tạo alias ngẫu nhiên
    const generateRandomAlias = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        const length = 8 + Math.floor(Math.random() * 4) // 8-11 ký tự
        let result = ''
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    // Kiểm tra alias có tồn tại không
    const checkAliasExists = async (alias) => {
        try {
            // ✅ Chỉ dùng cookies, bỏ Bearer token
            const response = await fetch(`${BACKEND_ORIGIN}/api/frames/check-alias/${alias}`, {
                credentials: 'include'
            })

            if (response.ok) {
                const data = await response.json()
                return data.exists // true nếu đã tồn tại
            }
            return false
        } catch (error) {
            console.error('Error checking alias:', error)
            return false
        }
    }

    // Tạo alias duy nhất
    const generateUniqueAlias = async () => {
        let alias = generateRandomAlias()
        let attempts = 0
        const maxAttempts = 10

        // Thử tối đa 10 lần để tránh vòng lặp vô hạn
        while (attempts < maxAttempts) {
            const exists = await checkAliasExists(alias)
            if (!exists) {
                return alias
            }
            alias = generateRandomAlias()
            attempts++
        }

        // Nếu sau 10 lần vẫn trùng, thêm timestamp
        return generateRandomAlias() + Date.now().toString().slice(-4)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // ✅ Chỉ chấp nhận PNG
        if (file.type !== 'image/png') {
            setErrors((p) => ({ ...p, file: 'Chỉ chấp nhận file PNG với nền trong suốt' }))
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors((p) => ({ ...p, file: 'File không được vượt quá 2MB' }))
            return
        }

        setSelectedFile(file)
        setErrors((p) => ({ ...p, file: '' }))

        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target?.result)
        reader.readAsDataURL(file)
    }

    const removeFile = () => {
        setSelectedFile(null)
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const validateForm = () => {
        const newErrors = {}
        const titleTrim = formData.title.trim()
        if (!titleTrim) newErrors.title = 'Tiêu đề không được để trống'
        else if (titleTrim.length < 10) newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự'
        if (!selectedFile) newErrors.file = 'Vui lòng chọn hình ảnh khung'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return
        setLoading(true)

        try {
            const submitData = new FormData()
            submitData.append('file', selectedFile)
            submitData.append('title', formData.title)
            submitData.append('type', formData.type) // ✅ Thêm loại khung

            let alias = (formData.url || '').replace(URL_PREFIX, '').trim()
            if (!alias) {
                alias = await generateUniqueAlias()
            }
            submitData.append('alias', alias)

            // ✅ Bỏ token, chỉ dùng cookies
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames`, {
                method: 'POST',
                credentials: 'include',
                body: submitData
            })

            if (!res.ok) {
                const errorData = await res.text()
                console.error('Server error:', errorData) // ✅ Debug

                if (errorData.includes('alias') || errorData.includes('duplicate') || errorData.includes('trùng')) {
                    const newAlias = await generateUniqueAlias()
                    submitData.set('alias', newAlias)

                    const retryRes = await fetch(`${BACKEND_ORIGIN}/api/frames`, {
                        method: 'POST',
                        credentials: 'include',
                        body: submitData
                    })

                    if (!retryRes.ok) {
                        throw new Error('Lỗi khi tạo khung hình')
                    }
                } else {
                    throw new Error(errorData || 'Lỗi khi tạo khung hình')
                }
            }

            // ✅ CHỈ hiện thông báo — KHÔNG tự chuyển trang
            setSuccess(formData.title.trim())
            window.scrollTo({ top: 0, behavior: 'smooth' })
            // ❌ Không navigate tự động nữa
        } catch (err) {
            console.error('Submit error:', err)
            setErrors((p) => ({ ...p, submit: err.message || 'Có lỗi xảy ra. Vui lòng thử lại.' }))
        } finally {
            setLoading(false)
        }
    }

    const urlTail = (formData.url || '').replace(URL_PREFIX, '')

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12">
            {/* ✅ Banner thông báo (tự ẩn sau 5s, chỉ điều hướng khi user bấm) */}
            {success && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6" aria-live="polite" aria-atomic="true">
                    <div className="relative rounded-md bg-emerald-100 text-emerald-900 px-4 py-3 ring-1 ring-emerald-200 shadow-sm">
                        <span>
                            Tạo khung hình <strong>{success}</strong> thành công!{' '}
                            <button
                                type="button"
                                className="underline text-blue-700 hover:text-blue-800"
                                onClick={() => navigate('/my-frames')}
                            >
                                Xem tại đây
                            </button>
                            .
                        </span>
                        <button
                            type="button"
                            aria-label="Đóng"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-900/70 hover:text-emerald-900"
                            onClick={() => setSuccess(null)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium ring-1 ring-blue-200/60 shadow-sm mb-3">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        Trình tạo khung hình
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        TẠO MỚI SỰ KIỆN, HOẠT ĐỘNG, CHIẾN DỊCH
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: Upload */}
                    <section className="bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
                        <header className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Hình khung</h2>
                            <p className="text-sm text-gray-500">PNG nền trong suốt • khuyến nghị 1080×1080 • tối đa 2MB</p>
                        </header>

                        {/* Dropzone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={[
                                'rounded-xl border-2 border-dashed transition-colors cursor-pointer',
                                'bg-white grid place-items-center px-6 py-10',
                                'hover:border-blue-400 hover:bg-blue-50/40'
                            ].join(' ')}
                        >
                            {!preview ? (
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-xl shadow-sm">
                                        <Upload size={24} />
                                    </div>
                                    <div className="text-blue-700 font-semibold">Nhấp để tải ảnh PNG lên hoặc kéo-thả</div>
                                    <p className="text-sm text-gray-500">Chỉ hỗ trợ PNG nền trong suốt • tối đa 2MB</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="relative inline-block rounded-xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                                        {/* checkerboard */}
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background:
                                                    'conic-gradient(#f3f4f6 25%, transparent 0 50%, #f3f4f6 0 75%, transparent 0) 0 0/18px 18px'
                                            }}
                                        />
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="relative max-w-full max-h-80 object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeFile()
                                            }}
                                            title="Xóa ảnh"
                                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-90 hover:opacity-100"
                                        >
                                            <X size={18} strokeWidth={3} />
                                        </button>
                                    </div>

                                    {selectedFile && (
                                        <div className="mt-3 text-sm text-gray-600">
                                            <span className="px-2 py-1 rounded-md bg-gray-100 ring-1 ring-gray-200">
                                                {selectedFile.name}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-3 text-blue-700 hover:underline text-sm font-medium"
                                    >
                                        Chọn ảnh khác
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png" // ✅ Chỉ chấp nhận PNG
                                onChange={handleFileSelect} // ✅ Bỏ multiple
                                className="hidden"
                            />
                        </div>

                        {errors.file && (
                            <p className="text-rose-600 text-sm mt-2 flex items-center gap-1">
                                <Info size={14} /> {errors.file}
                            </p>
                        )}

                        {/* Tips */}
                        <div className="mt-6 rounded-xl bg-blue-50/70 ring-1 ring-blue-200/60 p-4 text-sm text-blue-800">
                            Mẹo: Dùng PNG với vùng trong suốt để người dùng thấy ảnh của họ phía sau khung.
                        </div>
                    </section>

                    {/* RIGHT: Meta */}
                    <section className="bg-white/90 rounded-2xl ring-1 ring-gray-200 shadow-sm p-6">
                        <header className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin chung</h2>
                        </header>

                        <div className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Tiêu đề <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Khung xuân 2025 – sắc hoa đào"
                                    className={[
                                        'mt-1 w-full px-4 py-3 rounded-xl border outline-none transition',
                                        'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                                        errors.title ? 'border-rose-300 bg-rose-50/40' : 'border-gray-300'
                                    ].join(' ')}
                                />
                                <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Tối thiểu 10 ký tự</span>
                                    <span className={`font-medium ${formData.title.trim().length >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {formData.title.trim().length}/10
                                    </span>
                                </div>
                                {errors.title && (
                                    <p className="text-rose-600 text-sm mt-1 flex items-center gap-1">
                                        <Info size={14} /> {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Loại khung */}
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                    Loại khung <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    {frameTypes.length > 0 ? (
                                        frameTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="khac">Khác</option>
                                    )}
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Chọn loại phù hợp để người dùng dễ tìm thấy khung của bạn
                                </p>
                            </div>

                            {/* URL */}
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                    Đường dẫn (URL)
                                </label>
                                <div className="mt-1 flex">
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">
                                        {URL_PREFIX}
                                    </span>
                                    <input
                                        id="url"
                                        name="url"
                                        type="text"
                                        value={urlTail}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                url: URL_PREFIX + e.target.value
                                            }))
                                        }
                                        placeholder="ten-khung-hinh"
                                        className="flex-1 px-4 py-3 border border-l-0 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition border-gray-300"
                                    />
                                </div>

                                {formData.url && urlTail && (
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-500 mr-2">Xem trước:</span>
                                        <span className="px-2 py-1 rounded bg-gray-100 ring-1 ring-gray-200 text-gray-800 break-all">
                                            {formData.url}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loadingSubmit}
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-4 rounded-xl shadow-blue-600/20 shadow-md transition"
                            >
                                {loadingSubmit ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Đang tạo khung…
                                    </>
                                ) : (
                                    <>
                                        <Image size={20} />
                                        TẠO KHUNG HÌNH
                                    </>
                                )}
                            </button>

                            {errors.submit && (
                                <p className="text-rose-600 text-sm flex items-center gap-1">
                                    <Info size={14} /> {errors.submit}
                                </p>
                            )}
                        </div>
                    </section>
                </form>
            </div>
        </div>
    )
}
