// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Users,
    Image,
    Settings,
    BarChart3,
    FileText,
    Shield,
    Eye,
    Trash2,
    Edit
} from 'lucide-react'

export default function Admin() {
    const [me, setMe] = useState(null)
    const [activeTab, setActiveTab] = useState('dashboard')
    const navigate = useNavigate()

    // Đọc user từ localStorage
    const readMe = () => {
        try { return JSON.parse(localStorage.getItem('kh_me') || 'null') } catch { return null }
    }

    useEffect(() => {
        const user = readMe()
        setMe(user)

        // Kiểm tra quyền admin
        const isAdmin = user?.vaiTro === "admin" || user?.role === "admin" || user?.email === "admin@example.com"
        if (!user || !isAdmin) {
            navigate('/')
        }
    }, [navigate])

    // Nếu chưa load user hoặc không phải admin
    if (!me) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900">Đang kiểm tra quyền truy cập...</h2>
                </div>
            </div>
        )
    }

    const isAdmin = me?.vaiTro === "admin" || me?.role === "admin" || me?.email === "admin@example.com"
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-red-400" />
                    <h2 className="mt-2 text-lg font-medium text-gray-900">Bạn không có quyền truy cập trang này</h2>
                    <p className="mt-1 text-sm text-gray-500">Chỉ admin mới có thể truy cập trang quản trị.</p>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'dashboard', name: 'Tổng quan', icon: BarChart3 },
        { id: 'users', name: 'Người dùng', icon: Users },
        { id: 'frames', name: 'Khung hình', icon: Image },
        { id: 'reports', name: 'Báo cáo', icon: FileText },
        { id: 'settings', name: 'Cài đặt', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Trang Quản Trị</h1>
                    <p className="text-gray-600 mt-2">Chào mừng {me.name} đến với trang quản trị hệ thống</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow">
                    {activeTab === 'dashboard' && <DashboardTab />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'frames' && <FramesTab />}
                    {activeTab === 'reports' && <ReportsTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                </div>
            </div>
        </div>
    )
}

// Dashboard Tab
function DashboardTab() {
    const stats = [
        { name: 'Tổng người dùng', value: '1,234', icon: Users, color: 'bg-blue-500' },
        { name: 'Khung hình', value: '5,678', icon: Image, color: 'bg-green-500' },
        { name: 'Lượt tạo hôm nay', value: '234', icon: BarChart3, color: 'bg-yellow-500' },
        { name: 'Báo cáo chờ xử lý', value: '12', icon: FileText, color: 'bg-red-500' },
    ]

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tổng quan hệ thống</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.name} className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="flex items-center">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hoạt động gần đây</h3>
                <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <span>Người dùng <strong>Nguyễn Văn A</strong> vừa tạo khung hình mới</span>
                        <span className="ml-auto text-gray-400">2 phút trước</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        <span>Người dùng <strong>Trần Thị B</strong> đã đăng ký tài khoản</span>
                        <span className="ml-auto text-gray-400">15 phút trước</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                        <span>Khung hình <strong>"Giáng sinh 2024"</strong> được cập nhật</span>
                        <span className="ml-auto text-gray-400">1 giờ trước</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Users Tab
function UsersTab() {
    const users = [
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', role: 'user', status: 'active', joinDate: '2024-01-15' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', role: 'user', status: 'active', joinDate: '2024-02-20' },
        { id: 3, name: 'Admin', email: 'admin@example.com', role: 'admin', status: 'active', joinDate: '2023-12-01' },
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Quản lý người dùng</h2>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Thêm người dùng
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Người dùng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Vai trò
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ngày tham gia
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                            ? 'bg-purple-100 text-purple-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role === 'admin' ? 'Quản trị' : 'Người dùng'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Hoạt động
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.joinDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <button className="text-blue-600 hover:text-blue-900">
                                            <Eye size={16} />
                                        </button>
                                        <button className="text-yellow-600 hover:text-yellow-900">
                                            <Edit size={16} />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Frames Tab
function FramesTab() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quản lý khung hình</h2>
            <p className="text-gray-600">Chức năng quản lý khung hình đang được phát triển...</p>
        </div>
    )
}

// Reports Tab  
function ReportsTab() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Báo cáo</h2>
            <p className="text-gray-600">Chức năng báo cáo đang được phát triển...</p>
        </div>
    )
}

// Settings Tab
function SettingsTab() {
    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cài đặt hệ thống</h2>
            <p className="text-gray-600">Chức năng cài đặt đang được phát triển...</p>
        </div>
    )
}