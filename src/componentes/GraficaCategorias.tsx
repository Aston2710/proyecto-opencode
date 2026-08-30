import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatearEntero } from '../utilidades'

interface Punto {
  categoria: string
  unidades: number
  articulos: number
}

interface Props {
  datos: Punto[]
}

/**
 * Unidades en inventario por categoría, calculadas sobre el resultado filtrado:
 * la gráfica reacciona a los mismos filtros que la rejilla.
 */
export function GraficaCategorias({ datos }: Props) {
  return (
    <details className="group rounded border border-borde bg-superficie [&[open]>summary]:border-b">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-sm border-borde p-md marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 shrink-0 text-texto-tenue transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
          >
            <path d="m9 6 6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="t-card-title text-texto">Unidades por categoría</span>
        </span>
        <span className="t-metadata text-texto-tenue">
          Calculado sobre los productos visibles. Los registros sin stock no suman.
        </span>
      </summary>

      <div className="p-md">{contenido()}</div>
    </details>
  )

  function contenido() {
    return datos.length === 0 ? (
        <p className="t-body py-10 text-center text-texto-medio">
          No hay datos que graficar con los filtros actuales.
        </p>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="var(--borde)" vertical={false} />
              <XAxis
                dataKey="categoria"
                tick={{ fill: 'var(--texto-medio)', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: 'var(--borde)' }}
                interval={0}
                angle={-18}
                textAnchor="end"
                height={58}
              />
              <YAxis
                tick={{ fill: 'var(--texto-tenue)', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(valor: number) => formatearEntero(valor)}
              />
              <Tooltip
                cursor={{ fill: 'var(--neutro-suave)' }}
                contentStyle={{
                  background: 'var(--superficie)',
                  border: '1px solid var(--borde-fuerte)',
                  borderRadius: 4,
                  fontSize: 12,
                  color: 'var(--texto)',
                }}
                labelStyle={{ color: 'var(--texto)', fontWeight: 600 }}
                // Recharts tipa el valor como `ValueType | undefined`; se
                // estrecha aquí en vez de forzarlo con un aserto.
                formatter={(valor, nombre) => [
                  formatearEntero(typeof valor === 'number' ? valor : null),
                  nombre === 'unidades' ? 'Unidades' : 'Artículos',
                ]}
              />
              <Bar dataKey="unidades" fill="var(--acento)" radius={[4, 4, 0, 0]} maxBarSize={54} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )
  }
}
