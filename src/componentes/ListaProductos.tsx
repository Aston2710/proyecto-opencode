import type { Densidad, Producto } from '../tipos'
import { EncabezadoLista } from './EncabezadoLista'
import { EstadoVacio } from './EstadoVacio'
import { FilaProducto } from './FilaProducto'

interface Props {
  productos: Producto[]
  densidad: Densidad
  seleccionado: Producto | null
  onLimpiar: () => void
  onAbrir: (producto: Producto) => void
}

/**
 * Libro de inventario. No filtra, ordena ni pagina: recibe la página ya
 * resuelta. Un arreglo vacío no es un error, es un estado con salida.
 */
export function ListaProductos({
  productos,
  densidad,
  seleccionado,
  onLimpiar,
  onAbrir,
}: Props) {
  if (productos.length === 0) {
    return <EstadoVacio onLimpiar={onLimpiar} />
  }

  return (
    <div className="overflow-hidden rounded border border-borde bg-superficie">
      <EncabezadoLista />
      <ul className="flex flex-col [&>li:last-child>button]:border-b-0">
        {productos.map((producto) => (
          <li key={producto.id}>
            <FilaProducto
              producto={producto}
              densidad={densidad}
              seleccionado={seleccionado?.id === producto.id}
              onAbrir={onAbrir}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
