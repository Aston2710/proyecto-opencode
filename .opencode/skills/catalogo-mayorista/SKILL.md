---
name: catalogo-mayorista
description: Convenciones de datos, diseño y componentes del Catálogo Mayorista. Úsala siempre que se cree o modifique una vista, un componente, un filtro o una gráfica de este proyecto, o cuando haya que leer/derivar algo desde datos/productos.json.
---

# Skill: Catálogo Mayorista

Reglas de construcción de este proyecto. Cualquier código generado para la interfaz
debe respetarlas sin excepción.

## 1. La fuente de verdad es el archivo de datos

`datos/productos.json` manda. Nunca escribas listas de categorías, marcas,
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

- **Superficie:** fondo `--fondo`, tarjetas `--superficie` con borde `--borde` de 1 px. Sombra solo bajo la barra de filtros cuando queda fija.
- **Acento:** un único `--acento` (verde de bodega), usado con avaricia: chips activos, botón primario y barras de la gráfica. Nada más.
- **Semáforo de inventario:** `--ok` = stock sano, `--alerta` = bajo el mínimo, `--critico` (terracota apagado) = agotado, `--neutro` = sin dato. El color **nunca** comunica solo: siempre punto de color más texto.
- **Tipografía:** IBM Plex Sans para la interfaz, IBM Plex Mono para SKUs y cifras monetarias. Escala: 22/600 cifra de indicador, 19/600 título de página, 15/600 título de tarjeta, 13/400 base, 12/500 metadatos, 11/500 mayúsculas con `tracking` 0.04em en etiquetas de indicador. Cifras tabulares (clase `cifras`) en todo lo que sea número.
- **Forma:** rejilla base de 4 px. Radio 10px en tarjetas, campos y botones; 999px solo en chips. Bordes de 1 px.
- **Densidad:** rejilla de tarjetas con `minmax(260px, 1fr)`. Sin alturas fijas.
- **Modo oscuro:** carbón cálido, nunca azulado ni negro puro. Los tokens se redefinen bajo `prefers-color-scheme: dark`. Ningún color se declara solo dentro del bloque oscuro.

### Reglas de experiencia de usuario, no negociables

- **Paginación explícita.** Nada de scroll infinito ni de botón «cargar más».
- **Un solo eje de scroll** en toda la pantalla. Ninguna zona con scroll propio ni rejilla con altura fija y desbordamiento interno.
- **Contraste AA** como mínimo en todo el texto, incluidos los grises atenuados.
- **Áreas de toque** de 36 px de alto como mínimo en cualquier control.
- **Foco visible:** contorno de 2 px en `--acento` con 2 px de separación.
- Sin modales para el flujo principal; el detalle va en panel lateral.
- Sin texto centrado en bloques largos, sin mayúsculas sostenidas fuera de las etiquetas de indicador.
- **Sin imágenes de producto.** El archivo de datos no las tiene y no se inventan marcadores de posición.

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
