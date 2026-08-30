import { CalidadDato } from '../componentes/CalidadDato'
import { ColaReposicion } from '../componentes/ColaReposicion'
import { GraficaValor } from '../componentes/GraficaValor'
import type { HuecoCatalogo, ResumenNegocio, ValorCategoria } from '../metricas'
import type { Producto } from '../tipos'
import {
  formatearEntero,
  formatearMonedaCompacta,
  formatearPorcentaje,
} from '../utilidades'

interface Props {
  resumen: ResumenNegocio
  cola: Producto[]
  huecos: HuecoCatalogo[]
  valorPorCategoria: ValorCategoria[]
  onAbrirProducto: (producto: Producto) => void
  onIrAVista: (clave: string) => void
}

/** Cuántos productos de la cola caben antes de que deje de leerse de un vistazo. */
const CRITICOS_VISIBLES = 6

/**
 * Pantalla principal: dinero, urgencia y estado del dato.
 *
 * Los cuatro indicadores responden a las preguntas que se hace un comprador
 * mayorista al abrir el día, en este orden: cuánto tengo parado, qué me falta,
 * cuánto cuesta cubrirlo y de cuánto de esto me puedo fiar.
 */
export function Panel({
  resumen,
  cola,
  huecos,
  valorPorCategoria,
  onAbrirProducto,
  onIrAVista,
}: Props) {
  const indicadores = [
    {
      etiqueta: 'Valor del inventario',
      valor: formatearMonedaCompacta(resumen.valorInventario),
      nota:
        resumen.excluidosDelValor > 0
          ? `${formatearEntero(resumen.excluidosDelValor)} sin precio o sin existencias, excluidos`
          : 'todos los registros suman',
      tono: 'neutro' as const,
    },
    {
      etiqueta: 'Requieren reposición',
      valor: formatearEntero(resumen.necesitanReposicion),
      nota: `${formatearEntero(resumen.agotados)} agotados · ${formatearEntero(
        resumen.bajoMinimo,
      )} bajo mínimo`,
      tono: resumen.agotados > 0 ? ('critico' as const) : ('alerta' as const),
    },
    {
      etiqueta: 'Costo de reponer',
      valor: formatearMonedaCompacta(resumen.costoReposicion),
      nota:
        resumen.reposicionSinPrecio > 0
          ? `${formatearEntero(resumen.reposicionSinPrecio)} sin precio, no cuantificados`
          : 'para volver al mínimo de cada uno',
      tono: 'neutro' as const,
    },
    {
      etiqueta: 'Integridad del catálogo',
      valor: formatearPorcentaje(resumen.integridad),
      nota: `${formatearEntero(resumen.registrosConHuecos)} registros con huecos`,
      tono: 'neutro' as const,
    },
  ]

  const color = {
    neutro: 'text-texto',
    alerta: 'text-alerta',
    critico: 'text-critico',
  }

  return (
    <div className="flex flex-col gap-md">
      <section
        aria-label="Indicadores del negocio"
        className="grid grid-cols-2 gap-px overflow-hidden rounded border border-borde bg-borde lg:grid-cols-4"
      >
        {indicadores.map((indicador) => (
          <div key={indicador.etiqueta} className="bg-superficie px-md py-4">
            <p className="t-label-caps text-texto-tenue">{indicador.etiqueta}</p>
            <p className={`mt-1.5 text-[30px] leading-none font-semibold cifras ${color[indicador.tono]}`}>
              {indicador.valor}
            </p>
            <p className="t-metadata cifras mt-1.5 text-texto-tenue">{indicador.nota}</p>
          </div>
        ))}
      </section>

      <ColaReposicion
        productos={cola.slice(0, CRITICOS_VISIBLES)}
        total={cola.length}
        onAbrir={onAbrirProducto}
        onVerTodos={() => onIrAVista('reposicion')}
      />

      <div className="grid gap-md lg:grid-cols-[1.4fr_1fr]">
        <GraficaValor datos={valorPorCategoria} />
        <CalidadDato
          huecos={huecos}
          integridad={resumen.integridad}
          onIrAVista={onIrAVista}
        />
      </div>
    </div>
  )
}
