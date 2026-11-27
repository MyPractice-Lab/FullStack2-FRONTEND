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

async function completarDespacho(pantalla) {
  await pantalla.getByRole('textbox', { name: 'Nombre' }).fill('Pedro')
  await pantalla.getByRole('textbox', { name: 'Apellidos' }).fill('Hacker')
  await pantalla.getByRole('textbox', { name: 'Correo' }).fill('pedro.hacker@example.com')
  await pantalla.getByRole('textbox', { name: 'Calle' }).fill('Los Crisantemos 456')
  await pantalla.getByRole('combobox', { name: 'Región' }).selectOptions('Metropolitana de Santiago')
  await pantalla.getByRole('combobox', { name: 'Comuna' }).selectOptions('Providencia')
}

beforeEach(() => {
  localStorage.clear()
})

test('el cliente completa la compra contra la API y llega a la boleta', async () => {
  const pantalla = await montar('/productos')

  await pantalla.getByRole('button', { name: 'Agregar' }).first().click()
  await expect
    .element(pantalla.getByText('Teclado mecánico Zone K80 RGB se agregó al carrito.'))
    .toBeVisible()

  await pantalla.getByRole('button', { name: /^Carrito/ }).click()
  await expect.element(pantalla.getByRole('heading', { name: 'Carrito de compras' })).toBeVisible()

  await pantalla.getByRole('button', { name: 'Comprar ahora' }).click()
  await expect.element(pantalla.getByRole('heading', { name: 'Carrito de compra' })).toBeVisible()

  await completarDespacho(pantalla)
  await pantalla.getByRole('button', { name: /Pagar ahora/ }).click()

  await expect
    .element(pantalla.getByRole('heading', { name: /Se ha realizado la compra/ }))
    .toBeVisible()
  await expect.element(pantalla.getByText(/^Código orden: ORDER/)).toBeVisible()

  expect(JSON.parse(localStorage.getItem(CLAVES.carrito))).toEqual([])
})

test('el pago rechazado conserva el carrito y ofrece reintentar', async () => {
  const pantalla = await montar('/productos')

  await pantalla.getByRole('button', { name: 'Agregar' }).first().click()
  await pantalla.getByRole('button', { name: /^Carrito/ }).click()
  await pantalla.getByRole('button', { name: 'Comprar ahora' }).click()

  await completarDespacho(pantalla)
  await pantalla.getByRole('radio', { name: 'Pago rechazado por el banco' }).click()
  await pantalla.getByRole('button', { name: /Pagar ahora/ }).click()

  await expect
    .element(pantalla.getByRole('heading', { name: /No se pudo realizar el pago/ }))
    .toBeVisible()
  await expect
    .element(pantalla.getByRole('button', { name: 'Volver a realizar el pago' }))
    .toBeVisible()

  expect(JSON.parse(localStorage.getItem(CLAVES.carrito))).toHaveLength(1)
})
