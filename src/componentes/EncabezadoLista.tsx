/**
 * Encabezado de columnas del libro de inventario. Los anchos coinciden uno a
 * uno con los de `FilaProducto`, así que cada cifra cae bajo su rótulo.
 *
 * Queda fijo bajo la barra superior: en una tabla de 24 filas, perder los
 * rótulos al bajar obliga a subir para recordar qué columna es cuál.
 */
export function EncabezadoLista() {
  return (
    <div className="sticky top-[56px] z-20 flex items-center gap-md border-b border-borde-fuerte bg-fondo px-sm py-2">
      <span className="size-8 shrink-0" aria-hidden="true" />
      <span className="t-label-caps w-[92px] shrink-0 text-texto-tenue">SKU</span>
      <span className="t-label-caps grow text-texto-tenue">Producto</span>
      <span className="t-label-caps hidden w-[120px] shrink-0 text-texto-tenue lg:block">
        Categoría
      </span>
      <span className="t-label-caps hidden w-[104px] shrink-0 text-texto-tenue sm:block">
        Estado
      </span>
      <span className="t-label-caps hidden w-[72px] shrink-0 text-texto-tenue md:block">
        Reorden
      </span>
      <span className="t-label-caps w-[68px] shrink-0 text-right text-texto-tenue">Exist.</span>
      <span className="t-label-caps hidden w-[72px] shrink-0 text-right text-texto-tenue xl:block">
        Entrega
      </span>
      <span className="t-label-caps w-[104px] shrink-0 text-right text-texto-tenue">Unitario</span>
      <span className="w-[52px] shrink-0" aria-hidden="true" />
    </div>
  )
}
