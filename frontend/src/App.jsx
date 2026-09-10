// frontend/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'

// Importamos todas las pantallas que construimos
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Partos from './pages/Partos'
import RecienNacidos from './pages/RecienNacidos'
import Altas from './pages/Altas'
import Reportes from './pages/Reportes'

function App() {
  return (
    <Routes>
      {/* Ruta pública: El Login */}
      <Route path="/" element={<Login />} />

      {/* Rutas privadas del sistema */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pacientes" element={<Pacientes />} />
      <Route path="/partos" element={<Partos />} />
      <Route path="/recien-nacidos" element={<RecienNacidos />} />
      <Route path="/altas" element={<Altas />} />
      <Route path="/reportes" element={<Reportes />} />

      {/* Si el usuario ingresa una ruta que no existe, lo devolvemos al login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App