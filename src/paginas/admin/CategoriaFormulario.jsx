import { useCallback, useEffect, useState } from 'react'
import Form from 'react-bootstrap/Form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Aviso from '../../componentes/atomos/Aviso'
import Boton from '../../componentes/atomos/Boton'
import Titulo from '../../componentes/atomos/Titulo'
import CampoFormulario from '../../componentes/moleculas/CampoFormulario'
import {
  actualizarCategoria,
  crearCategoria,
  obtenerCategoriaPorId,
} from '../../data/categorias'
import { useCatalogo } from '../../hooks/useCatalogo'
import { usePeticion } from '../../hooks/usePeticion'
import { hayErrores, validarRequerido } from '../../utils/validaciones'

const VACIA = { nombre: '', descripcion: '', imagen: '' }

function CategoriaFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()
  const { recargar } = useCatalogo()

  const pedirCategoria = useCallback(
    () => (id === undefined ? Promise.resolve(null) : obtenerCategoriaPorId(id)),
    [id],
  )
  const { datos: existente, cargando, error } = usePeticion(pedirCategoria, [id])

  const [datos, setDatos] = useState(VACIA)
  const [errores, setErrores] = useState({})
  const [fallo, setFallo] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (existente !== null) {
      setDatos({
        nombre: existente.nombre,
        descripcion: existente.descripcion,
        imagen: existente.imagen,
      })
    }
  }, [existente])

  if (cargando) {
    return <p className="text-muted">Cargando la categoría...</p>
  }

  if (id !== undefined && (error !== null || existente === null)) {
    return (
      <p className="text-muted">
        Esa categoría no existe. <Link to="/admin/categorias">Volver al listado</Link>.
      </p>
    )
  }

  function cambiar(campo, valor) {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }))
  }

  async function guardar(evento) {
    evento.preventDefault()
    setFallo(null)

    const encontrados = {
      nombre: validarRequerido(datos.nombre, 'El nombre de la categoría es obligatorio.'),
      descripcion: validarRequerido(datos.descripcion, 'Escribe una descripción breve.'),
    }

    setErrores(encontrados)

    if (hayErrores(encontrados)) {
      return
    }

    setGuardando(true)

    try {
      if (existente === null) {
        await crearCategoria(datos)
      } else {
        await actualizarCategoria(existente.id, { ...datos, slug: existente.slug })
      }
    } catch (error) {
      setGuardando(false)
      setFallo(error.message)
      return
    }

    setGuardando(false)
    recargar()
    navegar('/admin/categorias')
  }

  return (
    <>
      <Titulo nivel={1} bajada={existente === null ? 'Agrupa productos bajo un nuevo nombre.' : `Editando ${existente.nombre}.`}>
        {existente === null ? 'Nueva categoría' : 'Editar categoría'}
      </Titulo>

      {fallo !== null && <Aviso tono="error">{fallo}</Aviso>}

      <Form noValidate onSubmit={guardar} style={{ maxWidth: '40rem' }}>
        <CampoFormulario
          id="categoria-nombre"
          etiqueta="Nombre"
          valor={datos.nombre}
          onCambiar={(valor) => cambiar('nombre', valor)}
          error={errores.nombre}
          requerido
        />

        <CampoFormulario
          id="categoria-descripcion"
          etiqueta="Descripción"
          tipo="textarea"
          filas={3}
          valor={datos.descripcion}
          onCambiar={(valor) => cambiar('descripcion', valor)}
          error={errores.descripcion}
          requerido
        />

        <CampoFormulario
          id="categoria-imagen"
          etiqueta="Ruta de la imagen"
          valor={datos.imagen}
          onCambiar={(valor) => cambiar('imagen', valor)}
          ayuda="Ej: /assets/img/teclado.jpg"
        />

        <div className="d-flex gap-2">
          <Boton tipo="submit" deshabilitado={guardando}>
            {existente === null ? 'Crear categoría' : 'Guardar cambios'}
          </Boton>
          <Boton variante="neutro" as={Link} to="/admin/categorias">
            Cancelar
          </Boton>
        </div>
      </Form>
    </>
  )
}

export default CategoriaFormulario
