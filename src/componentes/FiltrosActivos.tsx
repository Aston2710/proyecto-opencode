import type { FiltroActivo } from '../tipos'

interface Props {
  filtros: FiltroActivo[]
  onLimpiar: () => void
}

/**
 * Fila de etiquetas removibles. Se deriva del estado de filtros, así que no
 * puede desincronizarse: si aparece aquí, está aplicado.
 */
export function FiltrosActivos({ filtros, onLimpiar }: Props) {
  if (filtros.length === 0) return null

  return (
    <div className="t-metadata flex flex-wrap items-center gap-xs text-texto-medio">
      <span>Filtros activos:</span>

      {filtros.map((filtro) => (
        <button
          key={filtro.clave}
          type="button"
          onClick={filtro.quitar}
          aria-label={`Quitar el filtro ${filtro.etiqueta}`}
          className="flex items-center gap-1 rounded bg-superficie-alta px-2 py-0.5 text-texto transition-colors hover:bg-borde"
        >
          {filtro.etiqueta}
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor">
            <path d="m6 6 12 12M18 6 6 18" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      ))}

      {filtros.length > 1 ? (
        <button
          type="button"
          onClick={onLimpiar}
          className="ml-1 text-acento underline underline-offset-2"
        >
          Limpiar todo
        </button>
      ) : null}
    </div>
  )
}
