import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.redirectTo || '/dashboard'

  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [camposVacios, setCamposVacios] = useState({ rut: false, password: false })
  const [loading, setLoading] = useState(false)
  const [saludo, setSaludo] = useState('Bienvenido')

  useEffect(() => {
    localStorage.clear()
    
    const hora = new Date().getHours()
    if (hora < 12) setSaludo('Buenos días')
    else if (hora < 19) setSaludo('Buenas tardes')
    else setSaludo('Buenas noches')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const faltaRut = !rut.trim()
    const faltaPassword = !password.trim()
    
    setCamposVacios({ rut: faltaRut, password: faltaPassword })

    if (faltaRut || faltaPassword) {
      setError('Por favor, completa los campos obligatorios.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // CORRECCIÓN APLICADA: Solo '/token/' para evitar el doble /api/api/
      const respuesta = await api.post('/usuarios/login/', {
        username: rut,
        password: password,
      })

      localStorage.setItem('access_token', respuesta.data.access)
      localStorage.setItem('refresh_token', respuesta.data.refresh)
      
      // Guardar variables personalizadas si el backend las envía
      if (respuesta.data.rol) localStorage.setItem('user_role', respuesta.data.rol)
      if (respuesta.data.nombre) localStorage.setItem('user_nombre', respuesta.data.nombre)

      navigate(destino)
    } catch (err) {
      console.error('Error de autenticación:', err)
      
      // Manejo de seguridad para ataques de fuerza bruta (Throttling)
      if (err.response?.status === 429) {
        setError('Demasiados intentos fallidos. Por seguridad, espera 60 segundos antes de volver a intentar.')
      } else if (err.response?.status === 401) {
        setError('Credenciales incorrectas. Verifica tu RUT y contraseña.')
      } else {
        setError('Error de conexión con el servidor. Inténtalo más tarde.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <main className="login-card">
        <header className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.5c-4.5 0-8-3.5-8-8 0-4 3.5-7.5 7.5-7.5s7.5 3.5 7.5 7.5c0 4.5-3.5 8-7 8z"/>
              <path d="M12 13.5c-2 0-3.5-1.5-3.5-3.5 0-1.5 1.5-2.5 3.5-2.5s3.5 1 3.5 2.5c0 2-1.5 3.5-3.5 3.5z"/>
            </svg>
          </div>
          <h1 className="login-title">{saludo}</h1>
          <p className="login-subtitle">Gestión Clínica Integral Materno Infantil</p>
        </header>

        <section className="login-body">
          <form onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="login-error" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {error}
              </div>
            )}

            <div className="login-form-group">
              <div className="login-label">
                <label htmlFor="rut">RUT del Funcionario</label>
                {camposVacios.rut && <span className="login-label-error">Requerido</span>}
              </div>
              <div className="login-input-wrapper">
                <div className="login-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <input
                  id="rut"
                  type="text"
                  className={`login-input ${camposVacios.rut ? 'is-invalid' : ''}`}
                  value={rut}
                  onChange={(e) => {
                    setRut(e.target.value)
                    if (camposVacios.rut) setCamposVacios({...camposVacios, rut: false})
                  }}
                  placeholder="Ej. 12345678-9"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="login-form-group">
              <div className="login-label">
                <label htmlFor="password">Contraseña</label>
                {camposVacios.password && <span className="login-label-error">Requerida</span>}
              </div>
              <div className="login-input-wrapper">
                <div className="login-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`login-input ${camposVacios.password ? 'is-invalid' : ''}`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (camposVacios.password) setCamposVacios({...camposVacios, password: false})
                  }}
                  placeholder="Ingresa tu clave"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button 
                  type="button"
                  className="login-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn-submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  Verificando...
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default Login