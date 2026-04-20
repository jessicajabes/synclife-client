import axios from 'axios'
import { useAuthStore } from '../store/auth-store'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://synclife-server-production.up.railway.app/api',
  timeout: 15000,
})

// Injeta o JWT automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Se receber 401, limpa auth e redireciona para login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
