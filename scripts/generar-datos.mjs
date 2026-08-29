// Generador del archivo base de datos del catálogo.
// Produce datos/productos.json con registros realistas e inconsistencias
// intencionales (nulos, campos faltantes) para probar la tolerancia de la UI.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Generador congruencial simple para que el dataset sea reproducible.
let semilla = 20260829
const aleatorio = () => {
  semilla = (semilla * 1664525 + 1013904223) % 4294967296
  return semilla / 4294967296
}
const elegir = (lista) => lista[Math.floor(aleatorio() * lista.length)]
const entre = (min, max) => Math.floor(aleatorio() * (max - min + 1)) + min

const catalogo = {
  Abarrotes: {
    articulos: ['Arroz blanco', 'Frijol negro', 'Azúcar refinada', 'Aceite vegetal', 'Harina de trigo', 'Sal de mesa', 'Pasta larga', 'Atún en agua'],
    presentaciones: ['900 g', '1 kg', '5 kg', '450 ml', '1 L'],
  },
  Bebidas: {
    articulos: ['Refresco de cola', 'Agua purificada', 'Jugo de naranja', 'Té helado', 'Bebida energética', 'Café soluble'],
    presentaciones: ['355 ml', '600 ml', '1.5 L', '2 L', '200 g'],
  },
  Limpieza: {
    articulos: ['Detergente en polvo', 'Cloro', 'Jabón para trastes', 'Limpiador multiusos', 'Suavizante de telas', 'Fibra esponja'],
    presentaciones: ['500 ml', '1 L', '2 kg', '4 L', 'Pieza'],
  },
  'Cuidado Personal': {
    articulos: ['Shampoo', 'Jabón de tocador', 'Pasta dental', 'Desodorante', 'Papel higiénico', 'Rastrillo desechable'],
    presentaciones: ['200 ml', '400 ml', '90 g', '4 rollos', '12 rollos'],
  },
  Papelería: {
    articulos: ['Cuaderno profesional', 'Bolígrafo tinta negra', 'Hojas blancas', 'Marcador permanente', 'Cinta adhesiva', 'Carpeta de argollas'],
    presentaciones: ['100 hojas', 'Caja 12 pz', 'Paquete 500 hojas', 'Pieza'],
  },
  Ferretería: {
    articulos: ['Cinta de aislar', 'Foco LED', 'Extensión eléctrica', 'Juego de desarmadores', 'Silicón transparente', 'Guantes de trabajo'],
    presentaciones: ['Pieza', '9 W', '12 W', '3 m', 'Juego 6 pz'],
  },
  Snacks: {
    articulos: ['Papas fritas', 'Cacahuates salados', 'Galletas surtidas', 'Chocolate en barra', 'Palomitas para microondas'],
    presentaciones: ['45 g', '100 g', '160 g', 'Paquete 6 pz'],
  },
  Lácteos: {
    articulos: ['Leche entera', 'Queso panela', 'Yogur natural', 'Crema ácida', 'Mantequilla sin sal'],
    presentaciones: ['1 L', '400 g', '900 g', '90 g'],
  },
}

const marcas = ['La Rivera', 'Don Cosme', 'Vallesol', 'Prisma', 'Nortex', 'Mar de Cortés', 'Buenavista', 'Aurelia']
const proveedores = ['Distribuidora Centro', 'Grupo Andino', 'Comercial del Valle', 'Importadora Sur', 'Abastos del Norte']
const almacenes = ['Almacén Central', 'Bodega Norte', 'Bodega Sur']

const categorias = Object.keys(catalogo)
const productos = []

for (let i = 1; i <= 240; i++) {
  const categoria = elegir(categorias)
  const { articulos, presentaciones } = catalogo[categoria]
  const articulo = elegir(articulos)
  const presentacion = elegir(presentaciones)

  const producto = {
    id: `SKU-${String(i).padStart(4, '0')}`,
    nombre: `${articulo} ${presentacion}`,
    categoria,
    marca: elegir(marcas),
    proveedor: elegir(proveedores),
    almacen: elegir(almacenes),
    precioUnitario: Number((aleatorio() * 480 + 12).toFixed(2)),
    precioMayoreo: null,
    unidadesPorCaja: elegir([1, 6, 12, 24, 48]),
    stock: entre(0, 900),
    stockMinimo: elegir([10, 25, 50, 100]),
    descuento: entre(0, 100) < 22 ? entre(5, 30) : 0,
    activo: entre(0, 100) < 88,
    fechaAlta: `202${entre(3, 5)}-${String(entre(1, 12)).padStart(2, '0')}-${String(entre(1, 28)).padStart(2, '0')}`,
    descripcion: `${articulo} presentación ${presentacion}. Venta por caja de mayoreo.`,
  }

  // El precio de mayoreo se calcula sobre el unitario.
  producto.precioMayoreo = Number((producto.precioUnitario * 0.82).toFixed(2))

  // --- Inconsistencias intencionales del archivo origen ---
  // Reflejan lo que ocurre en catálogos reales exportados de un ERP.
  if (entre(0, 100) < 12) producto.marca = null
  if (entre(0, 100) < 9) producto.proveedor = null
  if (entre(0, 100) < 8) producto.descripcion = null
  if (entre(0, 100) < 6) producto.precioUnitario = null
  if (entre(0, 100) < 6) producto.precioMayoreo = null
  if (entre(0, 100) < 5) producto.stock = null
  if (entre(0, 100) < 4) delete producto.almacen
  if (entre(0, 100) < 3) producto.fechaAlta = null

  productos.push(producto)
}

const salida = {
  meta: {
    fuente: 'Exportación simulada del ERP de catálogo mayorista',
    generadoPor: 'scripts/generar-datos.mjs',
    version: 1,
    totalRegistros: productos.length,
  },
  productos,
}

// El archivo vive en public/ para que la aplicación lo consuma por fetch en
// tiempo de ejecución: cambiar el JSON cambia la interfaz sin tocar una línea
// de código.
const destino = resolve(raiz, 'public', 'datos')
mkdirSync(destino, { recursive: true })
writeFileSync(resolve(destino, 'productos.json'), JSON.stringify(salida, null, 2), 'utf8')
console.log(`Generados ${productos.length} productos en public/datos/productos.json`)
