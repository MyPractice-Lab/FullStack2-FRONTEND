import { useCallback, useEffect, useState } from 'react'

export function usePeticion(peticion, dependencias = []) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [intento, setIntento] = useState(0)

  const recargar = useCallback(() => setIntento((numero) => numero + 1), [])

  useEffect(() => {
    let vigente = true

    setCargando(true)
    setError(null)

    peticion()
      .then((resultado) => {
        if (vigente) {
          setDatos(resultado)
        }
      })
      .catch((fallo) => {
        if (vigente) {
          setError(fallo.message)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, intento])

  return { datos, cargando, error, recargar }
}
