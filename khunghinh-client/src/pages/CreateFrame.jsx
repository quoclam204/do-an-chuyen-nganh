import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Image, Info } from 'lucide-react'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')
const URL_PREFIX = 'https://trendyframe.me/'

export default function CreateFrame() {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        title: '',
        url: URL_PREFIX,
        description: ''
    })
    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setErrors((p) => ({ ...p, file: 'Vui lòng chọn file hình ảnh (PNG, JPG, GIF...)' }))
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
            submitData.append('title', formData.title)
            submitData.append('url', formData.url)
            submitData.append('description', formData.description)
            submitData.append('image', selectedFile)

            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/create`, {
                method: 'POST',
                credentials: 'include',
                body: submitData
            })
            if (!res.ok) throw new Error()
            const result = await res.json()
            navigate(`/frame/${result.alias}`)
        } catch (err) {
            console.error(err)
            setErrors((p) => ({ ...p, submit: 'Có lỗi xảy ra. Vui lòng thử lại.' }))
        } finally {
            setLoading(false)
        }
    }

    const urlTail = (formData.url || '').replace(URL_PREFIX, '')

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12">
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
                                    <div className="text-blue-700 font-semibold">Nhấp để tải ảnh lên hoặc kéo-thả</div>
                                    <p className="text-sm text-gray-500">Hỗ trợ PNG/JPG/GIF • tối đa 2MB</p>
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
                                            className="btn-remove-image"
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
                                accept="image/*"
                                onChange={handleFileSelect}
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
                                <p className="text-xs text-gray-500 mt-1">Để trống sẽ tự tạo từ tiêu đề.</p>
                                {formData.url && (
                                    <div className="mt-2 text-sm">
                                        <span className="text-gray-500 mr-2">Xem trước:</span>
                                        <span className="px-2 py-1 rounded bg-gray-100 ring-1 ring-gray-200 text-gray-800">
                                            {formData.url}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Mô tả
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Mô tả ngắn về khung hình này…"
                                    className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-4 rounded-xl shadow-blue-600/20 shadow-md transition"
                            >
                                {loading ? (
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
