/**
 * Verifica la tabla de tolerancia a nulos de la skill `catalogo-mayorista`.
 * Cada prueba corresponde a una fila de esa tabla: si una falla, la interfaz
 * dejó de cumplir el contrato con el archivo origen.
 */
import { describe, expect, it } from 'vitest'
import type { Producto } from '../tipos'
import {
  clasificarInventario,
  formatearAntiguedad,
  formatearEan,
  formatearEntero,
  formatearFecha,
  formatearGarantia,
  formatearMagnitud,
  formatearMoneda,
  formatearPlazo,
  normalizar,
  promedioSeguro,
  sumaSegura,
  textoOpcional,
} from '../utilidades'

const base: Producto = {
  id: 'SKU-0001',
  nombre: 'Arroz blanco 1 kg',
  categoria: 'Abarrotes',
  marca: 'La Rivera',
  proveedor: 'Distribuidora Centro',
  almacen: 'Almacén Central',
  precioUnitario: 100,
  precioMayoreo: 82,
  unidadesPorCaja: 12,
  stock: 300,
  stockMinimo: 50,
  descuento: 0,
  activo: true,
  fechaAlta: '2024-03-15',
  descripcion: 'Producto de prueba.',
  pesoKg: 1.2,
  volumenL: 0.9,
  material: 'Cartón',
  origen: 'México',
  plazoEntregaHoras: 48,
  garantiaMeses: null,
  ean: '7501234567890',
  codigoArancelario: null,
  ultimaSincronizacion: '2026-08-30T07:00:00.000Z',
}

const producto = (cambios: Partial<Producto>): Producto => ({ ...base, ...cambios })

describe('textoOpcional', () => {
  it('cubre null, undefined y cadenas en blanco con el mismo respaldo', () => {
    expect(textoOpcional(null, 'Sin marca')).toBe('Sin marca')
    expect(textoOpcional(undefined, 'Sin marca')).toBe('Sin marca')
    expect(textoOpcional('   ', 'Sin marca')).toBe('Sin marca')
  })

  it('conserva el valor real recortado', () => {
    expect(textoOpcional('  Nortex  ')).toBe('Nortex')
  })
})

describe('formatearMoneda', () => {
  it('nunca produce NaN ante un valor ausente', () => {
    expect(formatearMoneda(null)).toBe('Sin precio')
    expect(formatearMoneda(undefined)).toBe('Sin precio')
    expect(formatearMoneda(Number.NaN)).toBe('Sin precio')
    expect(formatearMoneda(Number.POSITIVE_INFINITY)).toBe('Sin precio')
  })

  it('formatea un importe válido', () => {
    expect(formatearMoneda(1234.5)).toContain('1,234.50')
  })
})

describe('formatearEntero', () => {
  it('distingue el dato ausente del cero', () => {
    expect(formatearEntero(null)).toBe('Sin dato')
    expect(formatearEntero(0)).toBe('0')
  })
})

describe('formatearFecha', () => {
  it('no interpreta null como la época Unix', () => {
    // `new Date(null)` devuelve 1970-01-01: sin guarda, un registro sin fecha
    // mostraría "31 dic 1969" como si fuera un dato real.
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('')).toBe('—')
    expect(formatearFecha('fecha-invalida')).toBe('—')
    expect(formatearFecha(null)).not.toContain('1969')
    expect(formatearFecha(null)).not.toContain('1970')
  })

  it('formatea una fecha ISO válida', () => {
    expect(formatearFecha('2024-03-15')).toContain('2024')
  })
})

describe('clasificarInventario', () => {
  it('trata el stock nulo como desconocido, no como agotado', () => {
    expect(clasificarInventario(producto({ stock: null }))).toBe('sin-dato')
    expect(clasificarInventario(producto({ stock: 0 }))).toBe('agotado')
  })

  it('marca stock bajo comparando contra el mínimo de cada producto', () => {
    expect(clasificarInventario(producto({ stock: 40, stockMinimo: 50 }))).toBe('bajo')
    expect(clasificarInventario(producto({ stock: 60, stockMinimo: 50 }))).toBe('disponible')
  })
})

describe('promedioSeguro y sumaSegura', () => {
  it('excluyen los nulos en vez de contarlos como cero', () => {
    expect(promedioSeguro([100, null, 200])).toBe(150)
    expect(sumaSegura([100, null, 200])).toBe(300)
  })

  it('devuelven null cuando no queda ningún valor utilizable', () => {
    expect(promedioSeguro([null, undefined])).toBeNull()
    expect(sumaSegura([])).toBeNull()
  })
})

describe('ficha logística', () => {
  it('distingue «no aplica» de un dato pendiente', () => {
    // La garantía en null significa que el artículo no la lleva. Mostrarlo
    // como «Sin registrar» sugeriría que falta capturarlo.
    expect(formatearGarantia(null)).toBe('No aplica')
    expect(formatearGarantia(12)).toBe('12 meses')
  })

  it('nunca convierte una magnitud ausente en cero', () => {
    expect(formatearMagnitud(null, 'kg')).toBe('Sin registrar')
    expect(formatearMagnitud(1.5, 'kg')).toBe('1.50 kg')
  })

  it('expresa el plazo en la unidad que se lee mejor', () => {
    expect(formatearPlazo(12)).toBe('12 h')
    expect(formatearPlazo(24)).toBe('1 día')
    expect(formatearPlazo(168)).toBe('7 días')
    expect(formatearPlazo(null)).toBe('Sin registrar')
  })

  it('agrupa el EAN para poder dictarlo y tolera su ausencia', () => {
    expect(formatearEan('7501234567890')).toBe('7 501234 567890')
    expect(formatearEan(null)).toBe('Sin registrar')
  })

  it('resuelve la antigüedad de la sincronización sin romperse', () => {
    expect(formatearAntiguedad(null)).toBe('Sin registrar')
    expect(formatearAntiguedad('no es una fecha')).toBe('Sin registrar')
    expect(formatearAntiguedad(new Date(Date.now() - 3 * 3600_000).toISOString())).toContain('3')
  })
})

describe('normalizar', () => {
  it('permite buscar sin acentos ni mayúsculas', () => {
    expect(normalizar('Papelería')).toBe('papeleria')
    expect(normalizar('  ALMACÉN Central ')).toBe('almacen central')
  })
})
