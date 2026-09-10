import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import axios from 'axios' // Asegúrate de tener axios instalado (npm install axios)

function Pacientes() {
  // 1. Estados alineados EXACTAMENTE con el models.py de Django
  const [rut, setRut] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [edad, setEdad] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación básica del frontend
    if (!rut || !nombre || !apellido || !fechaNacimiento || !edad || !direccion || !telefono) {
        setMensaje({ texto: 'Completa todos los campos obligatorios.', tipo: 'alert-danger' })
        return
    }

    if (Number(edad) < 12 || Number(edad) > 60) {
        setMensaje({ texto: 'La edad debe estar entre 12 y 60 años.', tipo: 'alert-warning' })
        return
    }

    // 2. Armamos el Payload (El paquete de datos que Django espera)
    const payload = {
        rut: rut,
        nombre: nombre,
        apellido: apellido,
        fecha_nacimiento: fechaNacimiento, // Formato YYYY-MM-DD automático en input type="date"
        edad: Number(edad),
        direccion: direccion,
        telefono: telefono,
        email: email
    }

    // 3. Conexión real con tu Backend en Django
    try {
        // Asumiendo que tu backend corre en localhost:8000
        const respuesta = await axios.post('http://localhost:8000/api/pacientes/', payload);
        
        if (respuesta.status === 201) {
            setMensaje({ texto: 'Paciente registrada exitosamente en la Base de Datos.', tipo: 'alert-success' })
            // Limpiar formulario
            setRut(''); setNombre(''); setApellido(''); setFechaNacimiento('');
            setEdad(''); setDireccion(''); setTelefono(''); setEmail('');
        }
    } catch (error) {
        console.error("Error del servidor:", error.response?.data);
        // Mostrar el error exacto que devuelva el serializers.py de Django
        setMensaje({ 
            texto: 'Error al guardar: ' + JSON.stringify(error.response?.data || error.message), 
            tipo: 'alert-danger' 
        })
    }
  }

  return (
    <MainLayout>
      <h1>Gestión de Pacientes</h1>
      <p className="text-muted">Registro de nueva paciente.</p>

      <form onSubmit={handleSubmit} className="mt-4">
        {/* Usamos un sistema de grillas (row/col) de Bootstrap para que no quede tan largo hacia abajo */}
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

        {mensaje.texto && (
          <div className={`alert ${mensaje.tipo} mt-3`}>
            {mensaje.texto}
          </div>
        )}

        <button type="submit" className="btn btn-primary mt-3">
          Registrar paciente
        </button>
      </form>
    </MainLayout>
  )
}

export default Pacientes