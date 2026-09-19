import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children, rolRequerido }) {
  const rolActual = localStorage.getItem('user_role')

  // Si el usuario intenta escribir la URL manualmente pero no es administrador,
  // el sistema lo intercepta en milisegundos y lo patea de vuelta al Dashboard.
  if (rolActual !== rolRequerido) {
    return <Navigate to="/dashboard" replace />
  }

  // Si tiene el poder, lo dejamos pasar a ver el componente que solicitó.
  return children
}

export default ProtectedRoute