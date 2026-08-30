import type { Densidad, Producto } from '../tipos'
import {
  clasificarInventario,
  distintivoCategoria,
  ESTILOS_INVENTARIO,
  ETIQUETAS_INVENTARIO,
  formatearEntero,
  formatearMoneda,
  formatearPlazo,
  textoOpcional,
} from '../utilidades'
import { MedidorStock } from './MedidorStock'

interface Props {
  producto: Producto
  densidad: Densidad
  seleccionado: boolean
  onAbrir: (producto: Producto) => void
}

/**
 * Fila del libro de inventario.
 *
 * Es una fila de tabla, no una tarjeta: sin borde propio ni esquinas
 * redondeadas, separada de la siguiente por una línea de 1 px. Las columnas
 * tienen ancho fijo, así que las cifras se apilan y se recorren con la vista.
 *
 * Ningún campo se lee directamente: todos pasan por los ayudantes de formato,
 * de modo que un `null` del archivo origen nunca llega al DOM.
 */
export function FilaProducto({ producto, densidad, seleccionado, onAbrir }: Props) {
  const estado = clasificarInventario(producto)
  const estilo = ESTILOS_INVENTARIO[estado]
  const comoda = densidad === 'comoda'

  return (
    <button
      type="button"
      onClick={() => onAbrir(producto)}
      aria-label={`Ver detalle de ${producto.nombre}`}
      aria-current={seleccionado ? 'true' : undefined}
      className={`group flex w-full items-center gap-md border-b border-borde px-sm text-left transition-colors ${
        comoda ? 'py-2.5' : 'py-1.5'
      } ${seleccionado ? 'bg-acento-suave' : 'hover:bg-superficie-alta'} ${
        producto.activo ? '' : 'opacity-55'
      }`}
    >
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-sm border border-borde bg-superficie-alta font-mono font-medium text-texto-tenue ${
          comoda ? 'size-8 text-[11px]' : 'size-6 text-[10px]'
        }`}
      >
        {distintivoCategoria(producto.categoria)}
      </span>

      <span className="t-mono w-[92px] shrink-0 text-texto-tenue">{producto.id}</span>

      <span className="min-w-0 grow">
        <span className="t-card-title block truncate text-texto">{producto.nombre}</span>
        {comoda ? (
          <span className="t-metadata block truncate text-texto-tenue">
            {textoOpcional(producto.marca, 'Sin marca')}
            <span aria-hidden="true"> · </span>
            {textoOpcional(producto.proveedor, 'Sin proveedor')}
            <span aria-hidden="true"> · </span>
            {textoOpcional(producto.almacen, 'Sin asignar')}
            {producto.activo ? null : (
              <>
                <span aria-hidden="true"> · </span>
                <span className="text-texto-medio">Inactivo</span>
              </>
            )}
          </span>
        ) : null}
      </span>

      <span className="t-metadata hidden w-[120px] shrink-0 truncate text-texto-medio lg:block">
        {producto.categoria}
      </span>

      <span className={`t-metadata hidden w-[104px] shrink-0 items-center gap-xs sm:flex ${estilo.texto}`}>
        <span className={`size-1.5 shrink-0 rounded-full ${estilo.punto}`} aria-hidden="true" />
        <span className="truncate">{ETIQUETAS_INVENTARIO[estado]}</span>
      </span>

      <span className="hidden w-[72px] shrink-0 md:block">
        <MedidorStock producto={producto} />
      </span>

      <span
        className={`t-mono w-[68px] shrink-0 text-right ${
          producto.stock === null ? 'text-texto-tenue' : 'text-texto'
        }`}
      >
        {producto.stock === null ? '—' : formatearEntero(producto.stock)}
      </span>

      <span className="t-mono hidden w-[72px] shrink-0 text-right text-texto-medio xl:block">
        {formatearPlazo(producto.plazoEntregaHoras)}
      </span>

      <span
        className={`t-mono w-[104px] shrink-0 text-right ${
          producto.precioUnitario === null ? 'text-texto-tenue' : 'text-texto'
        }`}
      >
        {formatearMoneda(producto.precioUnitario)}
      </span>

      <span className="w-[52px] shrink-0 text-right">
        {producto.descuento > 0 ? (
          <span className="t-metadata cifras rounded-sm bg-acento-suave px-1.5 py-0.5 text-acento">
            -{producto.descuento}%
          </span>
        ) : null}
      </span>
    </button>
  )
}
