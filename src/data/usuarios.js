import { api } from '../api/cliente'

export function listarUsuarios() {
  return api.obtener('/usuarios')
}

export function obtenerUsuario(id) {
  return api.obtener(`/usuarios/${id}`)
}

export function crearUsuario(datos) {
  return api.crear('/usuarios', {
    nombre: datos.nombre,
    correo: datos.correo,
    clave: datos.clave,
    rol: datos.rol ?? 'cliente',
    region: datos.region ?? '',
    comuna: datos.comuna ?? '',
    calle: datos.calle ?? '',
    activo: datos.activo ?? true,
  })
}

export function actualizarUsuario(id, datos) {
  const cuerpo = {
    nombre: datos.nombre,
    correo: datos.correo,
    region: datos.region ?? '',
    comuna: datos.comuna ?? '',
    calle: datos.calle ?? '',
  }

  if (datos.clave !== undefined && datos.clave !== '') {
    cuerpo.clave = datos.clave
  }

  if (datos.rol !== undefined) {
    cuerpo.rol = datos.rol
  }

  if (datos.activo !== undefined) {
    cuerpo.activo = datos.activo
  }

  return api.reemplazar(`/usuarios/${id}`, cuerpo)
}

export function eliminarUsuario(id) {
  return api.borrar(`/usuarios/${id}`)
}
