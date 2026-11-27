import { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Aviso from '../../componentes/atomos/Aviso'
import Boton from '../../componentes/atomos/Boton'
import Titulo from '../../componentes/atomos/Titulo'
import CampoFormulario from '../../componentes/moleculas/CampoFormulario'
import { comunasDe, regionesChile } from '../../data/regiones'
import { actualizarUsuario } from '../../data/usuarios'
import { useSesion } from '../../hooks/useSesion'
import { hayErrores, validarCorreo, validarNombre } from '../../utils/validaciones'

function Perfil() {
  const { usuario, refrescarSesion } = useSesion()

  const [datos, setDatos] = useState({
    nombre: usuario.nombre,
    correo: usuario.correo,
    calle: usuario.calle ?? '',
    region: usuario.region ?? '',
    comuna: usuario.comuna ?? '',
  })
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState(null)
  const [guardando, setGuardando] = useState(false)

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
    setAviso(null)

    const encontrados = {
      nombre: validarNombre(datos.nombre),
      correo: validarCorreo(datos.correo),
    }

    setErrores(encontrados)

    if (hayErrores(encontrados)) {
      return
    }

    setGuardando(true)

    try {
      const actualizado = await actualizarUsuario(usuario.id, datos)
      refrescarSesion(actualizado)
      setAviso({ tono: 'exito', texto: 'Datos del perfil actualizados.' })
    } catch (fallo) {
      setErrores((actuales) => ({ ...actuales, ...fallo.campos }))
      setAviso({ tono: 'error', texto: fallo.message })
    }

    setGuardando(false)
  }

  return (
    <>
      <Titulo nivel={1} bajada="Información de la cuenta con la que estás conectado.">
        Perfil
      </Titulo>

      {aviso !== null && (
        <Aviso tono={aviso.tono} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <Form noValidate onSubmit={guardar} style={{ maxWidth: '40rem' }}>
        <CampoFormulario
          id="perfil-nombre"
          etiqueta="Nombre completo"
          valor={datos.nombre}
          onCambiar={(valor) => cambiar('nombre', valor)}
          error={errores.nombre}
          requerido
        />

        <CampoFormulario
          id="perfil-correo"
          etiqueta="Correo electrónico"
          tipo="email"
          valor={datos.correo}
          onCambiar={(valor) => cambiar('correo', valor)}
          error={errores.correo}
          requerido
        />

        <CampoFormulario
          id="perfil-calle"
          etiqueta="Calle y número"
          valor={datos.calle}
          onCambiar={(valor) => cambiar('calle', valor)}
        />

        <Row>
          <Col md={6}>
            <CampoFormulario
              id="perfil-region"
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
              id="perfil-comuna"
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

        <Boton tipo="submit" deshabilitado={guardando}>
          {guardando ? 'Guardando...' : 'Guardar cambios'}
        </Boton>
      </Form>
    </>
  )
}

export default Perfil
