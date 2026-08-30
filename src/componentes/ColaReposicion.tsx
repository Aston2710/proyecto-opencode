import type { Producto } from '../tipos'
import {
  clasificarInventario,
  formatearEntero,
  formatearMoneda,
  formatearPlazo,
  textoOpcional,
} from '../utilidades'

interface Props {
  productos: Producto[]
  total: number
  onAbrir: (producto: Producto) => void
  onVerTodos: () => void
}

/**
 * Cola de reposición: lo que hay que comprar hoy, en orden de urgencia.
 *
 * Es el elemento central del panel. No es un resumen de lo que pasó, es una
 * lista de trabajo: cada fila dice cuánto falta, qué cuesta cubrirlo y en
 * cuánto tiempo llega.
 */
export function ColaReposicion({ productos, total, onAbrir, onVerTodos }: Props) {
  return (
    <section
      aria-labelledby="titulo-reposicion"
      className="rounded border border-borde bg-superficie shadow-[var(--sombra-panel)]"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-sm border-b border-borde px-md py-3">
        <div>
          <h2 id="titulo-reposicion" className="t-card-title text-texto">
            Cola de reposición
          </h2>
          <p className="t-metadata mt-0.5 text-texto-tenue">
            Agotados primero; dentro de cada grupo, por dinero comprometido
          </p>
        </div>
        {total > productos.length ? (
          <button
            type="button"
            onClick={onVerTodos}
            className="t-metadata rounded-sm text-acento underline underline-offset-2"
          >
            Ver los {formatearEntero(total)} en el catálogo →
          </button>
        ) : null}
      </header>

      {productos.length === 0 ? (
        <p className="t-body px-md py-10 text-center text-texto-medio">
          Ningún producto está por debajo de su mínimo. Nada que reponer hoy.
        </p>
      ) : (
        <ul>
          {productos.map((producto) => {
            const agotado = clasificarInventario(producto) === 'agotado'
            const stock = typeof producto.stock === 'number' ? producto.stock : 0
            const faltante = Math.max(0, producto.stockMinimo - stock)
            const precio = producto.precioUnitario
            const costo =
              typeof precio === 'number' && Number.isFinite(precio) ? faltante * precio : null

            return (
              <li key={producto.id}>
                <button
                  type="button"
                  onClick={() => onAbrir(producto)}
                  className="flex w-full items-center gap-md border-b border-borde px-md py-2.5 text-left transition-colors last:border-b-0 hover:bg-superficie-alta"
                >
                  <span
                    className={`t-label-caps w-[76px] shrink-0 rounded-sm px-1.5 py-1 text-center ${
                      agotado
                        ? 'bg-critico-suave text-critico'
                        : 'bg-alerta-suave text-alerta'
                    }`}
                  >
                    {agotado ? 'Agotado' : 'Bajo'}
                  </span>

                  <span className="min-w-0 grow">
                    <span className="t-card-title block truncate text-texto">
                      {producto.nombre}
                    </span>
                    <span className="t-metadata block truncate text-texto-tenue">
                      <span className="font-mono">{producto.id}</span>
                      <span aria-hidden="true"> · </span>
                      {textoOpcional(producto.proveedor, 'Sin proveedor')}
                      <span aria-hidden="true"> · </span>
                      Entrega en {formatearPlazo(producto.plazoEntregaHoras)}
                    </span>
                  </span>

                  <span className="hidden w-[128px] shrink-0 text-right sm:block">
                    <span className="t-mono block text-texto">
                      {formatearEntero(faltante)} u.
                    </span>
                    <span className="t-metadata block text-texto-tenue">
                      de {formatearEntero(producto.stockMinimo)} mínimo
                    </span>
                  </span>

                  <span className="w-[112px] shrink-0 text-right">
                    <span
                      className={`t-mono block ${costo === null ? 'text-texto-tenue' : 'text-texto'}`}
                    >
                      {costo === null ? 'Sin precio' : formatearMoneda(costo)}
                    </span>
                    <span className="t-metadata block text-texto-tenue">reponer</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
