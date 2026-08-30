import { BarraHerramientas } from '../componentes/BarraHerramientas'
import { Paginacion } from '../componentes/Paginacion'
import { TablaProductos } from '../componentes/TablaProductos'
import type {
  CampoOrden,
  Densidad,
  FiltroActivo,
  FiltrosCatalogo,
  OpcionFiltro,
  Producto,
  VistaGuardada,
} from '../tipos'
import { formatearEntero } from '../utilidades'
import { VISTAS_GUARDADAS } from '../vistas'

interface Props {
  filtros: FiltrosCatalogo
  categorias: OpcionFiltro[]
  filtrosActivos: FiltroActivo[]
  densidad: Densidad
  productosPagina: Producto[]
  totalResultados: number
  pagina: number
  totalPaginas: number
  rango: { desde: number; hasta: number }
  vistaActiva: string | null
  seleccionado: Producto | null
  onCambiar: (cambios: Partial<FiltrosCatalogo>) => void
  onAlternarCategoria: (categoria: string) => void
  onLimpiar: () => void
  onCambiarDensidad: (densidad: Densidad) => void
  onAplicarVista: (vista: VistaGuardada) => void
  onOrdenar: (campo: CampoOrden) => void
  onIrAPagina: (pagina: number) => void
  onAbrir: (producto: Producto) => void
}

/**
 * Pantalla de consulta: buscar y acotar el catálogo.
 *
 * Abre con las vistas guardadas porque el 90 % de las consultas son una de
 * ellas. Rearmar la misma combinación de filtros cada mañana es trabajo que la
 * herramienta puede ahorrarse.
 */
export function Catalogo({
  filtros,
  categorias,
  filtrosActivos,
  densidad,
  productosPagina,
  totalResultados,
  pagina,
  totalPaginas,
  rango,
  vistaActiva,
  seleccionado,
  onCambiar,
  onAlternarCategoria,
  onLimpiar,
  onCambiarDensidad,
  onAplicarVista,
  onOrdenar,
  onIrAPagina,
  onAbrir,
}: Props) {
  return (
    <div className="flex flex-col gap-md">
      <section aria-label="Vistas guardadas">
        <h2 className="t-label-caps mb-2 text-texto-tenue">Vistas guardadas</h2>
        <div className="sin-barra flex gap-sm overflow-x-auto pb-1">
          {VISTAS_GUARDADAS.map((vista) => {
            const activa = vistaActiva === vista.clave
            return (
              <button
                key={vista.clave}
                type="button"
                aria-pressed={activa}
                onClick={() => onAplicarVista(vista)}
                className={`min-w-[168px] shrink-0 rounded border px-3 py-2 text-left transition-colors ${
                  activa
                    ? 'border-acento bg-acento-suave'
                    : 'border-borde bg-superficie hover:border-borde-fuerte hover:bg-superficie-alta'
                }`}
              >
                <span
                  className={`t-body block font-medium ${activa ? 'text-acento' : 'text-texto'}`}
                >
                  {vista.nombre}
                </span>
                <span className="t-metadata block text-texto-tenue">{vista.descripcion}</span>
              </button>
            )
          })}
        </div>
      </section>

      <BarraHerramientas
        filtros={filtros}
        categorias={categorias}
        filtrosActivos={filtrosActivos}
        densidad={densidad}
        onCambiar={onCambiar}
        onAlternarCategoria={onAlternarCategoria}
        onLimpiar={onLimpiar}
        onCambiarDensidad={onCambiarDensidad}
      />

      <TablaProductos
        productos={productosPagina}
        densidad={densidad}
        orden={filtros.orden}
        seleccionado={seleccionado}
        onOrdenar={onOrdenar}
        onLimpiar={onLimpiar}
        onAbrir={onAbrir}
      />

      <div className="flex flex-wrap items-center justify-between gap-md">
        <p className="t-metadata text-texto-tenue">
          En la columna <span className="text-texto-medio">Reorden</span>, la marca vertical señala
          el mínimo de cada producto.
        </p>
        <Paginacion
          pagina={pagina}
          totalPaginas={totalPaginas}
          rango={rango}
          total={totalResultados}
          onIr={onIrAPagina}
        />
      </div>

      <p aria-live="polite" className="sr-only">
        {formatearEntero(totalResultados)} productos coinciden con los filtros
      </p>
    </div>
  )
}
