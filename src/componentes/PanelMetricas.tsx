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
  const atencion =
    (metricas.conteoPorEstado.bajo ?? 0) + (metricas.conteoPorEstado.agotado ?? 0)

  const indicadores = [
    {
      etiqueta: 'Productos visibles',
      valor: formatearEntero(metricas.total),
      nota: `de ${formatearEntero(metricas.totalGeneral)} en catálogo`,
      alerta: false,
    },
    {
      etiqueta: 'Precio promedio',
      valor:
        metricas.precioPromedio === null ? 'Sin datos' : formatearMoneda(metricas.precioPromedio),
      nota:
        metricas.sinPrecio > 0
          ? `${formatearEntero(metricas.sinPrecio)} sin precio, excluidos`
          : 'todos con precio',
      alerta: false,
    },
    {
      etiqueta: 'Unidades en piso',
      valor:
        metricas.unidadesTotales === null
          ? 'Sin datos'
          : formatearEntero(metricas.unidadesTotales),
      nota: `${formatearEntero(metricas.conteoPorEstado['sin-dato'] ?? 0)} sin registro de stock`,
      alerta: false,
    },
    {
      etiqueta: 'Requieren atención',
      valor: formatearEntero(atencion),
      nota: `${formatearEntero(metricas.conteoPorEstado.bajo ?? 0)} bajos · ${formatearEntero(
        metricas.conteoPorEstado.agotado ?? 0,
      )} agotados`,
      alerta: atencion > 0,
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
          <p
            className={`t-label-caps ${indicador.alerta ? 'text-critico' : 'text-texto-tenue'}`}
          >
            {indicador.etiqueta}
          </p>
          <p
            className={`t-indicator mt-xs ${indicador.alerta ? 'text-critico' : 'text-texto'}`}
          >
            {indicador.valor}
          </p>
          <p className="t-metadata cifras mt-xs text-texto-medio">{indicador.nota}</p>
        </div>
      ))}
    </section>
  )
}
