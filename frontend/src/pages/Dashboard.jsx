import { useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import './Dashboard.css'

const sections = [
  { to: '/pacientes', title: 'Pacientes', description: 'Ficha clínica y antecedentes de cada paciente.' },
  { to: '/partos', title: 'Partos', description: 'Registro y seguimiento de partos en curso y finalizados.' },
  { to: '/recien-nacidos', title: 'Recién nacidos', description: 'APGAR, controles y derivaciones del recién nacido.' },
  { to: '/altas', title: 'Altas', description: 'Confirmación clínica, administrativa y certificados.' },
  { to: '/reportes', title: 'Reportes', description: 'Indicadores de cesáreas, bajo peso y hospitalización.' },
]

const roleLabels = {
  ADMINISTRATIVO: 'Administrativo',
  MATRONA: 'Matrona',
  MEDICO: 'Médico',
  ENFERMERO: 'Enfermero',
  JEFATURA: 'Jefatura',
  GERENCIA: 'Gerencia',
  ADMIN_SISTEMA: 'Administrador del sistema',
}

function Dashboard() {
  const navigate = useNavigate()
  const nombre = localStorage.getItem('user_nombre') || 'Usuario'
  const rol = localStorage.getItem('user_role') || ''

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_nombre')
    navigate('/')
  }

  return (
    <MainLayout>
      <div className="dashboard-header">
        <div className="dashboard-header__content">
          <h1 className="dashboard-header__title">Hola, {nombre}</h1>
          {rol && (
            <span className="dashboard-header__badge">
              {roleLabels[rol] || rol}
            </span>
          )}
          <p className="dashboard-intro">
            Elige una sección para continuar con tu trabajo del día.
          </p>
        </div>
        <button className="dashboard-header__logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <p className="dashboard-intro">
        Elige una sección para continuar con tu trabajo del día.
      </p>

      <div className="dashboard-grid">
        {sections.map((section) => (
          <Link key={section.to} to={section.to} className="dashboard-card">
            <h2>{section.title}</h2>
            <p>{section.description}</p>
          </Link>
        ))}
      </div>
    </MainLayout>
  )
}

export default Dashboard
