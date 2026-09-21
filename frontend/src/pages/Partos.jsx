import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api' // Usamos tu instancia de axios configurada
import './Partos.css'

function Partos() {
  const [pacientes, setPacientes] = useState([]) // Lista de pacientes para el selector
  const [pacienteId, setPacienteId] = useState('') 
  const [tipoParto, setTipoParto] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaTermino, setFechaTermino] = useState('')
  const [tieneComplicaciones, setTieneComplicaciones] = useState(false)
  const [detalleComplicaciones, setDetalleComplicaciones] = useState('')
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(false)

  // Cargar la lista de pacientes reales al abrir la página
  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const respuesta = await api.get('/pacientes/')
        // Dependiendo de si tu API devuelve un paginado (results) o un array directo
        const lista = respuesta.data.results || respuesta.data
        setPacientes(lista)
      } catch (error) {
        console.error("Error al cargar pacientes", error)
        setMensaje({ texto: 'No se pudo cargar la lista de pacientes.', tipo: 'alert-warning' })
      }
    }
    cargarPacientes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pacienteId || !tipoParto || !fechaInicio) {
      setMensaje({ texto: 'Faltan datos obligatorios (Paciente, Tipo de Parto y Fecha de Inicio).', tipo: 'alert-warning' })
      return
    }

    if (tieneComplicaciones && !detalleComplicaciones.trim()) {
      setMensaje({ texto: 'Si indicas que hubo complicaciones, debes describirlas.', tipo: 'alert-danger' })
      return
    }

    setLoading(true)

    const payload = {
      paciente: parseInt(pacienteId, 10), // Enviamos el ID numérico exacto de la BD
      tipo: tipoParto,
      fecha_inicio: fechaInicio,
      fecha_termino: fechaTermino || null,
      tiene_complicaciones: tieneComplicaciones,
      complicaciones: tieneComplicaciones ? [detalleComplicaciones] : []
    }

    try {
      const respuesta = await api.post('/partos/', payload)
      
      if (respuesta.status === 201) {
        setMensaje({ texto: 'Parto registrado exitosamente.', tipo: 'alert-success' })
        setPacienteId(''); setTipoParto(''); setFechaInicio(''); 
        setFechaTermino(''); setTieneComplicaciones(false); setDetalleComplicaciones('');
      }
    } catch (error) {
      console.error("Error al registrar parto:", error.response?.data)
      setMensaje({ 
        texto: 'Error del servidor: ' + JSON.stringify(error.response?.data || error.message), 
        tipo: 'alert-danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Gestión de Partos</h1>
          <p className="page-intro">Registro de procesos de parto, tiempos y posibles complicaciones clínicas.</p>
        </div>
      </div>

      <div className="card shadow-sm p-4 mt-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Selector de Pacientes (Adiós al error de ID inexistente) */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Seleccionar Paciente (Madre)</label>
              <select 
                className="form-select" 
                value={pacienteId} 
                onChange={(e) => setPacienteId(e.target.value)}
              >
                <option value="">Seleccione una paciente registrada...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellido} (RUT: {p.rut})
                  </option>
                ))}
              </select>
              <small className="text-muted">Seleccione a la paciente de la lista de registros activos.</small>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Tipo de Parto</label>
              <select className="form-select" value={tipoParto} onChange={(e) => setTipoParto(e.target.value)}>
                <option value="">Seleccione una opción...</option>
                <option value="NATURAL">Natural</option>
                <option value="CESAREA">Cesárea</option>
                <option value="INSTRUMENTAL">Instrumental</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Fecha y Hora de Inicio</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={fechaInicio} 
                onChange={(e) => setFechaInicio(e.target.value)} 
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Fecha y Hora de Término</label>
              <input 
                type="datetime-local" 
                className="form-control" 
                value={fechaTermino} 
                onChange={(e) => setFechaTermino(e.target.value)} 
              />
              <small className="text-muted">Dejar en blanco si el parto está en curso.</small>
            </div>

            <div className="col-12 mb-3 mt-3 border-top pt-3">
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="switchComplicaciones"
                  checked={tieneComplicaciones}
                  onChange={(e) => setTieneComplicaciones(e.target.checked)}
                />
                <label className="form-check-label text-danger fw-bold" htmlFor="switchComplicaciones">
                  ¿Se presentaron complicaciones durante el parto?
                </label>
              </div>
            </div>

            {tieneComplicaciones && (
              <div className="col-12 mb-3">
                <label className="form-label">Descripción de las complicaciones</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Ej: Hemorragia, sufrimiento fetal..."
                  value={detalleComplicaciones}
                  onChange={(e) => setDetalleComplicaciones(e.target.value)}
                ></textarea>
              </div>
            )}
          </div>

          {mensaje.texto && (
            <div className={`alert ${mensaje.tipo} mt-3`}>
              {mensaje.texto}
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Registrar Parto'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default Partos