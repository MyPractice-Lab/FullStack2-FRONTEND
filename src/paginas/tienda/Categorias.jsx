import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import EstadoPeticion from '../../componentes/atomos/EstadoPeticion'
import Titulo from '../../componentes/atomos/Titulo'
import TarjetaCategoria from '../../componentes/moleculas/TarjetaCategoria'
import RejillaProductos from '../../componentes/organismos/RejillaProductos'
import { listarProductos } from '../../data/productos'
import { useCarrito } from '../../hooks/useCarrito'
import { useCatalogo } from '../../hooks/useCatalogo'
import { usePeticion } from '../../hooks/usePeticion'

function Categorias() {
  const { agregar } = useCarrito()
  const { categorias } = useCatalogo()
  const { datos, cargando, error } = usePeticion(listarProductos)

  const productos = datos ?? []

  return (
    <>
      <Titulo nivel={1} bajada="Los productos separados por tipo.">
        Categorías
      </Titulo>

      <EstadoPeticion cargando={cargando} error={error} mensaje="Cargando el catálogo..." />

      <Row xs={2} lg={4} className="g-3 mb-5">
        {categorias.map((categoria) => (
          <Col key={categoria.id}>
            <TarjetaCategoria
              categoria={categoria}
              cantidad={productos.filter((item) => item.categoria === categoria.slug).length}
            />
          </Col>
        ))}
      </Row>

      {categorias.map((categoria) => (
        <section key={categoria.id} className="mb-5">
          <Titulo nivel={2} bajada={categoria.descripcion}>
            {categoria.nombre}
          </Titulo>
          <RejillaProductos
            productos={productos.filter((item) => item.categoria === categoria.slug)}
            onAgregar={agregar}
            mensajeVacio="Todavía no hay productos en esta categoría."
          />
        </section>
      ))}
    </>
  )
}

export default Categorias
