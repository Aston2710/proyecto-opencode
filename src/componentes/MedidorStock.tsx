import type { Producto } from '../tipos'
import { clasificarInventario, formatearEntero } from '../utilidades'

interface Props {
  producto: Producto
}

/**
 * Regleta de existencias contra el punto de reorden.
 *
 * La escala de cada fila es tres veces su propio mínimo, de modo que la marca
 * del punto de reorden cae **siempre en el mismo tercio** de la regleta. Eso es
 * lo que la hace útil: basta recorrer la columna con la vista para ver quién
 * está por debajo, sin leer una sola cifra.
 *
 * Un producto sin stock registrado no dibuja barra. Estimar dónde estaría
 * sería inventar un dato que el archivo no tiene.
 */
export function MedidorStock({ producto }: Props) {
  const estado = clasificarInventario(producto)
  const minimo = Math.max(1, producto.stockMinimo)
  const escala = minimo * 3

  if (estado === 'sin-dato') {
    return (
      <span
        role="img"
        aria-label="Existencias sin registrar"
        className="relative block h-1.5 w-full rounded-full border border-dashed border-borde-fuerte"
      />
    )
  }

  const proporcion = Math.min(1, (producto.stock ?? 0) / escala)
  const relleno =
    estado === 'agotado' ? 'bg-critico' : estado === 'bajo' ? 'bg-alerta' : 'bg-acento'

  return (
    <span
      role="img"
      aria-label={`${formatearEntero(producto.stock)} unidades, mínimo ${formatearEntero(
        producto.stockMinimo,
      )}`}
      className="relative block h-1.5 w-full rounded-full bg-superficie-alta"
    >
      <span
        className={`absolute inset-y-0 left-0 rounded-full ${relleno}`}
        style={{ width: `${Math.max(proporcion * 100, proporcion > 0 ? 3 : 0)}%` }}
      />
      {/* Marca del punto de reorden, fija en un tercio de la regleta. */}
      <span
        className="absolute top-[-3px] bottom-[-3px] w-px bg-texto-tenue"
        style={{ left: '33.333%' }}
      />
    </span>
  )
}
