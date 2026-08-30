import { useEffect, useRef } from 'react'
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
  producto: Producto | null
  onCerrar: () => void
}

/**
 * Panel lateral de detalle. Es un aparte, no un modal: se cierra con Escape o
 * pulsando fuera.
 *
 * La tabla lista **solo campos que existen en el archivo de datos**. El
 * sistema de diseño proponía además peso, volumen, material, origen, plazo de
 * entrega, garantía, EAN y código arancelario; ninguno se exporta desde el
 * ERP y añadirlos habría significado inventar datos.
 */
export function PanelDetalle({ producto, onCerrar }: Props) {
  const cerrarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (producto === null) return

    function alPulsarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') onCerrar()
    }

    document.addEventListener('keydown', alPulsarTecla)
    cerrarRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', alPulsarTecla)
    }
  }, [producto, onCerrar])

  if (producto === null) return null

  const estado = clasificarInventario(producto)
  const estilo = ESTILOS_INVENTARIO[estado]

  const campos: Array<{ etiqueta: string; valor: string; ausente: boolean }> = [
    {
      etiqueta: 'Marca',
      valor: textoOpcional(producto.marca, 'Sin registrar'),
      ausente: producto.marca === null,
    },
    {
      etiqueta: 'Proveedor',
      valor: textoOpcional(producto.proveedor, 'Sin registrar'),
      ausente: producto.proveedor === null,
    },
    {
      etiqueta: 'Almacén',
      valor: textoOpcional(producto.almacen, 'Sin asignar'),
      ausente: producto.almacen === null || producto.almacen === undefined,
    },
    {
      etiqueta: 'Existencias',
      valor:
        typeof producto.stock === 'number'
          ? `${formatearEntero(producto.stock)} unidades`
          : 'Sin registrar',
      ausente: typeof producto.stock !== 'number',
    },
    {
      etiqueta: 'Mínimo',
      valor: `${formatearEntero(producto.stockMinimo)} unidades`,
      ausente: false,
    },
    {
      etiqueta: 'Por caja',
      valor: `${formatearEntero(producto.unidadesPorCaja)} unidades`,
      ausente: false,
    },
    {
      etiqueta: 'Alta',
      valor: formatearFecha(producto.fechaAlta),
      ausente: producto.fechaAlta === null,
    },
    { etiqueta: 'Estado', valor: producto.activo ? 'Activo' : 'Inactivo', ausente: false },
  ]

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Cerrar el detalle"
        onClick={onCerrar}
        className="absolute inset-0 cursor-default bg-[var(--velo)]"
      />

      <aside
        role="dialog"
        aria-modal="false"
        aria-label={`Detalle de ${producto.nombre}`}
        className="relative flex h-full w-full max-w-[420px] flex-col border-l border-borde bg-superficie shadow-lg"
      >
        <header className="flex items-start justify-between gap-md border-b border-borde p-md">
          <div className="min-w-0">
            <h2 className="t-card-title text-texto">{producto.nombre}</h2>
            <p className="t-mono mt-0.5 text-texto-tenue">SKU {producto.id}</p>
          </div>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid size-9 shrink-0 place-items-center rounded text-texto-medio transition-colors hover:bg-superficie-alta hover:text-texto"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
              <path d="m6 6 12 12M18 6 6 18" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="border-b border-borde p-md">
            <span className="t-label-caps inline-block rounded-sm bg-acento-suave px-2 py-1 text-acento">
              {producto.categoria}
            </span>

            <p
              className={`mt-3 text-[26px] leading-none font-semibold ${
                producto.precioUnitario === null ? 'text-texto-tenue' : 'text-texto'
              } cifras`}
            >
              {formatearMoneda(producto.precioUnitario)}
            </p>

            <p className="t-metadata mt-2 flex flex-wrap items-center gap-2 text-texto-medio">
              <span className="cifras">Mayoreo: {formatearMoneda(producto.precioMayoreo)}</span>
              {producto.descuento > 0 ? (
                <span className="cifras rounded-full bg-acento-suave px-2 py-0.5 text-acento">
                  -{producto.descuento}%
                </span>
              ) : null}
            </p>

            <p className="mt-3 flex items-center gap-xs">
              <span className={`size-2 rounded-full ${estilo.punto}`} aria-hidden="true" />
              <span className={`t-metadata ${estilo.texto}`}>{ETIQUETAS_INVENTARIO[estado]}</span>
            </p>
          </div>

          {producto.descripcion !== null && producto.descripcion.trim() !== '' ? (
            <p className="t-body border-b border-borde p-md text-texto-medio">
              {producto.descripcion}
            </p>
          ) : null}

          <dl className="p-md">
            {campos.map((campo, indice) => (
              <div
                key={campo.etiqueta}
                className={`flex items-baseline justify-between gap-md py-2.5 ${
                  indice === 0 ? '' : 'border-t border-borde'
                }`}
              >
                <dt className="t-label-caps text-texto-tenue">{campo.etiqueta}</dt>
                <dd
                  className={`t-body cifras text-right ${
                    campo.ausente ? 'text-texto-tenue italic' : 'text-texto'
                  }`}
                >
                  {campo.valor}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  )
}
