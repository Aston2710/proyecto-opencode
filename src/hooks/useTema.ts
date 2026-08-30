/**
 * Preferencia de tema con tres estados: sistema, claro y oscuro.
 *
 * El valor se refleja en el atributo `data-tema` de <html>, que es lo que
 * consumen los tokens de `index.css`. Sin atributo manda
 * `prefers-color-scheme`, de modo que la primera visita respeta el sistema
 * operativo.
 */
import { useCallback, useEffect, useState } from 'react'
import type { Tema } from '../tipos'

const CLAVE_ALMACEN = 'catalogo-mayorista:tema'

function esTema(valor: unknown): valor is Tema {
  return valor === 'sistema' || valor === 'claro' || valor === 'oscuro'
}

/**
 * Tema de partida cuando el visitante no ha elegido todavía.
 *
 * Es `claro` y no `sistema` a propósito: el sistema de diseño se construyó
 * sobre el papel cálido, y esa es la lectura de referencia del catálogo. El
 * tema oscuro existe y está completo, pero se ofrece, no se impone por la
 * configuración del sistema operativo.
 */
const TEMA_POR_OMISION: Tema = 'claro'

/**
 * Lee la preferencia guardada. El acceso va en try/catch porque en una
 * ventana privada o con el almacenamiento bloqueado, leerlo lanza.
 */
function leerPreferencia(): Tema {
  try {
    const guardado = window.localStorage.getItem(CLAVE_ALMACEN)
    return esTema(guardado) ? guardado : TEMA_POR_OMISION
  } catch {
    return TEMA_POR_OMISION
  }
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(leerPreferencia)

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') {
      raiz.removeAttribute('data-tema')
    } else {
      raiz.setAttribute('data-tema', tema)
    }
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, tema)
    } catch {
      // Sin persistencia la interfaz sigue siendo correcta durante la sesión.
    }
  }, [tema])

  /** Devuelve si en este momento se está viendo el tema oscuro. */
  const esOscuro =
    tema === 'oscuro' ||
    (tema === 'sistema' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const alternar = useCallback(() => {
    setTema((previo) => {
      if (previo === 'sistema') {
        const sistemaOscuro =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches
        return sistemaOscuro ? 'claro' : 'oscuro'
      }
      return previo === 'oscuro' ? 'claro' : 'oscuro'
    })
  }, [])

  return { tema, esOscuro, alternar }
}
