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
 * Franja única de indicadores, dividida por líneas de 1 px en lugar de cuatro
 * tarjetas sueltas: son un solo bloque de lectura, no cuatro objetos.
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
    // El hueco de 1 px sobre fondo de borde dibuja las divisiones exactas en
    // cualquier reacomodo de la rejilla, sin bordes condicionales por celda.
    <section
      aria-label="Indicadores del catálogo"
      className="grid grid-cols-2 gap-px overflow-hidden rounded border border-borde bg-borde md:grid-cols-4"
    >
      {indicadores.map((indicador) => (
        <div key={indicador.etiqueta} className="bg-superficie px-md py-3">
          <p className="t-label-caps text-texto-tenue">{indicador.etiqueta}</p>
          <p className="t-indicator mt-1 text-texto">{indicador.valor}</p>
          <p className="t-metadata cifras mt-0.5 text-texto-tenue">{indicador.nota}</p>
        </div>
      ))}

      <button
        type="button"
        onClick={onVerAtencion}
        aria-pressed={filtrandoAtencion}
        className={`px-md py-3 text-left transition-colors ${
          filtrandoAtencion ? 'bg-critico-suave' : 'bg-superficie hover:bg-critico-suave'
        }`}
      >
        <p className="t-label-caps flex items-center justify-between gap-2 text-critico">
          Requieren atención
          <span className="t-metadata font-normal normal-case tracking-normal">
            {filtrandoAtencion ? 'Ver todo' : 'Ver solo estos'}
          </span>
        </p>
        <p className={`t-indicator mt-1 ${atencion > 0 ? 'text-critico' : 'text-texto'}`}>
          {formatearEntero(atencion)}
        </p>
        <p className="t-metadata cifras mt-0.5 text-texto-tenue">
          {formatearEntero(bajos)} bajos · {formatearEntero(agotados)} agotados
        </p>
      </button>
    </section>
  )
}
