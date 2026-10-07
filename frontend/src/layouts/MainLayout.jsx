import { NavLink, Navigate } from 'react-router-dom'
import './MainLayout.css'

const roleLabels = {
  ADMINISTRATIVO: 'Administrativo',
  MATRONA: 'Matrona',
  MEDICO: 'Médico',
  ENFERMERO: 'Enfermero',
  JEFATURA: 'Jefatura',
  GERENCIA: 'Gerencia',
  ADMIN_SISTEMA: 'Administrador del sistema',
}

// Mapa módulo -> roles autorizados, calcado 1:1 de los permission_classes
// que ya exigen estos mismos roles en el backend (ver app/*/permissions.py y views.py).
const MODULOS = [
  { to: '/dashboard', label: 'Home', roles: null }, // null = todos los roles autenticados
  {
    to: '/pacientes',
    label: 'Pacientes',
    roles: ['ADMINISTRATIVO', 'MATRONA', 'JEFATURA', 'ADMIN_SISTEMA'],
  },
  {
    to: '/partos',
    label: 'Partos',
    roles: ['MATRONA', 'MEDICO', 'ENFERMERO', 'JEFATURA', 'ADMIN_SISTEMA'],
  },
  {
    to: '/recien-nacidos',
    label: 'Recién Nacidos',
    roles: ['MATRONA',  'ENFERMERO', 'JEFATURA', 'ADMIN_SISTEMA'],
  },
  {
    to: '/altas',
    label: 'Altas',
    roles: ['MEDICO', 'ADMINISTRATIVO', 'JEFATURA', 'ADMIN_SISTEMA'],
  },
  {
    to: '/reportes',
    label: 'Informes',
    roles: ['JEFATURA', 'GERENCIA', 'ADMIN_SISTEMA'],
  },
  {
    to: '/admin/usuarios',
    label: 'Gestionar Personal',
    roles: ['JEFATURA', 'GERENCIA', 'ADMIN_SISTEMA'],
  },
]

function MainLayout({ children }) {
  // Guardia de sesión: si no hay sesión iniciada, redirige al Login
  const token = localStorage.getItem('access_token')
  const rol = localStorage.getItem('user_role')

  if (!token || !rol) {
    return <Navigate to="/" replace />
  }

  const nombre = localStorage.getItem('user_nombre') || 'Usuario'

  // Solo los módulos a los que este rol tiene acceso, ni uno más ni uno menos.
  const links = MODULOS.filter((modulo) => modulo.roles === null || modulo.roles.includes(rol))

  // Candado de seguridad por ruta: si el usuario navega directo a una URL
  // de un módulo que su rol no tiene en el menú, lo mandamos al Dashboard.
  const rutaActual = window.location.pathname
  const rutasPermitidas = links.map((l) => l.to)
  const tienePermisoRuta = rutasPermitidas.some((ruta) => rutaActual.startsWith(ruta))

  if (!tienePermisoRuta && rutaActual !== '/dashboard') {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/'
  }

  const displayRole = roleLabels[rol] || rol

  return (
    <div className="layout-modern">
      <nav
        className="navbar-premium"
        style={{
          borderBottom: 'none',
          background: '#fff',
          padding: '12px 24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <div
          className="navbar-container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="navbar-logo">
              <span
                className="logo-text"
                style={{ color: 'var(--color-primary, #0F766E)', fontSize: '20px', fontWeight: 'bold' }}
              >
                MaternoInfantil
              </span>
            </div>

            <div className="navbar-links" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'nav-item nav-item--active' : 'nav-item')}
                  style={{ textDecoration: 'none', color: 'var(--text-muted, #64748b)', fontSize: '14px', fontWeight: '500' }}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #0f172a)' }}>{nombre}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>{displayRole}</div>
            </div>

            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--color-darkcyan, #0F766E)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {nombre.charAt(0).toUpperCase()}
            </div>

            <button
              className="btn-logout"
              onClick={handleLogout}
              style={{
                padding: '6px 12px',
                border: '1px solid #e2e8f0',
                background: '#fff',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                marginLeft: '8px',
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="layout-content">{children}</main>
    </div>
  )
}

export default MainLayout
