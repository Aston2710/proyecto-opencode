/**
 * Pruebas de humo de la aplicación completa contra el archivo de datos real.
 * Sustituyen a la inspección manual de la consola del navegador: si un `null`
 * del archivo llegara sin filtrar al DOM, el render fallaría aquí.
 *
 * Se monta con `react-dom/client` directamente, sin librería de pruebas de
 * componentes, para no añadir dependencias al proyecto.
 */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
// Se importa el archivo real como texto crudo con el cargador de Vite, para no
// depender de las rutas del sistema de archivos ni de los tipos de Node.
import archivoReal from '../../public/datos/productos.json?raw'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

let contenedor: HTMLDivElement
let raiz: Root | null = null

/** Sustituye `fetch` por una respuesta controlada. */
function simularRespuesta(cuerpo: string, ok = true, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      status,
      json: async () => JSON.parse(cuerpo) as unknown,
    })),
  )
}

/** Monta la aplicación y espera a que el efecto de carga se resuelva. */
async function montar() {
  contenedor = document.createElement('div')
  document.body.appendChild(contenedor)
  raiz = createRoot(contenedor)
  await act(async () => {
    raiz?.render(<App />)
  })
  // Segunda pasada: deja que se propaguen las actualizaciones de estado
  // disparadas por la promesa del fetch.
  await act(async () => {
    await Promise.resolve()
  })
  return contenedor.textContent ?? ''
}

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // Recharts mide su contenedor; en jsdom todo mide cero y avisa por consola.
  // Se le da un tamaño para que la gráfica se monte de verdad.
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(900)
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300)
})

afterEach(() => {
  if (raiz !== null) {
    const actual = raiz
    void act(() => {
      actual.unmount()
    })
    raiz = null
  }
  contenedor?.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('carga con el archivo de datos real', () => {
  it('renderiza el catálogo sin emitir errores en consola', async () => {
    const errores = vi.spyOn(console, 'error').mockImplementation(() => {})
    simularRespuesta(archivoReal)

    const texto = await montar()

    expect(texto).toContain('en pantalla')
    expect(errores).not.toHaveBeenCalled()
  })

  it('no deja ningún NaN ni undefined visible en la página', async () => {
    simularRespuesta(archivoReal)
    const texto = await montar()

    expect(texto).not.toContain('NaN')
    expect(texto).not.toContain('undefined')
    expect(texto).not.toContain('null')
    // `new Date(null)` produciría estas fechas si faltara la guarda.
    expect(texto).not.toContain('1969')
    expect(texto).not.toContain('1970')
  })

  it('muestra las etiquetas de respaldo de los campos ausentes', async () => {
    simularRespuesta(archivoReal)
    const texto = await montar()

    expect(texto).toContain('Sin marca')
    expect(texto).toContain('Sin precio')
    expect(texto).toContain('Sin dato')
    expect(texto).toContain('Sin asignar')
  })
})

describe('resistencia ante un archivo defectuoso', () => {
  it('avisa cuando la respuesta no es correcta en lugar de quedarse en blanco', async () => {
    simularRespuesta('{}', false, 500)
    const texto = await montar()

    expect(contenedor.querySelector('[role="alert"]')).not.toBeNull()
    expect(texto).toContain('No se pudo cargar el archivo de datos')
    expect(texto).toContain('500')
  })

  it('avisa cuando el archivo no contiene el arreglo de productos', async () => {
    simularRespuesta('{"meta":{},"otraCosa":[]}')
    const texto = await montar()

    expect(texto).toContain('no contiene un arreglo')
  })

  it('descarta los registros sin id, nombre o categoría y lo informa', async () => {
    simularRespuesta(
      JSON.stringify({
        meta: { fuente: 'prueba', generadoPor: 'test', version: 1, totalRegistros: 2 },
        productos: [
          {
            id: 'SKU-0001',
            nombre: 'Producto válido',
            categoria: 'Abarrotes',
            marca: null,
            proveedor: null,
            precioUnitario: null,
            precioMayoreo: null,
            unidadesPorCaja: 1,
            stock: null,
            stockMinimo: 10,
            descuento: 0,
            activo: true,
            fechaAlta: null,
            descripcion: null,
          },
          { nombre: 'Registro roto sin id ni categoría' },
        ],
      }),
    )

    const texto = await montar()

    expect(texto).toContain('Se descartaron 1 registros')
    expect(texto).toContain('Producto válido')
  })
})
