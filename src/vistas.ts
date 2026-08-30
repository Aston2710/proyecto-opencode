/**
 * Vistas guardadas del catálogo.
 *
 * Son los recortes que un comprador pide a diario. Tenerlos como preajustes
 * evita rearmar la misma combinación de filtros cada mañana, y da al panel un
 * destino concreto al que enviar desde cada indicador.
 */
import type { VistaGuardada } from './tipos'

export const VISTAS_GUARDADAS: VistaGuardada[] = [
  {
    clave: 'todos',
    nombre: 'Todo el catálogo',
    descripcion: 'Sin filtros aplicados',
    filtros: {},
  },
  {
    clave: 'reposicion',
    nombre: 'Requieren reposición',
    descripcion: 'Bajo mínimo o agotados',
    filtros: { inventario: 'atencion' },
  },
  {
    clave: 'agotados',
    nombre: 'Agotados',
    descripcion: 'Existencias en cero',
    filtros: { inventario: 'agotado' },
  },
  {
    clave: 'sin-precio',
    nombre: 'Sin precio',
    descripcion: 'No se pueden cotizar ni valorar',
    filtros: { soloSinPrecio: true },
  },
  {
    clave: 'sin-stock',
    nombre: 'Sin existencias registradas',
    descripcion: 'Quedan fuera del cálculo de reposición',
    filtros: { inventario: 'sin-dato' },
  },
  {
    clave: 'descuento',
    nombre: 'Con descuento',
    descripcion: 'Promoción vigente',
    filtros: { soloDescuento: true },
  },
  {
    clave: 'inactivos',
    nombre: 'Inactivos',
    descripcion: 'Dados de baja del catálogo',
    filtros: { actividad: 'inactivos' },
  },
  {
    clave: 'descuento-sin-precio',
    nombre: 'Descuento sin precio',
    descripcion: 'La promoción no se puede aplicar',
    filtros: { soloDescuento: true, soloSinPrecio: true },
  },
]

export function buscarVista(clave: string): VistaGuardada | undefined {
  return VISTAS_GUARDADAS.find((vista) => vista.clave === clave)
}
