interface Props {
  onLimpiar: () => void
}

/** Resultado vacío: explica la causa y ofrece la salida, no deja al usuario varado. */
export function EstadoVacio({ onLimpiar }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-borde-fuerte bg-superficie-sutil px-6 py-16 text-center">
      <p className="text-[15px] font-semibold text-texto">Ningún producto coincide</p>
      <p className="max-w-sm text-[13px] text-texto-medio">
        Los filtros activos no dejan resultados en el catálogo. Ajusta la búsqueda o vuelve al
        listado completo.
      </p>
      <button
        type="button"
        onClick={onLimpiar}
        className="mt-1 rounded-[10px] bg-acento px-3.5 py-2 text-[13px] font-medium text-acento-texto transition-opacity hover:opacity-90"
      >
        Limpiar filtros
      </button>
    </div>
  )
}
