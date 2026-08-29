# Instrucciones para Google Stitch

Herramienta de diseño declarada en el informe, como alternativa a Open Design.
Este documento contiene el prompt base, los prompts de refinamiento y las notas
de uso.

> **Cómo trabajar con Stitch.** Rinde mucho mejor con un prompt base sólido
> seguido de refinamientos encadenados que con un solo bloque enorme, que tiende
> a recortar. Pega primero el **Prompt 1** completo, revisa el resultado, y luego
> aplica los refinamientos de uno en uno sobre la misma pantalla.
>
> - Modo: **Web**, no Mobile.
> - Activa el **modo experimental** si está disponible: acepta prompts más largos
>   y respeta mejor las instrucciones de layout.
> - Genera primero el tema claro. El oscuro se pide como refinamiento, así
>   hereda la estructura en vez de reinventarla.

---

## Prompt 1 · Pantalla principal

```
Diseña un panel web de catálogo de inventario para un distribuidor mayorista,
llamado "Catálogo Mayorista". Es una herramienta de trabajo interna que un
comprador consulta muchas veces al día para revisar existencias, precios y
productos que necesitan reposición.

PERSONALIDAD
Precisión industrial, no software corporativo genérico. La referencia es un
instrumento de medición bien hecho: denso, calmado, legible, sin decoración.
Papel cálido en lugar de blanco clínico. Estructura definida por líneas finas de
1px, no por sombras ni tarjetas flotantes. La jerarquía la marcan el peso
tipográfico y el espacio, no el color. Nada de degradados, glassmorphism,
ilustraciones ni emojis.

PALETA — TEMA CLARO
Fondo de página #F7F6F3, superficies #FFFFFF, bordes #E3E1DC, borde marcado
#D2CFC8. Texto principal #1A1918, secundario #57564F, atenuado #8B8A82.
Color de acento, un verde de bodega #1F5F4B, con su versión suave #E6F0EC.
Estados: disponible #2F7D4F, stock bajo #A86413, agotado #A53024, sin dato
#7C7B74. Cada estado tiene su fondo suave correspondiente al 8% de opacidad.
El acento se usa con moderación: chips activos, botón primario y barras de la
gráfica. Nada más.

TIPOGRAFÍA
IBM Plex Sans para toda la interfaz. IBM Plex Mono para códigos SKU y cifras
monetarias.
Escala: 22px/600 cifras de indicador, 19px/600 título de página, 15px/600 título
de tarjeta, 13px/400 texto base, 12px/500 metadatos, 11px/500 mayúsculas con
letterspacing 0.04em para etiquetas de indicador.
Todos los números con cifras tabulares, alineadas verticalmente entre filas.

FORMA Y ESPACIO
Rejilla base de 4px. Radio de 10px en tarjetas, campos y botones; 999px solo en
chips. Bordes de 1px. Sin sombras salvo una muy sutil bajo la barra de filtros
cuando queda fija al hacer scroll. Ancho máximo de contenido 1240px, centrado,
con 20px de margen lateral.

ESTRUCTURA, DE ARRIBA HACIA ABAJO

1. Barra superior, 56px de alto, fondo de superficie, borde inferior de 1px.
   A la izquierda un logotipo cuadrado de 24px con un icono de caja en línea
   sobre fondo de acento, seguido del título "Catálogo Mayorista" en 15px/600.
   A la derecha, en 11px atenuado y separados por puntos medios: "Origen: ERP
   catálogo · 240 registros · v1". Al final, un conmutador de tema claro/oscuro
   como icono de 32px.

2. Fila de cuatro indicadores, tarjetas iguales de borde fino, 14px de padding.
   Cada una: etiqueta en 11px mayúsculas atenuada, cifra grande en 22px/600, y
   una nota de contexto en 11px debajo.
   - "PRODUCTOS VISIBLES" · 240 · "de 240 en catálogo"
   - "PRECIO PROMEDIO" · $247.80 · "19 sin precio, excluidos"
   - "UNIDADES EN PISO" · 108,432 · "15 sin registro de stock"
   - "REQUIEREN ATENCIÓN" · 38 · "24 bajos · 14 agotados"

3. Barra de filtros, tarjeta de borde fino con 14px de padding, que queda fija
   en la parte superior al hacer scroll.
   Primera fila: campo de búsqueda que ocupa el espacio disponible, con icono de
   lupa a la izquierda y el texto de ayuda "Buscar por nombre, SKU, marca,
   proveedor o almacén"; a su derecha dos desplegables compactos etiquetados
   "Inventario" y "Orden".
   Segunda fila: chips de categoría, cada uno con su nombre y el conteo en
   opacidad reducida — Abarrotes 38, Bebidas 29, Limpieza 31, Cuidado Personal
   27, Papelería 30, Ferretería 28, Snacks 26, Lácteos 31. Dos chips aparecen
   seleccionados, con fondo de acento y texto claro.
   Tercera fila, separada por un borde superior: dos casillas, "Solo activos" y
   "Solo con descuento", y a la derecha del todo un enlace "Limpiar filtros".

4. Fila de filtros activos: pequeñas etiquetas removibles con una equis, del
   tipo "Abarrotes ×" y "Solo activos ×", precedidas del texto "Filtros activos:".
   Solo aparece cuando hay filtros puestos.

5. Tarjeta de gráfica, plegable, con un encabezado que dice "Unidades por
   categoría" en 13px/600 y a la derecha la nota "Calculado sobre los productos
   visibles". Gráfica de barras verticales de 240px de alto, barras en color de
   acento con las esquinas superiores redondeadas 6px, solo líneas de rejilla
   horizontales muy tenues, eje sin línea, etiquetas de eje en 11px atenuado.

6. Encabezado de resultados: a la izquierda "240 productos" en 13px; a la
   derecha un selector de densidad con dos opciones, "Cómoda" y "Compacta", y un
   selector de "24 por página".

7. Rejilla de tarjetas de producto, 4 columnas en escritorio, separación de
   14px. Cada tarjeta lleva:
   - Nombre del producto en 15px/600, hasta dos líneas.
   - Debajo, el SKU en monoespaciada 11px atenuada, tipo "SKU-0042".
   - En la esquina superior derecha, un chip gris con la categoría.
   - Descripción de una línea en 12px secundario, recortada con puntos suspensivos.
   - Separador de 1px.
   - Bloque de precio: importe grande en 19px/600 monoespaciada, y debajo el
     precio de mayoreo en 12px con la palabra "mayoreo" en atenuado. Si hay
     descuento, un chip con el acento suave que dice "-15%".
   - Fila de inventario: un punto de color de 8px, la etiqueta de estado en
     12px/500 del mismo color, y a la derecha la cantidad, "412 u.".
   - Separador de 1px.
   - Rejilla de dos columnas con seis metadatos, etiqueta atenuada arriba en
     11px y valor en 11.5px/500 debajo: Marca, Proveedor, Almacén, Por caja,
     Mínimo, Alta.

   Muestra variedad real entre las tarjetas: una con todos los campos completos,
   una con "Sin marca", una con "Sin precio" en gris atenuado, una con estado
   "Sin dato" en gris, una marcada "Agotado" en rojo, una con "Stock bajo" en
   ámbar, una con chip de descuento, y una atenuada al 60% con una etiqueta que
   dice "Producto inactivo".

8. Pie de paginación centrado: botón "Anterior", números de página 1 2 3 … 10,
   botón "Siguiente", y a la derecha el texto "Mostrando 1-24 de 240".

REGLAS DE EXPERIENCIA DE USUARIO, OBLIGATORIAS
- Paginación explícita. Nada de scroll infinito ni de botón "cargar más": el
  usuario debe poder llegar al pie de la página y saber dónde está.
- Un solo eje de scroll en toda la pantalla. Ninguna zona con scroll propio,
  ninguna rejilla con altura fija y desbordamiento interno.
- El color nunca comunica solo. Todo estado de inventario lleva punto de color
  y texto.
- Contraste mínimo AA en todo el texto. Los grises atenuados siguen siendo
  legibles sobre su fondo.
- Áreas de toque de al menos 36px de alto en cualquier control.
- Foco visible: contorno de 2px en color de acento con 2px de separación.
- Sin modales para el flujo principal.
- Sin texto centrado en bloques largos, sin mayúsculas sostenidas fuera de las
  etiquetas de indicador, sin texto sobre imágenes.

RESPONSIVE
1440px cuatro columnas de tarjetas · 1024px tres · 768px dos, y los desplegables
de la barra de filtros pasan a segunda línea · 480px una columna, los
indicadores en rejilla de dos por dos y los chips de categoría en fila con
desplazamiento horizontal.
```

