interface Props {
  mensaje: string | null
  onReintentar: () => void
}

/**
 * Fallo de carga del archivo de datos. Muestra la causa concreta y ofrece
 * reintentar; nunca deja la página en blanco ni renderiza datos a medias.
 */
export function AvisoError({ mensaje, onReintentar }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded border border-critico bg-critico-suave p-md"
    >
      <div>
        <p className="t-card-title text-critico">No se pudo cargar el archivo de datos</p>
        <p className="t-body mt-1 text-texto-medio">
          {mensaje ?? 'Causa desconocida.'} La interfaz permanece estable y no se renderizó
          ningún dato parcial.
        </p>
      </div>
      <button
        type="button"
        onClick={onReintentar}
        className="t-body h-9 rounded border border-borde-fuerte bg-superficie px-4 font-medium text-texto transition-colors hover:bg-superficie-alta"
      >
        Reintentar
      </button>
    </div>
  )
}
