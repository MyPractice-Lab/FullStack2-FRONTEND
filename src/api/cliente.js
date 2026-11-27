import { leerToken } from './token'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export class ErrorApi extends Error {
  constructor(estado, mensaje, campos) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.estado = estado
    this.campos = campos ?? {}
  }
}

function cabeceras(cuerpo) {
  const salida = {}
  const token = leerToken()

  if (cuerpo !== undefined) {
    salida['Content-Type'] = 'application/json'
  }

  if (token !== null) {
    salida.Authorization = `Bearer ${token}`
  }

  return salida
}

async function cuerpoDe(respuesta) {
  if (respuesta.status === 204) {
    return null
  }

  const texto = await respuesta.text()

  if (texto === '') {
    return null
  }

  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

async function pedir(metodo, ruta, cuerpo) {
  let respuesta

  try {
    const opciones = { method: metodo, headers: cabeceras(cuerpo) }

    if (cuerpo !== undefined) {
      opciones.body = JSON.stringify(cuerpo)
    }

    respuesta = await fetch(`${BASE}${ruta}`, opciones)
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor. Revisa que el backend esté andando.')
  }

  const datos = await cuerpoDe(respuesta)

  if (respuesta.ok) {
    return datos
  }

  if (respuesta.status === 401) {
    throw new ErrorApi(401, datos?.mensaje ?? 'Tu sesión expiró. Vuelve a iniciar sesión.')
  }

  if (respuesta.status === 403) {
    throw new ErrorApi(403, datos?.mensaje ?? 'No tienes permisos para hacer esto.')
  }

  throw new ErrorApi(
    respuesta.status,
    datos?.mensaje ?? 'Ocurrió un error inesperado en el servidor.',
    datos?.campos,
  )
}

export const api = {
  obtener: (ruta) => pedir('GET', ruta),
  crear: (ruta, cuerpo) => pedir('POST', ruta, cuerpo),
  reemplazar: (ruta, cuerpo) => pedir('PUT', ruta, cuerpo),
  parchar: (ruta, cuerpo) => pedir('PATCH', ruta, cuerpo),
  borrar: (ruta) => pedir('DELETE', ruta),
}
