import axios from 'axios'

// In dev, use relative /api so Vite proxy ( :3000 -> :5000 ) handles it and avoids CORS.
// In prod, VITE_API_URL must be set (e.g. https://.../api). Fallback to /api for safety.
const apiBase = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
