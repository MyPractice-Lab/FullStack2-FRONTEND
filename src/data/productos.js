import { api } from '../api/cliente'

export function listarProductos() {
  return api.obtener('/productos')
}

export function listarProductosDeCategoria(slug) {
  return api.obtener(`/productos?categoria=${encodeURIComponent(slug)}`)
}

export function listarProductosCriticos() {
  return api.obtener('/productos/criticos')
}

export function obtenerProducto(id) {
  return api.obtener(`/productos/${id}`)
}

export function crearProducto(datos) {
  return api.crear('/productos', cuerpoDe(datos))
}

export function actualizarProducto(id, datos) {
  return api.reemplazar(`/productos/${id}`, cuerpoDe(datos))
}

export function eliminarProducto(id) {
  return api.borrar(`/productos/${id}`)
}

function cuerpoDe(datos) {
  return {
    nombre: datos.nombre,
    categoria: datos.categoria,
    precio: Number(datos.precio),
    oferta: datos.oferta ? Number(datos.oferta) : null,
    stock: Number(datos.stock),
    marca: datos.marca,
    garantia: datos.garantia,
    imagen: datos.imagen,
    descripcion: datos.descripcion,
  }
}
