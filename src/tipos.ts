/**
 * Tipos derivados del contrato real de public/datos/productos.json.
 * Los campos opcionales reflejan las inconsistencias del archivo origen:
 * `| null` cuando la clave existe pero viene vacía, `?` cuando la clave
 * puede no existir en el registro.
 */

export interface Producto {
  id: string
  nombre: string
  categoria: string
  marca: string | null
  proveedor: string | null
  almacen?: string | null
  precioUnitario: number | null
  precioMayoreo: number | null
  unidadesPorCaja: number
  stock: number | null
  stockMinimo: number
  descuento: number
  activo: boolean
  fechaAlta: string | null
  descripcion: string | null
}

export interface MetaCatalogo {
  fuente: string
  generadoPor: string
  version: number
  totalRegistros: number
}

export interface ArchivoCatalogo {
  meta: MetaCatalogo
  productos: Producto[]
}

/** Estado del semáforo de inventario de un producto. */
export type EstadoInventario = 'disponible' | 'bajo' | 'agotado' | 'sin-dato'

/** Opción de un filtro, derivada de los datos y con su conteo. */
export interface OpcionFiltro {
  valor: string
  conteo: number
}

/** Densidad de la lista de resultados. */
export type Densidad = 'comoda' | 'compacta'

/**
 * Filtro de inventario. `atencion` agrupa lo que hay que reponer —bajo mínimo y
 * agotado— porque es la pregunta que se hace de verdad, y ningún estado suelto
 * la responde.
 */
export type FiltroInventario = EstadoInventario | 'todos' | 'atencion'

export interface FiltrosCatalogo {
  busqueda: string
  categorias: string[]
  inventario: FiltroInventario
  soloActivos: boolean
  soloDescuento: boolean
  orden: OrdenCatalogo
}

export type OrdenCatalogo =
  | 'nombre-asc'
  | 'precio-asc'
  | 'precio-desc'
  | 'stock-desc'
  | 'reciente'

/** Una etiqueta removible de la fila de filtros activos. */
export interface FiltroActivo {
  clave: string
  etiqueta: string
  quitar: () => void
}

/** Preferencia de tema. `sistema` delega en `prefers-color-scheme`. */
export type Tema = 'sistema' | 'claro' | 'oscuro'
