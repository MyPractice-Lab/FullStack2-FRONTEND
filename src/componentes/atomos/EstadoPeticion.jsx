import Aviso from './Aviso'

function EstadoPeticion({ cargando, error, mensaje = 'Cargando datos del servidor...' }) {
  if (cargando) {
    return <p className="text-muted">{mensaje}</p>
  }

  if (error !== null && error !== undefined) {
    return <Aviso tono="error">{error}</Aviso>
  }

  return null
}

export default EstadoPeticion
