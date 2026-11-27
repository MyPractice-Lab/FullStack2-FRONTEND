import { useState } from 'react'
import Table from 'react-bootstrap/Table'
import { Link } from 'react-router-dom'
import Aviso from '../../componentes/atomos/Aviso'
import Boton from '../../componentes/atomos/Boton'
import Etiqueta from '../../componentes/atomos/Etiqueta'
import EstadoPeticion from '../../componentes/atomos/EstadoPeticion'
import Titulo from '../../componentes/atomos/Titulo'
import { eliminarUsuario, listarUsuarios } from '../../data/usuarios'
import { usePeticion } from '../../hooks/usePeticion'
import { useSesion } from '../../hooks/useSesion'

function UsuariosAdmin() {
  const { usuario: conectado } = useSesion()
  const { datos, cargando, error, recargar } = usePeticion(listarUsuarios)
  const [aviso, setAviso] = useState(null)

  const usuarios = datos ?? []

  async function borrar(usuario) {
    if (usuario.id === conectado.id) {
      setAviso({ tono: 'error', texto: 'No puedes eliminar la cuenta con la que estás conectado.' })
      return
    }

    if (!window.confirm(`¿Eliminar la cuenta de ${usuario.nombre}?`)) {
      return
    }

    try {
      await eliminarUsuario(usuario.id)
      setAviso({ tono: 'exito', texto: `Se eliminó la cuenta de ${usuario.nombre}.` })
      recargar()
    } catch (fallo) {
      setAviso({ tono: 'error', texto: fallo.message })
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <Titulo nivel={1} bajada="Cuentas registradas y su rol dentro del sistema.">
          Usuarios
        </Titulo>
        <Boton as={Link} to="/admin/usuarios/nuevo">
          Nuevo usuario
        </Boton>
      </div>

      {aviso !== null && (
        <Aviso tono={aviso.tono} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <EstadoPeticion cargando={cargando} error={error} mensaje="Cargando las cuentas..." />

      <Table responsive bordered className="align-middle bg-white">
        <caption className="visually-hidden">Listado de usuarios registrados</caption>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Correo</th>
            <th scope="col">Rol</th>
            <th scope="col">Comuna</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.correo}</td>
              <td>
                <Etiqueta tono={usuario.rol === 'administrador' ? 'info' : 'neutro'}>
                  {usuario.rol}
                </Etiqueta>
              </td>
              <td>{usuario.comuna || 'Sin registrar'}</td>
              <td>
                <Etiqueta tono={usuario.activo ? 'exito' : 'aviso'}>
                  {usuario.activo ? 'Activa' : 'Desactivada'}
                </Etiqueta>
              </td>
              <td className="d-flex gap-2 flex-wrap">
                <Boton
                  variante="secundario"
                  tamano="sm"
                  as={Link}
                  to={`/admin/usuarios/${usuario.id}`}
                >
                  Editar
                </Boton>
                <Boton
                  variante="neutro"
                  tamano="sm"
                  as={Link}
                  to={`/admin/usuarios/${usuario.id}/compras`}
                >
                  Historial
                </Boton>
                <Boton variante="peligro" tamano="sm" onClick={() => borrar(usuario)}>
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

export default UsuariosAdmin
