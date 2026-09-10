import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import axios from 'axios'

function RecienNacidos() {
  const [partoId, setPartoId] = useState('')
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')
  const [apgar1, setApgar1] = useState('')
  const [apgar5, setApgar5] = useState('')
  const [apgar10, setApgar10] = useState('')
  const [condicion, setCondicion] = useState('Estable')
  const [derivado, setDerivado] = useState(false)
  const [servicioDerivacion, setServicioDerivacion] = useState('')
  
  const [alertaCritica, setAlertaCritica] = useState(false)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(false)

  // Efecto visual: Evaluar APGAR en tiempo real mientras el usuario escribe
  useEffect(() => {
    const minApgar = Math.min(
      Number(apgar1 || 10), 
      Number(apgar5 || 10), 
      Number(apgar10 || 10)
    )
    
    // Si algún APGAR baja de 5, activamos la alerta crítica visual
    if (minApgar < 5 && (apgar1 !== '' || apgar5 !== '' || apgar10 !== '')) {
      setAlertaCritica(true)
      setCondicion('Crítico')
      setDerivado(true) // Forzamos la derivación visualmente
    } else {
      setAlertaCritica(false)
    }
  }, [apgar1, apgar5, apgar10])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!partoId || !peso || !talla || apgar1 === '' || apgar5 === '') {
      setMensaje({ texto: 'Faltan datos clínicos obligatorios.', tipo: 'alert-warning' })
      return
    }

    setLoading(true)

    const payload = {
      parto_id: partoId,
      peso: parseFloat(peso),
      talla: parseFloat(talla),
      apgar_1: parseInt(apgar1),
      apgar_5: parseInt(apgar5),
      apgar_10: apgar10 ? parseInt(apgar10) : null,
      condicion_al_nacer: condicion,
      derivado: derivado,
      servicio_derivacion: derivado ? servicioDerivacion : ''
    }

    try {
      const respuesta = await axios.post('http://localhost:8000/api/recien_nacidos/', payload)
      
      if (respuesta.status === 201) {
        setMensaje({ texto: 'Recién nacido registrado. Código QR generado.', tipo: 'alert-success' })
        // Limpieza de formulario
        setPartoId(''); setPeso(''); setTalla(''); 
        setApgar1(''); setApgar5(''); setApgar10('');
        setCondicion('Estable'); setDerivado(false); setServicioDerivacion('');
      }
    } catch (error) {
      setMensaje({ 
        texto: 'Error en el servidor: ' + JSON.stringify(error.response?.data || error.message), 
        tipo: 'alert-danger' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Recién Nacidos</h1>
      </div>
      
      <p className="text-muted">
        Registro clínico inicial, trazabilidad y evaluación de estado de salud.
      </p>

      {/* Alerta dinámica si el APGAR es crítico */}
      {alertaCritica && (
        <div className="alert alert-danger fw-bold shadow-sm animate__animated animate__pulse animate__infinite">
          ⚠️ ALERTA CRÍTICA: Puntaje APGAR menor a 5. Se requiere evaluación médica inmediata y derivación.
        </div>
      )}

      <div className={`card shadow-sm p-4 mt-2 ${alertaCritica ? 'border-danger' : ''}`}>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label fw-bold">ID del Parto Asociado</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Vincular con el registro de parto"
                value={partoId} 
                onChange={(e) => setPartoId(e.target.value)} 
              />
            </div>

            <h5 className="mt-3 mb-3 border-bottom pb-2">Somatometría</h5>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Peso (gramos)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Ej: 3200"
                value={peso} 
                onChange={(e) => setPeso(e.target.value)} 
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Talla (cm)</label>
              <input 
                type="number" 
                step="0.1"
                className="form-control" 
                placeholder="Ej: 50.5"
                value={talla} 
                onChange={(e) => setTalla(e.target.value)} 
              />
            </div>

            <h5 className="mt-3 mb-3 border-bottom pb-2">Evaluación APGAR (0-10)</h5>

            <div className="col-md-4 mb-3">
              <label className="form-label">Al 1 minuto</label>
              <input 
                type="number" 
                min="0" max="10"
                className="form-control text-center fs-5" 
                value={apgar1} 
                onChange={(e) => setApgar1(e.target.value)} 
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">A los 5 minutos</label>
              <input 
                type="number" 
                min="0" max="10"
                className="form-control text-center fs-5" 
                value={apgar5} 
                onChange={(e) => setApgar5(e.target.value)} 
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">A los 10 minutos</label>
              <input 
                type="number" 
                min="0" max="10"
                className="form-control text-center fs-5" 
                value={apgar10} 
                onChange={(e) => setApgar10(e.target.value)} 
              />
              <small className="text-muted">Solo si es necesario</small>
            </div>

            <h5 className="mt-3 mb-3 border-bottom pb-2">Estado y Derivación</h5>

            <div className="col-md-6 mb-3">
              <label className="form-label">Condición al Nacer</label>
              <select 
                className="form-select" 
                value={condicion} 
                onChange={(e) => setCondicion(e.target.value)}
              >
                <option value="Estable">Estable</option>
                <option value="Observación">En Observación</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>

            <div className="col-md-12 mb-3 mt-2">
              <div className="form-check form-switch">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="switchDerivacion"
                  checked={derivado}
                  onChange={(e) => setDerivado(e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor="switchDerivacion">
                  ¿Requiere derivación a otra unidad?
                </label>
              </div>
            </div>

            {derivado && (
              <div className="col-md-12 mb-3">
                <label className="form-label">Servicio de Derivación</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Ej: UCI Neonatal, Intermedio..."
                  value={servicioDerivacion}
                  onChange={(e) => setServicioDerivacion(e.target.value)}
                />
              </div>
            )}
          </div>

          {mensaje.texto && (
            <div className={`alert ${mensaje.tipo} mt-3`}>
              {mensaje.texto}
            </div>
          )}

          <div className="d-flex justify-content-end mt-4">
            <button type="submit" className={`btn ${alertaCritica ? 'btn-danger' : 'btn-primary'}`} disabled={loading}>
              {loading ? 'Procesando...' : 'Registrar Recién Nacido'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}

export default RecienNacidos