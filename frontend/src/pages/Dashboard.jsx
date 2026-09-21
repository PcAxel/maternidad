import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'

function Dashboard() {
  const [stats, setStats] = useState({
    pacientes: 0,
    partos: 0,
    recienNacidos: 0,
    altasPendientes: 0
  })
  
  // Nuevo estado para la actividad reciente real obtenida de la base de datos
  const [actividadReciente, setActividadReciente] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatosDashboard = async () => {
      let pac = 0, par = 0, rn = 0, alt = 0;
      let ultimosPartos = [];

      try {
        const resPacientes = await api.get('/pacientes/');
        pac = resPacientes.data.count ?? resPacientes.data.length ?? 0;
      } catch (e) { console.error('Fallo pacientes', e); }

      try {
        const resPartos = await api.get('/partos/');
        par = resPartos.data.count ?? resPartos.data.length ?? 0;
        
        // Tomamos los últimos partos registrados para armar la tabla real
        const listaPartos = resPartos.data.results || resPartos.data;
        if (Array.isArray(listaPartos)) {
          ultimosPartos = listaPartos.slice(0, 5).map(p => ({
            id: p.id,
            fecha: new Date(p.fecha_inicio).toLocaleDateString() + ' ' + new Date(p.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tipo: `Parto (${p.tipo})`,
            paciente: p.paciente_nombre || `Paciente ID: ${p.paciente}`,
            estado: p.estado === 'FINALIZADO' ? 'Completado' : 'En Proceso'
          }));
        }
      } catch (e) { console.error('Fallo partos', e); }

      try {
        const resRN = await api.get('/recien-nacidos/');
        rn = resRN.data.count ?? resRN.data.length ?? 0;
      } catch (e) { console.error('Fallo recién nacidos', e); }

      try {
        const resAltas = await api.get('/altas/');
        alt = resAltas.data.count ?? resAltas.data.length ?? 0;
      } catch (e) { console.error('Fallo altas', e); }

      setStats({
        pacientes: pac,
        partos: par,
        recienNacidos: rn,
        altasPendientes: alt,
      });

      // Si hay datos reales de partos los usamos, de lo contrario dejamos un arreglo vacío
      setActividadReciente(ultimosPartos);
      setCargando(false);
    }

    cargarDatosDashboard()
  }, [])

  return (
    <MainLayout>
      {/* Encabezado Superior */}
      <div className="mb-4">
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Panel
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          Centro de operaciones y métricas clínicas de la unidad
        </p>
      </div>

      {cargando && <p style={{ color: 'var(--text-muted)' }}>Sincronizando con el servidor…</p>}

      {/* Tarjetas de Métricas (Grid de 4 columnas conectadas a la BD) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>{cargando ? '...' : stats.pacientes}</span>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: '8px 0 4px 0' }}>Pacientes Activos</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Hospitalizados / Monitoreo</p>
        </div>

        <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>{cargando ? '...' : stats.partos}</span>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: '8px 0 4px 0' }}>Partos del Mes</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Registrados en periodo actual</p>
        </div>

        <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>{cargando ? '...' : stats.recienNacidos}</span>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: '8px 0 4px 0' }}>Recién Nacidos</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Ingresos neonatales este mes</p>
        </div>

        <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-primary)' }}>{cargando ? '...' : stats.altasPendientes}</span>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', margin: '8px 0 4px 0' }}>Altas Pendientes</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>En proceso de confirmación</p>
        </div>

      </div>

      {/* Sección Inferior dividida: Actividad reciente real y Accesos Rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* Tabla de Actividad Reciente Dinámica */}
        <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Actividad Reciente </h3>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '13px', borderBottom: '2px solid var(--border-light)' }}>
                  <th>Fecha y Hora</th>
                  <th>Tipo</th>
                  <th>Paciente</th>
                  <th className="text-end">Estado</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr><td colSpan="4" className="text-center py-3 text-muted">Cargando actividad...</td></tr>
                )}
                {!cargando && actividadReciente.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-3 text-muted">No hay registros recientes en el servidor.</td></tr>
                )}
                {!cargando && actividadReciente.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '13px' }}>{item.fecha}</td>
                    <td style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '500' }}>{item.tipo}</td>
                    <td style={{ fontSize: '13px' }}>{item.paciente}</td>
                    <td className="text-end">
                      <span className={`badge ${item.estado === 'Completado' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Accesos Rápidos */}
        <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '8px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Accesos Rápidos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/pacientes" className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center" style={{ fontSize: '13px', padding: '10px 14px' }}>
              Registrar Ingreso de Paciente <span>&rsaquo;</span>
            </Link>
            <Link to="/partos" className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center" style={{ fontSize: '13px', padding: '10px 14px' }}>
              Iniciar Flujo de Parto <span>&rsaquo;</span>
            </Link>
            <Link to="/recien-nacidos" className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center" style={{ fontSize: '13px', padding: '10px 14px' }}>
              Nueva Ficha Neonatal <span>&rsaquo;</span>
            </Link>
            <Link to="/reportes" className="btn btn-outline-secondary text-start d-flex justify-content-between align-items-center" style={{ fontSize: '13px', padding: '10px 14px' }}>
              Generar Reporte Mensual <span>&rsaquo;</span>
            </Link>
          </div>
        </div>

      </div>
    </MainLayout>
  )
}

export default Dashboard