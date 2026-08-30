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
import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  ArchivoCatalogo,
  CampoOrden,
  Densidad,
  FiltroActivo,
  FiltrosCatalogo,
  MetaCatalogo,
  OpcionFiltro,
  OrdenCatalogo,
  Producto,
  VistaGuardada,
} from '../tipos'
import {
  clasificarInventario,
  etiquetaFiltroInventario,
  normalizar,
  promedioSeguro,
  requiereAtencion,
  sumaSegura,
} from '../utilidades'

const RUTA_DATOS = `${import.meta.env.BASE_URL}datos/productos.json`

/** Tamaño de página fijo. Paginación explícita: nada de scroll infinito. */
export const POR_PAGINA = 24

export const FILTROS_INICIALES: FiltrosCatalogo = {
  busqueda: '',
  categorias: [],
  inventario: 'todos',
  actividad: 'todos',
  soloDescuento: false,
  soloSinPrecio: false,
  orden: { campo: 'nombre', direccion: 'asc' },
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

/**
 * Aplica los filtros indicados. `omitirCategorias` sirve para calcular los
 * conteos de los chips: si se contaran sobre el resultado final, seleccionar
 * una categoría dejaría todas las demás en cero y el usuario no podría saber
 * cuánto encontraría al cambiar de una a otra.
 */
function aplicarFiltros(
  productos: Producto[],
  filtros: FiltrosCatalogo,
  omitirCategorias = false,
): Producto[] {
  const termino = normalizar(filtros.busqueda)

  return productos.filter((producto) => {
    if (filtros.actividad === 'activos' && !producto.activo) return false
    if (filtros.actividad === 'inactivos' && producto.activo) return false
    if (filtros.soloDescuento && !(producto.descuento > 0)) return false
    if (filtros.soloSinPrecio && producto.precioUnitario !== null) return false

    if (
      !omitirCategorias &&
      filtros.categorias.length > 0 &&
      !filtros.categorias.includes(producto.categoria)
    ) {
      return false
    }

    if (filtros.inventario !== 'todos') {
      const estado = clasificarInventario(producto)
      const coincide =
        filtros.inventario === 'atencion'
          ? requiereAtencion(estado)
          : estado === filtros.inventario
      if (!coincide) return false
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
}

export function useCatalogo() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [meta, setMeta] = useState<MetaCatalogo | null>(null)
  const [estado, setEstado] = useState<EstadoCarga>('cargando')
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(FILTROS_INICIALES)
  const [descartados, setDescartados] = useState(0)
  const [densidad, setDensidad] = useState<Densidad>('comoda')
  const [pagina, setPagina] = useState(1)

  const cargar = useCallback(async (senal?: AbortSignal) => {
    setEstado('cargando')
    setMensajeError(null)
    try {
      const respuesta = await fetch(RUTA_DATOS, { signal: senal })
      if (!respuesta.ok) {
        throw new Error(`El servidor respondió ${respuesta.status} al pedir el catálogo.`)
      }
      const crudo: unknown = await respuesta.json()
      if (!esArchivoValido(crudo)) {
        throw new Error('El archivo de datos no contiene un arreglo "productos".')
      }
      const utilizables = crudo.productos.filter(esProductoUtilizable)
      if (senal?.aborted === true) return
      setProductos(utilizables)
      setDescartados(crudo.productos.length - utilizables.length)
      setMeta(crudo.meta ?? null)
      setEstado('listo')
    } catch (error) {
      if (senal?.aborted === true) return
      setMensajeError(error instanceof Error ? error.message : 'Error desconocido al cargar.')
      setEstado('error')
    }
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    void cargar(controlador.signal)
    return () => {
      controlador.abort()
    }
  }, [cargar])

  /**
   * Conteos de los chips de categoría, calculados sobre el resto de filtros
   * aplicados. Reflejan lo que se encontraría al pulsar cada uno.
   */
  const categorias = useMemo(
    () => contarPor(aplicarFiltros(productos, filtros, true), (p) => p.categoria, 'Sin categoría'),
    [productos, filtros],
  )

  const resultados = useMemo(
    () => ordenar(aplicarFiltros(productos, filtros), filtros.orden),
    [productos, filtros],
  )

  // Cambiar de filtro devuelve a la primera página: mantener la página 7
  // sobre un resultado de 12 elementos dejaría la lista vacía sin motivo.
  useEffect(() => {
    setPagina(1)
  }, [filtros])

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA))
  const paginaSegura = Math.min(pagina, totalPaginas)

  const productosPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * POR_PAGINA
    return resultados.slice(inicio, inicio + POR_PAGINA)
  }, [resultados, paginaSegura])

  const rango = useMemo(() => {
    if (resultados.length === 0) return { desde: 0, hasta: 0 }
    const desde = (paginaSegura - 1) * POR_PAGINA + 1
    return { desde, hasta: Math.min(desde + POR_PAGINA - 1, resultados.length) }
  }, [resultados.length, paginaSegura])

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

  const actualizarFiltros = useCallback((cambios: Partial<FiltrosCatalogo>) => {
    setFiltros((previos) => ({ ...previos, ...cambios }))
  }, [])

  const alternarCategoria = useCallback((categoria: string) => {
    setFiltros((previos) => ({
      ...previos,
      categorias: previos.categorias.includes(categoria)
        ? previos.categorias.filter((valor) => valor !== categoria)
        : [...previos.categorias, categoria],
    }))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIALES)
  }, [])

  /** Sustituye los filtros por los de una vista guardada, conservando el orden. */
  const aplicarVista = useCallback((vista: VistaGuardada) => {
    setFiltros((previos) => ({ ...FILTROS_INICIALES, orden: previos.orden, ...vista.filtros }))
  }, [])

  /**
   * Alterna el orden por una columna. La primera pulsación ordena ascendente;
   * la siguiente invierte. Cambiar de columna vuelve a empezar ascendente,
   * que es lo que espera quien acaba de pulsar otro encabezado.
   */
  const ordenarPor = useCallback((campo: CampoOrden) => {
    setFiltros((previos) => ({
      ...previos,
      orden:
        previos.orden.campo === campo
          ? { campo, direccion: previos.orden.direccion === 'asc' ? 'desc' : 'asc' }
          : { campo, direccion: 'asc' },
    }))
  }, [])

  /**
   * Fila de etiquetas removibles. Se deriva del estado de filtros, así que
   * es imposible que muestre un filtro que ya no está aplicado.
   */
  const filtrosActivos = useMemo<FiltroActivo[]>(() => {
    const activos: FiltroActivo[] = []

    if (filtros.busqueda.trim() !== '') {
      activos.push({
        clave: 'busqueda',
        etiqueta: `«${filtros.busqueda.trim()}»`,
        quitar: () => actualizarFiltros({ busqueda: '' }),
      })
    }

    for (const categoria of filtros.categorias) {
      activos.push({
        clave: `categoria:${categoria}`,
        etiqueta: categoria,
        quitar: () => alternarCategoria(categoria),
      })
    }

    if (filtros.inventario !== 'todos') {
      activos.push({
        clave: 'inventario',
        etiqueta: etiquetaFiltroInventario(filtros.inventario),
        quitar: () => actualizarFiltros({ inventario: 'todos' }),
      })
    }

    if (filtros.actividad !== 'todos') {
      activos.push({
        clave: 'actividad',
        etiqueta: filtros.actividad === 'activos' ? 'Solo activos' : 'Solo inactivos',
        quitar: () => actualizarFiltros({ actividad: 'todos' }),
      })
    }

    if (filtros.soloSinPrecio) {
      activos.push({
        clave: 'sin-precio',
        etiqueta: 'Sin precio',
        quitar: () => actualizarFiltros({ soloSinPrecio: false }),
      })
    }

    if (filtros.soloDescuento) {
      activos.push({
        clave: 'descuento',
        etiqueta: 'Solo con descuento',
        quitar: () => actualizarFiltros({ soloDescuento: false }),
      })
    }

    return activos
  }, [filtros, actualizarFiltros, alternarCategoria])

  return {
    estado,
    mensajeError,
    meta,
    descartados,
    productos,
    categorias,
    resultados,
    productosPagina,
    pagina: paginaSegura,
    totalPaginas,
    rango,
    irAPagina: setPagina,
    densidad,
    setDensidad,
    metricas,
    serieCategorias,
    filtros,
    filtrosActivos,
    hayFiltrosActivos: filtrosActivos.length > 0,
    actualizarFiltros,
    alternarCategoria,
    limpiarFiltros,
    aplicarVista,
    ordenarPor,
    reintentar: () => void cargar(),
  }
}

function ordenar(productos: Producto[], orden: OrdenCatalogo): Producto[] {
  const signo = orden.direccion === 'asc' ? 1 : -1

  // Los valores ausentes se van siempre al final, sin importar la dirección:
  // un hueco no es «el más barato» ni «el que menos stock tiene».
  const comparar = (a: Producto, b: Producto): number => {
    switch (orden.campo) {
      case 'id':
        return a.id.localeCompare(b.id, 'es') * signo
      case 'categoria':
        return (
          a.categoria.localeCompare(b.categoria, 'es') * signo ||
          a.nombre.localeCompare(b.nombre, 'es')
        )
      case 'stock':
      case 'plazoEntregaHoras':
      case 'precioUnitario': {
        const valorA = a[orden.campo]
        const valorB = b[orden.campo]
        const faltaA = typeof valorA !== 'number' || !Number.isFinite(valorA)
        const faltaB = typeof valorB !== 'number' || !Number.isFinite(valorB)
        if (faltaA && faltaB) return 0
        if (faltaA) return 1
        if (faltaB) return -1
        return (valorA - valorB) * signo
      }
      case 'nombre':
      default:
        return a.nombre.localeCompare(b.nombre, 'es') * signo
    }
  }

  return [...productos].sort(comparar)
}
