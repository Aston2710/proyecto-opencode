import { BarraFiltros } from './componentes/BarraFiltros'
import { GraficaCategorias } from './componentes/GraficaCategorias'
import { PanelMetricas } from './componentes/PanelMetricas'
import { RejillaProductos } from './componentes/RejillaProductos'
import { useCatalogo } from './hooks/useCatalogo'
import { formatearEntero } from './utilidades'

export default function App() {
  const {
    estado,
    mensajeError,
    meta,
    descartados,
    categorias,
    resultados,
    metricas,
    serieCategorias,
    filtros,
    hayFiltrosActivos,
    actualizarFiltros,
    alternarCategoria,
    limpiarFiltros,
  } = useCatalogo()

  return (
    <div className="min-h-screen bg-fondo">
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-end justify-between gap-4 px-5 py-5">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-texto">
              Catálogo Mayorista
            </h1>
            <p className="mt-1 text-[12.5px] text-texto-medio">
              Panel de inventario generado a partir de un archivo de datos externo.
            </p>
          </div>
          {meta !== null ? (
            <dl className="cifras flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-texto-tenue">
              <div>
                <dt className="inline">Origen: </dt>
                <dd className="inline text-texto-medio">{meta.fuente}</dd>
              </div>
              <div>
                <dt className="inline">Registros: </dt>
                <dd className="inline text-texto-medio">{formatearEntero(meta.totalRegistros)}</dd>
              </div>
              <div>
                <dt className="inline">Versión: </dt>
                <dd className="inline text-texto-medio">v{meta.version}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </header>

      <main className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-6">
        {estado === 'cargando' ? <Aviso texto="Cargando catálogo…" /> : null}

        {estado === 'error' ? (
          <div
            role="alert"
            className="rounded-[10px] border border-critico bg-critico-suave px-4 py-3.5"
          >
            <p className="text-[13px] font-semibold text-critico">
              No se pudo cargar el archivo de datos
            </p>
            <p className="mt-1 text-[12.5px] text-texto-medio">
              {mensajeError ?? 'Causa desconocida.'} La interfaz permanece estable y no se
              renderizó ningún dato parcial.
            </p>
          </div>
        ) : null}

        {estado === 'listo' ? (
          <>
            {descartados > 0 ? (
              <p className="rounded-[10px] border border-alerta bg-alerta-suave px-4 py-2.5 text-[12.5px] text-alerta">
                Se descartaron {formatearEntero(descartados)} registros del archivo por carecer de
                id, nombre o categoría.
              </p>
            ) : null}

            <PanelMetricas metricas={metricas} />

            <BarraFiltros
              filtros={filtros}
              categorias={categorias}
              hayFiltrosActivos={hayFiltrosActivos}
              onCambiar={actualizarFiltros}
              onAlternarCategoria={alternarCategoria}
              onLimpiar={limpiarFiltros}
            />

            <GraficaCategorias datos={serieCategorias} />

            <p aria-live="polite" className="cifras text-[12.5px] text-texto-medio">
              {formatearEntero(resultados.length)} producto
              {resultados.length === 1 ? '' : 's'} en pantalla
            </p>

            <RejillaProductos productos={resultados} onLimpiar={limpiarFiltros} />
          </>
        ) : null}
      </main>

      <footer className="border-t border-borde px-5 py-6">
        <p className="mx-auto max-w-[1240px] text-[11.5px] text-texto-tenue">
          Proyecto final del Curso de Desarrollo con Inteligencia Artificial. Interfaz generada
          íntegramente mediante agentes; los datos provienen de{' '}
          <code className="font-mono">public/datos/productos.json</code>.
        </p>
      </footer>
    </div>
  )
}

function Aviso({ texto }: { texto: string }) {
  return (
    <p className="rounded-[10px] border border-borde bg-superficie px-4 py-8 text-center text-[13px] text-texto-medio">
      {texto}
    </p>
  )
}
