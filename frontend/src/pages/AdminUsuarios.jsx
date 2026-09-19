import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'

function AdminUsuarios() {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    rol: 'MATRONA',
    telefono: '',
    especialidad: ''
  })
  
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje({ texto: '', tipo: '' })

    try {
      // Tu api.js se encargará de inyectar el token del ADMIN_SISTEMA automáticamente
      await api.post('/usuarios/', formData) 
      
      setMensaje({ texto: 'Personal registrado exitosamente en el sistema.', tipo: 'success' })
      setFormData({
        username: '', first_name: '', last_name: '', email: '', 
        password: '', rol: 'MATRONA', telefono: '', especialidad: ''
      })
    } catch (error) {
      console.error('Error:', error.response?.data)
      setMensaje({ 
        texto: 'Error al registrar. Verifica que el nombre de usuario no exista ya.', 
        tipo: 'error' 
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <h1 className="page-header__title">Gestión de Personal</h1>
        <p className="page-intro">Alta de nuevos perfiles médicos y administrativos.</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {mensaje.texto && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            backgroundColor: mensaje.tipo === 'success' ? 'rgba(31, 75, 76, 0.1)' : 'rgba(223, 71, 89, 0.1)',
            color: mensaje.tipo === 'success' ? 'var(--color-primary-dark)' : 'var(--color-accent)',
            border: `1px solid ${mensaje.tipo === 'success' ? 'var(--color-primary)' : 'var(--color-accent)'}`
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Rol en el Sistema</label>
            <select 
              name="rol" 
              value={formData.rol} 
              onChange={handleChange}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }}
            >
              <option value="MATRONA">Matrona</option>
              <option value="MEDICO">Médico</option>
              <option value="ENFERMERO">Enfermero</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="JEFATURA">Jefatura</option>
              <option value="GERENCIA">Gerencia</option>
              <option value="ADMIN_SISTEMA">Administrador del Sistema</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre de Usuario (Login)</label>
            <input type="text" name="username" required value={formData.username} onChange={handleChange} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Contraseña Temporal</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} minLength="6"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombres</label>
            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Apellidos</label>
            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Correo Electrónico</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Especialidad (Opcional)</label>
            <input type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} placeholder="Ej. Obstetricia"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-line)', background: 'transparent', outline: 'none' }} />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={cargando} style={{ width: '100%', cursor: 'pointer' }}>
              {cargando ? 'Procesando...' : 'Crear Cuenta de Personal'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default AdminUsuarios