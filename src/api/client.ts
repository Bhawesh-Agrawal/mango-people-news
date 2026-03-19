import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.gallitify.tech'

export const client = axios.create({
  baseURL:         `${BASE_URL}/api/v1`,
  timeout:         10000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mpn_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await client.post('/auth/refresh')
        const token = data.data.accessToken
        localStorage.setItem('mpn_token', token)
        original.headers.Authorization = `Bearer ${token}`
        return client(original)
      } catch {
        localStorage.removeItem('mpn_token')
      }
    }
    return Promise.reject(error)
  }
)