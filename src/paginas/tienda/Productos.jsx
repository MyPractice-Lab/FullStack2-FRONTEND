import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import EstadoPeticion from '../../componentes/atomos/EstadoPeticion'
import Titulo from '../../componentes/atomos/Titulo'
import FiltrosCatalogo from '../../componentes/organismos/FiltrosCatalogo'
import RejillaProductos from '../../componentes/organismos/RejillaProductos'
import { listarProductos } from '../../data/productos'
import { useCarrito } from '../../hooks/useCarrito'
import { useCatalogo } from '../../hooks/useCatalogo'
import { usePeticion } from '../../hooks/usePeticion'
import { filtrarProductos } from '../../utils/catalogo'

function Productos() {
  const [parametros] = useSearchParams()
  const { agregar } = useCarrito()
  const { categorias } = useCatalogo()
  const { datos, cargando, error } = usePeticion(listarProductos)

  const [criterios, setCriterios] = useState({
    texto: parametros.get('buscar') ?? '',
    categoria: parametros.get('categoria') ?? 'todas',
    orden: 'relevancia',
  })

  const productos = filtrarProductos(datos ?? [], criterios)

  return (
    <>
      <Titulo nivel={1} bajada="Todo el catálogo de The Zone en un solo lugar.">
        Productos
      </Titulo>

      <EstadoPeticion cargando={cargando} error={error} mensaje="Cargando el catálogo..." />

      <FiltrosCatalogo
        criterios={criterios}
        categorias={categorias}
        onCambiar={setCriterios}
        resultados={productos.length}
      />

      <RejillaProductos
        productos={productos}
        onAgregar={agregar}
        mensajeVacio="No hay productos que coincidan con la búsqueda."
      />
    </>
  )
}

export default Productos
