import React, { useEffect, useState, useRef } from 'react';
import useRequireAuth from '../hooks/useRequireAuth';
import { accountApi } from '../services/accountApi';

const Account = () => {
    const { user: authUser, loading: authLoading } = useRequireAuth();
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef();

    useEffect(() => {
        if (authUser) {
            fetchUser();
        }
    }, [authUser]);

    const fetchUser = async () => {
        try {
            const data = await accountApi.getMe();
            setUser(data);
            setDisplayName(data.tenHienThi || '');
        } catch (err) {
            setError('Không thể tải thông tin tài khoản');
            console.error('fetchUser error:', err);
        }
    };

    const handleDisplayNameChange = (e) => {
        setDisplayName(e.target.value);
    };

    const handleDisplayNameSubmit = async (e) => {
        e.preventDefault();

        if (!displayName.trim()) {
            setError('Tên hiển thị không được để trống');
            return;
        }

        if (displayName.length > 100) {
            setError('Tên hiển thị không được vượt quá 100 ký tự');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const res = await accountApi.updateDisplayName(displayName);
            setMessage('Đã cập nhật tên hiển thị!');
            setUser((u) => ({ ...u, tenHienThi: res.displayName }));
        } catch (err) {
            setError(err.message || 'Lỗi khi cập nhật tên hiển thị');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);

            console.log('🔵 [Account] Starting avatar upload...', file.name);

            setLoading(true);
            setMessage('');
            setError('');

            try {
                const res = await accountApi.updateAvatar(file);
                console.log('✅ [Account] Avatar updated successfully:', res);

                setUser((u) => ({ ...u, avatar: res.avatar }));
                setMessage('Đã cập nhật ảnh đại diện!');
                setAvatarFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';

                // Reload user data từ server để đảm bảo sync
                console.log('🔵 [Account] Reloading user data...');
                await fetchUser();
            } catch (err) {
                console.error('❌ [Account] Avatar update failed:', err);
                setError(err.message || 'Lỗi khi cập nhật ảnh đại diện');
            } finally {
                setLoading(false);
            }
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    if (authLoading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const handleCancel = () => {
        setDisplayName(user.tenHienThi || '');
        setMessage('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent mb-2">
                        Tài khoản của tôi
                    </h1>
                    <p className="text-gray-500">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Cover Background */}
                            <div className="h-32 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600"></div>

                            {/* Avatar */}
                            <div className="relative px-6 pb-6">
                                <div className="flex flex-col items-center -mt-16">
                                    <div className="relative group">
                                        <img
                                            src={accountApi.getAvatarUrl(user.avatar)}
                                            alt="avatar"
                                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-blue-100 transition-transform group-hover:scale-105"
                                        />
                                        <button
                                            onClick={triggerFileSelect}
                                            disabled={loading}
                                            className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 disabled:opacity-50"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </div>

                                    <h2 className="mt-4 text-2xl font-bold text-gray-800">
                                        {displayName || user.tenHienThi || 'Người dùng'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">{user.email}</p>

                                    {/* Stats */}
                                    <div className="mt-6 w-full">
                                        <div className="bg-gradient-to-r from-sky-50 to-blue-100 rounded-xl p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                                                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                                                    {user.framesCount ?? 0}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">Khung hình đã tạo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Settings Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Cài đặt tài khoản
                            </h3>

                            {/* Display Name Section */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Tên hiển thị
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={handleDisplayNameChange}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                                    placeholder="Nhập tên hiển thị của bạn"
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-2">{displayName.length}/100 ký tự</p>
                            </div>

                            {/* Email Section (Read-only) */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email
                                </label>
                                <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-600">
                                    {user.email}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Email không thể thay đổi</p>
                            </div>

                            {/* Message & Error */}
                            {message && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-green-700 font-medium">{message}</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    onClick={handleDisplayNameSubmit}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang lưu...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Lưu thay đổi
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
