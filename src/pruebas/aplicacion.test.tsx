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

/** Construye un archivo mínimo con los campos que se quieran forzar. */
function archivoCon(productos: Array<Record<string, unknown>>) {
  return JSON.stringify({
    meta: { fuente: 'prueba', generadoPor: 'test', version: 1, totalRegistros: productos.length },
    productos,
  })
}

const productoBase = {
  id: 'SKU-0001',
  nombre: 'Producto de prueba',
  categoria: 'Abarrotes',
  marca: 'La Rivera',
  proveedor: 'Distribuidora Centro',
  almacen: 'Almacén Central',
  precioUnitario: 120,
  precioMayoreo: 98,
  unidadesPorCaja: 12,
  stock: 300,
  stockMinimo: 50,
  descuento: 0,
  activo: true,
  fechaAlta: '2024-03-15',
  descripcion: 'Descripción de prueba.',
}

/**
 * Monta la aplicación en la ruta indicada y espera a que el efecto de carga
 * se resuelva. La pantalla inicial es el panel; las pruebas de la tabla piden
 * el catálogo explícitamente.
 */
async function montar(ruta: 'panel' | 'catalogo' = 'catalogo') {
  window.location.hash = `#/${ruta}`
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

    expect(texto).toContain('Mostrando')
    expect(contenedor.querySelector('table')).not.toBeNull()
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

  it('pagina los resultados en lugar de volcarlos todos', async () => {
    simularRespuesta(archivoReal)
    const texto = await montar()

    expect(texto).toContain('Mostrando 1–24 de 240')
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(24)
    expect(contenedor.querySelector('nav[aria-label="Paginación de resultados"]')).not.toBeNull()
  })

  it('expone los resultados como una tabla con encabezados ordenables', async () => {
    simularRespuesta(archivoReal)
    await montar()

    // Una tabla de verdad: un lector de pantalla anuncia filas y columnas en
    // lugar de una ristra de botones sueltos.
    const encabezados = [...contenedor.querySelectorAll('thead th')]
    expect(encabezados.length).toBeGreaterThan(4)
    expect(encabezados.every((th) => th.getAttribute('scope') === 'col')).toBe(true)

    // La columna por la que se ordena declara su sentido.
    const ordenada = contenedor.querySelector('thead th[aria-sort]')
    expect(ordenada).not.toBeNull()
    expect(ordenada?.getAttribute('aria-sort')).toBe('ascending')
  })
})

describe('tolerancia a campos ausentes en la vista', () => {
  it('muestra las etiquetas de respaldo de cada campo vacío', async () => {
    simularRespuesta(
      archivoCon([
        {
          ...productoBase,
          marca: null,
          proveedor: null,
          precioUnitario: null,
          precioMayoreo: null,
          stock: null,
          fechaAlta: null,
          descripcion: null,
          almacen: undefined,
        },
      ]),
    )

    const texto = await montar()

    expect(texto).toContain('Sin marca')
    expect(texto).toContain('Sin proveedor')
    expect(texto).toContain('Sin asignar')
    expect(texto).toContain('Sin precio')
    expect(texto).toContain('Sin dato')
    expect(texto).not.toContain('NaN')
    expect(texto).not.toContain('undefined')
  })

  it('distingue el stock ausente del agotado', async () => {
    simularRespuesta(
      archivoCon([
        { ...productoBase, id: 'SKU-0001', nombre: 'Sin registro', stock: null },
        { ...productoBase, id: 'SKU-0002', nombre: 'Sin existencias', stock: 0 },
      ]),
    )

    const texto = await montar()

    expect(texto).toContain('Sin dato')
    expect(texto).toContain('Agotado')
  })
})

describe('resistencia ante un archivo defectuoso', () => {
  it('avisa cuando la respuesta no es correcta en lugar de quedarse en blanco', async () => {
    simularRespuesta('{}', false, 500)
    const texto = await montar()

    expect(contenedor.querySelector('[role="alert"]')).not.toBeNull()
    expect(texto).toContain('No se pudo cargar el archivo de datos')
    expect(texto).toContain('500')
    expect(texto).toContain('Reintentar')
  })

  it('avisa cuando el archivo no contiene el arreglo de productos', async () => {
    simularRespuesta('{"meta":{},"otraCosa":[]}')
    const texto = await montar()

    expect(texto).toContain('no contiene un arreglo')
  })

  it('descarta los registros sin id, nombre o categoría y lo informa', async () => {
    simularRespuesta(
      archivoCon([
        { ...productoBase, nombre: 'Producto válido' },
        { nombre: 'Registro roto sin id ni categoría' },
      ]),
    )

    const texto = await montar()

    expect(texto).toContain('Se descartaron 1 registros')
    expect(texto).toContain('Producto válido')
  })
})

describe('panel', () => {
  it('abre como pantalla inicial cuando no hay ruta', async () => {
    simularRespuesta(archivoReal)
    window.location.hash = ''

    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    raiz = createRoot(contenedor)
    await act(async () => {
      raiz?.render(<App />)
    })
    await act(async () => {
      await Promise.resolve()
    })

    expect(contenedor.textContent).toContain('Valor del inventario')
    expect(contenedor.textContent).toContain('Cola de reposición')
    // El panel no muestra la tabla: son dos pantallas distintas.
    expect(contenedor.querySelector('table')).toBeNull()
  })

  it('presenta los cuatro indicadores del negocio', async () => {
    simularRespuesta(archivoReal)
    const texto = await montar('panel')

    expect(texto).toContain('Valor del inventario')
    expect(texto).toContain('Requieren reposición')
    expect(texto).toContain('Costo de reponer')
    expect(texto).toContain('Integridad del catálogo')
    expect(texto).not.toContain('NaN')
    expect(texto).not.toContain('Sin datos')
  })

  it('ordena la cola de reposición con los agotados primero', async () => {
    simularRespuesta(
      archivoCon([
        { ...productoBase, id: 'SKU-0001', nombre: 'Bajo barato', stock: 5, precioUnitario: 10 },
        { ...productoBase, id: 'SKU-0002', nombre: 'Sin existencias', stock: 0 },
        { ...productoBase, id: 'SKU-0003', nombre: 'Bajo caro', stock: 5, precioUnitario: 900 },
        { ...productoBase, id: 'SKU-0004', nombre: 'Con inventario', stock: 400 },
      ]),
    )

    await montar('panel')

    const filas = [...contenedor.querySelectorAll('li')]
      .map((li) => li.textContent ?? '')
      .filter((texto) => texto.includes('SKU-'))

    // Lo agotado va primero porque ya está perdiendo la venta; dentro del
    // resto manda el dinero comprometido, no el orden alfabético.
    expect(filas[0]).toContain('Sin existencias')
    expect(filas[1]).toContain('Bajo caro')
    expect(filas[2]).toContain('Bajo barato')
    expect(filas.some((fila) => fila.includes('Con inventario'))).toBe(false)
  })

  it('excluye del valor del inventario los registros incompletos', async () => {
    simularRespuesta(
      archivoCon([
        { ...productoBase, id: 'SKU-0001', precioUnitario: 100, stock: 10 },
        { ...productoBase, id: 'SKU-0002', precioUnitario: null, stock: 999 },
        { ...productoBase, id: 'SKU-0003', precioUnitario: 500, stock: null },
      ]),
    )

    const texto = await montar('panel')

    // Solo el primero aporta: 100 × 10 = 1000. Contar los otros como cero
    // pasaría desapercibido; contarlos con precio cero abarataría el almacén.
    expect(texto).toContain('$1,000')
    expect(texto).toContain('2 sin precio o sin existencias, excluidos')
  })
})
