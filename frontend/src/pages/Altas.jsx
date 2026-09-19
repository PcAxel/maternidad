import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './Altas.css'

function Altas() {
  const [altasPendientes, setAltasPendientes] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargarAltas = async () => {
    setCargando(true)
    try {
      const respuesta = await api.get('/altas/pendientes/')
      setAltasPendientes(respuesta.data)
      setMensaje('')
    } catch (error) {
      setMensaje('Error al cargar la lista de altas.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarAltas()
  }, [])

  const confirmarAltaClinica = async (idAlta) => {
    try {
      await api.post(`/altas/${idAlta}/confirmar_alta_clinica/`)
      cargarAltas()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'No se pudo confirmar el alta clínica.')
    }
  }

  const confirmarAltaAdmin = async (idAlta) => {
    try {
      await api.post(`/altas/${idAlta}/confirmar_alta_administrativa/`)
      cargarAltas()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'No se pudo confirmar el alta administrativa.')
    }
  }

  const generarPDF = async (idAlta) => {
    try {
      const respuesta = await api.get(`/altas/${idAlta}/generar_certificado/`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([respuesta.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificado_alta_${idAlta}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'No se pudo generar el certificado.')
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Gestión de Altas</h1>
          <p className="page-intro">Módulo de formalización de egresos médicos y administrativos.</p>
        </div>
        <button className="btn btn-outline-success">Exportar Historial a Excel</button>
      </div>

      {mensaje && <div className="alert alert-warning">{mensaje}</div>}

      <div className="table-responsive mt-4">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Paciente (Madre)</th>
              <th>Recién Nacido</th>
              <th>Alta Clínica (Médico)</th>
              <th>Alta Admin (Administrativo)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan="6">Cargando...</td></tr>
            )}
            {!cargando && altasPendientes.length === 0 && (
              <tr><td colSpan="6">No hay altas pendientes.</td></tr>
            )}
            {altasPendientes.map((alta) => (
              <tr key={alta.id}>
                <td>{alta.id}</td>
                <td>{alta.paciente_nombre}</td>
                <td>{alta.recien_nacido_numero || '—'}</td>
                <td>
                  {alta.alta_clinica_confirmada ? (
                    <span className="badge bg-success">Confirmada</span>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => confirmarAltaClinica(alta.id)}>
                      Confirmar Médico
                    </button>
                  )}
                </td>
                <td>
                  {alta.alta_administrativa_confirmada ? (
                    <span className="badge bg-success">Confirmada</span>
                  ) : (
                    <button className="btn btn-sm btn-secondary" onClick={() => confirmarAltaAdmin(alta.id)}>
                      Confirmar Admin
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => generarPDF(alta.id)}
                    disabled={!alta.alta_clinica_confirmada || !alta.alta_administrativa_confirmada}
                  >
                    📄 Generar PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  )
}

export default Altas
