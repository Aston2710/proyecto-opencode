import { formatearEntero, formatearMoneda } from '../utilidades'

interface Metricas {
  total: number
  totalGeneral: number
  precioPromedio: number | null
  unidadesTotales: number | null
  sinPrecio: number
  conteoPorEstado: Record<string, number>
}

interface Props {
  metricas: Metricas
  filtrandoAtencion: boolean
  onVerAtencion: () => void
}

/**
 * Fila de indicadores del conjunto filtrado.
 *
 * Los promedios y sumas ignoran los registros sin dato: contarlos como cero
 * distorsionaría las cifras y ocultaría el hueco del archivo origen.
 *
 * El último indicador es pulsable. Nombra el trabajo de la página —saber qué
 * hay que reponer— así que también es por donde se empieza a hacerlo.
 */
export function PanelMetricas({ metricas, filtrandoAtencion, onVerAtencion }: Props) {
  const bajos = metricas.conteoPorEstado.bajo ?? 0
  const agotados = metricas.conteoPorEstado.agotado ?? 0
  const atencion = bajos + agotados

  const indicadores = [
    {
      etiqueta: 'Productos visibles',
      valor: formatearEntero(metricas.total),
      nota: `de ${formatearEntero(metricas.totalGeneral)} en catálogo`,
    },
    {
      etiqueta: 'Precio promedio',
      valor:
        metricas.precioPromedio === null ? 'Sin datos' : formatearMoneda(metricas.precioPromedio),
      nota:
        metricas.sinPrecio > 0
          ? `${formatearEntero(metricas.sinPrecio)} sin precio, excluidos`
          : 'todos con precio',
    },
    {
      etiqueta: 'Unidades en piso',
      valor:
        metricas.unidadesTotales === null
          ? 'Sin datos'
          : formatearEntero(metricas.unidadesTotales),
      nota: `${formatearEntero(metricas.conteoPorEstado['sin-dato'] ?? 0)} sin registro de stock`,
    },
  ]

  return (
    <section
      aria-label="Indicadores del catálogo"
      className="grid grid-cols-2 gap-sm md:grid-cols-4 md:gap-md"
    >
      {indicadores.map((indicador) => (
        <div
          key={indicador.etiqueta}
          className="rounded border border-borde bg-superficie p-sm md:p-md"
        >
          <p className="t-label-caps text-texto-tenue">{indicador.etiqueta}</p>
          <p className="t-indicator mt-xs text-texto">{indicador.valor}</p>
          <p className="t-metadata cifras mt-xs text-texto-medio">{indicador.nota}</p>
        </div>
      ))}

      <button
        type="button"
        onClick={onVerAtencion}
        aria-pressed={filtrandoAtencion}
        className={`rounded border p-sm text-left transition-colors md:p-md ${
          filtrandoAtencion
            ? 'border-critico bg-critico-suave'
            : 'border-borde bg-superficie hover:border-critico hover:bg-critico-suave'
        }`}
      >
        <p className="t-label-caps flex items-center justify-between gap-2 text-critico">
          Requieren atención
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
          >
            <path d="m9 6 6 6-6 6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </p>
        <p className={`t-indicator mt-xs ${atencion > 0 ? 'text-critico' : 'text-texto'}`}>
          {formatearEntero(atencion)}
        </p>
        <p className="t-metadata cifras mt-xs text-texto-medio">
          {formatearEntero(bajos)} bajos · {formatearEntero(agotados)} agotados
        </p>
      </button>
    </section>
  )
}
