import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import axios from 'axios'
import './Reportes.css' // <-- Conectamos los estilos

function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('') // Ajustado para coincidir con el backend
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado inicializado en cero
  const [indicadores, setIndicadores] = useState({
    tasaCesareas: '0%',
    rnBajoPeso: 0,
    promedioHospitalizacion: '0 días',
    totalPartos: 0
  })

  const consultarReporte = async (e) => {
    e.preventDefault()
    
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar las fechas de inicio y fin.')
      return
    }

    setError('')
    setLoading(true)

    // Rescatamos el token de seguridad guardado en el Login
    const token = localStorage.getItem('access_token') // Cambia el nombre si tu token se llama distinto
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}` // Formato estándar de Django REST Framework
      },
      params: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      }
    }

    try {
      // Promise.all permite hacer las 3 peticiones al backend AL MISMO TIEMPO, 
      // haciendo que el sistema sea muchísimo más rápido.
      const [resCesareas, resBajoPeso, resDias] = await Promise.all([
        axios.get('http://localhost:8000/api/reportes/cesareas/', config),
        axios.get('http://localhost:8000/api/reportes/bajo-peso/', config),
        axios.get('http://localhost:8000/api/reportes/dias-hospitalizacion/', config)
      ])

      // Asignamos las respuestas exactas que programó tu compañero
      setIndicadores({
        tasaCesareas: `${resCesareas.data.tasa_cesareas}%`,
        totalPartos: resCesareas.data.total_partos,
        rnBajoPeso: resBajoPeso.data.bajo_peso,
        promedioHospitalizacion: `${resDias.data.promedio_dias} días`
      })

    } catch (err) {
      console.error("Error al cargar los reportes:", err)
      setError('Error al conectar con el servidor o sesión expirada.')
    } finally {
      setLoading(false)
    }
  }

  const exportarPDF = () => {
    alert("Función de PDF pendiente de conectar al backend.")
  }

  const exportarExcel = () => {
    alert("Función de Excel pendiente de conectar al backend.")
  }

  return (
    <MainLayout>
      {/* NUEVO ENCABEZADO ESTILO TARJETA */}
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Reportes y Consultas</h1>
          <p className="page-intro">Módulo de análisis estadístico e indicadores clave para gerencia.</p>
        </div>
        
        {/* Botones agrupados a la derecha */}
        <div className="header-actions">
          <button className="btn btn-outline-danger" onClick={exportarPDF}>
            📄 Exportar PDF
          </button>
          <button className="btn btn-outline-success" onClick={exportarExcel}>
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Sección de Filtros */}
      <div className="card shadow-sm p-3 mb-4">
        <form onSubmit={consultarReporte} className="row align-items-end">
          <div className="col-md-4">
            <label className="form-label fw-bold">Fecha Inicio</label>
            <input 
              type="date" 
              className="form-control" 
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-bold">Fecha Fin</label>
            <input 
              type="date" 
              className="form-control" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Consultando...' : 'Generar Reporte'}
            </button>
          </div>
        </form>
      </div>

      {/* Tarjetas de Indicadores */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-light shadow-sm text-center p-3 h-100">
            <h6 className="text-muted">Total Partos</h6>
            <h3 className="fw-bold text-dark">{indicadores.totalPartos}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light shadow-sm text-center p-3 h-100">
            <h6 className="text-muted">Tasa de Cesáreas</h6>
            <h3 className="fw-bold text-primary">{indicadores.tasaCesareas}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light shadow-sm text-center p-3 h-100">
            <h6 className="text-muted">RN con Bajo Peso ({'<'} 2.5kg)</h6>
            <h3 className="fw-bold text-warning">{indicadores.rnBajoPeso}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-light shadow-sm text-center p-3 h-100">
            <h6 className="text-muted">Promedio Hospitalización</h6>
            <h3 className="fw-bold text-info">{indicadores.promedioHospitalizacion}</h3>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Reportes