import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './Reportes.css'

function Reportes() {
  // Inicializar con fechas por defecto (ej: últimos 30 días) para que Django no devuelva error 400
  const hoy = new Date()
  const haceUnMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())
  
  const [fechaInicio, setFechaInicio] = useState(haceUnMes.toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(hoy.toISOString().split('T')[0])
  
  const [datosCesareas, setDatosCesareas] = useState([])
  const [kpis, setKpis] = useState({
    tasaCesareas: 0,
    porcentajeBajoPeso: 0,
    promedioDias: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const COLORES = ['#1f4b4c', '#c97b63']

  const cargarReportes = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar ambas fechas.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Obtener el token de seguridad guardado en el Login
      const token = localStorage.getItem('access_token')
      
      // 2. Configurar los headers y los parámetros de la URL
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      }

      // 3. Ejecutar las 3 peticiones de forma simultánea
      const [resCesareas, resBajoPeso, resHospitalizacion] = await Promise.all([
        axios.get('http://localhost:8000/api/reportes/cesareas/', config),
        axios.get('http://localhost:8000/api/reportes/bajo-peso/', config),
        axios.get('http://localhost:8000/api/reportes/hospitalizacion/', config)
      ])

      // 4. Mapear la respuesta al formato del gráfico circular
      setDatosCesareas([
        { name: 'Natural', value: resCesareas.data.naturales },
        { name: 'Cesárea', value: resCesareas.data.cesareas }
      ])

      // 5. Guardar los indicadores (KPIs) en el estado
      setKpis({
        tasaCesareas: resCesareas.data.tasa_cesareas,
        porcentajeBajoPeso: resBajoPeso.data.porcentaje,
        promedioDias: resHospitalizacion.data.promedio_dias
      })

    } catch (error) {
      console.error("Error al cargar reportes", error)
      setError('Hubo un problema al cargar los datos. Verifica tu conexión o sesión.')
    } finally {
      setLoading(false)
    }
  }

  // Ejecutar automáticamente al montar el componente
  useEffect(() => {
    cargarReportes()
  }, [])

  const exportarPDF = () => {
    // Aquí implementaremos la llamada a ReportLab posteriormente
    console.log("Exportando PDF de", fechaInicio, "a", fechaFin)
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Reportes y Estadísticas</h1>
          <p className="page-intro">Análisis de indicadores clave de maternidad y gestión hospitalaria.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportarPDF}>📄 Exportar PDF</button>
        </div>
      </div>

      <div className="card shadow-sm p-4 mb-4 border-0">
        <div className="row align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-bold">Fecha Inicio</label>
            <input type="date" className="form-control" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">Fecha Fin</label>
            <input type="date" className="form-control" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </div>
          <div className="col-md-4">
            <button className="btn btn-primary w-100" onClick={cargarReportes} disabled={loading}>
              {loading ? 'Consultando BD...' : 'Aplicar Filtros'}
            </button>
          </div>
        </div>
        {error && <div className="text-danger mt-3 fw-bold">{error}</div>}
      </div>

      {/* TARJETAS DE INDICADORES (KPIs) */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm p-4 border-0 text-center h-100">
            <h6 className="text-muted text-uppercase fw-bold mb-2">Tasa de Cesáreas</h6>
            <h2 className="display-5 fw-bold" style={{ color: '#c97b63' }}>{kpis.tasaCesareas}%</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-4 border-0 text-center h-100">
            <h6 className="text-muted text-uppercase fw-bold mb-2">RN con Bajo Peso</h6>
            <h2 className="display-5 fw-bold" style={{ color: '#1f4b4c' }}>{kpis.porcentajeBajoPeso}%</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-4 border-0 text-center h-100">
            <h6 className="text-muted text-uppercase fw-bold mb-2">Promedio Hospitalización</h6>
            <h2 className="display-5 fw-bold" style={{ color: '#5c6b65' }}>{kpis.promedioDias} días</h2>
          </div>
        </div>
      </div>

      {/* GRÁFICO CIRCULAR */}
      <div className="row">
        <div className="col-md-6 mb-4 mx-auto">
          <div className="card shadow-sm p-4 border-0 h-100">
            <h5 className="mb-4 fw-bold text-center">Distribución de Partos</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={datosCesareas} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                  {datosCesareas.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Reportes