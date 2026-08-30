import type { HuecoCatalogo } from '../metricas'
import { formatearEntero, formatearPorcentaje } from '../utilidades'

interface Props {
  huecos: HuecoCatalogo[]
  integridad: number
  onIrAVista: (clave: string) => void
}

/**
 * Estado de captura del catálogo.
 *
 * Los huecos del archivo no son una curiosidad técnica: cada fila es trabajo
 * pendiente con una consecuencia concreta en la operación. Por eso cada una
 * lleva a la vista del catálogo que la aísla, en lugar de quedarse en la cifra.
 */
export function CalidadDato({ huecos, integridad, onIrAVista }: Props) {
  return (
    <section
      aria-labelledby="titulo-calidad"
      className="flex flex-col rounded border border-borde bg-superficie"
    >
      <header className="border-b border-borde px-md py-3">
        <h2 id="titulo-calidad" className="t-card-title text-texto">
          Calidad del catálogo
        </h2>
        <p className="t-metadata mt-0.5 text-texto-tenue">
          {formatearPorcentaje(integridad)} de los registros están completos
        </p>
      </header>

      {huecos.length === 0 ? (
        <p className="t-body px-md py-8 text-center text-texto-medio">
          Todos los registros están completos.
        </p>
      ) : (
        <ul className="grow">
          {huecos.map((hueco) => (
            <li key={hueco.clave}>
              <button
                type="button"
                onClick={() => onIrAVista(hueco.clave)}
                className="flex w-full items-center gap-sm border-b border-borde px-md py-2.5 text-left transition-colors last:border-b-0 hover:bg-superficie-alta"
              >
                <span className="t-mono w-[44px] shrink-0 text-right text-texto">
                  {formatearEntero(hueco.conteo)}
                </span>
                <span className="min-w-0 grow">
                  <span className="t-body block truncate text-texto">{hueco.etiqueta}</span>
                  <span className="t-metadata block truncate text-texto-tenue">
                    {hueco.consecuencia}
                  </span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 shrink-0 text-texto-tenue"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="m9 6 6 6-6 6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
