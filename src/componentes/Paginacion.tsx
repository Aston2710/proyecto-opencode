import { formatearEntero } from '../utilidades'

interface Props {
  pagina: number
  totalPaginas: number
  rango: { desde: number; hasta: number }
  total: number
  onIr: (pagina: number) => void
}

/**
 * Paginación explícita. El sistema prohíbe el scroll infinito y el botón de
 * «cargar más»: el usuario debe poder llegar al pie y saber dónde está.
 */
export function Paginacion({ pagina, totalPaginas, rango, total, onIr }: Props) {
  if (total === 0) return null

  return (
    <nav
      aria-label="Paginación de resultados"
      className="flex flex-wrap items-center justify-between gap-md border-t border-borde pt-md"
    >
      <div className="flex items-center gap-xs">
        <BotonPagina
          etiqueta="Anterior"
          deshabilitado={pagina <= 1}
          onClick={() => onIr(pagina - 1)}
        />

        {construirRango(pagina, totalPaginas).map((entrada, indice) =>
          entrada === 'salto' ? (
            <span
              key={`salto-${indice}`}
              aria-hidden="true"
              className="t-metadata px-1 text-texto-tenue"
            >
              …
            </span>
          ) : (
            <button
              key={entrada}
              type="button"
              onClick={() => onIr(entrada)}
              aria-current={entrada === pagina ? 'page' : undefined}
              className={`t-metadata cifras h-9 min-w-9 rounded border px-2 transition-colors ${
                entrada === pagina
                  ? 'border-acento bg-acento text-acento-texto'
                  : 'border-borde bg-superficie text-texto-medio hover:bg-superficie-alta'
              }`}
            >
              {entrada}
            </button>
          ),
        )}

        <BotonPagina
          etiqueta="Siguiente"
          deshabilitado={pagina >= totalPaginas}
          onClick={() => onIr(pagina + 1)}
        />
      </div>

      <p className="t-metadata cifras text-texto-medio">
        Mostrando {formatearEntero(rango.desde)}–{formatearEntero(rango.hasta)} de{' '}
        {formatearEntero(total)}
      </p>
    </nav>
  )
}

function BotonPagina({
  etiqueta,
  deshabilitado,
  onClick,
}: {
  etiqueta: string
  deshabilitado: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={deshabilitado}
      className="t-metadata h-9 rounded border border-borde bg-superficie px-3 text-texto-medio transition-colors hover:bg-superficie-alta disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-superficie"
    >
      {etiqueta}
    </button>
  )
}

/**
 * Ventana de páginas alrededor de la actual, con saltos en los extremos.
 * Evita renderizar cien botones cuando el catálogo crece.
 */
function construirRango(pagina: number, total: number): Array<number | 'salto'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, indice) => indice + 1)
  }

  const entradas: Array<number | 'salto'> = [1]
  const desde = Math.max(2, pagina - 1)
  const hasta = Math.min(total - 1, pagina + 1)

  if (desde > 2) entradas.push('salto')
  for (let numero = desde; numero <= hasta; numero++) entradas.push(numero)
  if (hasta < total - 1) entradas.push('salto')

  entradas.push(total)
  return entradas
}
