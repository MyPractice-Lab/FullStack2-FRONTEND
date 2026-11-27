import { useCallback } from 'react'
import Table from 'react-bootstrap/Table'
import { Link, useParams } from 'react-router-dom'
import Etiqueta from '../../componentes/atomos/Etiqueta'
import Titulo from '../../componentes/atomos/Titulo'
import { listarOrdenes } from '../../data/ordenes'
import { obtenerUsuario } from '../../data/usuarios'
import { usePeticion } from '../../hooks/usePeticion'
import { formatearFecha, formatearPrecio } from '../../utils/formato'

function HistorialCompras() {
  const { id } = useParams()

  const pedirUsuario = useCallback(() => obtenerUsuario(id), [id])
  const peticionUsuario = usePeticion(pedirUsuario, [id])
  const peticionOrdenes = usePeticion(listarOrdenes)

  if (peticionUsuario.cargando || peticionOrdenes.cargando) {
    return <p className="text-muted">Cargando el historial...</p>
  }

  if (peticionUsuario.error !== null || peticionUsuario.datos === null) {
    return (
      <p className="text-muted">
        Ese usuario no existe. <Link to="/admin/usuarios">Volver al listado</Link>.
      </p>
    )
  }

  const usuario = peticionUsuario.datos
  const ordenes = (peticionOrdenes.datos ?? []).filter((orden) => orden.usuarioId === usuario.id)
  const gastado = ordenes
    .filter((orden) => orden.estado === 'pagada')
    .reduce((suma, orden) => suma + orden.totales.total, 0)

  return (
    <>
      <Titulo nivel={1} bajada={`Compras asociadas a ${usuario.correo}.`}>
        Historial de compras de {usuario.nombre}
      </Titulo>

      <p>
        Total comprado: <strong>{formatearPrecio(gastado)}</strong> en {ordenes.length}{' '}
        {ordenes.length === 1 ? 'orden' : 'órdenes'}.
      </p>

      {ordenes.length === 0 ? (
        <p className="text-muted">Esta cuenta todavía no tiene compras registradas.</p>
      ) : (
        <Table responsive bordered className="align-middle bg-white">
          <caption className="visually-hidden">Órdenes del usuario</caption>
          <thead>
            <tr>
              <th scope="col">Código</th>
              <th scope="col">Fecha</th>
              <th scope="col">Productos</th>
              <th scope="col">Total</th>
              <th scope="col">Estado</th>
              <th scope="col">Boleta</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.codigo}>
                <td>{orden.codigo}</td>
                <td>{formatearFecha(orden.fecha)}</td>
                <td>{orden.totales.unidades}</td>
                <td>{formatearPrecio(orden.totales.total)}</td>
                <td>
                  <Etiqueta tono={orden.estado === 'pagada' ? 'exito' : 'oferta'}>
                    {orden.estado === 'pagada' ? 'Pagada' : 'Rechazada'}
                  </Etiqueta>
                </td>
                <td>
                  <Link to={`/admin/ordenes/${orden.codigo}`}>Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Link to="/admin/usuarios">Volver al listado de usuarios</Link>
    </>
  )
}

export default HistorialCompras
