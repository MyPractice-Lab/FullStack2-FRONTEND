import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { listarCategorias } from '../data/categorias'

export const CatalogoContexto = createContext(null)

export function ProveedorCatalogo({ children }) {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  const recargar = useCallback(() => setIntento((numero) => numero + 1), [])

  useEffect(() => {
    let vigente = true

    setCargando(true)
    setError(null)

    listarCategorias()
      .then((lista) => {
        if (vigente) {
          setCategorias(lista)
        }
      })
      .catch((fallo) => {
        if (vigente) {
          setError(fallo.message)
          setCategorias([])
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
  }, [intento])

  const nombrePorSlug = useMemo(
    () => new Map(categorias.map((categoria) => [categoria.slug, categoria.nombre])),
    [categorias],
  )

  const valor = useMemo(
    () => ({ categorias, nombrePorSlug, cargando, error, recargar }),
    [categorias, nombrePorSlug, cargando, error, recargar],
  )

  return <CatalogoContexto.Provider value={valor}>{children}</CatalogoContexto.Provider>
}
