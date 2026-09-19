import { Routes, Route, Navigate } from 'react-router-dom'

// Importamos todas las pantallas que construimos
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Partos from './pages/Partos'
import RecienNacidos from './pages/RecienNacidos'
import Altas from './pages/Altas'
import Reportes from './pages/Reportes'

// Importamos el guardián y la nueva pantalla de administrador
import ProtectedRoute from './components/ProtectedRoute'
import AdminUsuarios from './pages/AdminUsuarios'

function App() {
  return (
    <Routes>
      {/* Ruta pública: El Login */}
      <Route path="/" element={<Login />} />

      {/* Rutas privadas generales del sistema */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pacientes" element={<Pacientes />} />
      <Route path="/partos" element={<Partos />} />
      <Route path="/recien-nacidos" element={<RecienNacidos />} />
      <Route path="/altas" element={<Altas />} />
      <Route path="/reportes" element={<Reportes />} />

      {/* RUTA PROTEGIDA: Solo accesible para el Administrador del Sistema */}
      <Route 
        path="/admin/usuarios" 
        element={
          <ProtectedRoute rolRequerido="ADMIN_SISTEMA">
            <AdminUsuarios />
          </ProtectedRoute>
        } 
      />

      {/* Si el usuario ingresa una ruta que no existe, lo devolvemos al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App