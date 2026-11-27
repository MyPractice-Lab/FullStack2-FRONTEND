import { useCallback, useEffect, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Aviso from '../../componentes/atomos/Aviso'
import Boton from '../../componentes/atomos/Boton'
import Titulo from '../../componentes/atomos/Titulo'
import CampoFormulario from '../../componentes/moleculas/CampoFormulario'
import { comunasDe, regionesChile } from '../../data/regiones'
import { actualizarUsuario, crearUsuario, obtenerUsuario } from '../../data/usuarios'
import { usePeticion } from '../../hooks/usePeticion'
import {
  hayErrores,
  sugerenciaCorreo,
  validarClave,
  validarCorreo,
  validarNombre,
  validarRequerido,
} from '../../utils/validaciones'

const ROLES = [
  { valor: 'cliente', texto: 'Cliente' },
  { valor: 'administrador', texto: 'Administrador' },
]

const VACIO = {
  nombre: '',
  correo: '',
  clave: '',
  rol: 'cliente',
  region: '',
  comuna: '',
  calle: '',
  activo: true,
}

function UsuarioFormulario() {
  const { id } = useParams()
  const navegar = useNavigate()

  const pedirUsuario = useCallback(
    () => (id === undefined ? Promise.resolve(null) : obtenerUsuario(id)),
    [id],
  )
  const { datos: existente, cargando, error } = usePeticion(pedirUsuario, [id])

  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [fallo, setFallo] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (existente !== null) {
      setDatos({ ...existente, clave: '' })
    }
  }, [existente])

  if (cargando) {
    return <p className="text-muted">Cargando la cuenta...</p>
  }

  if (id !== undefined && (error !== null || existente === null)) {
    return (
      <p className="text-muted">
        Ese usuario no existe. <Link to="/admin/usuarios">Volver al listado</Link>.
      </p>
    )
  }

  function cambiar(campo, valor) {
    setDatos((actuales) => {
      if (campo === 'region') {
        return { ...actuales, region: valor, comuna: '' }
      }

      return { ...actuales, [campo]: valor }
    })
  }

  async function guardar(evento) {
    evento.preventDefault()
    setFallo(null)

    const encontrados = {
      nombre: validarNombre(datos.nombre),
      correo: validarCorreo(datos.correo),
      rol: validarRequerido(datos.rol, 'Elige el rol de la cuenta.'),
      clave: existente === null || datos.clave !== '' ? validarClave(datos.clave) : null,
    }

    setErrores(encontrados)

    if (hayErrores(encontrados)) {
      return
    }

    setGuardando(true)

    try {
      if (existente === null) {
        await crearUsuario(datos)
      } else {
        const cambios = { ...datos }

        if (cambios.clave === '') {
          delete cambios.clave
        }

        await actualizarUsuario(existente.id, cambios)
      }
    } catch (error) {
      setGuardando(false)
      setErrores((actuales) => ({ ...actuales, ...error.campos }))
      setFallo(error.message)
      return
    }

    setGuardando(false)
    navegar('/admin/usuarios')
  }

  return (
    <>
      <Titulo
        nivel={1}
        bajada={existente === null ? 'Crea una cuenta desde la administración.' : `Editando ${existente.nombre}.`}
      >
        {existente === null ? 'Nuevo usuario' : 'Editar usuario'}
      </Titulo>

      {fallo !== null && <Aviso tono="error">{fallo}</Aviso>}

      <Form noValidate onSubmit={guardar} style={{ maxWidth: '44rem' }}>
        <CampoFormulario
          id="usuario-nombre"
          etiqueta="Nombre completo"
          valor={datos.nombre}
          onCambiar={(valor) => cambiar('nombre', valor)}
          error={errores.nombre}
          requerido
        />

        <Row>
          <Col md={7}>
            <CampoFormulario
              id="usuario-correo"
              etiqueta="Correo electrónico"
              tipo="email"
              valor={datos.correo}
              onCambiar={(valor) => cambiar('correo', valor)}
              error={errores.correo}
              sugerencia={sugerenciaCorreo(datos.correo)}
              onAceptarSugerencia={(valor) => cambiar('correo', valor)}
              requerido
            />
          </Col>
          <Col md={5}>
            <CampoFormulario
              id="usuario-rol"
              etiqueta="Rol"
              tipo="select"
              valor={datos.rol}
              onCambiar={(valor) => cambiar('rol', valor)}
              error={errores.rol}
              opciones={ROLES}
              marcador="Selecciona un rol"
              requerido
            />
          </Col>
        </Row>

        <CampoFormulario
          id="usuario-clave"
          etiqueta="Contraseña"
          tipo="password"
          valor={datos.clave}
          onCambiar={(valor) => cambiar('clave', valor)}
          error={errores.clave}
          ayuda={
            existente === null
              ? 'Mínimo 8 caracteres, con un número y una mayúscula.'
              : 'Déjala vacía para conservar la contraseña actual.'
          }
          requerido={existente === null}
        />

        <CampoFormulario
          id="usuario-calle"
          etiqueta="Calle y número"
          valor={datos.calle}
          onCambiar={(valor) => cambiar('calle', valor)}
        />

        <Row>
          <Col md={6}>
            <CampoFormulario
              id="usuario-region"
              etiqueta="Región"
              tipo="select"
              valor={datos.region}
              onCambiar={(valor) => cambiar('region', valor)}
              opciones={regionesChile.map((region) => ({
                valor: region.nombre,
                texto: region.nombre,
              }))}
              marcador="Selecciona una región"
            />
          </Col>
          <Col md={6}>
            <CampoFormulario
              id="usuario-comuna"
              etiqueta="Comuna"
              tipo="select"
              valor={datos.comuna}
              onCambiar={(valor) => cambiar('comuna', valor)}
              opciones={comunasDe(datos.region).map((comuna) => ({
                valor: comuna,
                texto: comuna,
              }))}
              marcador="Selecciona una comuna"
              deshabilitado={!datos.region}
            />
          </Col>
        </Row>

        <CampoFormulario
          id="usuario-activo"
          etiqueta="Cuenta activa"
          tipo="checkbox"
          valor={datos.activo}
          onCambiar={(valor) => cambiar('activo', valor)}
        />

        <div className="d-flex gap-2">
          <Boton tipo="submit" deshabilitado={guardando}>
            {existente === null ? 'Crear usuario' : 'Guardar cambios'}
          </Boton>
          <Boton variante="neutro" as={Link} to="/admin/usuarios">
            Cancelar
          </Boton>
        </div>
      </Form>
    </>
  )
}

export default UsuarioFormulario
