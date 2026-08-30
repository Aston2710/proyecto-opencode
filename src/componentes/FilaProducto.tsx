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
import { MedidorStock } from './MedidorStock'

interface Props {
  producto: Producto
  densidad: Densidad
  onAbrir: (producto: Producto) => void
}

/**
 * Fila de producto. Las tres columnas de la derecha —medidor, existencias y
 * precio— tienen ancho fijo, de modo que se alinean entre filas y se pueden
 * recorrer con la vista como las columnas de un libro de inventario.
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
        <span className="t-mono block truncate text-texto-tenue">SKU {producto.id}</span>
        <span className="t-card-title block truncate text-texto">{producto.nombre}</span>

        <span className="mt-0.5 flex flex-wrap items-center gap-sm">
          <span className="t-label-caps rounded-sm border border-borde px-1.5 py-0.5 text-texto-medio">
            {producto.categoria}
          </span>

          <span className={`t-metadata flex items-center gap-xs ${estilo.texto}`}>
            <span className={`size-2 shrink-0 rounded-full ${estilo.punto}`} aria-hidden="true" />
            {ETIQUETAS_INVENTARIO[estado]}
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

      {/* Columna del medidor: se oculta en pantallas estrechas, donde no hay
          sitio para leerla y el semáforo ya dice lo mismo. */}
      <span className="hidden w-[88px] shrink-0 sm:block">
        <MedidorStock producto={producto} />
      </span>

      <span
        className={`t-mono hidden w-[76px] shrink-0 text-right sm:block ${
          producto.stock === null ? 'text-texto-tenue' : estilo.texto
        }`}
      >
        {formatearEntero(producto.stock)}
      </span>

      <span
        className={`t-mono w-[104px] shrink-0 text-right ${
          producto.precioUnitario === null ? 'text-texto-tenue' : 'text-texto'
        }`}
      >
        {formatearMoneda(producto.precioUnitario)}
      </span>
    </button>
  )
}
