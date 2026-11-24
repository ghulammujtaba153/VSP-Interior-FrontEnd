import axios from 'axios'
import { BASE_URL } from '@/configs/url'

const apiClient = axios.create({
  baseURL: BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default apiClient
