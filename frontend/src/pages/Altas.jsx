import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import axios from 'axios'

function Altas() {
  const [altasPendientes, setAltasPendientes] = useState([])
  const [mensaje, setMensaje] = useState('')

  // 1. Cargar las altas pendientes al abrir la página
  useEffect(() => {
    const cargarAltas = async () => {
      try {
        const respuesta = await axios.get('http://localhost:8000/api/altas/pendientes/')
        setAltasPendientes(respuesta.data)
      } catch (error) {
        setMensaje('Error al cargar la lista de altas.')
      }
    }
    cargarAltas()
  }, [])

  // 2. Función para que el Médico apruebe
  const confirmarAltaClinica = async (idAlta) => {
    // Aquí iría el axios.post o put hacia tu backend
    console.log(`Alta clínica confirmada para el registro ${idAlta}`)
  }

  // 3. Función para que el Administrativo apruebe
  const confirmarAltaAdmin = async (idAlta) => {
    // Aquí iría el axios.post o put hacia tu backend
    console.log(`Alta administrativa confirmada para el registro ${idAlta}`)
  }

  // 4. Función para generar el PDF
  const generarPDF = (idAlta) => {
    // Aquí llamarías al endpoint de Django que genera el ReportLab
    console.log(`Generando PDF para el alta ${idAlta}`)
  }

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Altas</h1>
        {/* Botón para exportar el historial a Excel como pide el backlog */}
        <button className="btn btn-outline-success">Exportar Historial a Excel</button>
      </div>

      <p className="text-muted">Módulo de formalización de egresos médicos y administrativos.</p>

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
            {/* Aquí mapearíamos los datos reales que lleguen del backend */}
            <tr>
              <td>1</td>
              <td>María Pérez</td>
              <td>RN - Código QR #883</td>
              <td>
                <button className="btn btn-sm btn-primary" onClick={() => confirmarAltaClinica(1)}>
                  Confirmar Médico
                </button>
              </td>
              <td>
                <button className="btn btn-sm btn-secondary" onClick={() => confirmarAltaAdmin(1)}>
                  Confirmar Admin
                </button>
              </td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => generarPDF(1)}>
                  📄 Generar PDF
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </MainLayout>
  )
}

export default Altas // ¡No olvides exportarlo correctamente!