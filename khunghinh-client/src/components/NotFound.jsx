import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound({ message = "Không tìm thấy trang bạn yêu cầu" }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="text-9xl font-bold text-indigo-600 mb-4">404</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Oops! Trang không tồn tại
                    </h1>
                    <p className="text-gray-600 mb-8">
                        {message}
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Về trang chủ
                    </Link>

                    <Link
                        to="/editor"
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Tạo khung mới
                    </Link>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    <p>Có thể bạn đang tìm:</p>
                    <div className="mt-2 space-x-4">
                        <Link to="/quockhanh" className="text-indigo-600 hover:text-indigo-800">
                            Khung Quốc Khánh
                        </Link>
                        <Link to="/trungthu" className="text-indigo-600 hover:text-indigo-800">
                            Khung Trung Thu
                        </Link>
                        <Link to="/giangsinh" className="text-indigo-600 hover:text-indigo-800">
                            Khung Giáng Sinh
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}