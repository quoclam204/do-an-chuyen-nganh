const API_BASE = import.meta.env.VITE_API_URL || 'https://localhost:7090'

class AdminApiService {
    async request(endpoint, options = {}) {
        const url = `${API_BASE}/api/admin${endpoint}`

        const config = {
            credentials: 'include', // Gửi cookie authentication
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        }

        // Xử lý FormData (không set Content-Type)
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type']
        }

        const response = await fetch(url, config)

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Not authenticated')
            } else if (response.status === 403) {
                throw new Error('Forbidden: Admin access required')
            }
            throw new Error(`API Error: ${response.status}`)
        }

        return response.json()
    }

    // Dashboard Stats
    async getStats() {
        return this.request('/stats')
    }

    // Frames Management
    async getFrames(params = {}) {
        const query = new URLSearchParams(params).toString()
        return this.request(`/frames?${query}`)
    }

    async changeFrameStatus(id, status) {
        return this.request(`/frames/${id}/status`, {
            method: 'POST',
            body: JSON.stringify({ status }),
        })
    }

    async deleteFrame(id) {
        return this.request(`/frames/${id}`, {
            method: 'DELETE',
        })
    }

    // Users Management  
    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString()
        return this.request(`/users?${query}`)
    }

    async changeUserRole(id, role) {
        return this.request(`/users/${id}/role`, {
            method: 'POST',
            body: JSON.stringify({ role }),
        })
    }

    async banUser(id, reason = '') {
        return this.request(`/users/${id}/ban`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
        })
    }

    // Reports Management
    async getReports(params = {}) {
        const query = new URLSearchParams(params).toString()
        return this.request(`/reports?${query}`)
    }

    async resolveReport(id, action, note = '') {
        return this.request(`/reports/${id}/resolve`, {
            method: 'POST',
            body: JSON.stringify({ action, note }),
        })
    }
}

export const adminApi = new AdminApiService()