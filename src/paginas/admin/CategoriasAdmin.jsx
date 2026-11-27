import { useState } from 'react'
import Table from 'react-bootstrap/Table'
import { Link } from 'react-router-dom'
import Aviso from '../../componentes/atomos/Aviso'
import Boton from '../../componentes/atomos/Boton'
import EstadoPeticion from '../../componentes/atomos/EstadoPeticion'
import Titulo from '../../componentes/atomos/Titulo'
import { eliminarCategoria } from '../../data/categorias'
import { listarProductos } from '../../data/productos'
import { useCatalogo } from '../../hooks/useCatalogo'
import { usePeticion } from '../../hooks/usePeticion'

function CategoriasAdmin() {
  const { categorias, cargando, error, recargar } = useCatalogo()
  const peticionProductos = usePeticion(listarProductos)
  const [aviso, setAviso] = useState(null)

  const productos = peticionProductos.datos ?? []

  async function borrar(categoria) {
    try {
      await eliminarCategoria(categoria.id)
      setAviso({ tono: 'exito', texto: `Se eliminó la categoría "${categoria.nombre}".` })
      recargar()
    } catch (fallo) {
      setAviso({ tono: 'error', texto: fallo.message })
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <Titulo nivel={1} bajada="Agrupan los productos dentro de la tienda.">
          Categorías
        </Titulo>
        <Boton as={Link} to="/admin/categorias/nueva">
          Nueva categoría
        </Boton>
      </div>

      {aviso !== null && (
        <Aviso tono={aviso.tono} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <EstadoPeticion
        cargando={cargando || peticionProductos.cargando}
        error={error ?? peticionProductos.error}
        mensaje="Cargando las categorías..."
      />

      <Table responsive bordered className="align-middle bg-white">
        <caption className="visually-hidden">Listado de categorías</caption>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Identificador</th>
            <th scope="col">Productos</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>
                <Link to={`/categorias/${categoria.slug}`}>{categoria.nombre}</Link>
              </td>
              <td>{categoria.slug}</td>
              <td>{productos.filter((producto) => producto.categoria === categoria.slug).length}</td>
              <td className="d-flex gap-2">
                <Boton
                  variante="secundario"
                  tamano="sm"
                  as={Link}
                  to={`/admin/categorias/${categoria.id}`}
                >
                  Editar
                </Boton>
                <Boton variante="peligro" tamano="sm" onClick={() => borrar(categoria)}>
                  Eliminar
                </Boton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  )
}

export default CategoriasAdmin
