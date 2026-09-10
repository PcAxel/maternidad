import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/pacientes', label: 'Pacientes' },
  { to: '/partos', label: 'Partos' },
  { to: '/recien-nacidos', label: 'Recién nacidos' },
  { to: '/altas', label: 'Altas' },
  { to: '/reportes', label: 'Reportes' },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <p className="sidebar__mark">Materno</p>

      <nav className="sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <p className="sidebar__footer">Sistema Materno-Infantil</p>
    </aside>
  )
}

export default Sidebar
