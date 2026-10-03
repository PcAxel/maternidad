import { useState, useEffect, useRef } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './Partos.css'

function Partos() {
  // --- CONTROL DE ACCESO POR ROL (RBAC) ---
  const rolUsuario = localStorage.getItem('user_role') || 'ADMIN_SISTEMA'
  const puedeRegistrarParto = ['MATRONA', 'MEDICO', 'ADMIN_SISTEMA'].includes(rolUsuario)

  const [pacientes, setPacientes] = useState([])
  const [listaPartos, setListaPartos] = useState([])
  
  // Estados de datos
  const [pacienteId, setPacienteId] = useState('') 
  const [tipoParto, setTipoParto] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaTermino, setFechaTermino] = useState('')
  const [tieneComplicaciones, setTieneComplicaciones] = useState(false)
  const [detalleComplicaciones, setDetalleComplicaciones] = useState('')
  
  // --- NUEVOS ESTADOS: BUSCADOR DE PACIENTES ---
  const [busquedaPaciente, setBusquedaPaciente] = useState('')
  const [mostrarDropdown, setMostrarDropdown] = useState(false)
  const buscadorRef = useRef(null)

  // --- NUEVOS ESTADOS: FILTROS DE TABLA DE PARTOS ---
  const [filtroTextoPartos, setFiltroTextoPartos] = useState('')
  const [filtroFechaPartos, setFiltroFechaPartos] = useState('')

  // Estados de UI y Validación
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [loading, setLoading] = useState(false)
  const [camposVacios, setCamposVacios] = useState({
    paciente: false,
    tipoParto: false,
    fechaInicio: false,
    detalleComplicaciones: false
  })

  // --- ESTADOS CLÍNICOS ---
  const [paridad, setParidad] = useState('PRIMIGESTA')
  const [semanasGestacion, setSemanasGestacion] = useState(38)
  const [tipoAnestesia, setTipoAnestesia] = useState('EPIDURAL')
  const [profesionalResponsable, setProfesionalResponsable] = useState('')
  const [acompanamientoParto, setAcompanamientoParto] = useState(true)
  const [apegoTemprano, setApegoTemprano] = useState(true)
  const [inicioPresentacion, setInicioPresentacion] = useState('ESPONTANEO_CEFALICA')
  const [estadoPerineal, setEstadoPerineal] = useState('INTACTO')
  const [alumbramientoCompleto, setAlumbramientoCompleto] = useState(true)
  const [indicacionesPostparto, setIndicacionesPostparto] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resPacientes = await api.get('/pacientes/')
        setPacientes(resPacientes.data.results || resPacientes.data)
        
        const resPartos = await api.get('/partos/')
        setListaPartos(resPartos.data.results || resPartos.data)
      } catch (error) {
        console.error("Error al cargar datos", error)
        setMensaje({ texto: 'No se pudieron cargar los datos iniciales.', tipo: 'alert-warning' })
      }
    }
    cargarDatos()

    // Manejar clics fuera del buscador para cerrar el dropdown
    const handleClickFuera = (event) => {
      if (buscadorRef.current && !buscadorRef.current.contains(event.target)) {
        setMostrarDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickFuera)
    return () => document.removeEventListener("mousedown", handleClickFuera)
  }, [])

  // --- LÓGICA DE FILTRADO PARA EL BUSCADOR DE PACIENTES ---
  const pacientesFiltrados = pacientes.filter(p => {
    const termino = busquedaPaciente.toLowerCase()
    return (p.nombre?.toLowerCase().includes(termino) || 
            p.apellido?.toLowerCase().includes(termino) || 
            p.rut?.toLowerCase().includes(termino))
  }).slice(0, 10) // Limitar a 10 resultados para rendimiento

  const seleccionarPaciente = (paciente) => {
    setPacienteId(paciente.id)
    setBusquedaPaciente(`${paciente.nombre} ${paciente.apellido} (RUT: ${paciente.rut})`)
    setMostrarDropdown(false)
    if (camposVacios.paciente) setCamposVacios({ ...camposVacios, paciente: false })
  }

  // --- LÓGICA DE FILTRADO PARA LA TABLA DE PARTOS ---
  const partosFiltrados = listaPartos.filter(parto => {
    const termino = filtroTextoPartos.toLowerCase()
    const matchTexto = (parto.paciente_nombre || '').toLowerCase().includes(termino) ||
                       (parto.paciente_rut || '').toLowerCase().includes(termino)
    
    let matchFecha = true
    if (filtroFechaPartos) {
      // Comparar solo la parte de la fecha (YYYY-MM-DD)
      const fechaParto = new Date(parto.fecha_inicio).toISOString().split('T')[0]
      matchFecha = fechaParto === filtroFechaPartos
    }
    return matchTexto && matchFecha
  })

  // --- FORMATEADOR DE FECHAS SEPARADAS ---
  const formatFechaHora = (isoString) => {
    if (!isoString) return { fecha: '-', hora: '-' }
    const dateObj = new Date(isoString)
    return {
      fecha: dateObj.toLocaleDateString('es-CL'),
      hora: dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const finalizarParto = async (idParto) => {
    if (!puedeRegistrarParto) return
    try {
      const fechaActual = new Date().toISOString()
      
      await api.patch(`/partos/${idParto}/`, {
        fecha_termino: fechaActual
      })
      
      setMensaje({ texto: 'Parto finalizado correctamente.', tipo: 'alert-success' })
      
      const resPartos = await api.get('/partos/')
      setListaPartos(resPartos.data.results || resPartos.data)
    } catch (error) {
      console.error("Error al finalizar parto:", error)
      setMensaje({ texto: 'Error al finalizar el parto.', tipo: 'alert-danger' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!puedeRegistrarParto) {
      setMensaje({ texto: 'Su rol no tiene permisos para registrar partos.', tipo: 'alert-danger' })
      return
    }

    // VALIDACIÓN ESPECÍFICA DE CAMPOS VACÍOS
    const faltaPaciente = !pacienteId;
    const faltaTipoParto = !tipoParto;
    const faltaFechaInicio = !fechaInicio;
    const faltaDetalle = tieneComplicaciones && !detalleComplicaciones.trim();

    setCamposVacios({
      paciente: faltaPaciente,
      tipoParto: faltaTipoParto,
      fechaInicio: faltaFechaInicio,
      detalleComplicaciones: faltaDetalle
    });

    if (faltaPaciente || faltaTipoParto || faltaFechaInicio || faltaDetalle) {
      setMensaje({ texto: 'Por favor, completa todos los campos obligatorios marcados en rojo.', tipo: 'alert-danger' })
      return
    }

    if (fechaTermino && new Date(fechaTermino) < new Date(fechaInicio)) {
      setMensaje({ texto: 'Error clínico: La fecha y hora de término no puede ser anterior a la fecha de inicio.', tipo: 'alert-danger' })
      return
    }

    const semanasNum = parseInt(semanasGestacion, 10)
    if (isNaN(semanasNum) || semanasNum < 20 || semanasNum > 45) {
      setMensaje({ texto: 'Las semanas de gestación deben estar dentro de un rango clínico válido (20 a 45 semanas).', tipo: 'alert-warning' })
      return
    }

    setLoading(true)

    const payload = {
      paciente: parseInt(pacienteId, 10),
      tipo: tipoParto,
      fecha_inicio: fechaInicio,
      fecha_termino: fechaTermino || null,
      paridad: paridad,
      semanas_gestacion: semanasNum,
      tipo_anestesia: tipoAnestesia,
      profesional_responsable: profesionalResponsable.trim() || 'Matrona de Turno',
      acompanamiento_parto: acompanamientoParto,
      apego_temprano: apegoTemprano,
      inicio_presentacion: inicioPresentacion,
      estado_perineal: estadoPerineal,
      alumbramiento_completo: alumbramientoCompleto,
      indicaciones_postparto: indicacionesPostparto.trim(),
      tiene_complicaciones: tieneComplicaciones,
      complicaciones: tieneComplicaciones ? [detalleComplicaciones] : []
    }

    try {
      const respuesta = await api.post('/partos/', payload)
      
      if (respuesta.status === 201) {
        setMensaje({ texto: 'Parto y protocolo clínico registrados exitosamente.', tipo: 'alert-success' })
        // Limpieza de formulario
        setPacienteId(''); setBusquedaPaciente(''); setTipoParto(''); setFechaInicio(''); 
        setFechaTermino(''); setTieneComplicaciones(false); setDetalleComplicaciones('');
        setParidad('PRIMIGESTA'); setSemanasGestacion(38); setTipoAnestesia('EPIDURAL');
        setProfesionalResponsable(''); setAcompanamientoParto(true); setApegoTemprano(true);
        setInicioPresentacion('ESPONTANEO_CEFALICA'); setEstadoPerineal('INTACTO');
        setAlumbramientoCompleto(true); setIndicacionesPostparto('');
        setCamposVacios({ paciente: false, tipoParto: false, fechaInicio: false, detalleComplicaciones: false });
        
        const resPartos = await api.get('/partos/')
        setListaPartos(resPartos.data.results || resPartos.data)
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
          <p className="page-intro">Registro de procesos de parto, protocolo obstétrico, tiempos y posibles complicaciones clínicas.</p>
        </div>
      </div>

      {puedeRegistrarParto ? (
        <div className="card shadow-sm p-4 mt-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* --- BUSCADOR DE PACIENTES MEJORADO --- */}
              <div className="col-md-6 mb-3" ref={buscadorRef}>
                <label className="form-label fw-bold">
                  Buscar Paciente (Madre)
                  {camposVacios.paciente && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control ${camposVacios.paciente ? 'is-invalid' : ''}`}
                    placeholder="Escriba el RUT, nombre o apellido..."
                    value={busquedaPaciente}
                    onChange={(e) => {
                      setBusquedaPaciente(e.target.value)
                      setPacienteId('') // Reiniciar el ID si el usuario modifica el texto
                      setMostrarDropdown(true)
                    }}
                    onFocus={() => setMostrarDropdown(true)}
                  />
                  {mostrarDropdown && busquedaPaciente && (
                    <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                      {pacientesFiltrados.length > 0 ? (
                        pacientesFiltrados.map((p) => (
                          <li 
                            key={p.id} 
                            className="list-group-item list-group-item-action" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => seleccionarPaciente(p)}
                          >
                            <div className="fw-bold">{p.nombre} {p.apellido}</div>
                            <div className="text-muted small">RUT: {p.rut}</div>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">No se encontraron pacientes.</li>
                      )}
                    </ul>
                  )}
                </div>
                <small className="text-muted">Busque y seleccione a la paciente de la lista desplegable.</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Tipo de Parto (Vía)
                  {camposVacios.tipoParto && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <select 
                  className={`form-select ${camposVacios.tipoParto ? 'is-invalid' : ''}`} 
                  value={tipoParto} 
                  onChange={(e) => {
                    setTipoParto(e.target.value);
                    if (camposVacios.tipoParto) setCamposVacios({ ...camposVacios, tipoParto: false });
                  }}
                >
                  <option value="">Seleccione una opción...</option>
                  <option value="NATURAL">Natural</option>
                  <option value="CESAREA">Cesárea</option>
                  <option value="INSTRUMENTAL">Instrumental</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">
                  Fecha y Hora de Inicio
                  {camposVacios.fechaInicio && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="datetime-local" 
                  className={`form-control ${camposVacios.fechaInicio ? 'is-invalid' : ''}`} 
                  value={fechaInicio} 
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    if (camposVacios.fechaInicio) setCamposVacios({ ...camposVacios, fechaInicio: false });
                  }} 
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

              {/* --- FILA 1: PARIDAD Y ANESTESIA PRINCIPAL --- */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Paridad Materna</label>
                <select className="form-select" value={paridad} onChange={(e) => setParidad(e.target.value)}>
                  <option value="PRIMIGESTA">Primigesta (Primer parto)</option>
                  <option value="MULTIPARA">Multípara (Partos previos)</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Anestesia Principal</label>
                <select className="form-select" value={tipoAnestesia} onChange={(e) => setTipoAnestesia(e.target.value)}>
                  <option value="EPIDURAL">Epidural</option>
                  <option value="RAQUIDEA">Raquídea (Espinal)</option>
                  <option value="LOCAL">Local</option>
                  <option value="GENERAL">General</option>
                  <option value="NINGUNA">Sin Anestesia</option>
                </select>
              </div>

              {/* --- FILA 2: EDAD GESTACIONAL Y PROFESIONAL RESPONSABLE --- */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Edad Gestacional (Semanas)</label>
                <input type="number" className="form-control" min="20" max="45" value={semanasGestacion} onChange={(e) => setSemanasGestacion(e.target.value)} placeholder="Ej: 38" />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Profesional Responsable</label>
                <input type="text" className="form-control" maxLength="150" value={profesionalResponsable} onChange={(e) => setProfesionalResponsable(e.target.value)} placeholder="Ej: Matrona de Turno / Médico Obstetra" />
              </div>

              {/* --- FILA 3: PROTOCOLO DE PARTO (INICIO/PRESENTACIÓN Y PERINÉ) --- */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Inicio y Presentación Fetal</label>
                <select className="form-select" value={inicioPresentacion} onChange={(e) => setInicioPresentacion(e.target.value)}>
                  <option value="ESPONTANEO_CEFALICA">Espontáneo - Cefálica</option>
                  <option value="INDUCIDO_CEFALICA">Inducido - Cefálica</option>
                  <option value="PODALICA_OTRA">Podálica / Otra presentación</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Integridad del Canal (Episiotomía / Desgarro)</label>
                <select className="form-select" value={estadoPerineal} onChange={(e) => setEstadoPerineal(e.target.value)}>
                  <option value="INTACTO">Intacto (Sin lesiones)</option>
                  <option value="EPISIOTOMIA">Episiotomía realizada</option>
                  <option value="DESGARRO">Desgarro perineal</option>
                </select>
              </div>

              {/* --- SECCIÓN DE INTERRUPTORES: PARTO RESPETADO Y ALUMBRAMIENTO --- */}
              <div className="col-md-4 mb-2 mt-3 border-top pt-3">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="switchAcompanamiento" checked={acompanamientoParto} onChange={(e) => setAcompanamientoParto(e.target.checked)} />
                  <label className="form-check-label fw-bold" htmlFor="switchAcompanamiento">¿Contó con acompañamiento?</label>
                </div>
              </div>

              <div className="col-md-4 mb-2 mt-3 border-top pt-3">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="switchApego" checked={apegoTemprano} onChange={(e) => setApegoTemprano(e.target.checked)} />
                  <label className="form-check-label fw-bold" htmlFor="switchApego">¿Se realizó apego temprano?</label>
                </div>
              </div>

              <div className="col-md-4 mb-2 mt-3 border-top pt-3">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="switchAlumbramiento" checked={alumbramientoCompleto} onChange={(e) => setAlumbramientoCompleto(e.target.checked)} />
                  <label className="form-check-label fw-bold" htmlFor="switchAlumbramiento">¿Alumbramiento completo?</label>
                </div>
              </div>

              {/* --- EVOLUCIÓN E INDICACIONES DE PUERPERIO --- */}
              <div className="col-12 mb-3 mt-3">
                <label className="form-label fw-bold">Descripción del Parto e Indicaciones de Puerperio</label>
                <textarea className="form-control" rows="2" placeholder="Ej: Dilatación completa, LCF normales..." value={indicacionesPostparto} onChange={(e) => setIndicacionesPostparto(e.target.value)}></textarea>
              </div>

              {/* --- SECCIÓN DE COMPLICACIONES --- */}
              <div className="col-12 mb-3 mt-2 border-top pt-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="switchComplicaciones"
                    checked={tieneComplicaciones}
                    onChange={(e) => {
                      setTieneComplicaciones(e.target.checked);
                      if (!e.target.checked) {
                         setDetalleComplicaciones('');
                         setCamposVacios({ ...camposVacios, detalleComplicaciones: false });
                      }
                    }}
                  />
                  <label className="form-check-label text-danger fw-bold" htmlFor="switchComplicaciones">
                    ¿Se presentaron complicaciones durante el parto?
                  </label>
                </div>
              </div>

              {tieneComplicaciones && (
                <div className="col-12 mb-3">
                  <label className="form-label">
                    Descripción de las complicaciones
                    {camposVacios.detalleComplicaciones && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio detallar</span>}
                  </label>
                  <textarea 
                    className={`form-control ${camposVacios.detalleComplicaciones ? 'is-invalid' : ''}`} 
                    rows="3" 
                    placeholder="Ej: Hemorragia postparto, sufrimiento fetal agudo..."
                    value={detalleComplicaciones}
                    onChange={(e) => {
                      setDetalleComplicaciones(e.target.value);
                      if (camposVacios.detalleComplicaciones) setCamposVacios({ ...camposVacios, detalleComplicaciones: false });
                    }}
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
      ) : (
        <div className="alert alert-info mt-4">
          <strong>Modo Consulta Clínica ({rolUsuario}):</strong> Su perfil cuenta con acceso de lectura y supervisión sobre el registro de partos. El ingreso de protocolos obstétricos está reservado para Matronas y Médicos.
        </div>
      )}

      <div className="card shadow-sm p-4 mt-4">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h3 className="m-0" style={{ fontSize: '18px', fontWeight: '600' }}>Partos Registrados</h3>
        </div>

        {/* --- FILTROS DE TABLA --- */}
        <div className="row mb-4 bg-light p-3 rounded border">
          <div className="col-md-6">
            <label className="form-label small fw-bold">Buscar Paciente / RUT</label>
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Buscar por nombre, apellido o RUT..." 
              value={filtroTextoPartos} 
              onChange={(e) => setFiltroTextoPartos(e.target.value)} 
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold">Filtrar por Fecha (Inicio)</label>
            <input 
              type="date" 
              className="form-control form-control-sm" 
              value={filtroFechaPartos} 
              onChange={(e) => setFiltroFechaPartos(e.target.value)} 
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th>Paciente</th>
                <th>Vía / Presentación</th>
                <th>Contexto Obstétrico</th>
                <th>Anestesia / Periné</th>
                <th>Inicio (Fecha / Hora)</th>
                <th>Término (Fecha / Hora)</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {partosFiltrados.length === 0 && (
                <tr><td colSpan="8" className="text-center py-4">No se encontraron partos registrados con esos filtros.</td></tr>
              )}
              {partosFiltrados.map((parto) => {
                const enProceso = !parto.fecha_termino;
                const inicioStr = formatFechaHora(parto.fecha_inicio)
                const terminoStr = formatFechaHora(parto.fecha_termino)
                
                return (
                  <tr key={parto.id}>
                    <td>
                      <div className="fw-bold">{parto.paciente_nombre || `ID: ${parto.paciente}`}</div>
                      <div className="text-muted small">RUT: {parto.paciente_rut || '-'}</div>
                    </td>
                    <td>
                      <span className="fw-semibold">{parto.tipo}</span>
                      <br />
                      <small className="text-muted">{parto.inicio_presentacion || 'ESPONTANEO_CEFALICA'}</small>
                    </td>
                    <td>
                      <span className="fw-semibold">{parto.paridad || 'PRIMIGESTA'}</span>
                      <br />
                      <small className="text-muted">{parto.semanas_gestacion || 38} sem.</small>
                    </td>
                    <td>
                      <span>{parto.tipo_anestesia || 'EPIDURAL'}</span>
                      <br />
                      <small className="text-muted">{parto.estado_perineal || 'INTACTO'}</small>
                    </td>
                    
                    {/* FECHAS SEPARADAS Y CLARAS */}
                    <td>
                      <div className="fw-semibold" style={{ color: '#0f172a' }}>{inicioStr.fecha}</div>
                      <div className="text-muted small">Hora: {inicioStr.hora}</div>
                    </td>
                    <td>
                      {enProceso ? (
                         <div className="text-muted">-</div>
                      ) : (
                        <>
                          <div className="fw-semibold" style={{ color: '#0f172a' }}>{terminoStr.fecha}</div>
                          <div className="text-muted small">Hora: {terminoStr.hora}</div>
                        </>
                      )}
                    </td>

                    <td>
                      {enProceso ? (
                        <span className="badge bg-warning text-dark">En Proceso</span>
                      ) : (
                        <span className="badge bg-success">Finalizado</span>
                      )}
                    </td>
                    <td className="text-end">
                      {enProceso && puedeRegistrarParto && (
                        <button 
                          className="btn btn-sm btn-outline-success"
                          onClick={() => finalizarParto(parto.id)}
                        >
                          Finalizar Parto
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  )
}

export default Partos