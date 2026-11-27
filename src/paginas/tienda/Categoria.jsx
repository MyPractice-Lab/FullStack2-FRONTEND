import { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import EstadoPeticion from '../../componentes/atomos/EstadoPeticion'
import Titulo from '../../componentes/atomos/Titulo'
import RejillaProductos from '../../componentes/organismos/RejillaProductos'
import { obtenerCategoria } from '../../data/categorias'
import { listarProductosDeCategoria } from '../../data/productos'
import { useCarrito } from '../../hooks/useCarrito'
import { usePeticion } from '../../hooks/usePeticion'

function Categoria() {
  const { slug } = useParams()
  const { agregar } = useCarrito()

  const pedirCategoria = useCallback(() => obtenerCategoria(slug), [slug])
  const pedirProductos = useCallback(() => listarProductosDeCategoria(slug), [slug])

  const categoria = usePeticion(pedirCategoria, [slug])
  const productos = usePeticion(pedirProductos, [slug])

  if (categoria.cargando || productos.cargando) {
    return <p className="text-muted">Cargando la categoría...</p>
  }

  if (categoria.error !== null) {
    return (
      <p className="text-muted">
        Esa categoría no existe. <Link to="/categorias">Ver todas las categorías</Link>.
      </p>
    )
  }

  return (
    <>
      <Titulo nivel={1} bajada={categoria.datos.descripcion}>
        {categoria.datos.nombre}
      </Titulo>

      <EstadoPeticion cargando={false} error={productos.error} />

      <RejillaProductos
        productos={productos.datos ?? []}
        onAgregar={agregar}
        mensajeVacio="Todavía no hay productos en esta categoría."
      />
    </>
  )
}

export default Categoria
