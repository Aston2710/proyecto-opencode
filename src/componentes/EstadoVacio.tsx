interface Props {
  onLimpiar: () => void
}

/** Resultado vacío: explica la causa y ofrece la salida, no deja al usuario varado. */
export function EstadoVacio({ onLimpiar }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded border border-dashed border-borde-fuerte bg-superficie-sutil px-md py-20 text-center">
      <p className="t-card-title text-texto">Ningún producto coincide</p>
      <p className="t-body max-w-[380px] text-texto-medio">
        Los filtros activos no dejan resultados en el catálogo. Ajusta la búsqueda o vuelve al
        listado completo.
      </p>
      <button
        type="button"
        onClick={onLimpiar}
        className="t-body mt-1 h-9 rounded bg-acento px-4 font-medium text-acento-texto transition-opacity hover:opacity-90"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
