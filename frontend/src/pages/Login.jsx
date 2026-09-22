import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.redirectTo || '/dashboard'

  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!rut.trim() || !password.trim()) {
      setError('Debes completar todos los campos.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const respuesta = await api.post('/usuarios/login/', {
        username: rut,
        password: password,
      })

      localStorage.setItem('access_token', respuesta.data.access)
      localStorage.setItem('refresh_token', respuesta.data.refresh)
      localStorage.setItem('user_role', respuesta.data.rol)
      localStorage.setItem('user_nombre', respuesta.data.nombre)

      navigate(destino)
    } catch (err) {
      console.error('Error de autenticación:', err)
      setError('Credenciales incorrectas. Verifica tu RUT y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <div className="login-brand__content">
          <p className="login-brand__mark">Materno</p>
          <p className="login-brand__tagline">
            Registro clínico y seguimiento de maternidad, parto y recién
            nacidos, en un solo lugar para todo el equipo.
          </p>
        </div>

        <svg
          className="login-brand__graphic"
          viewBox="0 0 320 200"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="70" cy="130" r="54" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
          <circle cx="150" cy="90" r="86" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          <path
            d="M10 150 Q 60 110 100 150 T 190 150 T 280 150"
            stroke="#C97B63"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <p className="login-brand__footer">Sistema Materno-Infantil</p>
      </aside>

      <main className="login-panel">
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <h1 className="login-form__title">Iniciar sesión</h1>
          <p className="login-form__subtitle">
            Ingresa con tu RUT y contraseña institucional.
          </p>

          {error && (
            <p className="login-form__error" role="alert">
              {error}
            </p>
          )}

          <label className="login-field">
            <span>RUT</span>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="12.345.678-9"
              disabled={loading}
              autoComplete="username"
            />
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? 'Verificando…' : 'Iniciar sesión'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default Login
