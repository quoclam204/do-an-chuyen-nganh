import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const Account = () => {
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [avatar, setAvatar] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await axios.get('/api/accounts/me');
            setUser(res.data);
            setDisplayName(res.data.TenHienThi || res.data.tenHienThi || '');
            setAvatar(res.data.avatar || '');
        } catch (err) {
            setMessage('Không thể tải thông tin tài khoản');
        }
    };

    const handleDisplayNameChange = (e) => {
        setDisplayName(e.target.value);
    };

    const handleDisplayNameSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const formData = new FormData();
            formData.append('displayName', displayName);
            const res = await axios.post('/api/accounts/display-name', formData);
            setMessage('Đã cập nhật tên hiển thị!');
            setUser((u) => ({ ...u, TenHienThi: res.data.displayName }));
        } catch (err) {
            setMessage(err.response?.data || (err.response?.data?.message) || 'Lỗi khi cập nhật tên hiển thị');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // upload immediately
            setLoading(true);
            setMessage('');
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await axios.post('/api/accounts/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setAvatar(res.data.avatar);
                setUser((u) => ({ ...u, avatar: res.data.avatar }));
                setMessage('Đã cập nhật ảnh đại diện!');
                setAvatarFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } catch (err) {
                setMessage(err.response?.data || (err.response?.data?.message) || 'Lỗi khi cập nhật ảnh đại diện');
            } finally {
                setLoading(false);
            }
        }
    };

    const triggerFileSelect = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    if (!user) return <div>Đang tải thông tin tài khoản...</div>;

    const handleCancel = () => {
        setDisplayName(user.TenHienThi || user.tenHienThi || '');
        setMessage('');
    };

    return (
        <div className="container mx-auto px-4 mt-8">
            <h2 className="text-2xl font-bold mb-6">Tài khoản</h2>
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left: main card */}
                <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
                    <div className="text-sm text-gray-400 uppercase font-semibold mb-4">Thông tin</div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <img
                                src={user.avatar || avatar || '/default-avatar.png'}
                                alt="avatar"
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-inner"
                            />
                        </div>

                        <div className="flex-1" />

                        <div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <button
                                onClick={triggerFileSelect}
                                className="px-4 py-2 bg-white border rounded-full shadow-sm hover:shadow-md"
                                disabled={loading}
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>

                    <div className="my-6 border-t pt-6">
                        <label className="block mb-2 text-sm text-gray-600">Tên đầy đủ</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={handleDisplayNameChange}
                            className="border rounded px-4 py-3 w-full bg-gray-50"
                            maxLength={100}
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-white border rounded-full text-gray-600 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleDisplayNameSubmit}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow transition-colors"
                            disabled={loading}
                        >
                            Lưu
                        </button>
                    </div>

                    <div className="mt-6 text-sm text-gray-600">
                        <div>
                            <span className="font-medium">Email:</span> {user.Email || user.email}
                        </div>
                        <div className="mt-2">
                            <span className="font-medium">Số lượng khung hình:</span> {user.framesCount ?? 0}
                        </div>
                        {message && <div className="mt-4 text-blue-600">{message}</div>}
                    </div>
                </div>

                {/* Right: profile card */}
                <div className="w-full lg:w-80 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
                    <img
                        src={user.avatar || avatar || '/default-avatar.png'}
                        alt="avatar"
                        className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-white shadow-md"
                    />
                    <div className="text-lg font-semibold">{displayName || user.TenHienThi || user.tenHienThi || user.email}</div>
                    <div className="text-sm text-gray-400 mt-2 text-center">{user.framesCount ?? 0} khung hình</div>
                </div>
            </div>
        </div>
    );
};

export default Account;
