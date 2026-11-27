import EstadoPeticion from '../../componentes/atomos/EstadoPeticion'
import Titulo from '../../componentes/atomos/Titulo'
import RejillaProductos from '../../componentes/organismos/RejillaProductos'
import { listarProductos } from '../../data/productos'
import { useCarrito } from '../../hooks/useCarrito'
import { usePeticion } from '../../hooks/usePeticion'
import { tieneOferta } from '../../utils/catalogo'

function Ofertas() {
  const { agregar } = useCarrito()
  const { datos, cargando, error } = usePeticion(listarProductos)

  const ofertas = (datos ?? []).filter(tieneOferta)

  return (
    <>
      <Titulo nivel={1} bajada="Precios rebajados mientras dure el stock.">
        Ofertas
      </Titulo>

      <EstadoPeticion cargando={cargando} error={error} mensaje="Cargando las ofertas..." />

      <RejillaProductos
        productos={ofertas}
        onAgregar={agregar}
        mensajeVacio="Por ahora no hay productos en oferta."
      />
    </>
  )
}

export default Ofertas
