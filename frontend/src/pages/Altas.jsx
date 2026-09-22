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
      const respuesta = await api.get('/altas/')
      const lista = respuesta.data.results || respuesta.data
      
      const pendientes = lista.filter(alta => !alta.certificado_generado)
      
      setAltasPendientes(pendientes)
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
      
      cargarAltas()
    } catch (error) {
      setMensaje(error.response?.data?.error || 'No se pudo generar el certificado.')
    }
  }

  // NUEVA FUNCIÓN: Descarga el historial en formato CSV (Excel)
  const exportarAExcel = async () => {
    try {
      setMensaje('Generando archivo Excel...')
      const respuesta = await api.get('/altas/')
      const listaCompleta = respuesta.data.results || respuesta.data

      if (listaCompleta.length === 0) {
        setMensaje('No hay registros para exportar.')
        return
      }

      // Cabeceras del Excel
      const cabeceras = ['ID Alta', 'Boletín', 'Paciente', 'Tipo Alta', 'Firma Médica', 'Firma Admin', 'Certificado']
      
      // Filas de datos
      const filas = listaCompleta.map(alta => {
        return [
          alta.id,
          `BO-2026-${alta.id.toString().padStart(3, '0')}`,
          alta.paciente_nombre || `ID: ${alta.paciente}`,
          alta.tipo_alta || 'NORMAL',
          alta.alta_clinica_confirmada ? 'Sí' : 'No',
          alta.alta_administrativa_confirmada ? 'Sí' : 'No',
          alta.certificado_generado ? 'Sí' : 'No'
        ].join(';') // Usamos punto y coma para que Excel en español lo separe bien
      })

      // Generar el archivo con formato UTF-8 para que las tildes y ñ se vean bien
      const csvContent = "data:text/csv;charset=utf-8,\ufeff" + [cabeceras.join(';'), ...filas].join('\n')
      const encodedUri = encodeURI(csvContent)
      
      // Forzar la descarga
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", "Historial_Altas_Maternidad.csv")
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      setMensaje('') // Limpiamos el mensaje
    } catch (error) {
      setMensaje('Error al exportar el historial.')
    }
  }

  return (
    <MainLayout>
      <div className="gestionAltasContent">
        
        <section className="titleSection">
          <div className="frame8">
            <h3 className="gestinDeAltas">Gestión de Altas</h3>
            <div className="mduloDeFormalizacin">
              Módulo de formalización de egresos médicos y administrativos para pacientes de maternidad
            </div>
          </div>
          <div className="headerActions">
            {/* BOTÓN ACTUALIZADO PARA EXPORTAR */}
            <button 
              onClick={exportarAExcel}
              className="exportButton" 
              style={{ background: 'white', border: '1px solid var(--border-light)', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '16px' }}>📥</span>
              <div className="altasText fw-bold text-dark">Exportar historial a Excel</div>
            </button>
          </div>
        </section>

        {mensaje && (
          <div className="alert alert-info mt-3" style={{ borderRadius: '8px' }}>
            {mensaje}
          </div>
        )}

        <div className="infoBanner mt-3">
          <span style={{ fontSize: '20px' }}>ℹ️</span>
          <div className="informacinParaEmitir">
            Información: Para emitir el alta formal definitiva, tanto el Alta Clínica (Médico) como el Alta Administrativa (Finanzas/Admisión) deben estar confirmadas.
          </div>
        </div>

        <div className="altasTable">
          <div className="tableHeaderRow">
            <div className="pacienteMadre">Paciente (Madre)</div>
            <div className="boletnDeServicio">Boletín de Servicio</div>
            <div className="boletnDeServicio">Alta Clínica (Médico)</div>
            <div className="boletnDeServicio">Alta Admin (Administrativa)</div>
            <div className="accionesDeFormalizacin">Acciones de Formalización</div>
          </div>

          {cargando && (
            <div className="tableRows" style={{ justifyContent: 'center', padding: '32px' }}>
              Cargando...
            </div>
          )}

          {!cargando && altasPendientes.length === 0 && (
            <div className="tableRows" style={{ justifyContent: 'center', padding: '32px', color: 'var(--color-slategray)' }}>
              No hay altas pendientes.
            </div>
          )}

          {altasPendientes.map((alta, index) => {
            const isEven = index % 2 === 0;
            const rowClass = isEven ? "tableRows" : "tableRows2";

            return (
              <section key={alta.id} className={rowClass}>
                <div className="franciscaMuozSoto">{alta.paciente_nombre || `Paciente ID: ${alta.paciente}`}</div>
                <div className="bo2026904">BO-2026-{alta.id.toString().padStart(3, '0')}</div>
                
                {/* ESTADO ALTA CLÍNICA */}
                <div className="clinicalStatusCell">
                  {alta.alta_clinica_confirmada ? (
                    <div className="clinicalStatusWrapper">
                      <div className="confirmada">Confirmada</div>
                    </div>
                  ) : (
                    <div className="frame12">
                      <div className="pendiente">Pendiente</div>
                    </div>
                  )}
                </div>

                {/* ESTADO ALTA ADMIN */}
                <div className="clinicalStatusCell">
                  {alta.alta_administrativa_confirmada ? (
                    <div className="clinicalStatusWrapper">
                      <div className="confirmada">Confirmada</div>
                    </div>
                  ) : (
                    <div className="frame12">
                      <div className="pendiente">Pendiente</div>
                    </div>
                  )}
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="actionButtonsGroup">
                  
                  {/* Botón Médico */}
                  {alta.alta_clinica_confirmada ? (
                    <div className="clinicalActionButton">
                      <div className="clnica">Clínica ✓</div>
                    </div>
                  ) : (
                    <button className="frame14" onClick={() => confirmarAltaClinica(alta.id)}>
                      <div className="validarPago">Firma Médica</div>
                    </button>
                  )}

                  {/* Botón Admin */}
                  {alta.alta_administrativa_confirmada ? (
                    <div className="clinicalActionButton">
                      <div className="clnica">Admin ✓</div>
                    </div>
                  ) : (
                    <button className="frame14" onClick={() => confirmarAltaAdmin(alta.id)}>
                      <div className="validarPago">Validar Pago</div>
                    </button>
                  )}

                  {/* Botón Emitir PDF */}
                  {alta.alta_clinica_confirmada && alta.alta_administrativa_confirmada ? (
                    <button className="issueDischargeButton" onClick={() => generarPDF(alta.id)}>
                      <div className="emitirAlta">Emitir Alta</div>
                    </button>
                  ) : (
                    <div className="frame22">
                      <div className="emitirAlta2">Emitir Alta</div>
                    </div>
                  )}

                </div>
              </section>
            );
          })}
        </div>
      </div>
    </MainLayout>
  )
}

export default Altas