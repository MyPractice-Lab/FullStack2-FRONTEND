import { Navigate, Outlet } from 'react-router-dom'
import { useSesion } from '../../hooks/useSesion'

function RutaAdmin() {
  const { autenticado, esAdministrador, revalidando } = useSesion()

  if (revalidando) {
    return <p className="text-muted">Verificando tu sesión...</p>
  }

  if (autenticado === false) {
    return <Navigate to="/login" replace />
  }

  if (esAdministrador === false) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RutaAdmin
