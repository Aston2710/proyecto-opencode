---
name: catalogo-mayorista
description: Convenciones de datos, diseño y componentes del Catálogo Mayorista. Úsala siempre que se cree o modifique una vista, un componente, un filtro o una gráfica de este proyecto, o cuando haya que leer/derivar algo desde public/datos/productos.json.
---

# Skill: Catálogo Mayorista

Reglas de construcción de este proyecto. Cualquier código generado para la interfaz
debe respetarlas sin excepción.

## 1. La fuente de verdad es el archivo de datos

`public/datos/productos.json` manda. Nunca escribas listas de categorías, marcas,
proveedores, almacenes o rangos de precio en el código: **derívalos en tiempo de
ejecución** desde el arreglo `productos`.

Contrato del archivo:

```jsonc
{
  "meta": { "fuente": string, "generadoPor": string, "version": number, "totalRegistros": number },
  "productos": [
    {
      "id": string,                 // siempre presente
      "nombre": string,             // siempre presente
      "categoria": string,          // siempre presente
      "marca": string | null,
      "proveedor": string | null,
      "almacen": string | undefined,  // la clave puede NO existir
      "precioUnitario": number | null,
      "precioMayoreo": number | null,
      "unidadesPorCaja": number,
      "stock": number | null,
      "stockMinimo": number,
      "descuento": number,          // porcentaje 0-30
      "activo": boolean,
      "fechaAlta": string | null,   // ISO corto YYYY-MM-DD
      "descripcion": string | null,

      // Ficha logistica, capturada despues del alta comercial
      "pesoKg": number | null,
      "volumenL": number | null,
      "material": string | null,
      "origen": string | null,
      "plazoEntregaHoras": number | null,
      "garantiaMeses": number | null,      // null = NO APLICA, no es un hueco
      "ean": string | null,
      "codigoArancelario": string | null,  // solo mercancia importada
      "ultimaSincronizacion": string | null
    }
  ]
}
```

Si el contrato cambia, la interfaz debe adaptarse sola: campos nuevos no deben
romper la vista, campos ausentes tampoco.

## 2. Tolerancia a nulos (obligatoria)

El archivo origen viene de un ERP y trae huecos. Ninguna de estas situaciones
puede producir `NaN`, `undefined`, pantalla en blanco ni error en consola:

| Situación | Comportamiento exigido |
| --- | --- |
| `precioUnitario` o `precioMayoreo` en `null` | Mostrar `Sin precio` en tono atenuado. Excluir del cálculo de promedios y del rango del filtro. |
| `stock` en `null` | Mostrar `Sin dato`. Tratar como desconocido, **nunca** como cero. |
| `marca` / `proveedor` en `null` | Mostrar `Sin marca` / `Sin proveedor`. Deben ser una opción real y filtrable, no desaparecer. |
| `almacen` ausente | Igual que `null`. Usar acceso opcional, jamás indexado directo. |
| `descripcion` en `null` | Omitir el párrafo, no renderizar una cadena vacía. |
| `fechaAlta` en `null` | Mostrar `—`. No construir `new Date(null)`. |
| Campos de la ficha logística en `null` | Mostrar `Sin registrar` en cursiva atenuada. Jamás convertir a cero. |
| `garantiaMeses` en `null` | Mostrar `No aplica`, **sin atenuar**: es una respuesta, no un hueco. |
| `codigoArancelario` en `null` | Mostrar `Nacional`, **sin atenuar**: su ausencia significa que no se importó. |
| Resultado de filtros vacío | Estado vacío explicativo con acción para limpiar filtros. |

Toda lectura de campo opcional pasa por los ayudantes de `src/utilidades.ts`
(`textoOpcional`, `formatearMoneda`, `formatearEntero`, `formatearFecha`,
`formatearMagnitud`, `formatearPlazo`, `formatearGarantia`, `formatearEan`,
`formatearAntiguedad`). Nunca formatees en línea dentro del JSX.

**Distingue tres cosas distintas**: el dato que falta por capturar
(`Sin registrar`), el que no aplica a ese artículo (`No aplica`, `Nacional`) y el
que vale cero. Colapsarlos en una sola etiqueta hace mentir a la interfaz.

## 3. Diseño — sistema «Industrial Inventory Ledger»

Generado con Google Stitch; el prompt y el resultado están en
`docs/PROMPT-STITCH.md`. Tokens en `src/index.css` como variables CSS; en los
componentes se usan clases de Tailwind que consumen esos tokens. **Nunca
escribas un color literal en un componente.**

**Personalidad.** Precisión industrial, no software corporativo. La referencia es
un instrumento de medición bien hecho: denso, calmado, legible, sin decoración.
Papel cálido en lugar de blanco clínico. La estructura la definen líneas de 1 px,
no sombras. La jerarquía la marcan el peso tipográfico y el espacio, no el color.
Prohibidos: degradados, glassmorphism, ilustraciones, emojis.

