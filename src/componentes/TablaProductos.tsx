import type { CampoOrden, Densidad, OrdenCatalogo, Producto } from '../tipos'
import {
  clasificarInventario,
  descuentoAplicable,
  ESTILOS_INVENTARIO,
  ETIQUETAS_INVENTARIO,
  formatearEntero,
  formatearMoneda,
  formatearPlazo,
  textoOpcional,
} from '../utilidades'
import { EstadoVacio } from './EstadoVacio'
import { MedidorStock } from './MedidorStock'

interface Props {
  productos: Producto[]
  densidad: Densidad
  orden: OrdenCatalogo
  seleccionado: Producto | null
  onOrdenar: (campo: CampoOrden) => void
  onLimpiar: () => void
  onAbrir: (producto: Producto) => void
}

interface Columna {
  campo: CampoOrden | null
  rotulo: string
  ancho: string
  alineadaDerecha?: boolean
  /** Punto de ruptura a partir del cual la columna aparece. */
  desde?: 'sm' | 'md' | 'lg' | 'xl'
  ayuda?: string
}

const COLUMNAS: Columna[] = [
  { campo: 'id', rotulo: 'SKU', ancho: '108px' },
  { campo: 'nombre', rotulo: 'Producto', ancho: 'auto' },
  { campo: 'categoria', rotulo: 'Categoría', ancho: '132px', desde: 'lg' },
  { campo: null, rotulo: 'Estado', ancho: '116px', desde: 'sm' },
  {
    campo: null,
    rotulo: 'Reorden',
    ancho: '88px',
    desde: 'md',
    ayuda: 'La marca vertical señala el mínimo de reorden de cada producto.',
  },
  { campo: 'stock', rotulo: 'Existencias', ancho: '92px', alineadaDerecha: true },
  { campo: 'plazoEntregaHoras', rotulo: 'Entrega', ancho: '84px', alineadaDerecha: true, desde: 'xl' },
  { campo: 'precioUnitario', rotulo: 'Unitario', ancho: '112px', alineadaDerecha: true },
]

/** Clases de ocultado por punto de ruptura, escritas completas para Tailwind. */
const VISIBILIDAD: Record<NonNullable<Columna['desde']>, string> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
}

/**
 * Libro de inventario. Es una `<table>` de verdad: un lector de pantalla
 * anuncia filas y columnas, y los encabezados ordenan al pulsarlos.
 *
 * No filtra, ordena ni pagina por su cuenta: recibe la página ya resuelta.
 */
