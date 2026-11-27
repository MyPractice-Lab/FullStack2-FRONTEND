const CLAVE_TOKEN = 'zone_token'

export function leerToken() {
  return localStorage.getItem(CLAVE_TOKEN)
}

export function guardarToken(token) {
  localStorage.setItem(CLAVE_TOKEN, token)
  return token
}

export function borrarToken() {
  localStorage.removeItem(CLAVE_TOKEN)
}
