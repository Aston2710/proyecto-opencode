/**
 * Única capa que conoce el origen de los datos.
 *
 * Carga el archivo base por `fetch` en tiempo de ejecución: sustituir
 * public/datos/productos.json cambia por completo la interfaz sin tocar
 * una sola línea de código de componentes.
 *
 * Todas las opciones de filtro se derivan del archivo. No hay listas de
 * categorías, marcas ni rangos escritas a mano en ningún lugar del proyecto.
 */
import { useEffect, useMemo, useState } from 'react'
import type {
  ArchivoCatalogo,
  FiltrosCatalogo,
  MetaCatalogo,
  OpcionFiltro,
  Producto,
} from '../tipos'
import {
  clasificarInventario,
  normalizar,
  promedioSeguro,
  sumaSegura,
} from '../utilidades'

const RUTA_DATOS = `${import.meta.env.BASE_URL}datos/productos.json`

export const FILTROS_INICIALES: FiltrosCatalogo = {
  busqueda: '',
  categorias: [],
  inventario: 'todos',
  soloActivos: false,
  soloDescuento: false,
  orden: 'nombre-asc',
}

type EstadoCarga = 'cargando' | 'listo' | 'error'

/**
 * Valida que lo recibido tenga la forma mínima esperada.
 * Un archivo corrupto debe producir un estado de error visible, nunca una
 * pantalla en blanco por un `.map` sobre `undefined`.
 */
function esArchivoValido(dato: unknown): dato is ArchivoCatalogo {
  if (typeof dato !== 'object' || dato === null) return false
  const posible = dato as { productos?: unknown }
  return Array.isArray(posible.productos)
}

/**
 * Descarta registros que no sirven para renderizar.
 * `id`, `nombre` y `categoria` son los tres campos que la interfaz da por
 * garantizados; cualquier otro puede faltar.
 */
function esProductoUtilizable(dato: unknown): dato is Producto {
  if (typeof dato !== 'object' || dato === null) return false
  const posible = dato as Partial<Producto>
  return (
    typeof posible.id === 'string' &&
    typeof posible.nombre === 'string' &&
    typeof posible.categoria === 'string'
  )
}

/** Cuenta valores de un campo de texto, agrupando los nulos bajo una etiqueta. */
function contarPor(
  productos: Producto[],
  extraer: (producto: Producto) => string | null | undefined,
  etiquetaVacia: string,
): OpcionFiltro[] {
  const conteos = new Map<string, number>()
  for (const producto of productos) {
    const bruto = extraer(producto)
    const clave =
      typeof bruto === 'string' && bruto.trim() !== '' ? bruto.trim() : etiquetaVacia
    conteos.set(clave, (conteos.get(clave) ?? 0) + 1)
  }
  return [...conteos.entries()]
    .map(([valor, conteo]) => ({ valor, conteo }))
    .sort((a, b) => b.conteo - a.conteo || a.valor.localeCompare(b.valor, 'es'))
}

