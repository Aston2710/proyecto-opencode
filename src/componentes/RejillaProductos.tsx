import type { Producto } from '../tipos'
import { EstadoVacio } from './EstadoVacio'
import { TarjetaProducto } from './TarjetaProducto'

interface Props {
  productos: Producto[]
  onLimpiar: () => void
}

/**
 * Rejilla de resultados. No filtra ni ordena: recibe el arreglo ya resuelto.
 * Un arreglo vacío no es un error, es un estado con salida.
 */
export function RejillaProductos({ productos, onLimpiar }: Props) {
  if (productos.length === 0) {
    return <EstadoVacio onLimpiar={onLimpiar} />
  }

  return (
    <div
      className="grid gap-3.5"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
    >
      {productos.map((producto) => (
        <TarjetaProducto key={producto.id} producto={producto} />
      ))}
    </div>
  )
}