---

## Prompts de refinamiento

Aplícalos uno a uno, en este orden, sobre la pantalla ya generada.

### 2 · Tema oscuro

```
Genera la variante en tema oscuro de esta misma pantalla, conservando
exactamente la misma estructura, tamaños y espaciado. Solo cambian los colores.

Carbón cálido, nunca azulado ni negro puro. Fondo de página #131211,
superficies #1C1B19, superficie sutil #232220, bordes #302E2B, borde marcado
#45433E. Texto principal #F0EFEB, secundario #B3B2AA, atenuado #86857D.
Acento #61B795 con fondo suave #1C332B, y el texto sobre el acento en #0D1C16.
Estados: disponible #62B783, stock bajo #D99B45, agotado #E0796C, sin dato
#91908A.

Las superficies se distinguen del fondo por elevación de color, no por sombras.
El acento pierde saturación respecto al tema claro para no vibrar sobre el
fondo oscuro. Verifica que el texto atenuado siga cumpliendo contraste AA.
```

### 3 · Estados de carga, vacío y error

```
Genera tres variantes adicionales de la zona de resultados, conservando la barra
superior y la de filtros:

CARGANDO — esqueletos, no un indicador giratorio. Doce tarjetas con bloques
grises del tamaño real de cada elemento, con una animación de brillo suave que
recorre de izquierda a derecha. Las cuatro tarjetas de indicador también en
esqueleto. La estructura de la página ya está en su sitio, de modo que nada se
desplaza cuando entran los datos.

VACÍO — un solo recuadro de borde punteado que ocupa el ancho de la rejilla, con
80px de padding vertical. Contiene, centrados: "Ningún producto coincide" en
15px/600, debajo la explicación "Los filtros activos no dejan resultados en el
catálogo. Ajusta la búsqueda o vuelve al listado completo." en 13px secundario
con un ancho máximo de 380px, y un botón primario "Limpiar filtros". Sin
ilustración.

ERROR — franja de aviso con borde y fondo suave en color crítico, colocada donde
irían los resultados. Título "No se pudo cargar el archivo de datos" en 13px/600,
y debajo la causa concreta en 12.5px, del tipo "El servidor respondió 500 al
pedir el catálogo." Incluye un botón secundario "Reintentar". Los indicadores y
los filtros permanecen visibles pero atenuados.
```

