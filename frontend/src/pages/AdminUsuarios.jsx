import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './AdminUsuarios.css'

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mensajeExito, setMensajeExito] = useState('')

  // Estados del formulario para crear nuevo personal
  const [form, setForm] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    rol: 'MATRONA',
    especialidad: ''
  })

  // Estado para validación visual interactiva
  const [camposVacios, setCamposVacios] = useState({
    username: false,
    password: false,
    first_name: false,
    last_name: false
  })

  // Cargar la lista de usuarios de forma segura
  useEffect(() => {
    let isMounted = true;

    const cargarUsuarios = async () => {
      setLoading(true)
      try {
        const response = await api.get('/usuarios/') 
        
        if (isMounted) {
          const dataUsuarios = Array.isArray(response.data) 
            ? response.data 
            : (response.data.results || [])
            
          setUsuarios(dataUsuarios)
          setError('')
        }
      } catch (err) {
        console.error("Error al cargar usuarios:", err)
        if (isMounted) {
          setError('No se pudo cargar la lista de personal.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    cargarUsuarios()

    return () => {
      isMounted = false;
    }
  }, [])

  // Manejador inteligente: actualiza el valor y quita el borde rojo al mismo tiempo
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (camposVacios[name]) {
      setCamposVacios({ ...camposVacios, [name]: false });
    }
  }

  // Función para crear un nuevo usuario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensajeExito('')
    setError('')

    // VALIDACIÓN ESPECÍFICA DE CAMPOS VACÍOS
    const faltaUsername = !form.username.trim();
    const faltaPassword = !form.password.trim();
    const faltaFirstName = !form.first_name.trim();
    const faltaLastName = !form.last_name.trim();

    setCamposVacios({
      username: faltaUsername,
      password: faltaPassword,
      first_name: faltaFirstName,
      last_name: faltaLastName
    });

    if (faltaUsername || faltaPassword || faltaFirstName || faltaLastName) {
      setError('Por favor, completa todos los campos obligatorios marcados en rojo.');
      return;
    }

    try {
      await api.post('/usuarios/', form)
      setMensajeExito('¡Cuenta de personal creada exitosamente!')
      setForm({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        rol: 'MATRONA',
        especialidad: ''
      })
      setCamposVacios({ username: false, password: false, first_name: false, last_name: false })
      
      // Recargamos la tabla de forma segura
      const response = await api.get('/usuarios/')
      const dataUsuarios = Array.isArray(response.data) ? response.data : (response.data.results || [])
      setUsuarios(dataUsuarios)
    } catch (err) {
      console.error("Error al crear usuario:", err)
      setError(err.response?.data?.error || 'Error al registrar el nuevo usuario.')
    }
  }

  // Función para activar / desactivar usuario
  const toggleEstadoUsuario = async (id, estadoActual) => {
    try {
      await api.patch(`/usuarios/${id}/`, { is_active: !estadoActual })
      
      // Actualizamos el estado localmente de inmediato para evitar recargas innecesarias
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, is_active: !estadoActual } : u))
    } catch (err) {
      alert('No se pudo cambiar el estado del usuario.')
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Gestión de Personal</h1>
          <p className="page-intro">Alta, control y administración de perfiles médicos y administrativos de la unidad.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}

      <div className="card shadow-sm p-4 mb-5 border-0 bg-white" style={{ borderRadius: '12px' }}>
        <h5 className="fw-bold mb-3" style={{ color: '#0f172a' }}>Registrar Nuevo Perfil</h5>
        <form onSubmit={handleSubmit} className="row g-3" noValidate>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Rol en el Sistema</label>
            <select className="form-select" name="rol" value={form.rol} onChange={handleChange}>
              <option value="MATRONA">Matrona</option>
              <option value="MEDICO">Médico</option>
              <option value="ENFERMERO">Enfermero</option>
              <option value="ADMINISTRATIVO">Administrativo</option>
              <option value="JEFATURA">Jefatura</option>
              <option value="GERENCIA">Gerencia</option>
              <option value="ADMIN_SISTEMA">Administrador del Sistema</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Nombre de Usuario (Login)
              {camposVacios.username && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
            </label>
            <input 
              type="text" 
              className={`form-control ${camposVacios.username ? 'is-invalid' : ''}`} 
              name="username" 
              value={form.username} 
              onChange={handleChange} 
              placeholder="Ej. asilva" 
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Contraseña Temporal
              {camposVacios.password && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
            </label>
            <input 
              type="password" 
              className={`form-control ${camposVacios.password ? 'is-invalid' : ''}`} 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              placeholder="••••••••" 
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Nombres
              {camposVacios.first_name && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
            </label>
            <input 
              type="text" 
              className={`form-control ${camposVacios.first_name ? 'is-invalid' : ''}`} 
              name="first_name" 
              value={form.first_name} 
              onChange={handleChange} 
              placeholder="Ej. Alejandro" 
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              Apellidos
              {camposVacios.last_name && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
            </label>
            <input 
              type="text" 
              className={`form-control ${camposVacios.last_name ? 'is-invalid' : ''}`} 
              name="last_name" 
              value={form.last_name} 
              onChange={handleChange} 
              placeholder="Ej. Silva" 
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">Correo Electrónico (Opcional)</label>
            <input 
              type="email" 
              className="form-control" 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              placeholder="correo@hospital.cl" 
            />
          </div>

          <div className="col-md-12">
            <label className="form-label fw-semibold">Especialidad (Opcional)</label>
            <input 
              type="text" 
              className="form-control" 
              name="especialidad" 
              value={form.especialidad} 
              onChange={handleChange} 
              placeholder="Ej. Obstetricia y Ginecología" 
            />
          </div>

          <div className="col-12 text-end mt-4">
            <button type="submit" className="btn btn-primary px-4">
              Crear Cuenta de Personal
            </button>
          </div>
        </form>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden" style={{ borderRadius: '12px' }}>
        <div className="p-4 bg-white border-bottom">
          <h5 className="fw-bold m-0" style={{ color: '#0f172a' }}>Personal Registrado en la Unidad</h5>
        </div>
        <div className="table-responsive m-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-secondary">
              <tr>
                <th className="py-3 px-4">Nombre Completo</th>
                <th className="py-3">Usuario</th>
                <th className="py-3">Rol</th>
                <th className="py-3">Estado</th>
                <th className="py-3 text-end px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="5" className="text-center py-4 text-muted">Cargando personal...</td></tr>
              )}
              {!loading && usuarios.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No hay registros de personal activos.</td></tr>
              )}
              {!loading && usuarios.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 fw-semibold text-dark">{user.first_name} {user.last_name}</td>
                  <td className="text-muted">{user.username}</td>
                  <td>
                    <span className="badge bg-info-subtle text-info border border-info-subtle px-2 py-1">
                      {user.rol || 'PERSONAL'}
                    </span>
                  </td>
                  <td>
                    {user.is_active !== false ? (
                      <span className="badge bg-success-subtle text-success px-2 py-1">Conectado / Activo</span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger px-2 py-1">Desactivado</span>
                    )}
                  </td>
                  <td className="text-end px-4">
                    <button 
                      className={`btn btn-sm ${user.is_active !== false ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => toggleEstadoUsuario(user.id, user.is_active !== false)}
                    >
                      {user.is_active !== false ? 'Desactivar / Desconectar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}

export default AdminUsuarios