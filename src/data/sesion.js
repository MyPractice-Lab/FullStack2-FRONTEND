import { api } from '../api/cliente'
import { borrarToken, guardarToken } from '../api/token'
import { borrar, guardar, leer } from './almacenamiento'
import { CLAVES } from './claves'

export function leerSesion() {
  return leer(CLAVES.sesion)
}

export function guardarSesion(usuario) {
  return guardar(CLAVES.sesion, usuario)
}

export function borrarSesion() {
  borrar(CLAVES.sesion)
  borrarToken()
}

export async function autenticar(correo, clave) {
  const sesion = await api.crear('/auth/login', { correo, clave })

  guardarToken(sesion.token)
  guardarSesion(sesion.usuario)

  return sesion.usuario
}

export async function registrar(datos) {
  const sesion = await api.crear('/auth/registro', {
    nombre: datos.nombre,
    correo: datos.correo,
    clave: datos.clave,
    region: datos.region ?? '',
    comuna: datos.comuna ?? '',
    calle: datos.calle ?? '',
  })

  guardarToken(sesion.token)
  guardarSesion(sesion.usuario)

  return sesion.usuario
}

export function revalidarSesion() {
  return api.obtener('/auth/yo')
}
