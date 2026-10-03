import { useState, useEffect, useRef } from 'react'
import MainLayout from '../layouts/MainLayout'
import api from '../services/api'
import './RecienNacidos.css'

function RecienNacidos() {
  // --- CONTROL DE ACCESO POR ROL (RBAC) ---
  const rolUsuario = localStorage.getItem('user_role') || 'ADMIN_SISTEMA'
  const puedeRegistrarRn = ['MATRONA', 'MEDICO', 'ADMIN_SISTEMA'].includes(rolUsuario)
  const puedeRegistrarControl = ['MATRONA', 'MEDICO', 'ENFERMERO', 'ADMIN_SISTEMA'].includes(rolUsuario)

  const [partos, setPartos] = useState([])
  const [rnList, setRnList] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })
  const [mostrarForm, setMostrarForm] = useState(false)

  // Estados de datos principales
  const [partoId, setPartoId] = useState('')
  const [peso, setPeso] = useState('')
  const [talla, setTalla] = useState('')
  const [apgar1, setApgar1] = useState('')
  const [apgar5, setApgar5] = useState('')
  const [apgar10, setApgar10] = useState('')
  const [condicion, setCondicion] = useState('BUENA')
  const [alertaCritica, setAlertaCritica] = useState(false)
  const [loading, setLoading] = useState(false)

  // --- NUEVOS ESTADOS: BUSCADOR DE PARTOS ---
  const [busquedaParto, setBusquedaParto] = useState('')
  const [mostrarDropdownParto, setMostrarDropdownParto] = useState(false)
  const buscadorPartoRef = useRef(null)

  // --- NUEVO ESTADO: FILTRO DE TABLA ---
  const [filtroTextoRn, setFiltroTextoRn] = useState('')

  // Estado para validación visual de campos vacíos del Formulario Principal
  const [camposVacios, setCamposVacios] = useState({
    partoId: false,
    peso: false,
    talla: false,
    apgar1: false,
    apgar5: false
  })

  // --- ESTADOS CLÍNICOS: FICHA RECIÉN NACIDO (HOSPITAL) ---
  const [sexo, setSexo] = useState('FEMENINO')
  const [circunferenciaCraneana, setCircunferenciaCraneana] = useState('')
  const [grupoRh, setGrupoRh] = useState('PENDIENTE')
  const [profilaxisCompleta, setProfilaxisCompleta] = useState(true)
  const [lactanciaPrimeraHora, setLactanciaPrimeraHora] = useState(true)
  const [requirioOxigeno, setRequirioOxigeno] = useState(false)

  // Estados modales y sus validaciones
  const [rnQr, setRnQr] = useState(null)
  
  const [rnDerivar, setRnDerivar] = useState(null)
  const [servicioDerivacion, setServicioDerivacion] = useState('')
  const [motivoDerivacion, setMotivoDerivacion] = useState('')
  const [errorServicio, setErrorServicio] = useState(false)

  const [rnControl, setRnControl] = useState(null)
  const [vacunaBcg, setVacunaBcg] = useState(false)
  const [vacunaHepB, setVacunaHepB] = useState(false)
  const [tamizaje, setTamizaje] = useState(false)
  const [screeningCardiopatia, setScreeningCardiopatia] = useState(false)
  const [orinaMeconio, setOrinaMeconio] = useState(false)
  const [responsableControl, setResponsableControl] = useState('')
  const [observacionesControl, setObservacionesControl] = useState('')
  const [errorResponsable, setErrorResponsable] = useState(false)

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

    // Manejar clics fuera del buscador de partos para cerrar el dropdown
    const handleClickFuera = (event) => {
      if (buscadorPartoRef.current && !buscadorPartoRef.current.contains(event.target)) {
        setMostrarDropdownParto(false)
      }
    }
    document.addEventListener("mousedown", handleClickFuera)
    return () => document.removeEventListener("mousedown", handleClickFuera)
  }, [])

  useEffect(() => {
    const valores = [apgar1, apgar5, apgar10].filter((v) => v !== '')
    const minApgar = valores.length ? Math.min(...valores.map(Number)) : 10
    setAlertaCritica(valores.length > 0 && minApgar < 5)
  }, [apgar1, apgar5, apgar10])

  const limpiarFormulario = () => {
    setPartoId(''); setBusquedaParto(''); setPeso(''); setTalla('')
    setApgar1(''); setApgar5(''); setApgar10('')
    setCondicion('BUENA')
    setSexo('FEMENINO'); setCircunferenciaCraneana(''); setGrupoRh('PENDIENTE')
    setProfilaxisCompleta(true); setLactanciaPrimeraHora(true); setRequirioOxigeno(false)
    setCamposVacios({ partoId: false, peso: false, talla: false, apgar1: false, apgar5: false })
  }

  // --- LÓGICA DE FILTRADO PARA EL BUSCADOR DE PARTOS ---
  const partosFiltradosDropdown = partos.filter(p => {
    const termino = busquedaParto.toLowerCase()
    return (
      p.paciente_nombre?.toLowerCase().includes(termino) || 
      p.paciente_rut?.toLowerCase().includes(termino) ||
      p.id.toString().includes(termino)
    )
  }).slice(0, 10) // Limitar a 10 para rendimiento

  const seleccionarParto = (parto) => {
    setPartoId(parto.id)
    setBusquedaParto(`Parto #${parto.id} - ${parto.paciente_nombre} (RUT: ${parto.paciente_rut || '-'})`)
    setMostrarDropdownParto(false)
    if (camposVacios.partoId) setCamposVacios({ ...camposVacios, partoId: false })
  }

  // --- LÓGICA DE FILTRADO PARA LA TABLA DE RN ---
  const rnFiltrados = rnList.filter(rn => {
    const termino = filtroTextoRn.toLowerCase()
    return (
      rn.paciente_madre_nombre?.toLowerCase().includes(termino) ||
      rn.numero_interno?.toLowerCase().includes(termino) ||
      (rn.grupo_rh || '').toLowerCase().includes(termino)
    )
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!puedeRegistrarRn) {
      setMensaje({ texto: 'Su rol no tiene permisos para registrar ingresos neonatales.', tipo: 'alert-danger' })
      return
    }

    // VALIDACIÓN ESPECÍFICA DE CAMPOS VACÍOS
    const faltaParto = !partoId;
    const faltaPeso = !peso;
    const faltaTalla = !talla;
    const faltaApgar1 = apgar1 === '';
    const faltaApgar5 = apgar5 === '';

    setCamposVacios({
      partoId: faltaParto,
      peso: faltaPeso,
      talla: faltaTalla,
      apgar1: faltaApgar1,
      apgar5: faltaApgar5
    });

    if (faltaParto || faltaPeso || faltaTalla || faltaApgar1 || faltaApgar5) {
      setMensaje({ texto: 'Por favor, completa todos los campos obligatorios marcados en rojo.', tipo: 'alert-danger' })
      return
    }

    if (circunferenciaCraneana && (parseFloat(circunferenciaCraneana) < 20 || parseFloat(circunferenciaCraneana) > 50)) {
      setMensaje({ texto: 'La circunferencia craneana (CC) debe estar en un rango válido (20 a 50 cm).', tipo: 'alert-warning' })
      return
    }

    setLoading(true)
    try {
      const respuesta = await api.post('/recien-nacidos/', {
        parto: Number(partoId),
        peso: parseFloat(peso),
        talla: parseFloat(talla),
        apgar_1: parseInt(apgar1, 10),
        apgar_5: parseInt(apgar5, 10),
        apgar_10: apgar10 ? parseInt(apgar10, 10) : 0,
        condicion_al_nacer: condicion,
        sexo: sexo,
        circunferencia_craneana: circunferenciaCraneana ? parseFloat(circunferenciaCraneana) : 34.5,
        grupo_rh: grupoRh,
        profilaxis_completa: profilaxisCompleta,
        lactancia_primera_hora: lactanciaPrimeraHora,
        requirio_oxigeno: requirioOxigeno,
      })
      setMensaje({ texto: 'Recién nacido registrado exitosamente. Código QR generado.', tipo: 'alert-success' })
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
    if (!puedeRegistrarRn) return
    setRnDerivar(rn)
    setServicioDerivacion('')
    setMotivoDerivacion('')
    setErrorServicio(false)
  }

  const confirmarDerivar = async (e) => {
    e.preventDefault()
    if (!servicioDerivacion.trim()) {
      setErrorServicio(true)
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
    if (!puedeRegistrarControl) return
    setRnControl(rn)
    setVacunaBcg(false)
    setVacunaHepB(false)
    setTamizaje(false)
    setScreeningCardiopatia(false)
    setOrinaMeconio(false)
    setResponsableControl('')
    setObservacionesControl('')
    setErrorResponsable(false)
  }

  const confirmarControl = async (e) => {
    e.preventDefault()
    if (!responsableControl.trim()) {
      setErrorResponsable(true)
      return
    }

    const extrasClinicos = [
      screeningCardiopatia ? 'SCC (Oximetría) Normal' : null,
      orinaMeconio ? 'Orina y Meconio (+)' : null,
    ].filter(Boolean).join(' | ')

    const observacionesFinales = [extrasClinicos, observacionesControl.trim()]
      .filter(Boolean)
      .join(' — ')

    try {
      await api.post(`/recien-nacidos/${rnControl.id}/registrar_control/`, {
        vacuna_bcg: vacunaBcg,
        vacuna_hepatitis_b: vacunaHepB,
        tamizaje_neonatal: tamizaje,
        responsable: responsableControl,
        observaciones: observacionesFinales,
      })
      setMensaje({ texto: 'Control neonatal posterior registrado.', tipo: 'alert-success' })
      setRnControl(null)
      cargarDatos()
    } catch (error) {
      setMensaje({ texto: 'Error al registrar control: ' + JSON.stringify(error.response?.data), tipo: 'alert-danger' })
    }
  }

  return (
    <MainLayout>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Gestión de Recién Nacidos
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Registro clínico, antropometría, profilaxis, identificación QR y controles posteriores.
          </p>
        </div>
        {puedeRegistrarRn && (
          <button className="btn btn-primary" onClick={() => {
            setMostrarForm(!mostrarForm)
            if(!mostrarForm) limpiarFormulario()
          }}>
            {mostrarForm ? 'Cancelar' : '+ Registrar RN'}
          </button>
        )}
      </div>

      {!puedeRegistrarRn && (
        <div className="alert alert-info mb-4">
          <strong>Vista según perfil ({rolUsuario}):</strong>{' '}
          {puedeRegistrarControl
            ? 'Puede consultar registros, ver códigos QR y registrar controles de vacunación/observación neonatal.'
            : 'Modo supervisión y auditoría de registros neonatales.'}
        </div>
      )}

      {mensaje.texto && <div className={`alert ${mensaje.tipo} mb-4`}>{mensaje.texto}</div>}

      {mostrarForm && puedeRegistrarRn && (
        <div className="card-clinica mb-4" style={{ background: 'var(--bg-surface)', border: alertaCritica ? '1px solid #DC2626' : '1px solid var(--border-light)', padding: '24px', borderRadius: '8px' }}>
          {alertaCritica && (
            <div className="alert alert-danger fw-bold mb-3" style={{ fontSize: '13px' }}>
              ⚠ APGAR bajo detectado. Se recomienda derivar apenas se registre.
            </div>
          )}
          <h4 className="mb-3" style={{ fontSize: '16px', fontWeight: '600' }}>Registro Clínico de Recién Nacido</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* --- BUSCADOR DE PARTOS MEJORADO --- */}
              <div className="col-md-12 mb-3" ref={buscadorPartoRef}>
                <label className="form-label fw-bold">
                  Parto asociado (Madre)
                  {camposVacios.partoId && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <div className="position-relative">
                  <input
                    type="text"
                    className={`form-control ${camposVacios.partoId ? 'is-invalid' : ''}`}
                    placeholder="Escriba el nombre, RUT de la madre o ID del parto..."
                    value={busquedaParto}
                    onChange={(e) => {
                      setBusquedaParto(e.target.value)
                      setPartoId('') 
                      setMostrarDropdownParto(true)
                    }}
                    onFocus={() => setMostrarDropdownParto(true)}
                  />
                  {mostrarDropdownParto && busquedaParto && (
                    <ul className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                      {partosFiltradosDropdown.length > 0 ? (
                        partosFiltradosDropdown.map((p) => (
                          <li 
                            key={p.id} 
                            className="list-group-item list-group-item-action" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => seleccionarParto(p)}
                          >
                            <div className="fw-bold">Parto #{p.id} — {p.paciente_nombre}</div>
                            <div className="text-muted small">RUT: {p.paciente_rut || '-'} | Vía: {p.tipo}</div>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">No se encontraron partos que coincidan.</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* --- FILA 1: ANTROPOMETRÍA COMPLETA (PESO, TALLA Y CC) --- */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Peso (kg)
                  {camposVacios.peso && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  className={`form-control ${camposVacios.peso ? 'is-invalid' : ''}`} 
                  placeholder="Ej: 3.20" 
                  value={peso} 
                  onChange={(e) => {
                    setPeso(e.target.value)
                    if (camposVacios.peso) setCamposVacios({...camposVacios, peso: false})
                  }} 
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  Talla (cm)
                  {camposVacios.talla && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  className={`form-control ${camposVacios.talla ? 'is-invalid' : ''}`} 
                  placeholder="Ej: 50.5" 
                  value={talla} 
                  onChange={(e) => {
                    setTalla(e.target.value)
                    if (camposVacios.talla) setCamposVacios({...camposVacios, talla: false})
                  }} 
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Circunf. Craneana - CC (cm)</label>
                <input type="number" step="0.1" min="20" max="50" className="form-control" placeholder="Ej: 34.5" value={circunferenciaCraneana} onChange={(e) => setCircunferenciaCraneana(e.target.value)} />
              </div>

              {/* --- FILA 2: TEST DE APGAR (1, 5 Y 10 MINUTOS) --- */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  APGAR al 1 min
                  {camposVacios.apgar1 && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max="10" 
                  className={`form-control text-center ${camposVacios.apgar1 ? 'is-invalid' : ''}`} 
                  value={apgar1} 
                  onChange={(e) => {
                    setApgar1(e.target.value)
                    if (camposVacios.apgar1) setCamposVacios({...camposVacios, apgar1: false})
                  }} 
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">
                  APGAR a los 5 min
                  {camposVacios.apgar5 && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="number" 
                  min="0" 
                  max="10" 
                  className={`form-control text-center ${camposVacios.apgar5 ? 'is-invalid' : ''}`} 
                  value={apgar5} 
                  onChange={(e) => {
                    setApgar5(e.target.value)
                    if (camposVacios.apgar5) setCamposVacios({...camposVacios, apgar5: false})
                  }} 
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">APGAR a los 10 min</label>
                <input type="number" min="0" max="10" className="form-control text-center" value={apgar10} onChange={(e) => setApgar10(e.target.value)} />
              </div>

              {/* --- FILA 3: SEXO, GRUPO SANGUÍNEO Y CONDICIÓN AL NACER --- */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Sexo del Recién Nacido</label>
                <select className="form-select" value={sexo} onChange={(e) => setSexo(e.target.value)}>
                  <option value="FEMENINO">Femenino</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="INDETERMINADO">Indeterminado</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Grupo y Rh</label>
                <select className="form-select" value={grupoRh} onChange={(e) => setGrupoRh(e.target.value)}>
                  <option value="PENDIENTE">Pendiente (En estudio)</option>
                  <option value="O+">O Rh(+)</option>
                  <option value="O-">O Rh(-)</option>
                  <option value="A+">A Rh(+)</option>
                  <option value="A-">A Rh(-)</option>
                  <option value="B+">B Rh(+)</option>
                  <option value="B-">B Rh(-)</option>
                  <option value="AB+">AB Rh(+)</option>
                  <option value="AB-">AB Rh(-)</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Condición al nacer</label>
                <select className="form-select" value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                  <option value="BUENA">Buena</option>
                  <option value="REGULAR">Regular</option>
                  <option value="MALA">Mala</option>
                </select>
              </div>

              {/* --- FILA 4: INTERRUPTORES DE ATENCIÓN INMEDIATA (MINSAL) --- */}
              <div className="col-md-4 mb-2 mt-2 border-top pt-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="switchProfilaxis"
                    checked={profilaxisCompleta}
                    onChange={(e) => setProfilaxisCompleta(e.target.checked)}
                  />
                  <label className="form-check-label fw-bold" htmlFor="switchProfilaxis">
                    ¿Profilaxis completa (Vit. K / Ocular)?
                  </label>
                </div>
              </div>

              <div className="col-md-4 mb-2 mt-2 border-top pt-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="switchLactancia"
                    checked={lactanciaPrimeraHora}
                    onChange={(e) => setLactanciaPrimeraHora(e.target.checked)}
                  />
                  <label className="form-check-label fw-bold" htmlFor="switchLactancia">
                    ¿Lactancia en 1ª hora de vida?
                  </label>
                </div>
              </div>

              <div className="col-md-4 mb-2 mt-2 border-top pt-3">
                <div className="form-check form-switch">
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="switchOxigeno"
                    checked={requirioOxigeno}
                    onChange={(e) => setRequirioOxigeno(e.target.checked)}
                  />
                  <label className="form-check-label text-danger fw-bold" htmlFor="switchOxigeno">
                    ¿Requirió oxígeno / reanimación?
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className={`btn ${alertaCritica ? 'btn-danger' : 'btn-primary'}`} disabled={loading}>
                {loading ? 'Procesando...' : 'Registrar Recién Nacido'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card-clinica" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '24px', borderRadius: '8px' }}>
        
        {/* --- FILTRO DE TABLA DE RECIÉN NACIDOS --- */}
        <div className="row mb-4">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-muted">Buscar en Registros Neonatales</label>
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Buscar por N° interno o nombre de la madre..." 
              value={filtroTextoRn} 
              onChange={(e) => setFiltroTextoRn(e.target.value)} 
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '13px' }}>
                <th>N° interno</th>
                <th>Madre / Sexo</th>
                <th>Antropometría (Peso/Talla/CC)</th>
                <th>APGAR (1/5/10)</th>
                <th>Atención Inmediata</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando && <tr><td colSpan="7" className="text-center py-4">Cargando...</td></tr>}
              {!cargando && rnFiltrados.length === 0 && (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No se encontraron recién nacidos con esos datos.</td></tr>
              )}
              {rnFiltrados.map((rn) => {
                const critico = Math.min(rn.apgar_1, rn.apgar_5, rn.apgar_10 || 10) < 5
                return (
                  <tr key={rn.id} className={critico ? 'table-danger' : ''}>
                    <td>
                      <span className="fw-semibold">{rn.numero_interno}</span>
                      <br />
                      <small className="text-muted">Grupo: {rn.grupo_rh || 'PENDIENTE'}</small>
                    </td>
                    <td>
                      <span>{rn.paciente_madre_nombre}</span>
                      <br />
                      <small className="text-muted">{rn.sexo || 'FEMENINO'}</small>
                    </td>
                    <td>
                      <span>{rn.peso} kg / {rn.talla} cm</span>
                      <br />
                      <small className="text-muted">CC: {rn.circunferencia_craneana || 34.5} cm</small>
                    </td>
                    <td>
                      {rn.apgar_1}/{rn.apgar_5}/{rn.apgar_10}
                      {critico && <span className="badge bg-danger ms-2" style={{ fontSize: '10px' }}>Crítico</span>}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border me-1">
                        {rn.profilaxis_completa !== false ? 'Profilaxis OK' : 'Sin Profilaxis'}
                      </span>
                      {rn.requirio_oxigeno && (
                        <span className="badge bg-warning text-dark">Con O2</span>
                      )}
                      <br />
                      <small className="text-muted">
                        {rn.lactancia_primera_hora !== false ? 'Lactancia 1ªh: Sí' : 'Lactancia 1ªh: No'}
                      </small>
                    </td>
                    <td>{rn.estado}</td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setRnQr(rn)}>QR</button>
                        {puedeRegistrarRn && (
                          <button className="btn btn-sm btn-outline-warning" onClick={() => abrirDerivar(rn)} disabled={rn.derivado}>
                            {rn.derivado ? 'Derivado' : 'Derivar'}
                          </button>
                        )}
                        {puedeRegistrarControl && (
                          <button className="btn btn-sm btn-outline-primary" onClick={() => abrirControl(rn)}>Control</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {rnQr && (
        <div className="pacientes-modal" style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setRnQr(null)}>
          <div className="pacientes-modal__card card-clinica text-center" style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>{rnQr.numero_interno}</h3>
            {rnQr.codigo_qr_base64 ? (
              <img src={`data:image/png;base64,${rnQr.codigo_qr_base64}`} alt="Código QR" style={{ width: 180, margin: '0 auto' }} />
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Sin código QR disponible.</p>
            )}
            <button className="btn btn-outline-secondary mt-4 w-100" onClick={() => setRnQr(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {rnDerivar && puedeRegistrarRn && (
        <div className="pacientes-modal" style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="pacientes-modal__card card-clinica" style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Derivar {rnDerivar.numero_interno}</h3>
            <form onSubmit={confirmarDerivar}>
              <div className="mb-3">
                <label className="form-label">
                  Servicio de derivación
                  {errorServicio && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="text" 
                  className={`form-control ${errorServicio ? 'is-invalid' : ''}`} 
                  placeholder="Ej: UCI Neonatal" 
                  value={servicioDerivacion} 
                  onChange={(e) => {
                    setServicioDerivacion(e.target.value)
                    if(errorServicio) setErrorServicio(false)
                  }} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Motivo</label>
                <textarea className="form-control" rows="2" value={motivoDerivacion} onChange={(e) => setMotivoDerivacion(e.target.value)} />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setRnDerivar(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Confirmar derivación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rnControl && puedeRegistrarControl && (
        <div className="pacientes-modal" style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="pacientes-modal__card card-clinica" style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Control posterior — {rnControl.numero_interno}</h3>
            <form onSubmit={confirmarControl}>
              <div className="mb-3 d-flex flex-wrap gap-3">
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={vacunaBcg} onChange={(e) => setVacunaBcg(e.target.checked)} /> Vacuna BCG
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={vacunaHepB} onChange={(e) => setVacunaHepB(e.target.checked)} /> Vacuna Hepatitis B
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={tamizaje} onChange={(e) => setTamizaje(e.target.checked)} /> Tamizaje (TSH/PKU)
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={screeningCardiopatia} onChange={(e) => setScreeningCardiopatia(e.target.checked)} /> Screening Cardíaco (SCC)
                </label>
                <label className="form-check-label">
                  <input type="checkbox" className="form-check-input me-2" checked={orinaMeconio} onChange={(e) => setOrinaMeconio(e.target.checked)} /> Emisión Orina / Meconio
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Responsable
                  {errorResponsable && <span className="text-danger ms-2" style={{ fontSize: '0.85em' }}>* Obligatorio</span>}
                </label>
                <input 
                  type="text" 
                  className={`form-control ${errorResponsable ? 'is-invalid' : ''}`} 
                  placeholder="Ej: Matrona / Enfermero / Pediatra de turno" 
                  value={responsableControl} 
                  onChange={(e) => {
                    setResponsableControl(e.target.value)
                    if(errorResponsable) setErrorResponsable(false)
                  }} 
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Observaciones y Examen Físico</label>
                <textarea className="form-control" rows="2" placeholder="Ej: Reflejos arcaicos presentes (Moro, succión), cordón limpio, sin hallazgos patológicos..." value={observacionesControl} onChange={(e) => setObservacionesControl(e.target.value)} />
              </div>
              <div className="d-flex justify-content-end gap-2 mt-4">
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