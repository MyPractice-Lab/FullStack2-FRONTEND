import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { leerToken } from '../api/token'
import {
  autenticar,
  borrarSesion,
  guardarSesion,
  leerSesion,
  registrar,
  revalidarSesion,
} from '../data/sesion'

export const SesionContexto = createContext(null)

export function ProveedorSesion({ children }) {
  const [usuario, setUsuario] = useState(() => leerSesion())
  const [revalidando, setRevalidando] = useState(() => leerToken() !== null)

  useEffect(() => {
    if (leerToken() === null) {
      setRevalidando(false)
      return
    }

    let vigente = true

    revalidarSesion()
      .then((datos) => {
        if (!vigente) {
          return
        }

        guardarSesion(datos)
        setUsuario(datos)
      })
      .catch(() => {
        if (!vigente) {
          return
        }

        borrarSesion()
        setUsuario(null)
      })
      .finally(() => {
        if (vigente) {
          setRevalidando(false)
        }
      })

    return () => {
      vigente = false
    }
  }, [])

  const iniciarSesion = useCallback(async (correo, clave) => {
    try {
      const autenticado = await autenticar(correo, clave)
      setUsuario(autenticado)
      return { ok: true, usuario: autenticado }
    } catch (fallo) {
      return { ok: false, motivo: fallo.message }
    }
  }, [])

  const registrarCliente = useCallback(async (datos) => {
    try {
      const creado = await registrar(datos)
      setUsuario(creado)
      return { ok: true, usuario: creado }
    } catch (fallo) {
      return { ok: false, motivo: fallo.message, campos: fallo.campos }
    }
  }, [])

  const cerrarSesion = useCallback(() => {
    borrarSesion()
    setUsuario(null)
  }, [])

  const refrescarSesion = useCallback((datos) => {
    guardarSesion(datos)
    setUsuario(datos)
  }, [])

  const valor = useMemo(
    () => ({
      usuario,
      revalidando,
      autenticado: usuario !== null,
      esAdministrador: usuario?.rol === 'administrador',
      iniciarSesion,
      registrarCliente,
      cerrarSesion,
      refrescarSesion,
    }),
    [usuario, revalidando, iniciarSesion, registrarCliente, cerrarSesion, refrescarSesion],
  )

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}
