import { beforeEach, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'
import App from '../App'
import { CLAVES } from '../data/claves'
import { ConTienda } from './apoyo'

function montar(ruta) {
  return render(
    <ConTienda ruta={ruta}>
      <App />
    </ConTienda>,
  )
}

function botonEnviar(pantalla) {
  return pantalla.getByRole('main').getByRole('button', { name: 'Crear cuenta' })
}

function correoNuevo() {
  return `ana.rojas.${Date.now()}@gmail.com`
}

beforeEach(() => {
  localStorage.clear()
})

test('el formulario de registro muestra los errores propios de cada campo', async () => {
  const pantalla = await montar('/registro')

  await botonEnviar(pantalla).click()

  await expect.element(pantalla.getByText('El nombre completo es obligatorio.')).toBeVisible()
  await expect.element(pantalla.getByText('El correo es obligatorio.')).toBeVisible()
  await expect.element(pantalla.getByText('La contraseña es obligatoria.')).toBeVisible()
  await expect
    .element(pantalla.getByText('Debes aceptar los términos y condiciones para crear la cuenta.'))
    .toBeVisible()

  await pantalla.getByRole('textbox', { name: 'Nombre completo' }).fill('Ana')
  await pantalla.getByLabelText(/^Contraseña/).fill('corta1')
  await botonEnviar(pantalla).click()

  await expect
    .element(pantalla.getByText('Escribe nombre y apellido separados por un espacio.'))
    .toBeVisible()
  await expect
    .element(pantalla.getByText('La contraseña debe tener al menos 8 caracteres. Escribiste 6.'))
    .toBeVisible()

  expect(localStorage.getItem(CLAVES.sesion)).toBeNull()
})

test('el registro valido crea la cuenta en el backend y deja la sesion iniciada', async () => {
  const pantalla = await montar('/registro')
  const correo = correoNuevo()

  await pantalla.getByRole('textbox', { name: 'Nombre completo' }).fill('Ana Rojas')
  await pantalla.getByRole('textbox', { name: 'Correo electrónico' }).fill(correo)
  await pantalla.getByLabelText(/^Contraseña/).fill('Clave2026')
  await pantalla.getByLabelText(/^Repetir contraseña/).fill('Clave2026')
  await pantalla.getByRole('combobox', { name: 'Región' }).selectOptions('Valparaíso')
  await pantalla.getByRole('combobox', { name: 'Comuna' }).selectOptions('Viña del Mar')
  await pantalla
    .getByRole('checkbox', { name: 'Acepto los términos y condiciones de la tienda' })
    .click()

  await botonEnviar(pantalla).click()

  await expect
    .element(pantalla.getByText('Cuenta creada correctamente. Ya iniciaste sesión.'))
    .toBeVisible()

  const sesion = JSON.parse(localStorage.getItem(CLAVES.sesion))

  expect(sesion.correo).toBe(correo)
  expect(sesion.rol).toBe('cliente')
  expect(sesion.comuna).toBe('Viña del Mar')
  expect(localStorage.getItem('zone_token')).not.toBeNull()
})
