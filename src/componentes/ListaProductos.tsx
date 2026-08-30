import type { Densidad, Producto } from '../tipos'
import { EncabezadoLista } from './EncabezadoLista'
import { EstadoVacio } from './EstadoVacio'
import { FilaProducto } from './FilaProducto'

interface Props {
  productos: Producto[]
  densidad: Densidad
  onLimpiar: () => void
  onAbrir: (producto: Producto) => void
}

/**
 * Lista de resultados. No filtra, ordena ni pagina: recibe la página ya
 * resuelta. Un arreglo vacío no es un error, es un estado con salida.
 */
export function ListaProductos({ productos, densidad, onLimpiar, onAbrir }: Props) {
  if (productos.length === 0) {
    return <EstadoVacio onLimpiar={onLimpiar} />
  }

  return (
    <div>
      <EncabezadoLista />
      <ul className={`flex flex-col ${densidad === 'comoda' ? 'gap-sm' : 'gap-xs'}`}>
        {productos.map((producto) => (
          <li key={producto.id}>
            <FilaProducto producto={producto} densidad={densidad} onAbrir={onAbrir} />
          </li>
        ))}
      </ul>
    </div>
  )
}
