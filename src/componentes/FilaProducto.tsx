import type { Densidad, Producto } from '../tipos'
import {
  clasificarInventario,
  distintivoCategoria,
  ESTILOS_INVENTARIO,
  ETIQUETAS_INVENTARIO,
  formatearEntero,
  formatearMoneda,
  textoOpcional,
} from '../utilidades'

interface Props {
  producto: Producto
  densidad: Densidad
  onAbrir: (producto: Producto) => void
}

/**
 * Fila de producto del catálogo, en el formato horizontal del sistema de
 * diseño: distintivo, SKU y precio arriba, nombre, y pie con categoría e
 * inventario.
 *
 * Ningún campo se lee directamente: todos pasan por los ayudantes de formato,
 * de modo que un `null` del archivo origen nunca llega al DOM.
 */
export function FilaProducto({ producto, densidad, onAbrir }: Props) {
  const estado = clasificarInventario(producto)
  const estilo = ESTILOS_INVENTARIO[estado]
  const comoda = densidad === 'comoda'

  return (
    <button
      type="button"
      onClick={() => onAbrir(producto)}
      aria-label={`Ver detalle de ${producto.nombre}`}
      className={`flex w-full items-center gap-md rounded-md border border-borde bg-superficie text-left transition-colors hover:border-borde-fuerte hover:bg-superficie-sutil ${
        comoda ? 'p-sm' : 'px-sm py-xs'
      } ${producto.activo ? '' : 'opacity-60'}`}
    >
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-md border border-borde bg-superficie-alta font-mono font-medium text-texto-medio ${
          comoda ? 'size-12 text-[13px]' : 'size-9 text-[11px]'
        }`}
      >
        {distintivoCategoria(producto.categoria)}
      </span>

      <span className="min-w-0 grow">
        <span className="mb-1 flex items-baseline justify-between gap-md">
          <span className="t-mono truncate text-texto-tenue">SKU {producto.id}</span>
          <span
            className={`t-mono shrink-0 ${
              producto.precioUnitario === null ? 'text-texto-tenue' : 'text-texto'
            }`}
          >
            {formatearMoneda(producto.precioUnitario)}
          </span>
        </span>

        <span className="t-card-title mb-1 block truncate text-texto">{producto.nombre}</span>

        <span className="flex flex-wrap items-center gap-sm">
          <span className="t-label-caps rounded-sm border border-borde px-2 py-0.5 text-texto-medio">
            {producto.categoria}
          </span>

          <span className="flex items-center gap-xs">
            <span className={`size-2 shrink-0 rounded-full ${estilo.punto}`} aria-hidden="true" />
            <span className={`t-metadata ${estilo.texto}`}>
              {ETIQUETAS_INVENTARIO[estado]}
              {typeof producto.stock === 'number' ? (
                <span className="cifras text-texto-medio"> ({formatearEntero(producto.stock)})</span>
              ) : null}
            </span>
          </span>

          {producto.descuento > 0 ? (
            <span className="t-metadata cifras rounded-full bg-acento-suave px-2 py-0.5 text-acento">
              -{producto.descuento}%
            </span>
          ) : null}

          {producto.activo ? null : (
            <span className="t-metadata rounded-sm bg-neutro-suave px-2 py-0.5 text-texto-medio">
              Inactivo
            </span>
          )}

          {comoda ? (
            <span className="t-metadata truncate text-texto-tenue">
              {textoOpcional(producto.marca, 'Sin marca')}
              <span aria-hidden="true"> · </span>
              {textoOpcional(producto.proveedor, 'Sin proveedor')}
              <span aria-hidden="true"> · </span>
              {textoOpcional(producto.almacen, 'Sin asignar')}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  )
}
