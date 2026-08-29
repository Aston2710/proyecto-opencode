import type { Producto } from '../tipos'
import {
  clasificarInventario,
  ESTILOS_INVENTARIO,
  ETIQUETAS_INVENTARIO,
  formatearEntero,
  formatearFecha,
  formatearMoneda,
  textoOpcional,
} from '../utilidades'

interface Props {
  producto: Producto
}

/**
 * Tarjeta de un producto del catálogo.
 * Ningún campo se lee directamente: todos pasan por los ayudantes de formato,
 * de modo que un `null` en el archivo origen nunca llega al DOM.
 */
export function TarjetaProducto({ producto }: Props) {
  const estado = clasificarInventario(producto)
  const estilo = ESTILOS_INVENTARIO[estado]
  const tieneDescuento = producto.descuento > 0

  return (
    <article
      className={`flex flex-col gap-3 rounded-[10px] border border-borde bg-superficie p-4 transition-colors hover:border-borde-fuerte ${
        producto.activo ? '' : 'opacity-60'
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] leading-snug font-semibold text-texto">{producto.nombre}</h3>
          <p className="cifras mt-0.5 font-mono text-[11px] tracking-tight text-texto-tenue">
            {producto.id}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-neutro-suave px-2 py-0.5 text-[11px] font-medium text-texto-medio">
          {producto.categoria}
        </span>
      </header>

      {producto.descripcion !== null && producto.descripcion.trim() !== '' ? (
        <p className="line-clamp-2 text-[12.5px] text-texto-medio">{producto.descripcion}</p>
      ) : null}

      <div className="flex items-end justify-between gap-3 border-t border-borde pt-3">
        <div>
          <p
            className={`cifras text-[19px] leading-none font-semibold ${
              producto.precioUnitario === null ? 'text-texto-tenue' : 'text-texto'
            }`}
          >
            {formatearMoneda(producto.precioUnitario)}
          </p>
          <p className="cifras mt-1 text-[11.5px] text-texto-medio">
            {formatearMoneda(producto.precioMayoreo)}
            <span className="ml-1 text-texto-tenue">mayoreo</span>
          </p>
        </div>
        {tieneDescuento ? (
          <span className="cifras rounded-full bg-acento-suave px-2 py-0.5 text-[11px] font-semibold text-acento">
            -{producto.descuento}%
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${estilo.punto}`} aria-hidden="true" />
        <span className={`text-[12px] font-medium ${estilo.texto}`}>
          {ETIQUETAS_INVENTARIO[estado]}
        </span>
        <span className="cifras ml-auto text-[12px] text-texto-medio">
          {formatearEntero(producto.stock)}
          <span className="ml-1 text-texto-tenue">u.</span>
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-borde pt-3 text-[11.5px]">
        <Dato etiqueta="Marca" valor={textoOpcional(producto.marca, 'Sin marca')} />
        <Dato etiqueta="Proveedor" valor={textoOpcional(producto.proveedor, 'Sin proveedor')} />
        <Dato etiqueta="Almacén" valor={textoOpcional(producto.almacen, 'Sin asignar')} />
        <Dato etiqueta="Por caja" valor={`${formatearEntero(producto.unidadesPorCaja)} u.`} />
        <Dato etiqueta="Mínimo" valor={`${formatearEntero(producto.stockMinimo)} u.`} />
        <Dato etiqueta="Alta" valor={formatearFecha(producto.fechaAlta)} />
      </dl>

      {producto.activo ? null : (
        <p className="rounded-md bg-neutro-suave px-2 py-1 text-[11px] font-medium text-texto-medio">
          Producto inactivo
        </p>
      )}
    </article>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-texto-tenue">{etiqueta}</dt>
      <dd className="cifras truncate font-medium text-texto-medio">{valor}</dd>
    </div>
  )
}
