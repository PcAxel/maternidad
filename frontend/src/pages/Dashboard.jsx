import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './Dashboard.css'

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
  const nombre = localStorage.getItem('user_nombre') || 'Usuario'
  const rol = localStorage.getItem('user_role') || ''

  const [stats, setStats] = useState({
    pacientes: 0,
    partos: 0,
    recienNacidos: 0,
    altasPendientes: 0
  })
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarStats = async () => {
      let pac = 0, par = 0, rn = 0, alt = 0;

      try {
        const res = await api.get('/pacientes/');
        pac = res.data.count ?? res.data.length ?? 0;
      } catch (e) { console.error('Fallo pacientes'); }

      try {
        const res = await api.get('/partos/');
        par = res.data.count ?? res.data.length ?? 0;
      } catch (e) { console.error('Fallo partos'); }

      try {
        const res = await api.get('/recien-nacidos/');
        rn = res.data.count ?? res.data.length ?? 0;
      } catch (e) { console.error('Fallo recién nacidos'); }

      try {
        const res = await api.get('/altas/');
        alt = res.data.count ?? res.data.length ?? 0;
      } catch (e) { console.error('Fallo altas'); }

      setStats({
        pacientes: pac,
        partos: par,
        recienNacidos: rn,
        altasPendientes: alt,
      });
      setCargando(false);
    }
    cargarStats()
  }, [])

  return (
    <MainLayout>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-header__title">Bienvenido, {nombre}</h1>
          <p className="page-intro">Centro de operaciones y monitoreo clínico.</p>
        </div>
        {rol && (
          <span className="dashboard-header__badge">
            {roleLabels[rol] || rol}
          </span>
        )}
      </div>

      {cargando && <p className="dashboard-loading">Sincronizando con el servidor…</p>}

      {!cargando && (
        <div className="home-layout">
          {/* Columna Izquierda: Monitoreo */}
          <div className="home-main">
            <h2 className="section-title">Actividad Reciente</h2>
            <div className="dashboard-stats">
              <div className="dashboard-stat">
                <span className="dashboard-stat__value">{stats.pacientes}</span>
                <span className="dashboard-stat__label">Pacientes en sala</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat__value">{stats.partos}</span>
                <span className="dashboard-stat__label">Partos en curso / Hoy</span>
              </div>
              <div className="dashboard-stat">
                <span className="dashboard-stat__value">{stats.recienNacidos}</span>
                <span className="dashboard-stat__label">Neonatos en NEO</span>
              </div>
            </div>

            {/* Panel de Alertas (Solo aparece si hay altas) */}
            {stats.altasPendientes > 0 && (
              <div className="alert-panel">
                <div className="alert-panel__content">
                  <span className="alert-panel__icon">⚠️</span>
                  <div>
                    <h3 className="alert-panel__title">Atención Requerida</h3>
                    <p className="alert-panel__text">Tienes {stats.altasPendientes} alta(s) médica(s) pendiente(s) de revisión administrativa.</p>
                  </div>
                </div>
                <Link to="/altas" className="btn-alert">Gestionar Altas</Link>
              </div>
            )}
          </div>

          {/* Columna Derecha: Accesos Rápidos */}
          <div className="home-sidebar">
            <h2 className="section-title">Accesos Rápidos</h2>
            <div className="quick-actions">
              <Link to="/pacientes" className="action-card">
                <span className="action-card__icon">+</span>
                Registrar Ingreso
              </Link>
              <Link to="/partos" className="action-card">
                <span className="action-card__icon">+</span>
                Iniciar Parto
              </Link>
              <Link to="/recien-nacidos" className="action-card">
                <span className="action-card__icon">+</span>
                Ficha Neonato
              </Link>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Dashboard