import { formatearAntiguedad, formatearEntero } from '../utilidades'

interface Props {
  origen: string | null
  referencias: number
  sincronizacion: string | null
}

/**
 * Procedencia de la información en pantalla.
 *
 * Un panel de inventario que no dice de cuándo son sus cifras invita a decidir
 * sobre datos viejos. Esto responde a las dos preguntas que importan: de dónde
 * salen y cuánto hace que llegaron.
 */
export function PieDatos({ origen, referencias, sincronizacion }: Props) {
  return (
    <footer className="border-t border-borde bg-superficie px-md py-4">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-1">
        <span className="t-metadata flex items-center gap-1.5 text-texto-medio">
          <span className="size-1.5 rounded-full bg-ok" aria-hidden="true" />
          {origen === null ? 'Origen no identificado' : origen}
        </span>

        <span className="t-metadata cifras text-texto-tenue">
          {formatearEntero(referencias)} referencias
        </span>

        <span className="t-metadata text-texto-tenue">
          Última sincronización {formatearAntiguedad(sincronizacion)}
        </span>
      </div>
    </footer>
  )
}
