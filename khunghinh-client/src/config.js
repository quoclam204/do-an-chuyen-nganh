// Centralized configuration for API and SPA origins
export const API_BASE = (import.meta.env.VITE_API_ORIGIN || import.meta.env.VITE_API_URL || 'https://localhost:7090').replace(/\/$/, '')
export const SPA_ORIGIN = (import.meta.env.VITE_SPA_ORIGIN || window.location.origin).replace(/\/$/, '')
