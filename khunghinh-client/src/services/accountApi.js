import { API_BASE } from '../config'

/**
 * Service quản lý các API calls liên quan đến tài khoản người dùng
 * Tương ứng với AccountsController trong backend
 */
class AccountApiService {
    /**
     * Lấy thông tin cơ bản của user hiện tại
     * GET /api/accounts/me
     * @returns {Promise<{id, email, tenHienThi, avatar, framesCount}>}
     */
    async getMe() {
        const response = await fetch(`${API_BASE}/api/accounts/me`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized')
            }
            const error = await response.text()
            throw new Error(error || `Failed to get account info: ${response.status}`)
        }

        return await response.json()
    }

    /**
     * Cập nhật tên hiển thị
     * POST /api/accounts/display-name
     * @param {string} displayName - Tên hiển thị mới (max 100 ký tự)
     * @returns {Promise<{success: boolean, displayName: string}>}
     */
    async updateDisplayName(displayName) {
        const formData = new FormData()
        formData.append('displayName', displayName)

        const response = await fetch(`${API_BASE}/api/accounts/display-name`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(error || 'Lỗi khi cập nhật tên hiển thị')
        }

        return await response.json()
    }

    /**
     * Thay đổi ảnh đại diện
     * POST /api/accounts/avatar
     * @param {File} file - File ảnh (PNG/JPG, max 2MB)
     * @returns {Promise<{success: boolean, avatar: string}>}
     */
    async updateAvatar(file) {
        console.log('🔵 [accountApi] updateAvatar:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            apiUrl: `${API_BASE}/api/accounts/avatar`
        })

        // Validate client-side trước khi gửi
        if (!file) {
            throw new Error('Chưa chọn file')
        }

        if (file.size > 2 * 1024 * 1024) {
            throw new Error('File không được vượt quá 2MB')
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Chỉ chấp nhận file PNG/JPG')
        }

        const formData = new FormData()
        formData.append('file', file)

        console.log('🔵 [accountApi] Sending request with credentials...')

        const response = await fetch(`${API_BASE}/api/accounts/avatar`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        })

        console.log('🔵 [accountApi] Response status:', response.status)
        console.log('🔵 [accountApi] Response headers:', {
            contentType: response.headers.get('content-type'),
            setCookie: response.headers.get('set-cookie')
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('❌ [accountApi] Error response:', error)
            throw new Error(error || 'Lỗi khi cập nhật ảnh đại diện')
        }

        const result = await response.json()
        console.log('✅ [accountApi] Success result:', result)
        return result
    }

    /**
     * Lấy số lượng khung hình của user đang đăng nhập
     * GET /api/accounts/frames-count
     * @returns {Promise<{count: number}>}
     */
    async getFramesCount() {
        const response = await fetch(`${API_BASE}/api/accounts/frames-count`, {
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        })

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized')
            }
            const error = await response.text()
            throw new Error(error || `Failed to get frames count: ${response.status}`)
        }

        return await response.json()
    }

    /**
     * Helper: Lấy URL đầy đủ cho avatar
     * @param {string} avatarPath - Path từ backend (vd: /avatars/xxx.jpg)
     * @returns {string}
     */
    getAvatarUrl(avatarPath) {
        if (!avatarPath) {
            return '/default-avatar.png'
        }

        // Nếu đã có full URL (http/https), trả về luôn
        if (avatarPath.startsWith('http')) {
            return avatarPath
        }

        // Nếu là relative path, ghép với API_BASE
        return `${API_BASE}${avatarPath}`
    }
}

export const accountApi = new AccountApiService()