export function TablaProductos({
  productos,
  densidad,
  orden,
  seleccionado,
  onOrdenar,
  onLimpiar,
  onAbrir,
}: Props) {
  if (productos.length === 0) {
    return <EstadoVacio onLimpiar={onLimpiar} />
  }

  const comoda = densidad === 'comoda'
  const alto = comoda ? 'h-[52px]' : 'h-9'

  return (
    <div className="rounded border border-borde bg-superficie">
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">
          Catálogo de productos. Pulsa el encabezado de una columna para ordenar por ella.
        </caption>

        <colgroup>
          {COLUMNAS.map((columna) => (
            <col key={columna.rotulo} style={{ width: columna.ancho }} />
          ))}
        </colgroup>

        <thead>
          <tr>
            {COLUMNAS.map((columna) => {
              const activa = columna.campo !== null && orden.campo === columna.campo
              const visibilidad = columna.desde === undefined ? '' : VISIBILIDAD[columna.desde]

              return (
                <th
                  key={columna.rotulo}
                  scope="col"
                  title={columna.ayuda}
                  aria-sort={
                    activa ? (orden.direccion === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  className={`sticky top-[56px] z-20 border-b border-borde-fuerte bg-superficie px-2 py-2 ${
                    columna.alineadaDerecha ? 'text-right' : 'text-left'
                  } ${visibilidad}`}
                >
                  {columna.campo === null ? (
                    <span className="t-label-caps text-texto-tenue">{columna.rotulo}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOrdenar(columna.campo as CampoOrden)}
                      className={`t-label-caps inline-flex items-center gap-1 rounded-sm transition-colors hover:text-texto ${
                        activa ? 'text-texto' : 'text-texto-tenue'
                      } ${columna.alineadaDerecha ? 'flex-row-reverse' : ''}`}
                    >
                      {columna.rotulo}
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className={`size-3 transition-opacity ${activa ? 'opacity-100' : 'opacity-0'} ${
                          activa && orden.direccion === 'desc' ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                      >
                        <path d="m6 15 6-6 6 6" strokeWidth="2.4" strokeLinecap="round" />
                      </svg>
                    </button>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {productos.map((producto) => {
            const estado = clasificarInventario(producto)
            const estilo = ESTILOS_INVENTARIO[estado]
            const activo = producto.activo

            return (
              <tr
                key={producto.id}
                // El clic en la fila es una comodidad de ratón. El acceso por
                // teclado y por lector de pantalla va por el botón del nombre,
                // que es el control real.
                onClick={() => onAbrir(producto)}
                className={`${alto} cursor-pointer border-b border-borde transition-colors last:border-b-0 ${
                  seleccionado?.id === producto.id ? 'bg-acento-suave' : 'hover:bg-superficie-alta'
                }`}
              >
                <td className="px-2">
                  <span className={`t-mono ${activo ? 'text-texto-tenue' : 'text-texto-tenue/60'}`}>
                    {producto.id}
                  </span>
                </td>

                <td className="px-2">
                  <button
                    type="button"
                    onClick={(evento) => {
                      evento.stopPropagation()
                      onAbrir(producto)
                    }}
                    className="block w-full truncate rounded-sm text-left"
                  >
                    <span
                      className={`t-card-title block truncate ${
                        activo ? 'text-texto' : 'text-texto-medio'
                      }`}
                    >
                      {producto.nombre}
                      {activo ? null : (
                        <span className="t-label-caps ml-2 rounded-sm border border-borde-fuerte px-1.5 py-0.5 align-middle text-texto-medio">
                          Inactivo
                        </span>
                      )}
                    </span>
                    {comoda ? (
                      <span className="t-metadata block truncate text-texto-tenue">
                        {textoOpcional(producto.marca, 'Sin marca')}
                        <span aria-hidden="true"> · </span>
                        {textoOpcional(producto.proveedor, 'Sin proveedor')}
                        <span aria-hidden="true"> · </span>
                        {textoOpcional(producto.almacen, 'Sin asignar')}
                      </span>
                    ) : null}
                  </button>
                </td>

                <td className={`px-2 ${VISIBILIDAD.lg}`}>
                  <span className="t-metadata block truncate text-texto-medio">
                    {producto.categoria}
                  </span>
                </td>

                <td className={`px-2 ${VISIBILIDAD.sm}`}>
                  <span className={`t-metadata flex items-center gap-1.5 ${estilo.texto}`}>
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${estilo.punto}`}
                      aria-hidden="true"
                    />
                    <span className="truncate">{ETIQUETAS_INVENTARIO[estado]}</span>
                  </span>
                </td>

                <td className={`px-2 ${VISIBILIDAD.md}`}>
                  <MedidorStock producto={producto} />
                </td>

                <td className="px-2 text-right">
                  <span
                    className={`t-mono ${producto.stock === null ? 'text-texto-tenue' : 'text-texto'}`}
                  >
                    {producto.stock === null ? '—' : formatearEntero(producto.stock)}
                  </span>
                </td>

                <td className={`px-2 text-right ${VISIBILIDAD.xl}`}>
                  <span className="t-mono text-texto-medio">
                    {formatearPlazo(producto.plazoEntregaHoras)}
                  </span>
                </td>

                <td className="px-2 text-right">
                  <span
                    className={`t-mono ${
                      producto.precioUnitario === null ? 'text-texto-tenue' : 'text-texto'
                    }`}
                  >
                    {formatearMoneda(producto.precioUnitario)}
                  </span>
                  {descuentoAplicable(producto) ? (
                    <span className="t-metadata cifras block text-acento">
                      -{producto.descuento}%
                    </span>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
