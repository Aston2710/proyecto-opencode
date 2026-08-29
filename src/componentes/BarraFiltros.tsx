import type { EstadoInventario, FiltrosCatalogo, OpcionFiltro, OrdenCatalogo } from '../tipos'
import { ETIQUETAS_INVENTARIO, formatearEntero } from '../utilidades'

interface Props {
  filtros: FiltrosCatalogo
  categorias: OpcionFiltro[]
  hayFiltrosActivos: boolean
  onCambiar: (cambios: Partial<FiltrosCatalogo>) => void
  onAlternarCategoria: (categoria: string) => void
  onLimpiar: () => void
}

const ESTADOS_INVENTARIO: Array<EstadoInventario | 'todos'> = [
  'todos',
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

/**
 * Controles de filtrado. Las categorías llegan derivadas del archivo de datos;
 * este componente no conoce ni una sola categoría de antemano.
 */
export function BarraFiltros({
  filtros,
  categorias,
  hayFiltrosActivos,
  onCambiar,
  onAlternarCategoria,
  onLimpiar,
}: Props) {
  return (
    <section
      aria-label="Filtros del catálogo"
      className="flex flex-col gap-3.5 rounded-[10px] border border-borde bg-superficie p-4"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="relative min-w-[240px] flex-1">
          <span className="sr-only">Buscar productos</span>
          <input
            type="search"
            value={filtros.busqueda}
            onChange={(evento) => onCambiar({ busqueda: evento.target.value })}
            placeholder="Buscar por nombre, SKU, marca, proveedor o almacén"
            className="w-full rounded-[10px] border border-borde bg-superficie-sutil px-3 py-2 text-[13px] text-texto placeholder:text-texto-tenue"
          />
        </label>

        <label className="flex items-center gap-2 text-[12.5px] text-texto-medio">
          <span>Inventario</span>
          <select
            value={filtros.inventario}
            onChange={(evento) =>
              onCambiar({ inventario: evento.target.value as FiltrosCatalogo['inventario'] })
            }
            className="rounded-[10px] border border-borde bg-superficie-sutil px-2.5 py-2 text-[13px] text-texto"
          >
            {ESTADOS_INVENTARIO.map((estado) => (
              <option key={estado} value={estado}>
                {estado === 'todos' ? 'Todos' : ETIQUETAS_INVENTARIO[estado]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-[12.5px] text-texto-medio">
          <span>Orden</span>
          <select
            value={filtros.orden}
            onChange={(evento) => onCambiar({ orden: evento.target.value as OrdenCatalogo })}
            className="rounded-[10px] border border-borde bg-superficie-sutil px-2.5 py-2 text-[13px] text-texto"
          >
            {ORDENES.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {categorias.map((categoria) => {
          const activa = filtros.categorias.includes(categoria.valor)
          return (
            <button
              key={categoria.valor}
              type="button"
              aria-pressed={activa}
              onClick={() => onAlternarCategoria(categoria.valor)}
              className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors ${
                activa
                  ? 'border-acento bg-acento text-acento-texto'
                  : 'border-borde bg-superficie-sutil text-texto-medio hover:border-borde-fuerte'
              }`}
            >
              {categoria.valor}
              <span className="cifras ml-1.5 opacity-65">{formatearEntero(categoria.conteo)}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-borde pt-3">
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
        {hayFiltrosActivos ? (
          <button
            type="button"
            onClick={onLimpiar}
            className="ml-auto text-[12.5px] font-medium text-acento underline underline-offset-2"
          >
            Limpiar filtros
          </button>
        ) : null}
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
    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-texto-medio">
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
