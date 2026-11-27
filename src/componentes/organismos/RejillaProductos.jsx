import { useContext } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { CatalogoContexto } from '../../contexto/CatalogoContexto'
import TarjetaProducto from '../moleculas/TarjetaProducto'

const SIN_NOMBRES = new Map()

function RejillaProductos({ productos, onAgregar, mensajeVacio = 'No hay productos que mostrar.' }) {
  const catalogo = useContext(CatalogoContexto)
  const nombres = catalogo === null ? SIN_NOMBRES : catalogo.nombrePorSlug

  if (productos.length === 0) {
    return <p className="text-muted">{mensajeVacio}</p>
  }

  return (
    <Row xs={1} sm={2} lg={4} className="g-3">
      {productos.map((producto) => (
        <Col key={producto.id}>
          <TarjetaProducto
            producto={producto}
            onAgregar={onAgregar}
            nombreCategoria={nombres.get(producto.categoria)}
          />
        </Col>
      ))}
    </Row>
  )
}

export default RejillaProductos
