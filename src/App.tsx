import { useMemo, useState } from 'react'
import { AvisoError } from './componentes/AvisoError'
import { BarraSuperior } from './componentes/BarraSuperior'
import { EsqueletoCatalogo } from './componentes/EsqueletoCatalogo'
import { PanelDetalle } from './componentes/PanelDetalle'
import { useCatalogo } from './hooks/useCatalogo'
import { useRuta } from './hooks/useRuta'
import { useTema } from './hooks/useTema'
import {
  colaReposicion,
  inventariarHuecos,
  resumirNegocio,
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
                Se descartaron {formatearEntero(descartados)} registros del archivo por carecer de
                id, nombre o categoría.
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
