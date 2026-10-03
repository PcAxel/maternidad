import axios from 'axios'

// Apunta a tu servidor de Django
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- 1. INTERCEPTOR DE SALIDA (REQUEST) ---
// Antes de que cualquier petición viaje a Django, le inyectamos el Token de seguridad.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- 2. INTERCEPTOR DE ENTRADA (RESPONSE) ---
// Si Django nos rechaza con un 401 (Token expirado), intentamos renovarlo en silencio.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si el error es 401, no hemos reintentado ya, y NO es la ruta de login
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      originalRequest.url !== '/token/'
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (!refreshToken) {
          throw new Error('No hay token de refresco disponible')
        }

        // Le pedimos una nueva llave a Django usando el refresh token
        const respuestaRefresh = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        })

        // Guardamos la llave nueva
        localStorage.setItem('access_token', respuestaRefresh.data.access)

        // Se la pegamos a la petición que había fallado y la disparamos de nuevo
        originalRequest.headers.Authorization = `Bearer ${respuestaRefresh.data.access}`
        return api(originalRequest)
        
      } catch (refreshError) {
        // Si el refresh token también murió, borramos todo y lo mandamos al Login
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api