export function useCatalogo() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [meta, setMeta] = useState<MetaCatalogo | null>(null)
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(FILTROS_INICIALES)
  const [descartados, setDescartados] = useState(0)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const respuesta = await fetch(RUTA_DATOS)
        if (!respuesta.ok) {
          throw new Error(`El servidor respondió ${respuesta.status} al pedir el catálogo.`)
        }
        const crudo: unknown = await respuesta.json()
        if (!esArchivoValido(crudo)) {
          throw new Error('El archivo de datos no contiene un arreglo "productos".')
        }
        const utilizables = crudo.productos.filter(esProductoUtilizable)
        if (cancelado) return
        setProductos(utilizables)
        setDescartados(crudo.productos.length - utilizables.length)
        setMeta(crudo.meta ?? null)
        setEstado('listo')
      } catch (error) {
        if (cancelado) return
        setMensajeError(error instanceof Error ? error.message : 'Error desconocido al cargar.')
        setEstado('error')
      }
    }

    void cargar()
    return () => {
      cancelado = true
    }
  }, [])

  /** Opciones de filtro derivadas de los datos, no declaradas en el código. */
  const categorias = useMemo(
    () => contarPor(productos, (p) => p.categoria, 'Sin categoría'),
    [productos],
  )

  const resultados = useMemo(() => {
    const termino = normalizar(filtros.busqueda)

    const filtrados = productos.filter((producto) => {
      if (filtros.soloActivos && !producto.activo) return false
      if (filtros.soloDescuento && !(producto.descuento > 0)) return false

      if (filtros.categorias.length > 0 && !filtros.categorias.includes(producto.categoria)) {
        return false
      }

      if (filtros.inventario !== 'todos' && clasificarInventario(producto) !== filtros.inventario) {
        return false
      }

      if (termino === '') return true

      // La búsqueda recorre varios campos opcionales; `??` evita el
      // `TypeError: Cannot read properties of null` al normalizar.
      const indice = normalizar(
        [
          producto.nombre,
          producto.id,
          producto.categoria,
          producto.marca ?? '',
          producto.proveedor ?? '',
          producto.almacen ?? '',
        ].join(' '),
      )
      return indice.includes(termino)
    })

    return ordenar(filtrados, filtros.orden)
  }, [productos, filtros])

  /** Métricas del conjunto filtrado. Los nulos se excluyen, no se cuentan como cero. */
  const metricas = useMemo(() => {
    const conteoPorEstado = { disponible: 0, bajo: 0, agotado: 0, 'sin-dato': 0 }
    for (const producto of resultados) {
      conteoPorEstado[clasificarInventario(producto)] += 1
    }
    return {
      total: resultados.length,
      totalGeneral: productos.length,
      precioPromedio: promedioSeguro(resultados.map((p) => p.precioUnitario)),
      unidadesTotales: sumaSegura(resultados.map((p) => p.stock)),
      sinPrecio: resultados.filter((p) => typeof p.precioUnitario !== 'number').length,
      conteoPorEstado,
    }
  }, [resultados, productos])

  /** Serie para la gráfica: stock agregado por categoría sobre el filtrado actual. */
  const serieCategorias = useMemo(() => {
    const acumulado = new Map<string, { unidades: number; articulos: number }>()
    for (const producto of resultados) {
      const previo = acumulado.get(producto.categoria) ?? { unidades: 0, articulos: 0 }
      acumulado.set(producto.categoria, {
        unidades: previo.unidades + (typeof producto.stock === 'number' ? producto.stock : 0),
        articulos: previo.articulos + 1,
      })
    }
    return [...acumulado.entries()]
      .map(([categoria, valores]) => ({ categoria, ...valores }))
      .sort((a, b) => b.unidades - a.unidades)
  }, [resultados])

  const hayFiltrosActivos =
    filtros.busqueda !== '' ||
    filtros.categorias.length > 0 ||
    filtros.inventario !== 'todos' ||
    filtros.soloActivos ||
    filtros.soloDescuento

  function actualizarFiltros(cambios: Partial<FiltrosCatalogo>) {
    setFiltros((previos) => ({ ...previos, ...cambios }))
  }

  function alternarCategoria(categoria: string) {
    setFiltros((previos) => ({
      ...previos,
      categorias: previos.categorias.includes(categoria)
        ? previos.categorias.filter((valor) => valor !== categoria)
        : [...previos.categorias, categoria],
    }))
  }

  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
  }

  return {
    estado,
    mensajeError,
    meta,
    descartados,
    productos,
    categorias,
    resultados,
    metricas,
    serieCategorias,
    filtros,
    hayFiltrosActivos,
    actualizarFiltros,
    alternarCategoria,
    limpiarFiltros,
  }
}

function ordenar(productos: Producto[], orden: FiltrosCatalogo['orden']): Producto[] {
  const copia = [...productos]

  // Los nulos siempre se van al final, sin importar la dirección del orden.
  const porNumero = (valor: number | null | undefined, ascendente: boolean) => {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      return ascendente ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    }
    return valor
  }

  switch (orden) {
    case 'precio-asc':
      return copia.sort(
        (a, b) => porNumero(a.precioUnitario, true) - porNumero(b.precioUnitario, true),
      )
    case 'precio-desc':
      return copia.sort(
        (a, b) => porNumero(b.precioUnitario, false) - porNumero(a.precioUnitario, false),
      )
    case 'stock-desc':
      return copia.sort((a, b) => porNumero(b.stock, false) - porNumero(a.stock, false))
    case 'reciente':
      return copia.sort((a, b) => (b.fechaAlta ?? '').localeCompare(a.fechaAlta ?? ''))
    case 'nombre-asc':
    default:
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }
}
