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
        url: URL_PREFIX, // ✅ mặc định đúng domain
        description: ''
    })

    const [selectedFile, setSelectedFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setErrors(prev => ({ ...prev, file: 'Vui lòng chọn file hình ảnh (PNG, JPG, GIF...)' }))
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, file: 'File không được vượt quá 2MB' }))
            return
        }

        setSelectedFile(file)
        setErrors(prev => ({ ...prev, file: '' }))

        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
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
        if (!titleTrim) {
            newErrors.title = 'Tiêu đề không được để trống'
        } else if (titleTrim.length < 10) {
            // ✅ yêu cầu tối thiểu 10 ký tự
            newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự'
        }

        if (!selectedFile) {
            newErrors.file = 'Vui lòng chọn hình ảnh khung'
        }

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
            submitData.append('url', formData.url) // ✅ gửi đúng URL với prefix trendyframe.me
            submitData.append('description', formData.description)
            submitData.append('image', selectedFile)

            const response = await fetch(`${BACKEND_ORIGIN}/api/frames/create`, {
                method: 'POST',
                credentials: 'include',
                body: submitData
            })

            if (response.ok) {
                const result = await response.json()
                navigate(`/frame/${result.alias}`)
            } else {
                throw new Error('Có lỗi xảy ra khi tạo khung')
            }
        } catch (error) {
            console.error('Error creating frame:', error)
            setErrors(prev => ({ ...prev, submit: 'Có lỗi xảy ra. Vui lòng thử lại.' }))
        } finally {
            setLoading(false)
        }
    }

    // Tail của URL để hiện trong input (loại bỏ prefix)
    const urlTail = (formData.url || '').replace(URL_PREFIX, '')

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        TẠO MỚI SỰ KIỆN, HOẠT ĐỘNG, CHIẾN DỊCH
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Phần upload hình */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Thêm hình khung
                        </h2>
                        <p className="text-gray-600 mb-2">
                            Định dạng bắt buộc hình khung là PNG và phải có vùng trong suốt.
                        </p>
                        <p className="text-gray-600 mb-2">
                            Kích thước đề xuất là hình vuông cạnh <strong>1080px</strong>.
                        </p>
                        <p className="text-gray-600 mb-6">
                            Dung lượng tối đa của hình khung là <strong>2MB</strong>.
                        </p>

                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 transition-colors bg-grid">
                            {!preview ? (
                                <div className="text-center">
                                    <div
                                        className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-lg mb-4 cursor-pointer hover:bg-blue-700 transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload size={24} />
                                    </div>
                                    <div
                                        className="text-blue-600 font-medium cursor-pointer hover:text-blue-700"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Thêm hình khung
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Định dạng PNG, tối đa 2MB<br />
                                        Kích thước cạnh 1080px.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 rounded-lg bg-checker" />
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="relative max-w-full max-h-64 rounded-lg shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-3">{selectedFile?.name}</p>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Thay đổi hình ảnh
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
                            <p className="text-red-500 text-sm mt-2 flex items-center">
                                <Info size={14} className="mr-1" />
                                {errors.file}
                            </p>
                        )}
                    </div>

                    {/* Phần thông tin */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Thông tin chung
                        </h2>

                        <div className="space-y-6">
                            {/* Tiêu đề */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề <span className="text-red-500">(*)</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Tối thiểu 10 ký tự"
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center">
                                        <Info size={14} className="mr-1" />
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            {/* Đường dẫn */}
                            <div>
                                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                    Đường dẫn (URL)
                                </label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                        {URL_PREFIX}
                                    </span>
                                    <input
                                        type="text"
                                        id="url"
                                        name="url"
                                        value={urlTail}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            url: URL_PREFIX + e.target.value
                                        }))}
                                        placeholder="duong-dan-khung-hinh"
                                        className="flex-1 px-4 py-3 border border-l-0 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors border-gray-300"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm mt-1">
                                    Đường dẫn để chia sẻ, để trống để tự tạo từ tiêu đề
                                </p>
                            </div>

                            {/* Mô tả */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô tả
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Mô tả ngắn về khung hình này..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Đang tạo khung...
                                    </>
                                ) : (
                                    <>
                                        <Image size={20} className="mr-2" />
                                        TẠO KHUNG HÌNH
                                    </>
                                )}
                            </button>

                            {errors.submit && (
                                <p className="text-red-500 text-sm flex items-center">
                                    <Info size={14} className="mr-1" />
                                    {errors.submit}
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