### 4 · Panel de detalle

```
Añade un panel lateral de detalle que entra deslizándose desde la derecha al
pulsar una tarjeta. Ancho de 420px, altura completa, borde izquierdo de 1px, y
el resto de la página cubierto por un velo oscuro al 40%.

Contiene, de arriba abajo: una cabecera fija con el nombre del producto y un
botón de cerrar; el SKU en monoespaciada; el chip de categoría; el bloque de
precios en grande, con unitario, mayoreo y descuento; una tabla de dos columnas
con los quince campos del producto, donde los ausentes aparecen como "Sin
registrar" en gris; y un pie fijo con un botón primario "Agregar a orden" y uno
secundario "Ver movimientos".

El panel es un aparte, no un modal: el fondo sigue siendo visible y se cierra con
la tecla Escape o pulsando fuera.
```

### 5 · Densidad compacta

```
Genera la variante de densidad "Compacta" de la rejilla de resultados. Las
tarjetas reducen el padding de 16px a 10px, ocultan la descripción y el
separador que la sigue, y muestran los metadatos en una sola línea separada por
puntos medios en lugar de la rejilla de dos columnas. Caben seis columnas en
lugar de cuatro. El nombre, el precio y el estado de inventario mantienen su
tamaño: son lo que el usuario viene a leer.
```

