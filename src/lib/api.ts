const apiBase = import.meta.env.VITE_API_BASE_URL
export const API_BASE = (typeof apiBase === 'string' && apiBase.length > 0) ? apiBase : '/api'
