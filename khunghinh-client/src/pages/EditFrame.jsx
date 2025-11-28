import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Loader2, AlertCircle, CheckCircle, X } from 'lucide-react'

const BACKEND_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090').replace(/\/$/, '')


export default function EditFrame() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [frame, setFrame] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        alias: '',
        type: 'khac', // Thêm loại khung mặc định
    })
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState('')
    const [aliasStatus, setAliasStatus] = useState({ checking: false, available: true, message: '' })
    const [errors, setErrors] = useState({})
    const [notification, setNotification] = useState({ show: false, type: '', message: '' })
    const [frameTypes, setFrameTypes] = useState([]) // Danh sách loại khung


    useEffect(() => {
        fetchFrameDetail()
        fetchFrameTypes()
    }, [id])

    // Lấy danh sách loại khung từ API
    async function fetchFrameTypes() {
        try {
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/types`, { credentials: 'include' })
            if (res.ok) {
                const data = await res.json()
                setFrameTypes(data)
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error fetching frame types:', error)
        }
    }

    // Auto-check alias when typing (debounced)
    useEffect(() => {
        if (!formData.alias || formData.alias === frame?.alias) {
            setAliasStatus({ checking: false, available: true, message: '' })
            return
        }

        const timer = setTimeout(checkAlias, 500)
        return () => clearTimeout(timer)
    }, [formData.alias, frame?.alias])

    async function fetchFrameDetail() {
        try {
            setLoading(true)
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/${id}`, {
                credentials: 'include'
            })

            if (res.status === 404) {
                navigate('/my-frames', { replace: true })
                return
            }

            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            const data = await res.json()
            setFrame(data)
            setFormData({
                title: data.tieuDe || data.TieuDe || '',
                alias: data.alias || data.Alias || '',
                type: data.loai || data.Loai || data.type || data.Type || 'khac',
            })
            setPreview(data.urlXemTruoc || data.UrlXemTruoc || '')
        } catch (error) {
            console.error('Error fetching frame:', error)
            showNotification('error', 'Không thể tải thông tin khung hình')
            navigate('/my-frames', { replace: true })
        } finally {
            setLoading(false)
        }
    }

    async function checkAlias() {
        if (!formData.alias || formData.alias === frame?.alias) return

        setAliasStatus({ checking: true, available: true, message: 'Đang kiểm tra...' })

        try {
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/check-alias/${encodeURIComponent(formData.alias)}`)
            if (res.ok) {
                const { exists } = await res.json()
                setAliasStatus({
                    checking: false,
                    available: !exists,
                    message: exists ? 'Alias đã tồn tại' : 'Alias khả dụng'
                })
            }
        } catch {
            setAliasStatus({ checking: false, available: true, message: 'Không thể kiểm tra alias' })
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    function handleFileChange(e) {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Validate file
        const newErrors = {}
        if (!selectedFile.name.toLowerCase().endsWith('.png')) {
            newErrors.file = 'Chỉ chấp nhận file PNG'
        } else if (selectedFile.size > 2 * 1024 * 1024) {
            newErrors.file = 'File không được vượt quá 2MB'
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setFile(selectedFile)
        setErrors(prev => ({ ...prev, file: '' }))

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(selectedFile)
    }

    function removeFile() {
        setFile(null)
        setPreview(frame?.urlXemTruoc || frame?.UrlXemTruoc || '')
        setErrors(prev => ({ ...prev, file: '' }))

        // Reset file input
        const fileInput = document.getElementById('file-input')
        if (fileInput) fileInput.value = ''
    }

    function validateForm() {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Vui lòng nhập tiêu đề'
        }

        if (formData.alias && !/^[a-z0-9-]+$/.test(formData.alias)) {
            newErrors.alias = 'Alias chỉ chứa chữ thường, số và dấu gạch ngang'
        }

        if (!aliasStatus.available) {
            newErrors.alias = 'Alias đã tồn tại'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (!validateForm()) return

        setSaving(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append('title', formData.title.trim())
            if (formData.alias) {
                formDataToSend.append('alias', formData.alias.trim())
            }
            formDataToSend.append('type', formData.type) // Thêm loại khung
            if (file) {
                formDataToSend.append('file', file)
            }

            // ✅ Thay đổi từ PUT thành POST và URL từ /api/frames/{id} thành /api/frames/update/{id}
            const res = await fetch(`${BACKEND_ORIGIN}/api/frames/update/${id}`, {
                method: 'POST', // ✅ Đổi từ PUT thành POST
                credentials: 'include',
                body: formDataToSend
            })

            if (res.status === 401) {
                showNotification('error', 'Phiên đăng nhập đã hết hạn')
                return
            }

            if (res.status === 404) {
                showNotification('error', 'Không tìm thấy khung hình hoặc bạn không có quyền sửa')
                return
            }

            if (res.status === 409) {
                setErrors({ alias: 'Alias đã tồn tại' })
                return
            }

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(errorText || 'Lỗi không xác định')
            }

            showNotification('success', 'Cập nhật khung hình thành công!')

            // Redirect after short delay
            setTimeout(() => {
                navigate('/my-frames')
            }, 1500)

        } catch (error) {
            console.error('Error updating frame:', error)
            showNotification('error', error.message || 'Có lỗi xảy ra khi cập nhật')
        } finally {
            setSaving(false)
        }
    }

    function showNotification(type, message) {
        setNotification({ show: true, type, message })
        setTimeout(() => {
            setNotification({ show: false, type: '', message: '' })
        }, 5000)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <div className="mx-auto max-w-4xl px-4 py-10">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
                        <div className="bg-white rounded-2xl p-8 space-y-6">
                            <div className="h-6 w-32 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-48 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <div className="mx-auto max-w-4xl px-4 py-10">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/my-frames"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={16} />
                        Quay lại danh sách
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa khung hình</h1>
                    <p className="text-gray-600 mt-1">Cập nhật thông tin và hình ảnh khung hình của bạn</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                                Tiêu đề khung hình *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Nhập tiêu đề khung hình..."
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${errors.title
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                maxLength={200}
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Alias */}
                        <div>
                            <label htmlFor="alias" className="block text-sm font-semibold text-gray-900 mb-2">
                                Alias (tùy chọn)
                            </label>
                            <input
                                type="text"
                                id="alias"
                                name="alias"
                                value={formData.alias}
                                onChange={handleInputChange}
                                placeholder="vd: khung-tet-2024"
                                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${errors.alias || (!aliasStatus.available && formData.alias)
                                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : aliasStatus.available && formData.alias && !aliasStatus.checking
                                        ? 'border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200'
                                        : 'border-slate-200 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                maxLength={100}
                            />

                            {/* Alias Status */}
                            {formData.alias && formData.alias !== frame?.alias && (
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    {aliasStatus.checking ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin text-blue-600" />
                                            <span className="text-blue-600">{aliasStatus.message}</span>
                                        </>
                                    ) : aliasStatus.available ? (
                                        <>
                                            <CheckCircle size={14} className="text-emerald-600" />
                                            <span className="text-emerald-600">{aliasStatus.message}</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={14} className="text-red-600" />
                                            <span className="text-red-600">{aliasStatus.message}</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {errors.alias && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.alias}
                                </p>
                            )}

                            <p className="mt-1 text-xs text-gray-500">
                                Alias giúp tạo URL thân thiện. Chỉ sử dụng chữ thường, số và dấu gạch ngang.
                            </p>
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

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Ảnh khung hình (tùy chọn)
                            </label>

                            <div className="space-y-4">
                                {/* Current/Preview Image */}
                                {preview && (
                                    <div className="relative inline-block">
                                        <img
                                            src={preview.startsWith('data:') ? preview : `${BACKEND_ORIGIN}${preview}`}
                                            alt="Preview"
                                            className="h-48 w-auto rounded-lg ring-1 ring-slate-200 object-contain bg-gray-50"
                                        />
                                        {file && (
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* File Input */}
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="file-input"
                                        accept=".png,image/png"
                                        onChange={handleFileChange}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor="file-input"
                                        className={`flex items-center justify-center gap-3 w-full px-6 py-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${errors.file
                                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                                            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                                            }`}
                                    >
                                        <Upload size={20} className="text-slate-400" />
                                        <div className="text-sm text-slate-600">
                                            <span className="font-medium">
                                                {file ? 'Thay đổi file khác' : 'Chọn file PNG mới'}
                                            </span>
                                            <span className="block text-xs text-slate-500 mt-1">
                                                PNG với nền trong suốt, tối đa 2MB
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {errors.file && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.file}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t">
                            <Link
                                to="/my-frames"
                                className="px-6 py-3 text-sm font-medium rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={saving || !aliasStatus.available}
                                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu thay đổi'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Notification */}
            {notification.show && (
                <div className="fixed top-4 right-4 z-50 max-w-sm">
                    <div className={`rounded-xl p-4 shadow-lg ring-1 ${notification.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                        : 'bg-red-50 text-red-800 ring-red-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            {notification.type === 'success' ? (
                                <CheckCircle size={20} className="text-emerald-600" />
                            ) : (
                                <AlertCircle size={20} className="text-red-600" />
                            )}
                            <span className="font-medium">{notification.message}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}