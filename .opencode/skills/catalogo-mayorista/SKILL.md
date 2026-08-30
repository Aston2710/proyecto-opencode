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
      "descripcion": string | null
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
| Resultado de filtros vacío | Estado vacío explicativo con acción para limpiar filtros. |

Toda lectura de campo opcional pasa por los ayudantes de `src/utilidades.ts`
(`textoOpcional`, `formatearMoneda`, `formatearEntero`, `formatearFecha`).
Nunca formatees en línea dentro del JSX.

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

- **Superficie:** fondo `--fondo`, contenedores `--superficie` con borde `--borde` de 1 px. La profundidad se comunica por capas tonales y líneas finas, **nunca por sombras**.
- **Acento:** un único `--acento` (verde de bodega), usado con avaricia: chips activos, botón primario, página actual y barras de la gráfica. Nada más.
- **Semáforo de inventario:** `--ok` = stock sano, `--alerta` = bajo el mínimo, `--critico` (terracota apagado) = agotado, `--neutro` = sin dato. El color **nunca** comunica solo: siempre punto de color más texto.
- **Tipografía:** una clase por rol, definidas en `index.css`. No inventes tamaños sueltos: usa `.t-page-title` (19/600), `.t-indicator` (22/600), `.t-card-title` (15/600), `.t-body` (13/400), `.t-metadata` (12/500), `.t-label-caps` (11/500 mayúsculas) y `.t-mono` (13/450, IBM Plex Mono para SKUs y cifras). Añade `cifras` a todo lo numérico.
- **Forma:** rejilla base de 4 px, con utilidades `xs`/`sm`/`md`/`lg`/`xl` (4/8/16/24/32). Radio: `rounded-sm` 2px en distintivos, `rounded` 4px en contenedores y controles, `rounded-md` 6px en filas de producto, `rounded-full` solo en chips.
- **Lista de resultados:** filas horizontales a ancho completo, no rejilla de tarjetas. Cada fila: distintivo de 48 px, SKU y precio en la línea superior, nombre, y pie con categoría, estado de inventario y metadatos.
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
- **Sin imágenes de producto.** El archivo de datos no las tiene. El recuadro de 48 px que abre cada fila lleva el distintivo de la categoría, que es un dato real del registro, no un marcador de posición.
- **Sin campos inventados.** Si un dato no está en `productos.json`, no se muestra. No importa que el diseño de referencia lo proponga.
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
