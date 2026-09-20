import { useState, useEffect } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './RecienNacidos.css'

function RecienNacidos() {
  const [partos, setPartos] = useState([])
  const [rnList, setRnList] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [mostrarForm, setMostrarForm] = useState(false)

  const [partoId, setPartoId] = useState('')
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')
  const [apgar1, setApgar1] = useState('')
  const [apgar5, setApgar5] = useState('')
  const [apgar10, setApgar10] = useState('')
  const [condicion, setCondicion] = useState('BUENA')
  const [alertaCritica, setAlertaCritica] = useState(false)
  const [loading, setLoading] = useState(false)

  const [rnQr, setRnQr] = useState(null)
  const [rnDerivar, setRnDerivar] = useState(null)
  const [servicioDerivacion, setServicioDerivacion] = useState('')
  const [motivoDerivacion, setMotivoDerivacion] = useState('')

  const [rnControl, setRnControl] = useState(null)
  const [vacunaBcg, setVacunaBcg] = useState(false)
  const [vacunaHepB, setVacunaHepB] = useState(false)
  const [tamizaje, setTamizaje] = useState(false)
  const [responsableControl, setResponsableControl] = useState('')
  const [observacionesControl, setObservacionesControl] = useState('')

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resPartos, resRn] = await Promise.all([
        api.get('/partos/'),
        api.get('/recien-nacidos/'),
      ])
      setPartos(resPartos.data.results || resPartos.data)
      setRnList(resRn.data.results || resRn.data)
    } catch (error) {
      setMensaje({ texto: 'Error al cargar los datos.', tipo: 'alert-danger' })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    const valores = [apgar1, apgar5, apgar10].filter((v) => v !== '')
    const minApgar = valores.length ? Math.min(...valores.map(Number)) : 10
    setAlertaCritica(valores.length > 0 && minApgar < 5)
  }, [apgar1, apgar5, apgar10])

  const limpiarFormulario = () => {
    setPartoId(''); setPeso(''); setTalla('')
    setApgar1(''); setApgar5(''); setApgar10('')
    setCondicion('BUENA')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partoId || !peso || !talla || apgar1 === '' || apgar5 === '') {
      setMensaje({ texto: 'Faltan datos clínicos obligatorios.', tipo: 'alert-warning' })
      return
    }

    setLoading(true)
    try {
      const respuesta = await api.post('/recien-nacidos/', {
        parto: Number(partoId),
        peso: parseFloat(peso),
        talla: parseFloat(talla),
        apgar_1: parseInt(apgar1),
        apgar_5: parseInt(apgar5),
        apgar_10: apgar10 ? parseInt(apgar10) : 0,
        condicion_al_nacer: condicion,
      })
      setMensaje({ texto: 'Recién nacido registrado. Código QR generado.', tipo: 'alert-success' })
      limpiarFormulario()
      setMostrarForm(false)
      cargarDatos()
      setRnQr(respuesta.data)
    } catch (error) {
      setMensaje({
        texto: 'Error: ' + JSON.stringify(error.response?.data || error.message),
        tipo: 'alert-danger',
      })
    } finally {
      setLoading(false)
    }
  }

  const abrirDerivar = (rn) => {
    setRnDerivar(rn)
    setServicioDerivacion('')
    setMotivoDerivacion('')
  }

  const confirmarDerivar = async (e) => {
    e.preventDefault()
    if (!servicioDerivacion) {
      setMensaje({ texto: 'El servicio de derivación es obligatorio.', tipo: 'alert-warning' })
      return
    }
    try {
      await api.post(`/recien-nacidos/${rnDerivar.id}/derivar/`, {
        servicio: servicioDerivacion,
        motivo: motivoDerivacion,
      })
      setMensaje({ texto: 'Derivación registrada.', tipo: 'alert-success' })
      setRnDerivar(null)
      cargarDatos()
    } catch (error) {
      setMensaje({ texto: 'Error al derivar: ' + JSON.stringify(error.response?.data), tipo: 'alert-danger' })
    }
  }

  const abrirControl = (rn) => {
    setRnControl(rn)
    setVacunaBcg(false)
    setVacunaHepB(false)
    setTamizaje(false)
    setResponsableControl('')
    setObservacionesControl('')
  }

  const confirmarControl = async (e) => {
    e.preventDefault()
    if (!responsableControl) {
      setMensaje({ texto: 'Indica quién realiza el control.', tipo: 'alert-warning' })
      return
    }
    try {
      await api.post(`/recien-nacidos/${rnControl.id}/registrar_control/`, {
        vacuna_bcg: vacunaBcg,
        vacuna_hepatitis_b: vacunaHepB,
        tamizaje_neonatal: tamizaje,
        responsable: responsableControl,
        observaciones: observacionesControl,
      })
      setMensaje({ texto: 'Control posterior registrado.', tipo: 'alert-success' })
      setRnControl(null)
      cargarDatos()
    } catch (error) {
      setMensaje({ texto: 'Error al registrar control: ' + JSON.stringify(error.response?.data), tipo: 'alert-danger' })
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-header__content">
          <h1 className="page-header__title">Gestión de Recién Nacidos</h1>
          <p className="page-intro">Registro clínico, identificación, derivaciones y controles posteriores.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Registrar RN'}
        </button>
      </div>

      {mensaje.texto && <div className={`alert ${mensaje.tipo} mt-3`}>{mensaje.texto}</div>}

      {mostrarForm && (
        <div className={`card shadow-sm p-4 mt-2 ${alertaCritica ? 'border-danger' : ''}`}>
          {alertaCritica && (
            <div className="alert alert-danger fw-bold">
              ⚠️ APGAR bajo detectado. Se recomienda derivar apenas se registre.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold">Parto asociado</label>
                <select className="form-select" value={partoId} onChange={(e) => setPartoId(e.target.value)}>
                  <option value="">Selecciona un parto…</option>
                  {partos.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} — {p.paciente_nombre} — {p.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Peso (kg)</label>
                <input type="number" step="0.01" className="form-control" placeholder="Ej: 3.20" value={peso} onChange={(e) => setPeso(e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Talla (cm)</label>
                <input type="number" step="0.1" className="form-control" placeholder="Ej: 50.5" value={talla} onChange={(e) => setTalla(e.target.value)} />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">APGAR al 1 min</label>
                <input type="number" min="0" max="10" className="form-control text-center" value={apgar1} onChange={(e) => setApgar1(e.target.value)} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">APGAR a los 5 min</label>
                <input type="number" min="0" max="10" className="form-control text-center" value={apgar5} onChange={(e) => setApgar5(e.target.value)} />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">APGAR a los 10 min</label>
                <input type="number" min="0" max="10" className="form-control text-center" value={apgar10} onChange={(e) => setApgar10(e.target.value)} />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Condición al nacer</label>
                <select className="form-select" value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                  <option value="BUENA">Buena</option>
                  <option value="REGULAR">Regular</option>
                  <option value="MALA">Mala</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-2">
              <button type="submit" className={`btn ${alertaCritica ? 'btn-danger' : 'btn-primary'}`} disabled={loading}>
                {loading ? 'Procesando...' : 'Registrar Recién Nacido'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-responsive mt-4">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>N° interno</th>
              <th>Madre</th>
              <th>Peso / Talla</th>
              <th>APGAR (1/5/10)</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando && <tr><td colSpan="6">Cargando...</td></tr>}
            {!cargando && rnList.length === 0 && (
              <tr><td colSpan="6">No hay recién nacidos registrados.</td></tr>
            )}
            {rnList.map((rn) => {
              const critico = Math.min(rn.apgar_1, rn.apgar_5, rn.apgar_10 || 10) < 5
              return (
                <tr key={rn.id} className={critico ? 'table-danger' : ''}>
                  <td>{rn.numero_interno}</td>
                  <td>{rn.paciente_madre_nombre}</td>
                  <td>{rn.peso} kg / {rn.talla} cm</td>
                  <td>
                    {rn.apgar_1}/{rn.apgar_5}/{rn.apgar_10}
                    {critico && <span className="badge bg-danger ms-2">Crítico</span>}
                  </td>
                  <td>{rn.estado}</td>
                  <td className="rn-acciones">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setRnQr(rn)}>QR</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={() => abrirDerivar(rn)} disabled={rn.derivado}>
                      {rn.derivado ? 'Derivado' : 'Derivar'}
                    </button>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => abrirControl(rn)}>Control</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {rnQr && (
        <div className="pacientes-modal" onClick={() => setRnQr(null)}>
          <div className="pacientes-modal__card text-center" onClick={(e) => e.stopPropagation()}>
            <h3>{rnQr.numero_interno}</h3>
            {rnQr.codigo_qr_base64 ? (
              <img src={`data:image/png;base64,${rnQr.codigo_qr_base64}`} alt="Código QR" style={{ width: 200 }} />
            ) : (
              <p>Sin código QR disponible.</p>
            )}
            <button className="btn btn-outline-secondary mt-3" onClick={() => setRnQr(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {rnDerivar && (
        <div className="pacientes-modal">
          <div className="pacientes-modal__card">
            <h3>Derivar {rnDerivar.numero_interno}</h3>
            <form onSubmit={confirmarDerivar}>
              <div className="mb-3">
                <label className="form-label">Servicio de derivación</label>
                <input type="text" className="form-control" placeholder="Ej: UCI Neonatal" value={servicioDerivacion} onChange={(e) => setServicioDerivacion(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Motivo</label>
                <textarea className="form-control" rows="2" value={motivoDerivacion} onChange={(e) => setMotivoDerivacion(e.target.value)} />
              </div>
              <div className="pacientes-modal__actions">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setRnDerivar(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar derivación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rnControl && (
        <div className="pacientes-modal">
          <div className="pacientes-modal__card">
            <h3>Control posterior — {rnControl.numero_interno}</h3>
            <form onSubmit={confirmarControl}>
              <div className="mb-3 pacientes-modal__checks">
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input" checked={vacunaBcg} onChange={(e) => setVacunaBcg(e.target.checked)} /> Vacuna BCG
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input" checked={vacunaHepB} onChange={(e) => setVacunaHepB(e.target.checked)} /> Vacuna Hepatitis B
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input" checked={tamizaje} onChange={(e) => setTamizaje(e.target.checked)} /> Tamizaje neonatal
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label">Responsable</label>
                <input type="text" className="form-control" value={responsableControl} onChange={(e) => setResponsableControl(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Observaciones</label>
                <textarea className="form-control" rows="2" value={observacionesControl} onChange={(e) => setObservacionesControl(e.target.value)} />
              </div>
              <div className="pacientes-modal__actions">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setRnControl(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar control</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default RecienNacidos
