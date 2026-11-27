import { useContext } from 'react'
import { CatalogoContexto } from '../contexto/CatalogoContexto'

export function useCatalogo() {
  const contexto = useContext(CatalogoContexto)

  if (contexto === null) {
    throw new Error('useCatalogo debe usarse dentro de ProveedorCatalogo')
  }

  return contexto
}
