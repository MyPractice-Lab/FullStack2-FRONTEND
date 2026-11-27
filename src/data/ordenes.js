import { api } from '../api/cliente'

export function listarOrdenes() {
  return api.obtener('/ordenes')
}

export function obtenerOrden(codigo) {
  return api.obtener(`/ordenes/${encodeURIComponent(codigo)}`)
}

export function listarMisOrdenes() {
  return api.obtener('/ordenes/mias')
}

export function crearOrden({ estado, cliente, direccion, lineas }) {
  return api.crear('/ordenes', {
    estado,
    cliente,
    direccion,
    lineas: lineas.map((linea) => ({ id: linea.id, cantidad: linea.cantidad })),
  })
}

export function actualizarEstadoOrden(codigo, estado) {
  return api.parchar(`/ordenes/${encodeURIComponent(codigo)}/estado`, { estado })
}
