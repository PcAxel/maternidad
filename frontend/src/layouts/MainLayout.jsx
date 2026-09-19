import { NavLink } from 'react-router-dom'
import './MainLayout.css'

function MainLayout({ children }) {
  const rol = localStorage.getItem('user_role');

  // 1. Definimos los enlaces base que comparten la mayoría o todos
  let links = [
    { to: '/dashboard', label: 'Home' },
  ];

  // 2. Filtramos y agregamos secciones según las atribuciones de cada rol
  if (rol === 'MATRONA' || rol === 'MEDICO' || rol === 'ENFERMERO') {
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
      { to: '/reportes', label: 'Reportes' }
    );
  }

  // 3. El Administrador del Sistema tiene acceso exclusivo a la gestión de personal
  if (rol === 'ADMIN_SISTEMA') {
    links.push(
      { to: '/admin/usuarios', label: '⚙️ Gestionar Personal' }
    );
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <div className="layout-modern">
      {/* Navbar Superior Premium */}
      <nav className="navbar-premium">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo-text">MaternoInfantil</span>
          </div>
          
          <div className="navbar-links">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive ? 'nav-item nav-item--active' : 'nav-item'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-user">
            <button className="btn-logout" onClick={handleLogout}>Salir</button>
          </div>
        </div>
      </nav>

      {/* Contenedor central donde va el contenido de cada página */}
      <main className="layout-content">
        {children}
      </main>
    </div>
  )
}

export default MainLayout