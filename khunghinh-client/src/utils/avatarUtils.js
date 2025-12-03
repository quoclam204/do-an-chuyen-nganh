import { API_BASE } from '../config'

/**
 * Resolve avatar URL to full path
 * @param {string} path - Avatar path from API (can be relative or absolute)
 * @param {string} fallbackName - Name for default avatar generation
 * @returns {string} Full avatar URL
 */
export function resolveAvatarUrl(path, fallbackName = 'User') {
    // If no path, return default avatar with name
    if (!path) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=0D8ABC&color=fff&size=128&bold=true`
    }

    // If already full URL, return as is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }

    // If relative path, prepend API_BASE
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

/**
 * Get avatar URL with cache busting timestamp
 * @param {string} path - Avatar path from API
 * @param {string} fallbackName - Name for default avatar generation
 * @returns {string} Avatar URL with timestamp
 */
export function getAvatarUrlWithTimestamp(path, fallbackName = 'User') {
    const url = resolveAvatarUrl(path, fallbackName)

    // Don't add timestamp to ui-avatars.com
    if (url.includes('ui-avatars.com')) {
        return url
    }

    const timestamp = Date.now()
    return url.includes('?') ? `${url}&t=${timestamp}` : `${url}?t=${timestamp}`
}
