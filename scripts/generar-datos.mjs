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

// Ficha logística. El empaque depende de lo que se envasa, así que los
// materiales van por categoría en lugar de sortearse de una lista única.
const materiales = {
  Abarrotes: ['Bolsa laminada', 'Lata de hojalata', 'Cartón', 'PET reciclable', 'Vidrio'],
  Bebidas: ['PET reciclable', 'Lata de aluminio', 'Vidrio retornable', 'Envase multicapa'],
  Limpieza: ['HDPE', 'PET reciclable', 'Cartón'],
  'Cuidado Personal': ['HDPE', 'PET reciclable', 'Cartón', 'Aluminio'],
  Papelería: ['Papel', 'Cartón', 'Polipropileno'],
  Ferretería: ['Acero', 'Polipropileno', 'Cartón', 'Cobre'],
  Snacks: ['Bolsa metalizada', 'Cartón'],
  Lácteos: ['HDPE', 'Envase multicapa', 'Polipropileno'],
}

const origenes = ['México', 'México', 'México', 'Estados Unidos', 'China', 'Colombia', 'España']

/** Dígito verificador del EAN-13, para que los códigos sean válidos de verdad. */
function ean13(base) {
  const suma = [...base].reduce(
    (total, digito, indice) => total + Number(digito) * (indice % 2 === 0 ? 1 : 3),
    0,
  )
  return base + String((10 - (suma % 10)) % 10)
}

const categorias = Object.keys(catalogo)
const productos = []

// Momento de referencia para las marcas de sincronización con el ERP.
const AHORA = new Date('2026-08-30T09:00:00Z')

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

    // --- Ficha logística ---
    pesoKg: Number((aleatorio() * 4.6 + 0.08).toFixed(2)),
    volumenL: Number((aleatorio() * 3.8 + 0.05).toFixed(2)),
    material: elegir(materiales[categoria]),
    origen: elegir(origenes),
    plazoEntregaHoras: elegir([24, 48, 72, 96, 120, 168]),
    garantiaMeses: null,
    ean: ean13(`750${String(entre(100000000, 999999999))}`),
    codigoArancelario: null,
    ultimaSincronizacion: null,
  }

  // El precio de mayoreo se calcula sobre el unitario.
  producto.precioMayoreo = Number((producto.precioUnitario * 0.82).toFixed(2))

  // La garantía solo aplica a artículos de ferretería. En el resto la clave
  // existe pero vale null: «no aplica» es distinto de «falta el dato».
  if (categoria === 'Ferretería') {
    producto.garantiaMeses = elegir([6, 12, 24])
  }

  // El código arancelario solo existe para lo importado.
  if (producto.origen !== 'México') {
    producto.codigoArancelario = `${entre(1000, 9899)}.${String(entre(10, 99))}.${String(entre(1, 99)).padStart(2, '0')}`
  }

  // Marca de la última sincronización con el ERP, dentro de las últimas 72 h.
  producto.ultimaSincronizacion = new Date(
    AHORA.getTime() - entre(5, 4320) * 60 * 1000,
  ).toISOString()

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

  // La ficha logística se captura después del alta, así que llega más
  // incompleta que los campos comerciales.
  if (entre(0, 100) < 9) producto.pesoKg = null
  if (entre(0, 100) < 11) producto.volumenL = null
  if (entre(0, 100) < 8) producto.material = null
  if (entre(0, 100) < 6) producto.origen = null
  if (entre(0, 100) < 10) producto.plazoEntregaHoras = null
  if (entre(0, 100) < 7) producto.ean = null
  if (entre(0, 100) < 5) producto.ultimaSincronizacion = null

  productos.push(producto)
}

const salida = {
  meta: {
    fuente: 'Exportación simulada del ERP de catálogo mayorista',
    generadoPor: 'scripts/generar-datos.mjs',
    version: 2,
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
