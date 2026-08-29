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
    <section
      aria-label="Inventario por categoría"
      className="rounded-[10px] border border-borde bg-superficie p-4"
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold text-texto">Unidades por categoría</h2>
        <p className="text-[11.5px] text-texto-tenue">
          Calculado sobre los productos visibles. Los registros sin stock no suman.
        </p>
      </header>

      {datos.length === 0 ? (
        <p className="py-10 text-center text-[13px] text-texto-medio">
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
                  borderRadius: 10,
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
              <Bar dataKey="unidades" fill="var(--acento)" radius={[6, 6, 0, 0]} maxBarSize={54} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
