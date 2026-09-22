import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import './FichaRN.css'

function FichaRN() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rn, setRn] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await api.get(`/recien-nacidos/${id}/`)
        setRn(respuesta.data)
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/', { state: { redirectTo: `/ficha-rn/${id}` } })
        } else {
          setError('No se pudo cargar la ficha del recién nacido.')
        }
      }
    }
    cargar()
  }, [id, navigate])

  if (error) return <div className="ficha-rn ficha-rn__error">{error}</div>
  if (!rn) return <div className="ficha-rn">Cargando ficha…</div>

  const critico = Math.min(rn.apgar_1, rn.apgar_5, rn.apgar_10 || 10) < 5

  return (
    <div className="ficha-rn">
      <div className="ficha-rn__card">
        <p className="ficha-rn__mark">Materno</p>
        <h1>{rn.numero_interno}</h1>
        {critico && <p className="ficha-rn__alerta">⚠️ APGAR crítico registrado</p>}

        <div className="ficha-rn__grid">
          <div><span>Madre</span><strong>{rn.paciente_madre_nombre}</strong></div>
          <div><span>Peso</span><strong>{rn.peso} kg</strong></div>
          <div><span>Talla</span><strong>{rn.talla} cm</strong></div>
          <div><span>APGAR (1/5/10)</span><strong>{rn.apgar_1}/{rn.apgar_5}/{rn.apgar_10}</strong></div>
          <div><span>Condición al nacer</span><strong>{rn.condicion_al_nacer}</strong></div>
          <div><span>Estado</span><strong>{rn.estado}</strong></div>
          {rn.derivado && (
            <div><span>Derivado a</span><strong>{rn.servicio_derivacion}</strong></div>
          )}
        </div>

        {rn.controles?.length > 0 && (
          <>
            <h2>Controles posteriores</h2>
            <ul className="ficha-rn__controles">
              {rn.controles.map((c) => (
                <li key={c.id}>
                  {new Date(c.fecha_control).toLocaleDateString()} —
                  {c.vacuna_bcg && ' BCG'} {c.vacuna_hepatitis_b && ' Hep. B'} {c.tamizaje_neonatal && ' Tamizaje'}
                  {c.responsable && ` (${c.responsable})`}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export default FichaRN
