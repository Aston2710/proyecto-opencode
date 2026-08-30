import type {
  Densidad,
  FiltroActividad,
  FiltroActivo,
  FiltroInventario,
  FiltrosCatalogo,
  OpcionFiltro,
} from '../tipos'
import { etiquetaFiltroInventario, formatearEntero } from '../utilidades'
import { FiltrosActivos } from './FiltrosActivos'

interface Props {
  filtros: FiltrosCatalogo
  categorias: OpcionFiltro[]
  filtrosActivos: FiltroActivo[]
  densidad: Densidad
  onCambiar: (cambios: Partial<FiltrosCatalogo>) => void
  onAlternarCategoria: (categoria: string) => void
  onLimpiar: () => void
  onCambiarDensidad: (densidad: Densidad) => void
}

const ESTADOS_INVENTARIO: FiltroInventario[] = [
  'todos',
  'atencion',
  'disponible',
  'bajo',
  'agotado',
  'sin-dato',
]

/**
 * Barra de herramientas única.
 *
 * Antes había tres bloques —búsqueda, chips y casillas— siempre desplegados.
 * Ahora la primera línea lleva lo que se usa a diario y lo secundario vive tras
 * un desplegable que anuncia cuántos filtros tiene aplicados. El orden ya no
 * está aquí: se decide pulsando los encabezados de la tabla.
 */
export function BarraHerramientas({
  filtros,
  categorias,
  filtrosActivos,
  densidad,
  onCambiar,
  onAlternarCategoria,
  onLimpiar,
  onCambiarDensidad,
}: Props) {
  const secundariosAplicados =
    (filtros.inventario === 'todos' ? 0 : 1) +
    (filtros.actividad === 'todos' ? 0 : 1) +
    (filtros.soloDescuento ? 1 : 0) +
    (filtros.soloSinPrecio ? 1 : 0)

  return (
    <section
      aria-label="Herramientas del catálogo"
      className="rounded border border-borde bg-superficie"
    >
      <div className="flex flex-wrap items-center gap-sm p-sm">
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
            className="t-body h-9 w-full rounded border border-borde bg-superficie-sutil pr-2.5 pl-8 text-texto placeholder:text-texto-tenue"
          />
        </label>

        <details className="relative">
          <summary className="t-metadata flex h-9 cursor-pointer list-none items-center gap-2 rounded border border-borde bg-superficie px-3 text-texto-medio transition-colors hover:bg-superficie-alta [&::-webkit-details-marker]:hidden">
            Filtros
            {secundariosAplicados > 0 ? (
              <span className="cifras rounded-full bg-acento px-1.5 text-acento-texto">
                {secundariosAplicados}
              </span>
            ) : null}
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
            >
              <path d="m6 9 6 6 6-6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </summary>

          <div className="absolute top-full right-0 z-30 mt-1 w-[280px] rounded border border-borde bg-superficie p-md shadow-lg">
            <label className="t-metadata block text-texto-medio">
              Estado de inventario
              <select
                value={filtros.inventario}
                onChange={(evento) =>
                  onCambiar({ inventario: evento.target.value as FiltroInventario })
                }
                className="t-body mt-1 h-9 w-full rounded border border-borde bg-superficie-sutil px-2 text-texto"
              >
                {ESTADOS_INVENTARIO.map((estado) => (
                  <option key={estado} value={estado}>
                    {etiquetaFiltroInventario(estado)}
                  </option>
                ))}
              </select>
            </label>

            <label className="t-metadata mt-3 block text-texto-medio">
              Alta en catálogo
              <select
                value={filtros.actividad}
                onChange={(evento) =>
                  onCambiar({ actividad: evento.target.value as FiltroActividad })
                }
                className="t-body mt-1 h-9 w-full rounded border border-borde bg-superficie-sutil px-2 text-texto"
              >
                <option value="todos">Todos</option>
                <option value="activos">Solo activos</option>
                <option value="inactivos">Solo inactivos</option>
              </select>
            </label>

            <div className="mt-3 flex flex-col gap-2 border-t border-borde pt-3">
              <Interruptor
                etiqueta="Solo con descuento"
                activo={filtros.soloDescuento}
                onCambiar={(valor) => onCambiar({ soloDescuento: valor })}
              />
              <Interruptor
                etiqueta="Solo sin precio registrado"
                activo={filtros.soloSinPrecio}
                onCambiar={(valor) => onCambiar({ soloSinPrecio: valor })}
              />
            </div>
          </div>
        </details>

        <div
          role="group"
          aria-label="Densidad de la tabla"
          className="flex h-9 items-center gap-0.5 rounded border border-borde p-0.5"
        >
          {(['comoda', 'compacta'] as const).map((valor) => (
            <button
              key={valor}
              type="button"
              aria-pressed={densidad === valor}
              onClick={() => onCambiarDensidad(valor)}
              className={`t-metadata h-full rounded-sm px-2.5 transition-colors ${
                densidad === valor
                  ? 'bg-superficie-alta text-texto'
                  : 'text-texto-tenue hover:text-texto-medio'
              }`}
            >
              {valor === 'comoda' ? 'Cómoda' : 'Compacta'}
            </button>
          ))}
        </div>
      </div>

      <div className="sin-barra flex items-center gap-1.5 overflow-x-auto border-t border-borde px-sm py-2">
        {categorias.map((categoria) => {
          const activa = filtros.categorias.includes(categoria.valor)
          return (
            <button
              key={categoria.valor}
              type="button"
              aria-pressed={activa}
              onClick={() => onAlternarCategoria(categoria.valor)}
              className={`t-metadata rounded-full border px-2.5 py-1 whitespace-nowrap transition-colors ${
                activa
                  ? 'border-acento bg-acento text-acento-texto'
                  : 'border-borde text-texto-medio hover:bg-superficie-alta'
              }`}
            >
              {categoria.valor}
              <span className="cifras ml-1.5 opacity-65">{formatearEntero(categoria.conteo)}</span>
            </button>
          )
        })}
      </div>

      {filtrosActivos.length > 0 ? (
        <div className="border-t border-borde px-sm py-2">
          <FiltrosActivos filtros={filtrosActivos} onLimpiar={onLimpiar} />
        </div>
      ) : null}
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
    <label className="t-body flex cursor-pointer items-center gap-2 text-texto-medio">
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
