import type { ValorCategoria } from '../metricas'
import { formatearEntero, formatearMonedaCompacta } from '../utilidades'

interface Props {
  datos: ValorCategoria[]
}

/**
 * Dónde está puesto el dinero, por categoría.
 *
 * Barras en HTML en lugar de una librería de gráficas: son ocho valores en una
 * sola dimensión. Una capa de SVG con ejes y escalas no aportaría nada y sí
 * pesaría en el paquete.
 */
export function GraficaValor({ datos }: Props) {
  const maximo = Math.max(...datos.map((punto) => punto.valor), 1)
  const total = datos.reduce((suma, punto) => suma + punto.valor, 0)

  return (
    <section
      aria-labelledby="titulo-valor"
      className="rounded border border-borde bg-superficie"
    >
      <header className="border-b border-borde px-md py-3">
        <h2 id="titulo-valor" className="t-card-title text-texto">
          Valor por categoría
        </h2>
        <p className="t-metadata mt-0.5 text-texto-tenue">
          Existencias por precio unitario. Los registros incompletos no suman.
        </p>
      </header>

      {datos.length === 0 ? (
        <p className="t-body px-md py-8 text-center text-texto-medio">
          No hay datos que mostrar con los filtros actuales.
        </p>
      ) : (
        <ul className="flex flex-col gap-2.5 p-md">
          {datos.map((punto) => {
            const porcentaje = total === 0 ? 0 : (punto.valor / total) * 100

            return (
              <li key={punto.categoria} className="flex items-center gap-sm">
                <span className="t-metadata w-[124px] shrink-0 truncate text-texto-medio">
                  {punto.categoria}
                </span>

                <span className="h-4 grow rounded-sm bg-superficie-alta">
                  <span
                    className="block h-full rounded-sm bg-acento"
                    style={{ width: `${(punto.valor / maximo) * 100}%` }}
                    role="img"
                    aria-label={`${formatearMonedaCompacta(punto.valor)}, ${porcentaje.toFixed(
                      0,
                    )} por ciento del total, ${formatearEntero(punto.articulos)} artículos`}
                  />
                </span>

                <span className="t-mono w-[76px] shrink-0 text-right text-texto">
                  {formatearMonedaCompacta(punto.valor)}
                </span>
                <span className="t-metadata w-[40px] shrink-0 text-right text-texto-tenue">
                  {porcentaje.toFixed(0)}%
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
