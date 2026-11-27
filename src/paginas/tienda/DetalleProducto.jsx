import { useCallback, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Link, useParams } from 'react-router-dom'
import Boton from '../../componentes/atomos/Boton'
import Etiqueta from '../../componentes/atomos/Etiqueta'
import ImagenProducto from '../../componentes/atomos/ImagenProducto'
import Precio from '../../componentes/atomos/Precio'
import FichaTecnica from '../../componentes/moleculas/FichaTecnica'
import { obtenerProducto } from '../../data/productos'
import { useCarrito } from '../../hooks/useCarrito'
import { useCatalogo } from '../../hooks/useCatalogo'
import { usePeticion } from '../../hooks/usePeticion'
import { precioFinal, tieneOferta } from '../../utils/catalogo'

function DetalleProducto() {
  const { id } = useParams()
  const { agregar } = useCarrito()
  const { nombrePorSlug } = useCatalogo()
  const [cantidad, setCantidad] = useState(1)

  const pedirProducto = useCallback(() => obtenerProducto(id), [id])
  const { datos: producto, cargando, error } = usePeticion(pedirProducto, [id])

  if (cargando) {
    return <p className="text-muted">Cargando el producto...</p>
  }

  if (error !== null || producto === null) {
    return (
      <p className="text-muted">
        El producto solicitado no existe. <Link to="/productos">Volver al catálogo</Link>.
      </p>
    )
  }

  const nombreCategoria = nombrePorSlug.get(producto.categoria) ?? producto.categoria
  const enOferta = tieneOferta(producto)
  const sinStock = producto.stock === 0

  return (
    <Row className="g-4">
      <Col md={5}>
        <ImagenProducto origen={producto.imagen} descripcion={producto.nombre} ficha />
      </Col>

      <Col md={7}>
        <div className="mb-2 d-flex gap-2">
          <Etiqueta>{nombreCategoria}</Etiqueta>
          {enOferta && <Etiqueta tono="oferta">En oferta</Etiqueta>}
        </div>

        <h1 className="h3">{producto.nombre}</h1>
        <p>{producto.descripcion}</p>

        <Precio valor={precioFinal(producto)} antes={enOferta ? producto.precio : null} />

        <FichaTecnica
          filas={[
            { campo: 'Marca', valor: producto.marca },
            { campo: 'Categoría', valor: nombreCategoria },
            { campo: 'Garantía', valor: producto.garantia },
            { campo: 'Stock', valor: sinStock ? 'Agotado' : `${producto.stock} unidades` },
            { campo: 'Despacho', valor: 'A todo Chile en 3 a 5 días hábiles' },
          ]}
        />

        <Row className="g-2 align-items-end">
          <Col xs={4} md={3}>
            <Form.Label htmlFor="cantidad-detalle">Cantidad</Form.Label>
            <Form.Control
              id="cantidad-detalle"
              type="number"
              min="1"
              max={producto.stock || 1}
              value={cantidad}
              onChange={(evento) => setCantidad(Number(evento.target.value))}
              disabled={sinStock}
            />
          </Col>
          <Col xs={8} md={5}>
            <Boton
              bloque
              deshabilitado={sinStock}
              onClick={() => agregar(producto, Math.max(1, cantidad))}
            >
              {sinStock ? 'Sin stock' : 'Agregar al carrito'}
            </Boton>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default DetalleProducto
