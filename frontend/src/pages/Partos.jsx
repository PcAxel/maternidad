import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import axios from 'axios'
import './Partos.css' // <-- Conectamos los estilos

function Partos() {
  // Estados para el formulario basados en los requerimientos del Módulo 2
  const [pacienteId, setPacienteId] = useState('') // El ID o RUT de la madre
  const [tipoParto, setTipoParto] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaTermino, setFechaTermino] = useState('')
  const [tieneComplicaciones, setTieneComplicaciones] = useState(false)
  const [detalleComplicaciones, setDetalleComplicaciones] = useState('')
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validaciones obligatorias
    if (!pacienteId || !tipoParto || !fechaInicio) {
      setMensaje({ texto: 'Faltan datos obligatorios (Paciente, Tipo de Parto y Fecha de Inicio).', tipo: 'alert-warning' })
      return
    }

    if (tieneComplicaciones && !detalleComplicaciones.trim()) {
      setMensaje({ texto: 'Si indicas que hubo complicaciones, debes describirlas.', tipo: 'alert-danger' })
      return
    }

    setLoading(true)

    // Armamos el paquete de datos para Django
    const payload = {
      paciente: pacienteId,
      tipo: tipoParto,
      fecha_inicio: fechaInicio,
      fecha_termino: fechaTermino || null, // Puede estar en curso
      tiene_complicaciones: tieneComplicaciones,
      descripcion_complicaciones: tieneComplicaciones ? detalleComplicaciones : ''
    }

    try {
      const respuesta = await axios.post('http://localhost:8000/api/partos/', payload)
      
      if (respuesta.status === 201) {
        setMensaje({ texto: 'Parto registrado exitosamente.', tipo: 'alert-success' })
        // Limpiamos el formulario
        setPacienteId(''); setTipoParto(''); setFechaInicio(''); 
        setFechaTermino(''); setTieneComplicaciones(false); setDetalleComplicaciones('');
      }
    } catch (error) {
      console.error("Error al registrar parto:", error.response?.data)
      setMensaje({ 
        texto: 'Error al conectar con el servidor: ' + JSON.stringify(error.response?.data || error.message), 
        tipo: 'alert-danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      {/* NUEVO ENCABEZADO ESTILO TARJETA */}
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Gestión de Partos</h1>
          <p className="page-intro">Registro de procesos de parto, tiempos y posibles complicaciones clínicas.</p>
        </div>
      </div>

      <div className="card shadow-sm p-4 mt-4">
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Buscador o Selector de Paciente */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">ID Paciente (Madre)</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Ingrese ID o RUT de la paciente"
                value={pacienteId} 
                onChange={(e) => setPacienteId(e.target.value)} 
              />
            </div>

            {/* Tipo de Parto */}
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Tipo de Parto</label>
              <select className="form-select" value={tipoParto} onChange={(e) => setTipoParto(e.target.value)}>
                <option value="">Seleccione una opción...</option>
                <option value="Natural">Natural</option>
                <option value="Cesárea">Cesárea</option>
                <option value="Instrumental">Instrumental</option>
              </select>
            </div>

            {/* Tiempos */}
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

            {/* Complicaciones */}
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

            {/* Textarea dinámico: Solo aparece si hay complicaciones */}
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

          {/* Mensajes de alerta */}
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