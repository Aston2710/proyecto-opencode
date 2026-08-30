import { useState } from 'react'
import { AvisoError } from './componentes/AvisoError'
import { BarraFiltros } from './componentes/BarraFiltros'
import { BarraSuperior } from './componentes/BarraSuperior'
import { EsqueletoCatalogo } from './componentes/EsqueletoCatalogo'
import { FiltrosActivos } from './componentes/FiltrosActivos'
import { GraficaCategorias } from './componentes/GraficaCategorias'
import { ListaProductos } from './componentes/ListaProductos'
import { Paginacion } from './componentes/Paginacion'
import { PanelDetalle } from './componentes/PanelDetalle'
import { PanelMetricas } from './componentes/PanelMetricas'
import { useCatalogo } from './hooks/useCatalogo'
import { useTema } from './hooks/useTema'
import type { Densidad, Producto } from './tipos'
import { formatearEntero } from './utilidades'

export default function App() {
  const {
    estado,
    mensajeError,
    meta,
    descartados,
    categorias,
    resultados,
    productosPagina,
    pagina,
    totalPaginas,
    rango,
    irAPagina,
    densidad,
    setDensidad,
    metricas,
    serieCategorias,
    filtros,
    filtrosActivos,
    actualizarFiltros,
    alternarCategoria,
    limpiarFiltros,
    reintentar,
  } = useCatalogo()

  const { esOscuro, alternar } = useTema()
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)

  return (
    <div className="min-h-screen bg-fondo">
      <BarraSuperior meta={meta} esOscuro={esOscuro} onAlternarTema={alternar} />

      <main className="mx-auto flex max-w-[1240px] flex-col gap-md p-md">
        {estado === 'cargando' ? <EsqueletoCatalogo /> : null}

        {estado === 'error' ? (
          <AvisoError mensaje={mensajeError} onReintentar={reintentar} />
        ) : null}

        {estado === 'listo' ? (
          <>
            {descartados > 0 ? (
              <p className="t-metadata rounded border border-alerta bg-alerta-suave px-md py-2.5 text-alerta">
                Se descartaron {formatearEntero(descartados)} registros del archivo por carecer de
                id, nombre o categoría.
              </p>
            ) : null}

            <PanelMetricas
              metricas={metricas}
              filtrandoAtencion={filtros.inventario === 'atencion'}
              onVerAtencion={() =>
                actualizarFiltros({
                  inventario: filtros.inventario === 'atencion' ? 'todos' : 'atencion',
                })
              }
            />

            <BarraFiltros
              filtros={filtros}
              categorias={categorias}
              onCambiar={actualizarFiltros}
              onAlternarCategoria={alternarCategoria}
            />

            <FiltrosActivos filtros={filtrosActivos} onLimpiar={limpiarFiltros} />

            <GraficaCategorias datos={serieCategorias} />

            <div className="flex flex-wrap items-center justify-between gap-md">
              <p aria-live="polite" className="t-body cifras text-texto-medio">
                {formatearEntero(resultados.length)} producto
                {resultados.length === 1 ? '' : 's'} en pantalla
              </p>
              <SelectorDensidad densidad={densidad} onCambiar={setDensidad} />
            </div>

            <ListaProductos
              productos={productosPagina}
              densidad={densidad}
              onLimpiar={limpiarFiltros}
              onAbrir={setSeleccionado}
            />

            <Paginacion
              pagina={pagina}
              totalPaginas={totalPaginas}
              rango={rango}
              total={resultados.length}
              onIr={irAPagina}
            />
          </>
        ) : null}
      </main>

      <footer className="border-t border-borde px-md py-lg">
        <p className="t-metadata mx-auto max-w-[1240px] text-texto-tenue">
          Proyecto final del Curso de Desarrollo con Inteligencia Artificial. Interfaz generada
          íntegramente mediante agentes; los datos provienen de{' '}
          <code className="font-mono">public/datos/productos.json</code>.
        </p>
      </footer>

      <PanelDetalle producto={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </div>
  )
}

function SelectorDensidad({
  densidad,
  onCambiar,
}: {
  densidad: Densidad
  onCambiar: (valor: Densidad) => void
}) {
  const opciones: Array<{ valor: Densidad; etiqueta: string }> = [
    { valor: 'comoda', etiqueta: 'Cómoda' },
    { valor: 'compacta', etiqueta: 'Compacta' },
  ]

  return (
    <div
      role="group"
      aria-label="Densidad de la lista"
      className="flex items-center gap-1 rounded border border-borde bg-superficie p-0.5"
    >
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          aria-pressed={densidad === opcion.valor}
          onClick={() => onCambiar(opcion.valor)}
          className={`t-metadata h-7 rounded-sm px-2.5 transition-colors ${
            densidad === opcion.valor
              ? 'bg-superficie-alta text-texto'
              : 'text-texto-tenue hover:text-texto-medio'
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  )
}
