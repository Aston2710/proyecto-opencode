/**
 * Enrutado mínimo por fragmento de URL.
 *
 * Se resuelve a mano en lugar de añadir una librería de rutas: son dos
 * pantallas y el fragmento no viaja al servidor, así que la aplicación sigue
 * siendo estática y no necesita reescrituras en el alojamiento. Añadir una
 * dependencia para esto no se sostiene.
 */
import { useCallback, useEffect, useState } from 'react'

export const RUTAS = ['panel', 'catalogo'] as const
export type Ruta = (typeof RUTAS)[number]

function esRuta(valor: string): valor is Ruta {
  return (RUTAS as readonly string[]).includes(valor)
}

/** Lee la ruta del fragmento actual, con `panel` como destino por omisión. */
function leerRuta(): Ruta {
  const fragmento = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  return esRuta(fragmento) ? fragmento : 'panel'
}

export function useRuta() {
  const [ruta, setRuta] = useState<Ruta>(leerRuta)

  useEffect(() => {
    const alCambiar = () => setRuta(leerRuta())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const navegar = useCallback((destino: Ruta) => {
    window.location.hash = `#/${destino}`
    // La navegación entre pantallas devuelve el foco de lectura arriba; si no,
    // se aterriza a media página sin contexto.
    window.scrollTo({ top: 0 })
  }, [])

  return { ruta, navegar }
}
