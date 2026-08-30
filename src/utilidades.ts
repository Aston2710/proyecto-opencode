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

// Se compone a mano en lugar de usar `style: 'currency'` con notación
// compacta: en es-MX eso coloca el símbolo detrás —«24.8 M$»— y se lee mal en
// un indicador.
const formateadorCompacto = new Intl.NumberFormat('es-MX', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const formateadorSinCentavos = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

/**
 * Importe para indicadores. Tres tramos, porque abreviar siempre pierde
 * precisión donde no hace falta:
 *
 * - menos de mil: importe exacto con centavos;
 * - hasta el millón: importe agrupado sin centavos, que sigue siendo legible;
 * - a partir del millón: abreviado, `$24.8 M`, donde la magnitud importa más
 *   que el peso suelto.
 */
export function formatearMonedaCompacta(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'Sin datos'
  const magnitud = Math.abs(valor)
  if (magnitud < 1000) return formatearMoneda(valor)
  if (magnitud < 1_000_000) return formateadorSinCentavos.format(valor)
  return `$${formateadorCompacto.format(valor)}`
}

/** Porcentaje con un decimal como mucho. */
export function formatearPorcentaje(valor: number | null | undefined): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'Sin datos'
  return `${valor % 1 === 0 ? valor : valor.toFixed(1)}%`
}

/** Formatea una magnitud con su unidad. Un nulo no se convierte en cero. */
export function formatearMagnitud(
  valor: number | null | undefined,
  unidad: string,
  decimales = 2,
): string {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return 'Sin registrar'
  return `${valor.toFixed(decimales)} ${unidad}`
}

/**
 * Convierte horas a la unidad que se lee mejor. Un plazo de entrega de 168
 * horas se entiende como «7 días», no contando.
 */
export function formatearPlazo(horas: number | null | undefined): string {
  if (typeof horas !== 'number' || !Number.isFinite(horas)) return 'Sin registrar'
  if (horas < 24) return `${horas} h`
  const dias = horas / 24
  return `${Number.isInteger(dias) ? dias : dias.toFixed(1)} día${dias === 1 ? '' : 's'}`
}

/**
 * Garantía en meses. `null` aquí significa que el artículo no la lleva, que es
 * distinto de un dato pendiente de capturar.
 */
export function formatearGarantia(meses: number | null | undefined): string {
  if (typeof meses !== 'number' || !Number.isFinite(meses)) return 'No aplica'
  return `${meses} meses`
}

/** Agrupa un EAN-13 para que se pueda leer y dictar. */
export function formatearEan(ean: string | null | undefined): string {
  if (typeof ean !== 'string' || ean.trim() === '') return 'Sin registrar'
  const limpio = ean.trim()
  if (limpio.length !== 13) return limpio
  return `${limpio.slice(0, 1)} ${limpio.slice(1, 7)} ${limpio.slice(7, 13)}`
}

const formateadorRelativo = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })

/**
 * Antigüedad de la última sincronización con el ERP, relativa al momento de
 * lectura. Se apoya en `Intl` en lugar de calcular cadenas a mano.
 */
export function formatearAntiguedad(iso: string | null | undefined): string {
  if (typeof iso !== 'string' || iso.trim() === '') return 'Sin registrar'
  const momento = new Date(iso)
  if (Number.isNaN(momento.getTime())) return 'Sin registrar'

  const minutos = Math.round((momento.getTime() - Date.now()) / 60000)
  if (Math.abs(minutos) < 60) return formateadorRelativo.format(minutos, 'minute')
  const horas = Math.round(minutos / 60)
  if (Math.abs(horas) < 24) return formateadorRelativo.format(horas, 'hour')
  return formateadorRelativo.format(Math.round(horas / 24), 'day')
}

/**
 * Un descuento solo significa algo si hay un precio del que descontarlo.
 *
 * El archivo origen permite que un producto tenga regla de descuento y no
 * tenga precio capturado: son dos altas distintas del ERP. Mostrar «-18 %»
 * junto a «Sin precio» haría pasar por sensata una combinación que no lo es,
 * así que el porcentaje no se dibuja y la incoherencia se reporta aparte, en
 * el estado de captura del catálogo.
 */
export function descuentoAplicable(producto: Producto): boolean {
  return (
    producto.descuento > 0 &&
    typeof producto.precioUnitario === 'number' &&
    Number.isFinite(producto.precioUnitario)
  )
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

/**
 * Clases del punto y del texto del semáforo.
 *
 * El punto usa el tono vivo y el texto el legible: a 6 px, tres tonos oscuros
 * de saturación parecida se confunden entre sí, que es justo lo contrario de
 * lo que un semáforo debe hacer. El color nunca comunica solo: siempre va
 * acompañado del texto.
 */
export const ESTILOS_INVENTARIO: Record<EstadoInventario, { punto: string; texto: string }> = {
  disponible: { punto: 'bg-ok-punto', texto: 'text-ok' },
  bajo: { punto: 'bg-alerta-punto', texto: 'text-alerta' },
  agotado: { punto: 'bg-critico-punto', texto: 'text-critico' },
  'sin-dato': { punto: 'bg-neutro-punto', texto: 'text-texto-tenue' },
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
