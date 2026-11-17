import axios from 'axios'
import { AUTH_STORAGE_KEYS, clearStoredAuth } from '../utils/authStorage'

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '')

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(AUTH_STORAGE_KEYS.token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStoredAuth()
    }
    return Promise.reject(error)
  },
)

export default apiClient
