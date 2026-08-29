/**
 * Verifica la tabla de tolerancia a nulos de la skill `catalogo-mayorista`.
 * Cada prueba corresponde a una fila de esa tabla: si una falla, la interfaz
 * dejó de cumplir el contrato con el archivo origen.
 */
import { describe, expect, it } from 'vitest'
import type { Producto } from '../tipos'
import {
  clasificarInventario,
  formatearEntero,
  formatearFecha,
  formatearMoneda,
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

describe('normalizar', () => {
  it('permite buscar sin acentos ni mayúsculas', () => {
    expect(normalizar('Papelería')).toBe('papeleria')
    expect(normalizar('  ALMACÉN Central ')).toBe('almacen central')
  })
})
