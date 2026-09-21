import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts'
import './Reportes.css'

function Reportes() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [tipoParto, setTipoParto] = useState('')
  const [patologia, setPatologia] = useState('')
  const [loading, setLoading] = useState(false)
  const [cargandoExcel, setCargandoExcel] = useState(false)
  const [cargandoPdf, setCargandoPdf] = useState(false)
  const [error, setError] = useState('')

  const [indicadores, setIndicadores] = useState({
    tasaCesareas: 0,
    rnBajoPeso: 0,
    promedioHospitalizacion: 0,
    totalPartos: 0
  })

  const [datosGrafico, setDatosGrafico] = useState([])
  const [datosPastel, setDatosPastel] = useState([])

  const consultarReporte = async (e) => {
    e.preventDefault()
    
    if (!fechaInicio || !fechaFin) {
      setError('Debes seleccionar las fechas de inicio y fin para generar el reporte.')
      return
    }

    if (fechaInicio > fechaFin) {
      setError('La fecha de inicio no puede ser posterior a la fecha fin.')
      return
    }

    setError('')
    setLoading(true)

    const params = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      ...(tipoParto && { tipo_parto: tipoParto }),
      ...(patologia && { patologia: patologia }),
    }

    try {
      const [resCesareas, resBajoPeso, resDias] = await Promise.all([
        api.get('/reportes/cesareas/', { params }),
        api.get('/reportes/bajo-peso/', { params }),
        api.get('/reportes/dias-hospitalizacion/', { params })
      ])

      const cesareasNum = Number(resCesareas.data.tasa_cesareas ?? 0)
      const partosNum = Number(resCesareas.data.total_partos ?? 0)
      const bajoPesoNum = Number(resBajoPeso.data.bajo_peso ?? 0)
      const promedioDiasNum = Number(resDias.data.promedio_dias ?? 0)

      setIndicadores({
        tasaCesareas: cesareasNum,
        totalPartos: partosNum,
        rnBajoPeso: bajoPesoNum,
        promedioHospitalizacion: promedioDiasNum
      })

      setDatosGrafico([
        { name: 'Total Partos', valor: partosNum },
        { name: 'Bajo Peso', valor: bajoPesoNum },
        { name: 'Días Estada (Prom)', valor: promedioDiasNum }
      ])

      setDatosPastel([
        { name: 'Cesáreas (%)', value: cesareasNum },
        { name: 'Partos Vaginales / Otros (%)', value: Math.max(0, 100 - cesareasNum) }
      ])

    } catch (err) {
      console.error("Error al cargar los reportes:", err)
      setError('Error al conectar con el servidor o sesión expirada.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerarExcel = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("⚠️ Error: Debe ingresar la fecha de inicio y la fecha de término para generar el reporte en Excel.");
      return;
    }

    try {
      setCargandoExcel(true);
      const response = await api.get('/reportes/excel/', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin, ...(tipoParto && { tipo_parto: tipoParto }), ...(patologia && { patologia: patologia }) },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Maternidad_${fechaInicio}_al_${fechaFin}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setCargandoExcel(false);
    } catch (error) {
      console.error("Error al generar el excel:", error);
      alert("❌ Ocurrió un error al generar el reporte en Excel.");
      setCargandoExcel(false);
    }
  };

  const handleGenerarPDF = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("⚠️ Error: Debe ingresar la fecha de inicio y la fecha de término para generar el PDF.");
      return;
    }
    try {
      setCargandoPdf(true);
      const response = await api.get('/reportes/pdf/', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin, ...(tipoParto && { tipo_parto: tipoParto }), ...(patologia && { patologia: patologia }) },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Maternidad_${fechaInicio}_al_${fechaFin}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setCargandoPdf(false);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("❌ Ocurrió un error al generar el reporte en PDF.");
      setCargandoPdf(false);
    }
  };

  const COLORS = ['#0F766E', '#df4759', '#f39c12', '#3498db'];

  return (
    <MainLayout>
      {/* Encabezado Principal estilo tarjeta */}
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Infografía y Gráficos Estadísticos</h1>
          <p className="page-intro">Panel analítico visual con representación gráfica de indicadores clínicos.</p>
        </div>
        
        <div className="header-actions">
          <button className="btn btn-outline-danger" onClick={handleGenerarPDF} disabled={cargandoPdf}>
            {cargandoPdf ? 'Generando PDF...' : '📄 Exportar PDF'}
          </button>
          <button className="btn btn-outline-success" onClick={handleGenerarExcel} disabled={cargandoExcel}>
            {cargandoExcel ? 'Generando Excel...' : '📊 Exportar Excel'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-4">{error}</div>}

      {/* Tarjeta de Filtros */}
      <div className="card shadow-sm p-4 mb-4 border-0">
        <form onSubmit={consultarReporte} className="row align-items-end g-3">
          <div className="col-md-3">
            <label className="form-label fw-bold">Fecha Inicio</label>
            <input type="date" className="form-control" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
          </div>
          <div className="col-md-3">
            <label className="form-label fw-bold">Fecha Fin</label>
            <input type="date" className="form-control" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
          </div>
          <div className="col-md-2">
            <label className="form-label fw-bold">Tipo de Parto</label>
            <select className="form-select" value={tipoParto} onChange={(e) => setTipoParto(e.target.value)}>
              <option value="">Todos</option>
              <option value="NATURAL">Natural</option>
              <option value="CESAREA">Cesárea</option>
              <option value="INSTRUMENTAL">Instrumental</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label fw-bold">Patología</label>
            <select className="form-select" value={patologia} onChange={(e) => setPatologia(e.target.value)}>
              <option value="">Todas</option>
              <option value="hipertension">Hipertensión</option>
              <option value="diabetes_gestacional">Diabetes gestacional</option>
              <option value="preclampsia">Preeclampsia</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN DE GRÁFICOS VISUALES */}
      <div className="row g-4 mb-4">
        {/* Gráfico de Barras */}
        <div className="col-md-7">
          <div className="card shadow-sm p-4 border-0 h-100 bg-white">
            <h5 className="text-secondary fw-bold mb-3">Resumen Comparativo de Indicadores</h5>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart data={datosGrafico}>
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="valor" fill="#0F766E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Gráfico Circular */}
        <div className="col-md-5">
          <div className="card shadow-sm p-4 border-0 h-100 bg-white text-center">
            <h5 className="text-secondary fw-bold mb-3">Distribución Porcentual (Cesáreas)</h5>
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={datosPastel} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                    {datosPastel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas inferiores de apoyo numérico */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm text-center bg-white">
            <span className="text-muted fw-semibold">Total Partos Analizados</span>
            <h3 className="fw-bold text-dark mt-2 mb-0">{indicadores.totalPartos}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm text-center bg-white">
            <span className="text-muted fw-semibold">Neonatos con Bajo Peso</span>
            <h3 className="fw-bold text-warning mt-2 mb-0">{indicadores.rnBajoPeso}</h3>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-4 border-0 shadow-sm text-center bg-white">
            <span className="text-muted fw-semibold">Promedio de Estadía</span>
            <h3 className="fw-bold text-info mt-2 mb-0">{indicadores.promedioHospitalizacion} días</h3>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Reportes