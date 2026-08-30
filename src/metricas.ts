/**
 * Indicadores del negocio.
 *
 * Funciones puras sobre el catálogo, separadas de React para poder probarlas
 * sin montar nada. Todas comparten una regla: **un dato ausente se excluye del
 * cálculo y se reporta aparte**. Tratarlo como cero produciría un inventario
 * más barato de lo que es y un catálogo más sano de lo que está.
 */
import type { Producto } from './tipos'
import { clasificarInventario, requiereAtencion } from './utilidades'

export interface ResumenNegocio {
  /** Suma de existencias por precio unitario. El dinero parado en almacén. */
  valorInventario: number
  /** Productos que no entraron en la suma por faltarles precio o existencias. */
  excluidosDelValor: number

  /** Productos por debajo del mínimo o agotados. */
  necesitanReposicion: number
  agotados: number
  bajoMinimo: number

  /** Lo que cuesta comprar lo justo para volver al mínimo de cada uno. */
  costoReposicion: number
  /** Productos cuyo costo de reposición no se pudo calcular por falta de precio. */
  reposicionSinPrecio: number

  /** Porcentaje de registros sin ningún hueco en los campos comerciales. */
  integridad: number
  registrosConHuecos: number

  totalProductos: number
}

/** Campos cuya ausencia impide operar con el producto. */
const CAMPOS_COMERCIALES = [
  'precioUnitario',
  'precioMayoreo',
  'stock',
  'marca',
  'proveedor',
] as const

function tieneHueco(producto: Producto): boolean {
  if (producto.almacen === null || producto.almacen === undefined) return true
  return CAMPOS_COMERCIALES.some((campo) => producto[campo] === null)
}

export function resumirNegocio(productos: Producto[]): ResumenNegocio {
  let valorInventario = 0
  let excluidosDelValor = 0
  let agotados = 0
  let bajoMinimo = 0
  let costoReposicion = 0
  let reposicionSinPrecio = 0
  let registrosConHuecos = 0

  for (const producto of productos) {
    const precio = producto.precioUnitario
    const stock = producto.stock
    const hayPrecio = typeof precio === 'number' && Number.isFinite(precio)
    const hayStock = typeof stock === 'number' && Number.isFinite(stock)

    if (hayPrecio && hayStock) {
      valorInventario += precio * stock
    } else {
      excluidosDelValor += 1
    }

    const estado = clasificarInventario(producto)
    if (estado === 'agotado') agotados += 1
    if (estado === 'bajo') bajoMinimo += 1

    if (requiereAtencion(estado)) {
      const faltante = producto.stockMinimo - (hayStock ? stock : 0)
      if (hayPrecio) {
        costoReposicion += faltante * precio
      } else {
        reposicionSinPrecio += 1
      }
    }

    if (tieneHueco(producto)) registrosConHuecos += 1
  }

  const total = productos.length

  return {
    valorInventario,
    excluidosDelValor,
    necesitanReposicion: agotados + bajoMinimo,
    agotados,
    bajoMinimo,
    costoReposicion,
    reposicionSinPrecio,
    integridad: total === 0 ? 0 : ((total - registrosConHuecos) / total) * 100,
    registrosConHuecos,
    totalProductos: total,
  }
}

/**
 * Cola de reposición, ordenada por urgencia real y no alfabéticamente.
 *
 * Primero lo agotado, porque ya se está perdiendo la venta. Dentro de cada
 * grupo manda el dinero: reponer un faltante caro corre más prisa que uno
 * barato. Los productos sin precio se ordenan al final del grupo, no se
 * descartan: siguen necesitando reposición aunque no se pueda cuantificar.
 */
export function colaReposicion(productos: Producto[]): Producto[] {
  const urgentes = productos.filter((producto) =>
    requiereAtencion(clasificarInventario(producto)),
  )

  const faltanteValorado = (producto: Producto): number => {
    const precio = producto.precioUnitario
    if (typeof precio !== 'number' || !Number.isFinite(precio)) return -1
    const stock = typeof producto.stock === 'number' ? producto.stock : 0
    return (producto.stockMinimo - stock) * precio
  }

  return urgentes.sort((a, b) => {
    const agotadoA = clasificarInventario(a) === 'agotado' ? 0 : 1
    const agotadoB = clasificarInventario(b) === 'agotado' ? 0 : 1
    if (agotadoA !== agotadoB) return agotadoA - agotadoB
    return faltanteValorado(b) - faltanteValorado(a)
  })
}

export interface HuecoCatalogo {
  clave: string
  etiqueta: string
  conteo: number
  /** Por qué importa, en una línea. */
  consecuencia: string
}

/**
 * Inventario de huecos del archivo, cada uno con su consecuencia operativa.
 * No es una curiosidad técnica: cada fila es trabajo pendiente de captura.
 */
export function inventariarHuecos(productos: Producto[]): HuecoCatalogo[] {
  const contar = (predicado: (producto: Producto) => boolean) =>
    productos.filter(predicado).length

  return [
    {
      clave: 'sin-precio',
      etiqueta: 'Sin precio',
      conteo: contar((p) => p.precioUnitario === null),
      consecuencia: 'No se pueden cotizar ni valorar',
    },
    {
      clave: 'sin-stock',
      etiqueta: 'Sin existencias registradas',
      conteo: contar((p) => p.stock === null),
      consecuencia: 'Quedan fuera del cálculo de reposición',
    },
    {
      clave: 'sin-proveedor',
      etiqueta: 'Sin proveedor',
      conteo: contar((p) => p.proveedor === null),
      consecuencia: 'No hay a quién comprarlos',
    },
    {
      clave: 'inactivos-con-existencias',
      etiqueta: 'Inactivos con existencias',
      conteo: contar((p) => !p.activo && typeof p.stock === 'number' && p.stock > 0),
      consecuencia: 'Capital inmovilizado que no se vende',
    },
  ].filter((hueco) => hueco.conteo > 0)
}

/**
 * Marca de sincronización más reciente del catálogo.
 * Es la que interesa mostrar: dice cuán fresca es la información en pantalla.
 */
export function ultimaSincronizacion(productos: Producto[]): string | null {
  let masReciente: string | null = null

  for (const producto of productos) {
    const marca = producto.ultimaSincronizacion
    if (typeof marca !== 'string' || marca.trim() === '') continue
    if (Number.isNaN(new Date(marca).getTime())) continue
    if (masReciente === null || marca > masReciente) masReciente = marca
  }

  return masReciente
}

export interface ValorCategoria {
  categoria: string
  valor: number
  articulos: number
}

/** Valor de inventario por categoría: dónde está puesto el dinero. */
export function valorPorCategoria(productos: Producto[]): ValorCategoria[] {
  const acumulado = new Map<string, ValorCategoria>()

  for (const producto of productos) {
    const previo = acumulado.get(producto.categoria) ?? {
      categoria: producto.categoria,
      valor: 0,
      articulos: 0,
    }
    const precio = producto.precioUnitario
    const stock = producto.stock
    const aporta =
      typeof precio === 'number' && Number.isFinite(precio) &&
      typeof stock === 'number' && Number.isFinite(stock)

    acumulado.set(producto.categoria, {
      categoria: producto.categoria,
      valor: previo.valor + (aporta ? precio * stock : 0),
      articulos: previo.articulos + 1,
    })
  }

  return [...acumulado.values()].sort((a, b) => b.valor - a.valor)
}
