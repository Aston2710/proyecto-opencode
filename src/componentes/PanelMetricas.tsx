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
}

/**
 * Fila de indicadores del conjunto filtrado.
 * Los promedios y sumas ignoran los registros sin dato: contarlos como cero
 * distorsionaría las cifras y ocultaría el hueco del archivo origen.
 */
export function PanelMetricas({ metricas }: Props) {
  const indicadores = [
    {
      etiqueta: 'Productos visibles',
      valor: formatearEntero(metricas.total),
      nota: `de ${formatearEntero(metricas.totalGeneral)} en catálogo`,
    },
    {
      etiqueta: 'Precio promedio',
      valor: metricas.precioPromedio === null ? 'Sin datos' : formatearMoneda(metricas.precioPromedio),
      nota:
        metricas.sinPrecio > 0
          ? `${formatearEntero(metricas.sinPrecio)} sin precio, excluidos`
          : 'todos con precio',
    },
    {
      etiqueta: 'Unidades en piso',
      valor: metricas.unidadesTotales === null ? 'Sin datos' : formatearEntero(metricas.unidadesTotales),
      nota: `${formatearEntero(metricas.conteoPorEstado['sin-dato'] ?? 0)} sin registro de stock`,
    },
    {
      etiqueta: 'Requieren atención',
      valor: formatearEntero(
        (metricas.conteoPorEstado.bajo ?? 0) + (metricas.conteoPorEstado.agotado ?? 0),
      ),
      nota: `${formatearEntero(metricas.conteoPorEstado.bajo ?? 0)} bajos · ${formatearEntero(
        metricas.conteoPorEstado.agotado ?? 0,
      )} agotados`,
    },
  ]

  return (
    <section
      aria-label="Indicadores del catálogo"
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}
    >
      {indicadores.map((indicador) => (
        <div
          key={indicador.etiqueta}
          className="rounded-[10px] border border-borde bg-superficie px-4 py-3.5"
        >
          <p className="text-[11.5px] font-medium tracking-wide text-texto-tenue uppercase">
            {indicador.etiqueta}
          </p>
          <p className="cifras mt-1.5 text-[22px] leading-none font-semibold text-texto">
            {indicador.valor}
          </p>
          <p className="cifras mt-1.5 text-[11.5px] text-texto-medio">{indicador.nota}</p>
        </div>
      ))}
    </section>
  )
}
