import { NavLink } from 'react-router-dom'
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

function MainLayout({ children }) {
  // Obtenemos los valores y evitamos que caigan en null o undefined
  const rol = localStorage.getItem('user_role') || 'ADMIN_SISTEMA';
  const nombre = localStorage.getItem('user_nombre') || 'Administrador';

  // 1. Definimos los enlaces base
  let links = [
    { to: '/dashboard', label: 'Home' },
  ];

  // 2. Filtramos y agregamos secciones según las atribuciones de cada rol
  if (rol === 'MATRONA' || rol === 'MEDICO' || rol === 'ENFERMERO' || rol === 'ADMIN_SISTEMA') {
    links.push(
      { to: '/pacientes', label: 'Pacientes' },
      { to: '/partos', label: 'Partos' },
      { to: '/recien-nacidos', label: 'Recién Nacidos' }
    );
  }

  if (rol === 'ADMINISTRATIVO' || rol === 'JEFATURA' || rol === 'GERENCIA' || rol === 'ADMIN_SISTEMA') {
    links.push(
      { to: '/pacientes', label: 'Pacientes' },
      { to: '/altas', label: 'Altas' }
    );
  }

  if (rol === 'JEFATURA' || rol === 'GERENCIA' || rol === 'ADMIN_SISTEMA') {
    links.push(
      { to: '/reportes', label: 'Informes' }
    );
  }

  if (rol === 'ADMIN_SISTEMA') {
    links.push(
      { to: '/admin/usuarios', label: 'Gestionar Personal' }
    );
  }

  // Eliminamos enlaces duplicados automáticamente
  links = links.filter((value, index, self) =>
    index === self.findIndex((t) => (
      t.to === value.to
    ))
  );

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  }

  // Obtenemos la etiqueta de rol de forma segura
  const displayRole = roleLabels[rol] || rol || 'Usuario del Sistema';

  return (
    <div className="layout-modern">
      {/* Navbar Superior */}
      <nav className="navbar-premium" style={{ borderBottom: 'none', background: '#fff', padding: '12px 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          
          {/* LADO IZQUIERDO: Logo y Menú agrupados */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="navbar-logo">
              <span className="logo-text" style={{ color: 'var(--color-primary, #0F766E)', fontSize: '20px', fontWeight: 'bold' }}>
                MaternoInfantil
              </span>
            </div>
            
            <div className="navbar-links" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-item nav-item--active' : 'nav-item'
                  }
                  style={{ textDecoration: 'none', color: 'var(--text-muted, #64748b)', fontSize: '14px', fontWeight: '500' }}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* LADO DERECHO: Usuario, Rol, Avatar y Botón Salir */}
          <div className="navbar-user" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main, #0f172a)' }}>
                {nombre}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>
                {displayRole}
              </div>
            </div>
            
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--color-darkcyan, #0F766E)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {nombre ? nombre.charAt(0).toUpperCase() : 'A'}
            </div>

            <button 
              className="btn-logout" 
              onClick={handleLogout} 
              style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', marginLeft: '8px' }}
            >
              Salir
            </button>
          </div>

        </div>
      </nav>

      {/* Contenedor central */}
      <main className="layout-content">
        {children}
      </main>
    </div>
  )
}

export default MainLayout