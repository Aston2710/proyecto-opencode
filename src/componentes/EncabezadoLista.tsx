/**
 * Encabezado de columnas de la lista, al modo de un libro de inventario.
 * Los anchos coinciden con los de `FilaProducto`, así que las cifras de todas
 * las filas caen bajo su rótulo.
 */
export function EncabezadoLista() {
  return (
    <div className="flex items-center gap-md px-sm pb-1">
      <span className="size-12 shrink-0" aria-hidden="true" />
      <span className="t-label-caps grow text-texto-tenue">Producto</span>
      <span className="t-label-caps hidden w-[88px] shrink-0 text-texto-tenue sm:block">
        Reorden
      </span>
      <span className="t-label-caps hidden w-[76px] shrink-0 text-right text-texto-tenue sm:block">
        Existencias
      </span>
      <span className="t-label-caps w-[104px] shrink-0 text-right text-texto-tenue">Unitario</span>
    </div>
  )
}
