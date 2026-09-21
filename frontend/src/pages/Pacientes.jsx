import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './Pacientes.css'

function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

  const [mostrarForm, setMostrarForm] = useState(false)
  const [rut, setRut] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [edad, setEdad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  const [pacienteAntecedentes, setPacienteAntecedentes] = useState(null)
  const [numeroControles, setNumeroControles] = useState(0)
  const [numeroPartos, setNumeroPartos] = useState(0)
  const [numeroCesareas, setNumeroCesareas] = useState(0)
  const [numeroAbortos, setNumeroAbortos] = useState(0)
  const [tieneHipertension, setTieneHipertension] = useState(false)
  const [tieneDiabetesGestacional, setTieneDiabetesGestacional] = useState(false)
  const [tienePreclampsia, setTienePreclampsia] = useState(false)
  const [otrasPatologias, setOtrasPatologias] = useState('')
  const [grupoSanguineo, setGrupoSanguineo] = useState('')
  const [observaciones, setObservaciones] = useState('')

  const cargarPacientes = async (filtro = '') => {
    setCargando(true)
    try {
      const respuesta = await api.get('/pacientes/', {
        params: filtro ? { busqueda: filtro } : {},
      })
      setPacientes(respuesta.data.results || respuesta.data)
    } catch (error) {
      setMensaje({ texto: 'Error al cargar pacientes.', tipo: 'alert-danger' })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPacientes()
  }, [])

  const handleBuscar = (e) => {
    e.preventDefault()
    cargarPacientes(busqueda)
  }

  const limpiarFormulario = () => {
    setRut(''); setNombre(''); setApellido(''); setFechaNacimiento('')
    setEdad(''); setDireccion(''); setTelefono(''); setEmail('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!rut || !nombre || !apellido || !fechaNacimiento || !edad || !direccion || !telefono) {
      setMensaje({ texto: 'Completa todos los campos obligatorios.', tipo: 'alert-danger' })
      return
    }
    if (Number(edad) < 12 || Number(edad) > 60) {
      setMensaje({ texto: 'La edad debe estar entre 12 y 60 años.', tipo: 'alert-warning' })
      return
    }

    try {
      await api.post('/pacientes/', {
        rut, nombre, apellido,
        fecha_nacimiento: fechaNacimiento,
        edad: Number(edad),
        direccion, telefono, email,
      })
      setMensaje({ texto: 'Paciente registrada exitosamente.', tipo: 'alert-success' })
      limpiarFormulario()
      setMostrarForm(false)
      cargarPacientes(busqueda)
    } catch (error) {
      const detalle = error.response?.data
      setMensaje({
        texto: detalle
          ? 'Error al guardar: ' + JSON.stringify(detalle)
          : 'No tienes permiso para registrar pacientes.',
        tipo: 'alert-danger',
      })
    }
  }

  const abrirAntecedentes = (paciente) => {
    setPacienteAntecedentes(paciente)
    const a = paciente.antecedentes
    setNumeroControles(a?.numero_controles ?? 0)
    setNumeroPartos(a?.numero_partos ?? 0)
    setNumeroCesareas(a?.numero_cesareas ?? 0)
    setNumeroAbortos(a?.numero_abortos ?? 0)
    setTieneHipertension(a?.tiene_hipertension ?? false)
    setTieneDiabetesGestacional(a?.tiene_diabetes_gestacional ?? false)
    setTienePreclampsia(a?.tiene_preclampsia ?? false)
    setOtrasPatologias(a?.otras_patologias ?? '')
    setGrupoSanguineo(a?.grupo_sanguineo ?? '')
    setObservaciones(a?.observaciones ?? '')
  }

  const guardarAntecedentes = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/pacientes/${pacienteAntecedentes.id}/antecedentes/`, {
        numero_controles: Number(numeroControles),
        numero_partos: Number(numeroPartos),
        numero_cesareas: Number(numeroCesareas),
        numero_abortos: Number(numeroAbortos),
        tiene_hipertension: tieneHipertension,
        tiene_diabetes_gestacional: tieneDiabetesGestacional,
        tiene_preclampsia: tienePreclampsia,
        otras_patologias: otrasPatologias,
        grupo_sanguineo: grupoSanguineo || null,
        observaciones: observaciones,
      })
      setMensaje({ texto: 'Antecedentes clínicos registrados.', tipo: 'alert-success' })
      setPacienteAntecedentes(null)
      cargarPacientes(busqueda)
    } catch (error) {
      setMensaje({
        texto: error.response?.data
          ? 'Error: ' + JSON.stringify(error.response.data)
          : 'No tienes permiso para registrar antecedentes clínicos.',
        tipo: 'alert-danger',
      })
    }
  }

  return (
    <MainLayout>
      <div className="page-header flex justify-between items-center mb-4">
        <div>
          <h1>Gestión de Pacientes</h1>
          <p className="text-muted">Ficha, búsqueda y antecedentes clínicos de cada paciente.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nueva paciente'}
        </button>
      </div>

      {mensaje.texto && (
        <div className={`alert ${mensaje.tipo} mb-4`}>{mensaje.texto}</div>
      )}

      {/* Buscador envuelto en tarjeta clínica */}
      <div className="card-clinica mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '20px', borderRadius: '8px' }}>
        <form onSubmit={handleBuscar} className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por RUT, nombre o apellido…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-primary">Buscar</button>
        </form>
      </div>

      {mostrarForm && (
        <div className="card-clinica mb-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '8px' }}>
          <h4 className="mb-3" style={{ fontSize: '16px', fontWeight: '600' }}>Registro / Edición de Paciente</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">RUT</label>
                <input type="text" className="form-control" value={rut} onChange={(e) => setRut(e.target.value)} placeholder="Ej: 12.345.678-9" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha de Nacimiento</label>
                <input type="date" className="form-control" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} />
              </div>
              <div className="col-md-2 mb-3">
                <label className="form-label">Edad</label>
                <input type="number" className="form-control" value={edad} onChange={(e) => setEdad(e.target.value)} />
              </div>
              <div className="col-md-10 mb-3">
                <label className="form-label">Dirección</label>
                <input type="text" className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: +56912345678" />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email (Opcional)</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Registrar paciente</button>
          </form>
        </div>
      )}

      {/* Tabla limpia dentro de tarjeta blanca */}
      <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '8px' }}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '13px' }}>
                <th>RUT</th>
                <th>Nombre</th>
                <th>Edad</th>
                <th>Teléfono</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && <tr><td colSpan="5" className="text-center py-4">Cargando...</td></tr>}
              {!cargando && pacientes.length === 0 && (
                <tr><td colSpan="5" className="text-center py-4">No se encontraron pacientes.</td></tr>
              )}
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td>{p.rut}</td>
                  <td>{p.nombre} {p.apellido}</td>
                  <td>{p.edad}</td>
                  <td>{p.telefono}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-primary" onClick={() => abrirAntecedentes(p)}>
                      {p.antecedentes ? 'Ver / editar' : 'Agregar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pacienteAntecedentes && (
        <div className="pacientes-modal" style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="pacientes-modal__card card-clinica" style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: '600' }}>Antecedentes clínicos — {pacienteAntecedentes.nombre} {pacienteAntecedentes.apellido}</h3>
            <form onSubmit={guardarAntecedentes}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">N° controles prenatales</label>
                  <input type="number" min="0" className="form-control" value={numeroControles} onChange={(e) => setNumeroControles(e.target.value)} />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">N° partos previos</label>
                  <input type="number" min="0" className="form-control" value={numeroPartos} onChange={(e) => setNumeroPartos(e.target.value)} />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">N° cesáreas previas</label>
                  <input type="number" min="0" className="form-control" value={numeroCesareas} onChange={(e) => setNumeroCesareas(e.target.value)} />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">N° abortos previos</label>
                  <input type="number" min="0" className="form-control" value={numeroAbortos} onChange={(e) => setNumeroAbortos(e.target.value)} />
                </div>
              </div>

              <div className="mb-3 d-flex gap-4">
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={tieneHipertension} onChange={(e) => setTieneHipertension(e.target.checked)} />
                  Hipertensión
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={tieneDiabetesGestacional} onChange={(e) => setTieneDiabetesGestacional(e.target.checked)} />
                  Diabetes gestacional
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={tienePreclampsia} onChange={(e) => setTienePreclampsia(e.target.checked)} />
                  Preeclampsia
                </label>
              </div>

              <div className="mb-3">
                <label className="form-label">Otras patologías</label>
                <textarea className="form-control" rows="2" value={otrasPatologias} onChange={(e) => setOtrasPatologias(e.target.value)} />
              </div>

              <div className="mb-3">
                <label className="form-label">Grupo sanguíneo</label>
                <select className="form-select" value={grupoSanguineo} onChange={(e) => setGrupoSanguineo(e.target.value)}>
                  <option value="">Sin especificar</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea className="form-control" rows="2" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setPacienteAntecedentes(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default Pacientes