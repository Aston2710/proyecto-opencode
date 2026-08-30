import type { FiltroInventario, FiltrosCatalogo, OpcionFiltro, OrdenCatalogo } from '../tipos'
import { etiquetaFiltroInventario, formatearEntero } from '../utilidades'

interface Props {
  filtros: FiltrosCatalogo
  categorias: OpcionFiltro[]
  onCambiar: (cambios: Partial<FiltrosCatalogo>) => void
  onAlternarCategoria: (categoria: string) => void
}

const ESTADOS_INVENTARIO: FiltroInventario[] = [
  'todos',
  'atencion',
  'disponible',
  'bajo',
  'agotado',
  'sin-dato',
]

const ORDENES: Array<{ valor: OrdenCatalogo; etiqueta: string }> = [
  { valor: 'nombre-asc', etiqueta: 'Nombre (A-Z)' },
  { valor: 'precio-asc', etiqueta: 'Precio ascendente' },
  { valor: 'precio-desc', etiqueta: 'Precio descendente' },
  { valor: 'stock-desc', etiqueta: 'Mayor inventario' },
  { valor: 'reciente', etiqueta: 'Alta más reciente' },
]

const CLASE_CONTROL =
  'rounded border border-borde bg-superficie-sutil px-2.5 h-9 text-texto t-body'

/**
 * Controles de filtrado. Las categorías llegan derivadas del archivo de datos;
 * este componente no conoce ni una sola categoría de antemano.
 */
export function BarraFiltros({ filtros, categorias, onCambiar, onAlternarCategoria }: Props) {
  return (
    <section
      aria-label="Filtros del catálogo"
      className="flex flex-col gap-sm rounded border border-borde bg-superficie p-md"
    >
      <div className="flex flex-wrap items-center gap-sm">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Buscar productos</span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-texto-tenue"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="6.4" strokeWidth="1.8" />
            <path d="m16 16 4 4" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={filtros.busqueda}
            onChange={(evento) => onCambiar({ busqueda: evento.target.value })}
            placeholder="Buscar por nombre, SKU, marca, proveedor o almacén"
            className={`${CLASE_CONTROL} w-full pl-8 placeholder:text-texto-tenue`}
          />
        </label>

        <label className="t-metadata flex items-center gap-2 text-texto-medio">
          <span>Inventario</span>
          <select
            value={filtros.inventario}
            onChange={(evento) =>
              onCambiar({ inventario: evento.target.value as FiltrosCatalogo['inventario'] })
            }
            className={CLASE_CONTROL}
          >
            {ESTADOS_INVENTARIO.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaFiltroInventario(estado)}
              </option>
            ))}
          </select>
        </label>

        <label className="t-metadata flex items-center gap-2 text-texto-medio">
          <span>Orden</span>
          <select
            value={filtros.orden}
            onChange={(evento) => onCambiar({ orden: evento.target.value as OrdenCatalogo })}
            className={CLASE_CONTROL}
          >
            {ORDENES.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sin-barra flex items-center gap-sm overflow-x-auto py-xs">
        {categorias.map((categoria) => {
          const activa = filtros.categorias.includes(categoria.valor)
          return (
            <button
              key={categoria.valor}
              type="button"
              aria-pressed={activa}
              onClick={() => onAlternarCategoria(categoria.valor)}
              className={`t-metadata rounded-full border px-3 py-1.5 whitespace-nowrap transition-colors ${
                activa
                  ? 'border-acento bg-acento text-acento-texto'
                  : 'border-borde bg-superficie text-texto-medio hover:bg-superficie-alta'
              }`}
            >
              {categoria.valor}
              <span className="cifras ml-1.5 opacity-65">{formatearEntero(categoria.conteo)}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-md border-t border-borde pt-sm">
        <Interruptor
          etiqueta="Solo activos"
          activo={filtros.soloActivos}
          onCambiar={(valor) => onCambiar({ soloActivos: valor })}
        />
        <Interruptor
          etiqueta="Solo con descuento"
          activo={filtros.soloDescuento}
          onCambiar={(valor) => onCambiar({ soloDescuento: valor })}
        />
      </div>
    </section>
  )
}

function Interruptor({
  etiqueta,
  activo,
  onCambiar,
}: {
  etiqueta: string
  activo: boolean
  onCambiar: (valor: boolean) => void
}) {
  return (
    <label className="t-metadata flex cursor-pointer items-center gap-2 text-texto-medio">
      <input
        type="checkbox"
        checked={activo}
        onChange={(evento) => onCambiar(evento.target.checked)}
        className="size-3.5 accent-[var(--acento)]"
      />
      {etiqueta}
    </label>
  )
}
