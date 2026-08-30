interface Props {
  esOscuro: boolean
  onAlternarTema: () => void
}

/**
 * Barra superior fija de 56 px: marca y conmutador de tema.
 *
 * Antes mostraba también la procedencia del archivo, el número de registros y
 * la versión del esquema. Eso es información de depuración: no le sirve a
 * quien consulta el catálogo y competía con el título. Sigue disponible en el
 * archivo y en la documentación.
 */
export function BarraSuperior({ esOscuro, onAlternarTema }: Props) {
  return (
    <header className="sticky top-0 z-40 h-[56px] border-b border-borde bg-superficie">
      <div className="mx-auto flex h-full max-w-[1240px] items-center justify-between gap-md px-md">
        <div className="flex min-w-0 items-center gap-sm">
          <span
            aria-hidden="true"
            className="grid size-6 shrink-0 place-items-center rounded bg-acento text-acento-texto"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor">
              <path
                d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M4 8.5 12 13l8-4.5M12 13v7" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="t-page-title truncate text-texto">Catálogo Mayorista</h1>
        </div>

        <div className="flex items-center gap-md">
          <button
            type="button"
            onClick={onAlternarTema}
            aria-label={esOscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className="grid size-9 place-items-center rounded text-texto-medio transition-colors hover:bg-superficie-alta hover:text-texto"
          >
            {esOscuro ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="4.2" strokeWidth="1.7" />
                <path
                  d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor">
                <path
                  d="M20 13.2A8.2 8.2 0 0 1 10.8 4a8.4 8.4 0 1 0 9.2 9.2Z"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
