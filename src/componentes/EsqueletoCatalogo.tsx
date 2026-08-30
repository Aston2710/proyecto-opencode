/**
 * Estado de carga con esqueletos en lugar de un indicador giratorio.
 *
 * Replica la estructura real —cuatro indicadores y una lista de filas— para
 * que nada se desplace cuando entran los datos.
 */
export function EsqueletoCatalogo() {
  return (
    <div className="flex flex-col gap-md" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando el catálogo…</span>

      <div className="grid grid-cols-2 gap-sm md:grid-cols-4 md:gap-md">
        {Array.from({ length: 4 }, (_, indice) => (
          <div key={indice} className="rounded border border-borde bg-superficie p-md">
            <div className="esqueleto h-3 w-24" />
            <div className="esqueleto mt-3 h-6 w-20" />
          </div>
        ))}
      </div>

      <div className="rounded border border-borde bg-superficie p-md">
        <div className="flex flex-wrap gap-sm">
          {[72, 88, 64, 96, 80].map((ancho, indice) => (
            <div key={indice} className="esqueleto h-7 rounded-full" style={{ width: ancho }} />
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-sm">
        {Array.from({ length: 8 }, (_, indice) => (
          <li
            key={indice}
            className="flex items-center gap-md rounded-md border border-borde bg-superficie p-sm"
          >
            <div className="esqueleto size-12 shrink-0 rounded-md" />
            <div className="min-w-0 grow">
              <div className="mb-2 flex items-center justify-between gap-md">
                <div className="esqueleto h-3 w-28" />
                <div className="esqueleto h-3 w-16" />
              </div>
              <div className="esqueleto mb-2 h-4 w-2/3" />
              <div className="flex gap-sm">
                <div className="esqueleto h-4 w-20" />
                <div className="esqueleto h-4 w-24" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
