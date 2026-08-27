import axios from 'axios'

const TOKEN_KEY = 'minishop_token'

// In dev, calls go to '/api' and Vite proxies them to the Laravel backend.
// In production, set VITE_API_URL to the deployed backend, e.g. https://api.example.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { Accept: 'application/json' },
})

// Attach the admin bearer token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export default api
