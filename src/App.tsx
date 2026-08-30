import { useMemo, useState } from 'react'
import { AvisoError } from './componentes/AvisoError'
import { BarraSuperior } from './componentes/BarraSuperior'
import { EsqueletoCatalogo } from './componentes/EsqueletoCatalogo'
import { PanelDetalle } from './componentes/PanelDetalle'
import { PieDatos } from './componentes/PieDatos'
import { useCatalogo } from './hooks/useCatalogo'
import { useRuta } from './hooks/useRuta'
import { useTema } from './hooks/useTema'
import {
  colaReposicion,
  inventariarHuecos,
  resumirNegocio,
  ultimaSincronizacion,
  valorPorCategoria,
} from './metricas'
import { Catalogo } from './paginas/Catalogo'
import { Panel } from './paginas/Panel'
import type { Producto, VistaGuardada } from './tipos'
import { formatearEntero } from './utilidades'
import { buscarVista, VISTAS_GUARDADAS } from './vistas'

export default function App() {
  const catalogo = useCatalogo()
  const { ruta, navegar } = useRuta()
  const { esOscuro, alternar } = useTema()
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)
  const [vistaActiva, setVistaActiva] = useState<string | null>('todos')

  const { productos, estado, mensajeError, descartados } = catalogo

  // El panel resume el catálogo completo, no el filtrado: son los indicadores
  // del negocio, no los del recorte que el usuario tenga abierto.
  const resumen = useMemo(() => resumirNegocio(productos), [productos])
  const cola = useMemo(() => colaReposicion(productos), [productos])
  const huecos = useMemo(() => inventariarHuecos(productos), [productos])
  const valores = useMemo(() => valorPorCategoria(productos), [productos])
  const sincronizacion = useMemo(() => ultimaSincronizacion(productos), [productos])

  function aplicarVista(vista: VistaGuardada) {
    catalogo.aplicarVista(vista)
    setVistaActiva(vista.clave)
  }

  /** Salta al catálogo con una vista guardada ya aplicada. */
  function irAVista(clave: string) {
    const vista = buscarVista(clave) ?? VISTAS_GUARDADAS[0]
    aplicarVista(vista)
    navegar('catalogo')
  }

  return (
    <div className="min-h-screen bg-fondo">
      <BarraSuperior
        ruta={ruta}
        esOscuro={esOscuro}
        onNavegar={navegar}
        onAlternarTema={alternar}
      />

      <main className="mx-auto flex max-w-[1240px] flex-col gap-md px-md py-md">
        {estado === 'cargando' ? <EsqueletoCatalogo /> : null}

        {estado === 'error' ? (
          <AvisoError mensaje={mensajeError} onReintentar={catalogo.reintentar} />
        ) : null}

        {estado === 'listo' ? (
          <>
            {descartados > 0 ? (
              <p className="t-metadata rounded border border-alerta bg-alerta-suave px-md py-2.5 text-alerta">
                Se omitieron {formatearEntero(descartados)} referencias por carecer de clave, nombre o
                categoría. Revísalas en el sistema de origen.
              </p>
            ) : null}

            {ruta === 'panel' ? (
              <Panel
                resumen={resumen}
                cola={cola}
                huecos={huecos}
                valorPorCategoria={valores}
                onAbrirProducto={setSeleccionado}
                onIrAVista={irAVista}
              />
            ) : (
              <Catalogo
                filtros={catalogo.filtros}
                categorias={catalogo.categorias}
                filtrosActivos={catalogo.filtrosActivos}
                densidad={catalogo.densidad}
                productosPagina={catalogo.productosPagina}
                totalResultados={catalogo.resultados.length}
                pagina={catalogo.pagina}
                totalPaginas={catalogo.totalPaginas}
                rango={catalogo.rango}
                vistaActiva={vistaActiva}
                seleccionado={seleccionado}
                onCambiar={(cambios) => {
                  catalogo.actualizarFiltros(cambios)
                  setVistaActiva(null)
                }}
                onAlternarCategoria={(categoria) => {
                  catalogo.alternarCategoria(categoria)
                  setVistaActiva(null)
                }}
                onLimpiar={() => {
                  catalogo.limpiarFiltros()
                  setVistaActiva('todos')
                }}
                onCambiarDensidad={catalogo.setDensidad}
                onAplicarVista={aplicarVista}
                onOrdenar={catalogo.ordenarPor}
                onIrAPagina={catalogo.irAPagina}
                onAbrir={setSeleccionado}
              />
            )}
          </>
        ) : null}
      </main>

      <PieDatos
        origen={catalogo.meta?.fuente ?? null}
        referencias={productos.length}
        sincronizacion={sincronizacion}
      />

      <PanelDetalle producto={seleccionado} onCerrar={() => setSeleccionado(null)} />
    </div>
  )
}