---

## Resultado de la sesión

Stitch devolvió dos tableros: un sistema de diseño bautizado **«Industrial
Inventory Ledger»** y una pantalla de aplicación.

### Lo que se adoptó

| Decisión | Estado |
| --- | --- |
| Paleta con rampas tonales sobre `#1F5F4B` | Adoptada |
| IBM Plex Sans para interfaz, IBM Plex Mono para SKUs y cifras | Adoptada |
| Papel cálido `#F7F6F3` y bordes `#E3E1DC` | Adoptada |
| **Terracota `#7F443E` para el estado crítico** | Adoptada, sustituye al rojo `#A53024` |
| Neutro `#757875` | Adoptada |

La aportación propia de Stitch fue el terracota. El rojo original competía con el
papel cálido del fondo; el terracota convive con él sin perder la lectura de
alarma. Se ajustó su variante oscura a `#C98D84` para conservar el contraste AA
sobre carbón.

### Lo que se descartó

La pantalla de aplicación se generó en formato **móvil** pese a haberse pedido
web, y con ella llegaron tres decisiones fuera de alcance:

| Elemento generado | Motivo del descarte |
| --- | --- |
| Barra de navegación inferior con las pestañas Pedidos, Inventario y Reportes | Secciones inexistentes: el proyecto es una sola vista |
| Miniatura de imagen en cada fila de producto | El archivo de datos no contiene imágenes y no se inventan marcadores |
| Lista de filas en lugar de rejilla de tarjetas | Consecuencia del formato móvil, no de una decisión de diseño |

Se solicitó una segunda pasada en formato escritorio con el prompt de
refinamiento 6.

### 6 · Corrección a formato escritorio

```
Rehaz esta pantalla en formato web de escritorio, 1440px de ancho. No es una
aplicación móvil.

Elimina la barra de navegación inferior con pestañas: la aplicación es una sola
vista, no tiene secciones de Pedidos, Inventario ni Reportes.

Elimina las miniaturas de imagen de los productos. El catálogo no tiene
fotografías y no deben aparecer marcadores de posición.

Sustituye la lista de filas por una rejilla de tarjetas de cuatro columnas con
separación de 14px, contenido centrado con un ancho máximo de 1240px.

Los cuatro indicadores van en una sola fila horizontal, no en rejilla de dos por
dos. La barra de filtros ocupa el ancho completo con la búsqueda, los dos
desplegables y los chips de categoría visibles a la vez, sin desplazamiento
horizontal.

Conserva exactamente la paleta, la tipografía y el sistema de espaciado ya
definidos.
```

---

## Después de Stitch

1. Exporta las pantallas y guárdalas en `docs/diseño/` como evidencia para el
   informe.
2. Toma nota de las decisiones que se apartaron de lo pedido, si las hubo.
3. El resultado se traslada a código actualizando los tokens de
   `src/index.css` y la sección 3 de la skill `catalogo-mayorista`, que es la que
   obliga al agente a respetarlos.
4. Retira el bloque de pendientes de `INFORME.md`: a partir de ese momento la
   declaración de Google Stitch como herramienta de diseño es cierta.

## Diferencias con la implementación actual

El prompt pide cuatro cosas que la aplicación todavía no tiene. Están incluidas
a propósito, porque son mejoras reales de experiencia de usuario:

| Elemento | Estado |
| --- | --- |
| Paginación de 24 por página | Por implementar — hoy se muestran los 240 de una vez |
| Fila de filtros activos removibles | Por implementar |
| Selector de densidad y panel de detalle | Por implementar |
| Esqueletos de carga | Por implementar — hoy hay un aviso de texto |

Lo demás —tokens, estados de inventario, tolerancia a nulos, estado vacío,
estado de error, barra de filtros y gráfica— ya existe y solo cambiaría de
aspecto.
