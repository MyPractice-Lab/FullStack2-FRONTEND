import { api } from '../api/cliente'

export function listarCategorias() {
  return api.obtener('/categorias')
}

export function obtenerCategoria(slug) {
  return api.obtener(`/categorias/${encodeURIComponent(slug)}`)
}

export async function obtenerCategoriaPorId(id) {
  const buscado = Number(id)
  const lista = await listarCategorias()

  return lista.find((categoria) => categoria.id === buscado) ?? null
}

export function crearCategoria(datos) {
  return api.crear('/categorias', cuerpoDe(datos))
}

export function actualizarCategoria(id, datos) {
  return api.reemplazar(`/categorias/${id}`, cuerpoDe(datos))
}

export function eliminarCategoria(id) {
  return api.borrar(`/categorias/${id}`)
}

function cuerpoDe(datos) {
  return {
    slug: datos.slug,
    nombre: datos.nombre,
    descripcion: datos.descripcion,
    imagen: datos.imagen,
  }
}
