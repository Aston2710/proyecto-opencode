import { useState } from 'react'
import { AvisoError } from './componentes/AvisoError'
import { BarraHerramientas } from './componentes/BarraHerramientas'
import { BarraSuperior } from './componentes/BarraSuperior'
import { EsqueletoCatalogo } from './componentes/EsqueletoCatalogo'
import { GraficaCategorias } from './componentes/GraficaCategorias'
import { Paginacion } from './componentes/Paginacion'
import { PanelDetalle } from './componentes/PanelDetalle'
import { PanelMetricas } from './componentes/PanelMetricas'
import { TablaProductos } from './componentes/TablaProductos'
import { useCatalogo } from './hooks/useCatalogo'
import { useTema } from './hooks/useTema'
import type { Producto } from './tipos'
import { formatearEntero } from './utilidades'

export default function App() {
  const {
    estado,
    mensajeError,
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
    ordenarPor,
    reintentar,
  } = useCatalogo()

  const { esOscuro, alternar } = useTema()
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)

  return (
    <div className="min-h-screen bg-fondo">
      <BarraSuperior esOscuro={esOscuro} onAlternarTema={alternar} />

      <main className="mx-auto flex max-w-[1240px] flex-col gap-md px-md py-md">
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

            <BarraHerramientas
              filtros={filtros}
              categorias={categorias}
              filtrosActivos={filtrosActivos}
              densidad={densidad}
              onCambiar={actualizarFiltros}
              onAlternarCategoria={alternarCategoria}
              onLimpiar={limpiarFiltros}
              onCambiarDensidad={setDensidad}
            />

            <TablaProductos
              productos={productosPagina}
              densidad={densidad}
              orden={filtros.orden}
              seleccionado={seleccionado}
              onOrdenar={ordenarPor}
              onLimpiar={limpiarFiltros}
              onAbrir={setSeleccionado}
            />

            <div className="flex flex-wrap items-center justify-between gap-md">
              <p className="t-metadata text-texto-tenue">
                En la columna <span className="text-texto-medio">Reorden</span>, la marca vertical
                señala el mínimo de cada producto.
              </p>
              <Paginacion
                pagina={pagina}
                totalPaginas={totalPaginas}
                rango={rango}
                total={resultados.length}
                onIr={irAPagina}
              />
            </div>

            <GraficaCategorias datos={serieCategorias} />
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
