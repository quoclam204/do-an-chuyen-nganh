// ✅ Dùng import.meta.env thay vì process.env cho Vite
const API_BASE = import.meta.env.VITE_API_ORIGIN || 'https://localhost:7090'

class AuthApiService {
    // Đăng nhập bằng Google OAuth (popup)
    async loginWithGoogle() {
        return new Promise((resolve, reject) => {
            const w = 520, h = 620
            const y = window.top.outerHeight / 2 + window.top.screenY - h / 2
            const x = window.top.outerWidth / 2 + window.top.screenX - w / 2

            const popup = window.open(
                `${API_BASE}/api/auth/google`,
                'google-auth',
                `width=${w},height=${h},left=${x},top=${y},scrollbars=yes,resizable=yes`
            )

            if (!popup || popup.closed) {
                reject(new Error('Không thể mở popup. Vui lòng kiểm tra popup blocker.'))
                return
            }

            // Lắng nghe message từ popup callback
            const messageHandler = (event) => {
                // Kiểm tra origin để bảo mật
                const backendOrigin = new URL(API_BASE).origin

                if (event.origin !== backendOrigin) return

                if (event.data === 'auth:success') {
                    popup?.close()
                    window.removeEventListener('message', messageHandler)
                    resolve(true)
                }
            }

            window.addEventListener('message', messageHandler)

            // Kiểm tra popup đóng thủ công
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed)
                    window.removeEventListener('message', messageHandler)
                    reject(new Error('Popup đã đóng'))
                }
            }, 1000)
        })
    }

    // Lấy thông tin user hiện tại (với ClaimsTransformer)
    async getMe() {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            credentials: 'include', // Gửi cookie authentication
        })

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Not authenticated')
            }
            throw new Error(`Failed to get user info: ${response.status}`)
        }

        const user = await response.json()

        // Lưu vào localStorage và dispatch event
        localStorage.setItem('kh_me', JSON.stringify(user))
        window.dispatchEvent(new Event('kh_me_changed'))

        return user
    }

    // Đăng xuất
    async logout() {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch (error) {
            console.error('Logout API error:', error)
        } finally {
            // Luôn xóa localStorage dù API có lỗi
            localStorage.removeItem('kh_me')
            window.dispatchEvent(new Event('kh_me_changed'))
        }
    }

    // Kiểm tra quyền admin từ ClaimsTransformer
    isAdmin() {
        try {
            const me = JSON.parse(localStorage.getItem('kh_me') || 'null')
            return me?.vaiTro === 'admin'
        } catch {
            return false
        }
    }

    // Kiểm tra đã đăng nhập chưa
    isAuthenticated() {
        try {
            const me = JSON.parse(localStorage.getItem('kh_me') || 'null')
            return !!me?.email
        } catch {
            return false
        }
    }

    // Refresh thông tin user (gọi lại /api/auth/me)
    async refreshMe() {
        try {
            return await this.getMe()
        } catch (error) {
            console.error('Failed to refresh user info:', error)
            // Nếu không thể refresh, xóa thông tin cũ
            localStorage.removeItem('kh_me')
            window.dispatchEvent(new Event('kh_me_changed'))
            throw error
        }
    }
}

export const authApi = new AuthApiService()