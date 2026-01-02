import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: `${API_URL}/api` })

api.interceptors.request.use((config) => {
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  const token = Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const req = error.config
    if (error.response?.status === 401 && !req._retry) {
      req._retry = true
      try {
        const refresh = Cookies.get('refresh_token')
        if (refresh) {
          const res = await axios.post(`${API_URL}/api/auth/token/refresh/`, { refresh })
          Cookies.set('access_token', res.data.access)
          req.headers.Authorization = `Bearer ${res.data.access}`
          return api(req)
        }
      } catch {
        Cookies.remove('access_token')
        Cookies.remove('refresh_token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
