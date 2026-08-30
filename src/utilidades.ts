/**
 * Ayudantes de formato y clasificación.
 *
 * Toda lectura de un campo que puede venir nulo o ausente pasa por aquí.
 * Es la única capa autorizada para decidir qué se muestra cuando falta un dato,
 * de modo que la regla no quede repartida por el JSX.
 */
import type { EstadoInventario, FiltroInventario, Producto } from './tipos'

const formateadorMoneda = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

const formateadorEntero = new Intl.NumberFormat('es-MX')

const formateadorFecha = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

/** Marcador único para los valores ausentes en toda la interfaz. */
export const SIN_DATO = '—'

/**
 * Devuelve el texto de un campo de texto opcional.
 * Cubre `null`, `undefined` y cadenas en blanco por igual.
 */
export function textoOpcional(valor: string | null | undefined, respaldo = SIN_DATO): string {
  if (valor === null || valor === undefined) return respaldo
  const limpio = valor.trim()
  return limpio.length > 0 ? limpio : respaldo
}

/** Formatea moneda. Un valor nulo nunca produce `NaN`. */
export function formatearMoneda(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'Sin precio'
  return formateadorMoneda.format(valor)
}

/** Formatea un entero. Un valor nulo no se convierte en cero. */
export function formatearEntero(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'Sin dato'
  return formateadorEntero.format(valor)
}

/**
 * Formatea una fecha ISO corta.
 * Nunca construye `new Date(null)`, que en JavaScript devuelve la época Unix
 * y mostraría "31 dic 1969" en lugar de reconocer el dato faltante.
 */
export function formatearFecha(valor: string | null | undefined): string {
  if (typeof valor !== 'string' || valor.trim() === '') return SIN_DATO
  const fecha = new Date(`${valor}T00:00:00`)
  if (Number.isNaN(fecha.getTime())) return SIN_DATO
  return formateadorFecha.format(fecha)
}

/**
 * Clasifica el inventario de un producto.
 * `stock === null` significa desconocido, no cero: se distingue de `agotado`.
 */
export function clasificarInventario(producto: Producto): EstadoInventario {
  if (typeof producto.stock !== 'number' || !Number.isFinite(producto.stock)) return 'sin-dato'
  if (producto.stock <= 0) return 'agotado'
  if (producto.stock < producto.stockMinimo) return 'bajo'
  return 'disponible'
}

/** Nombre visible de cualquier valor del filtro de inventario. */
export function etiquetaFiltroInventario(valor: FiltroInventario): string {
  if (valor === 'todos') return 'Todos'
  if (valor === 'atencion') return 'Requieren atención'
  return ETIQUETAS_INVENTARIO[valor]
}

/**
 * Un producto «requiere atención» cuando está por debajo de su mínimo o
 * agotado. Los que no tienen stock registrado quedan fuera: no se sabe.
 */
export function requiereAtencion(estado: EstadoInventario): boolean {
  return estado === 'bajo' || estado === 'agotado'
}

export const ETIQUETAS_INVENTARIO: Record<EstadoInventario, string> = {
  disponible: 'Disponible',
  bajo: 'Stock bajo',
  agotado: 'Agotado',
  'sin-dato': 'Sin dato',
}

/** Clases del punto y del texto del semáforo. El color nunca va solo. */
export const ESTILOS_INVENTARIO: Record<EstadoInventario, { punto: string; texto: string }> = {
  disponible: { punto: 'bg-ok', texto: 'text-ok' },
  bajo: { punto: 'bg-alerta', texto: 'text-alerta' },
  agotado: { punto: 'bg-critico', texto: 'text-critico' },
  'sin-dato': { punto: 'bg-neutro', texto: 'text-texto-tenue' },
}

/**
 * Distintivo de dos letras para el recuadro que abre cada fila.
 *
 * El sistema de diseño coloca ahí una miniatura de 48 px, pero el archivo de
 * datos no tiene imágenes. En lugar de un marcador de posición vacío, el
 * recuadro muestra las iniciales de la categoría: es un dato real del
 * registro, no un relleno.
 */
export function distintivoCategoria(categoria: string): string {
  const palabras = categoria
    .trim()
    .split(/\s+/)
    .filter((palabra) => palabra.length > 0)
  if (palabras.length === 0) return '··'
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase()
  return (palabras[0][0] + palabras[1][0]).toUpperCase()
}

/** Normaliza texto para buscar sin acentos ni diferencias de mayúsculas. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Promedio que ignora los valores nulos en vez de tratarlos como cero.
 * Devuelve `null` si no queda ningún valor utilizable.
 */
export function promedioSeguro(valores: Array<number | null | undefined>): number | null {
  const validos = valores.filter(
    (valor): valor is number => typeof valor === 'number' && Number.isFinite(valor),
  )
  if (validos.length === 0) return null
  return validos.reduce((suma, valor) => suma + valor, 0) / validos.length
}

/** Suma que ignora nulos. Devuelve `null` si no había nada que sumar. */
export function sumaSegura(valores: Array<number | null | undefined>): number | null {
  const validos = valores.filter(
    (valor): valor is number => typeof valor === 'number' && Number.isFinite(valor),
  )
  if (validos.length === 0) return null
  return validos.reduce((suma, valor) => suma + valor, 0)
}
