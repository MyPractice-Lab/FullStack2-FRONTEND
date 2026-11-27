import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { guardarCarrito, leerCarrito } from '../data/carrito'
import { listarProductos } from '../data/productos'
import {
  agregarLinea,
  cambiarCantidadLinea,
  contarUnidades,
  quitarLinea,
} from '../utils/carrito'
import { precioFinal } from '../utils/catalogo'
import { calcularTotales } from '../utils/totales'

export const CarritoContexto = createContext(null)

export function ProveedorCarrito({ children }) {
  const [lineas, setLineas] = useState(() => leerCarrito())
  const [catalogo, setCatalogo] = useState([])
  const [cargando, setCargando] = useState(true)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    let vigente = true

    listarProductos()
      .then((productos) => {
        if (vigente) {
          setCatalogo(productos)
        }
      })
      .catch(() => {
        if (vigente) {
          setCatalogo([])
        }
      })
      .finally(() => {
        if (vigente) {
          setCargando(false)
        }
      })

    return () => {
      vigente = false
    }
  }, [lineas])

  useEffect(() => {
    guardarCarrito(lineas)
  }, [lineas])

  useEffect(() => {
    if (aviso === '') {
      return
    }

    const reloj = setTimeout(() => setAviso(''), 2500)
    return () => clearTimeout(reloj)
  }, [aviso])

  const agregar = useCallback((producto, cantidad = 1) => {
    setLineas((actuales) => agregarLinea(actuales, producto.id, cantidad))
    setAviso(`${producto.nombre} se agregó al carrito.`)
  }, [])

  const cambiarCantidad = useCallback((id, cantidad) => {
    setLineas((actuales) => cambiarCantidadLinea(actuales, id, cantidad))
  }, [])

  const quitar = useCallback((id) => {
    setLineas((actuales) => quitarLinea(actuales, id))
  }, [])

  const vaciar = useCallback(() => {
    setLineas([])
  }, [])

  const detalle = useMemo(() => {
    return lineas
      .map((linea) => {
        const producto = catalogo.find((item) => item.id === linea.id)

        if (producto === undefined) {
          return null
        }

        return {
          id: producto.id,
          nombre: producto.nombre,
          imagen: producto.imagen,
          precio: precioFinal(producto),
          cantidad: linea.cantidad,
          subtotal: precioFinal(producto) * linea.cantidad,
        }
      })
      .filter((linea) => linea !== null)
  }, [lineas, catalogo])

  const valor = useMemo(
    () => ({
      lineas,
      detalle,
      cargando,
      totales: calcularTotales(detalle),
      unidades: contarUnidades(lineas),
      aviso,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
    }),
    [lineas, detalle, cargando, aviso, agregar, cambiarCantidad, quitar, vaciar],
  )

  return <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>
}
