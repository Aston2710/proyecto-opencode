---
description: Genera o regenera la rejilla de tarjetas del catálogo derivando todo desde datos/productos.json, con tolerancia a nulos y semáforo de inventario.
argument-hint: [ajuste opcional, ej. "agrega el proveedor al pie de la tarjeta"]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, PowerShell
---

# /renderizar_tarjetas

Orquesta la construcción completa de la rejilla de tarjetas del catálogo.

Ajuste solicitado por el usuario: **$ARGUMENTS**
(si viene vacío, genera la rejilla en su forma base)

Sigue estos pasos en orden, sin saltarte ninguno.

## Paso 1 — Leer el contrato real, no el asumido

1. Carga la skill `catalogo-mayorista` y respétala como especificación.
2. Lee `datos/productos.json`. No confíes en la memoria del esquema: recórrelo y
   determina empíricamente
   - la lista de claves que aparecen en al menos un registro,
   - qué claves faltan en algún registro,
   - qué claves tienen `null` y en cuántos registros,
   - el tipo real de cada clave.
3. Reporta ese inventario en tabla antes de escribir código. Si el esquema no
   coincide con `src/tipos.ts`, actualiza los tipos primero.

## Paso 2 — Derivar, nunca hardcodear

De los datos leídos, deriva en tiempo de ejecución:

- las categorías disponibles y su conteo,
- las marcas y proveedores presentes, incluyendo el cubo `Sin marca` / `Sin proveedor` para los `null`,
- el rango mínimo y máximo de precio, ignorando los `null`,
- los umbrales del semáforo a partir de `stock` contra `stockMinimo` de cada registro.

Cualquier constante literal que represente un valor del dominio es un error:
corrígela derivándola.

## Paso 3 — Construir la tarjeta

Componente `src/componentes/TarjetaProducto.tsx`:

- Encabezado: `nombre` y el `id` como referencia secundaria monoespaciada.
- Cinta de categoría como chip.
- Bloque de precios: `precioUnitario` grande, `precioMayoreo` secundario con la
  etiqueta `mayoreo`. Si alguno es `null`, `Sin precio` atenuado. Si `descuento > 0`,
  chip de descuento.
- Pie de metadatos: marca, proveedor, almacén, unidades por caja. Cada uno pasa por
  `textoOpcional`.
- Indicador de inventario con punto de color **y** texto: `Disponible`,
  `Stock bajo`, `Agotado`, `Sin dato`.
- Si `activo` es `false`, marca visual de `Inactivo` y opacidad reducida.
- Sin `descripcion`, el párrafo simplemente no se renderiza.

## Paso 4 — Construir la rejilla

Componente `src/componentes/RejillaProductos.tsx`:

- `grid` con `repeat(auto-fill, minmax(260px, 1fr))` y separación de 14px.
- Recibe el arreglo ya filtrado por props. No filtra nada por su cuenta.
- Si el arreglo viene vacío, renderiza `EstadoVacio` con un botón para limpiar filtros.
- Anuncia el conteo con `aria-live="polite"`.

## Paso 5 — Verificar antes de declarar terminado

Ejecuta y no te detengas hasta que las cuatro pasen:

1. `npx tsc --noEmit` sin errores.
2. `npm run build` exitoso.
3. Búsqueda de literales del dominio en `src/componentes/` — no debe haber nombres
   de categorías, marcas ni proveedores escritos a mano.
4. Prueba mental de nulos: recorre los 8 casos de la tabla de la skill y confirma
   dónde los maneja el código, citando archivo y línea.

Reporta el resultado de las cuatro verificaciones. Si alguna falla, corrígela y
vuelve a ejecutarlas; no entregues con verificaciones en rojo.
