import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  pacientes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </svg>
  ),
  partos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s-7-4.5-9-9a5 5 0 0 1 9-4 5 5 0 0 1 9 4c-2 4.5-9 9-9 9Z" />
    </svg>
  ),
  recienNacidos: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21c0-4 2.5-6 6-6s6 2 6 6" />
      <path d="M9 21v-3M15 21v-3" />
    </svg>
  ),
  altas: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 12h6M12 9v6" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  ),
  reportes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  ),
}

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { to: '/pacientes', label: 'Pacientes', icon: icons.pacientes },
  { to: '/partos', label: 'Partos', icon: icons.partos },
  { to: '/recien-nacidos', label: 'Recién nacidos', icon: icons.recienNacidos },
  { to: '/altas', label: 'Altas', icon: icons.altas },
  { to: '/reportes', label: 'Reportes', icon: icons.reportes },
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
            <span className="sidebar__icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <p className="sidebar__footer">Sistema Materno-Infantil</p>
    </aside>
  )
}

export default Sidebar