- **Superficie:** fondo `--fondo`, contenedores `--superficie` con borde `--borde` de 1 px. Un **único plano de elevación** (`--sombra-panel`), reservado a lo que exige acción: hoy solo la cola de reposición. Si todo se eleva, nada destaca.
- **Acento:** un único `--acento` (verde de bodega), usado con avaricia: chips activos, botón primario, página actual y barras de la gráfica. Nada más.
- **Semáforo de inventario en dos capas.** El texto usa `--ok` / `--alerta` / `--critico`, que son oscuros porque deben cumplir AA. El punto usa `--ok-punto` / `--alerta-punto` / `--critico-punto`, vivos, porque no son texto y su único trabajo es distinguirse a 6 px. El color **nunca** comunica solo: siempre punto más texto.
- **Tipografía:** una clase por rol, definidas en `index.css`. No inventes tamaños sueltos: usa `.t-titular` (30/600, cifras de indicador del panel, con el símbolo de moneda en `.simbolo`), `.t-page-title` (19/600), `.t-indicator` (22/600), `.t-card-title` (15/600), `.t-body` (13/400), `.t-metadata` (12/500), `.t-label-caps` (11/500 mayúsculas) y `.t-mono` (13/450, IBM Plex Mono para SKUs y cifras). Añade `cifras` a todo lo numérico.
- **Forma:** rejilla base de 4 px, con utilidades `xs`/`sm`/`md`/`lg`/`xl` (4/8/16/24/32). Radio: `rounded-sm` 2px en distintivos, `rounded` 4px en contenedores y controles, `rounded-full` solo en chips.
- **La lista es una `<table>` de verdad**, no tarjetas ni divs: `<thead>`, `<tbody>`, `<th scope="col">` y `<caption>`. Un lector de pantalla debe anunciar filas y columnas, no una ristra de botones. Anchos por `<colgroup>` con `table-fixed`.
- **Columnas, en orden:** SKU · producto · categoría · estado · reorden · existencias · entrega · unitario. Las secundarias se ocultan por punto de ruptura (`sm`, `md`, `lg`, `xl`), nunca se comprimen.
- **Ordenar se hace desde el encabezado**, no desde un desplegable aparte. La columna activa declara `aria-sort`; la primera pulsación ordena ascendente y la siguiente invierte. Los valores ausentes van siempre al final: un hueco no es «el más barato».
- **El encabezado de columnas queda fijo** bajo la barra superior. Cuidado: un ancestro con `overflow-hidden` crea un contenedor de scroll y desplaza el elemento pegajoso; no lo pongas.
- **Como máximo tres contenedores** en la vista principal: franja de indicadores, barra de herramientas y tabla. Lo secundario va tras un desplegable o al pie. Cada caja nueva compite con las demás.
- **Ningún dato se muestra dos veces.** Si el conteo ya está en los indicadores, no se repite sobre la tabla.
- **Nada de metadatos de depuración en la interfaz** (procedencia del archivo, versión del esquema, rutas). Van en la documentación.
- **Los conteos de los chips se calculan con el resto de filtros aplicados**, omitiendo el de categoría: deben anticipar lo que se encontraría al pulsarlos.
- **Estado inactivo:** etiqueta visible junto al nombre. Nunca `opacity` sobre la fila entera, que hunde el contraste del texto secundario por debajo de AA.
- **Medidor de reorden:** regleta por fila con la marca del mínimo fija en el mismo tercio en todas. Sirve para detectar faltantes recorriendo la columna, sin leer cifras. Sin stock registrado no se dibuja barra: estimarla sería inventar el dato.
- **Modo oscuro:** carbón cálido, nunca azulado ni negro puro. Tres estados: claro por omisión, oscuro por `prefers-color-scheme`, y ambos forzables con `data-tema` en `<html>`. Ningún color se declara solo dentro del bloque oscuro.

### Reglas de experiencia de usuario, no negociables

- **Paginación explícita.** Nada de scroll infinito ni de botón «cargar más».
- **Un solo eje de scroll** en toda la pantalla. Ninguna zona con scroll propio ni rejilla con altura fija y desbordamiento interno.
- **Contraste AA** como mínimo en todo el texto, incluidos los grises atenuados.
- **Áreas de toque** de 36 px de alto como mínimo en cualquier control.
- **Foco visible:** contorno de 2 px en `--acento` con 2 px de separación.
- Sin modales para el flujo principal; el detalle va en panel lateral.
- Sin texto centrado en bloques largos, sin mayúsculas sostenidas fuera de las etiquetas de indicador.
- **Paginación de 24 por página**, con el rango visible en el pie («Mostrando 1–24 de 240»).
- **Sin imágenes de producto.** El archivo de datos no las tiene. El recuadro que abre cada fila lleva el distintivo de la categoría, que es un dato real del registro, no un marcador de posición.
- **Sin campos inventados.** Si un dato no está en `productos.json`, no se muestra. Si el diseño pide un campo que falta, se amplía el generador y se regenera el archivo: la vista nunca simula lo que el origen no tiene.
- **Sin acciones que no hacen nada.** Ningún botón decorativo: si no está implementado, no se dibuja.

## 4. Componentes

Ubicación `src/componentes/`, un archivo por componente, nombre en PascalCase,
export nombrado. Props tipadas con `interface`, nunca `any`.

- Los componentes de presentación no leen el JSON: reciben datos por props.
- La carga y el filtrado viven en `src/hooks/useCatalogo.ts`.
- Los tipos compartidos viven en `src/tipos.ts` y reflejan el contrato de arriba.
- Nombres de variables, funciones y comentarios en español.

## 5. Accesibilidad mínima

Cada control interactivo lleva `aria-label` o etiqueta visible. Los chips de filtro
usan `aria-pressed`. La rejilla de resultados anuncia el conteo con `aria-live="polite"`.
El foco siempre visible.

## 6. Prohibiciones

- No agregar dependencias sin justificarlo en la bitácora.
- No usar `!` (non-null assertion) ni `as any` para silenciar TypeScript.
- No hacer peticiones de red a servicios externos: la app es estática.
- No inventar datos de ejemplo dentro de los componentes.
