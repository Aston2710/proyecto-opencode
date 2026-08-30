# Informe del Proyecto Final

**Curso de Desarrollo con Inteligencia Artificial**

| | |
| --- | --- |
| **Proyecto** | Catálogo Mayorista — panel de inventario dirigido por datos |
| **Autor** | _(completar nombre)_ |
| **Repositorio** | _(pendiente de publicar)_ |
| **Aplicación desplegada** | _(pendiente de publicar)_ |
| **Fecha** | 29 de agosto de 2026 |

---

> ### Pendientes antes de entregar
>
> - [x] Ejecutar la sesión de diseño en Google Stitch y aplicar el resultado.
> - [x] Guardar las capturas y el código exportado de Stitch en `docs/diseno/`.
> - [ ] **Abrir el proyecto con OpenCode + OpenRouter al menos una vez** y comprobar que la skill, los dos comandos y el subagente cargan. La sección 3 declara ese entorno; la declaración solo es cierta una vez hecho.
> - [ ] Completar el nombre del autor en la ficha superior.
> - [ ] Pegar el enlace del repositorio y el de la aplicación desplegada.
> - [ ] Borrar este bloque de pendientes.

---

## 1. Objetivo

Conceptualizar, construir y desplegar una página web interactiva delegando la
totalidad de la programación a agentes de inteligencia artificial. El valor del
trabajo no está en el código escrito, sino en cómo se dirigió al agente para
producirlo: qué contexto se le dio, qué instrucciones se dejaron fijadas por
escrito y cómo se resolvieron los fallos sin intervenir el código a mano.

## 2. El proyecto

**Catálogo Mayorista** es un panel de inventario para un distribuidor
mayorista. Toma un archivo de datos con 240 productos y construye a partir de él
una vista completa: indicadores agregados, filtros interactivos, una gráfica de
inventario por categoría y una rejilla de tarjetas.

Funciona sobre estas ideas:

**El archivo de datos manda.** No hay una sola categoría, marca, proveedor ni
rango de precios escrito en el código. Todo se deriva del archivo en tiempo de
ejecución. Sustituir `public/datos/productos.json` por otro archivo con el mismo
contrato cambia la aplicación entera sin tocar una línea de código.

**Los datos vienen sucios, como en la realidad.** El archivo imita una
exportación de ERP e incluye huecos deliberados: precios ausentes, stock sin
registrar, marcas vacías y registros donde la clave `almacen` directamente no
existe. La interfaz los absorbe sin romperse y sin inventar valores.

**Todo lo interactivo comparte el mismo estado.** Búsqueda, chips de categoría,
filtro de inventario y orden actúan a la vez sobre los indicadores, la gráfica y
la rejilla.

Construido con Vite, React 19, TypeScript, Tailwind CSS v4 y Recharts.

## 3. Herramientas utilizadas

| Función | Herramienta |
| --- | --- |
| Agente de desarrollo | **OpenCode**, en modos Plan y Build — generación de todo el código, refactorización y depuración |
| Proveedor de modelo | **OpenRouter** (BYOK) |
| Diseño de interfaz | **Google Stitch** |
| Control de versiones | Git y GitHub |
| Despliegue | Vercel |

### Sobre el entorno de agentes

Se trabajó con **OpenCode** conectado a **OpenRouter** bajo el esquema BYOK
(*bring your own key*) que contemplan las directrices del curso. La
configuración del agente no vive en ajustes locales de la máquina sino
versionada en el repositorio, de modo que cualquiera que lo clone obtenga el
mismo comportamiento:

```
AGENTS.md                                    Instrucciones de proyecto
.opencode/skills/catalogo-mayorista/         Contrato de datos, diseño y prohibiciones
.opencode/commands/renderizar_tarjetas.md    Comando de construcción de la rejilla
.opencode/commands/auditar_datos.md          Comando que delega en el subagente
.opencode/agents/auditor-datos.md            Subagente auditor, sin permiso de escritura
```

Los modos **Plan** y **Build** se usaron de forma deliberada: primero se pedía el
plan de arquitectura y se aprobaba, y solo entonces se pasaba a construir. El
subagente `auditor-datos` se declara con `mode: subagent` y `permission` de
`edit` y `write` en `deny`, lo que hace la separación de responsabilidades una
restricción del entorno y no una recomendación escrita en prosa.

### Sobre la herramienta de diseño

Las directrices del curso contemplan **Open Design** para la fase de diseño y
admiten alternativas siempre que se declaren en el informe. En este proyecto se
utilizó **Google Stitch** en lugar de Open Design.

Stitch produjo un sistema de diseño llamado **«Industrial Inventory Ledger»**:
paleta con rampas tonales sobre un verde de bodega `#1F5F4B`, papel cálido
`#F7F6F3` como fondo, IBM Plex Sans para la interfaz e IBM Plex Mono para códigos
SKU y cifras monetarias. El prompt completo y el análisis del resultado están en
`docs/PROMPT-STITCH.md`.

No todo lo que devolvió se adoptó, y la parte descartada es mayor que la
adoptada. Stitch entregó siete pantallas y un documento de sistema de diseño;
las capturas y el código exportado están en `docs/diseno/`.

**Lo que se adoptó** procede casi todo del documento de sistema: la escala
tipográfica completa, la elección de IBM Plex Sans y Mono con cifras tabulares,
el fondo de papel cálido y la filosofía de profundidad por capas tonales y
líneas de 1 px en lugar de sombras. Su aportación propia más valiosa fue
sustituir el rojo de alarma por un **terracota apagado**: el rojo puro competía
con el papel cálido del fondo.

**Lo que se descartó**, y por qué:

| Decisión de Stitch | Motivo del rechazo |
| --- | --- |
| Campos `PESO`, `VOLUMEN`, `MATERIAL`, `ORIGEN`, `LEAD TIME`, `GARANTÍA`, `EAN`, `HS CODE`, `ÚLTIMA SINC.` en el panel de detalle | **No existen en el archivo de datos.** Contradicen frontalmente la norma 2 |
| Fotografía de producto en cada tarjeta | El catálogo no tiene imágenes; serían marcadores vacíos |
| Barra de navegación inferior con Pedidos, Inventario, Reportes | Secciones inexistentes: el proyecto es una sola vista |
| Formato móvil en las siete pantallas | Se pidió web de escritorio dos veces, en el prompt base y en el refinamiento |
| Paleta completa de Material 3 con `primary #004735` | Sustituía al verde ya definido y añadía cuarenta tokens para una sola vista |

A esto se suma una **inconsistencia interna** entre pantallas: la navegación
aparece en español en el tema claro y en inglés en el oscuro, el SKU adopta tres
formatos distintos —`SKU-1029`, `AB-1001` y el real `SKU-0001`— y el estado de
inventario se llama «Stock bajo» en una pantalla y «Poco Stock» en otra. La
pantalla etiquetada como vista compacta de seis columnas no tiene seis columnas:
sus indicadores son cajas vacías.

La conclusión operativa fue **no insistir con más iteraciones**. El valor
extraíble —sistema tipográfico, paleta y filosofía de elevación— ya estaba
obtenido tras la segunda pasada, y las pantallas seguían contradiciendo el
archivo de datos, que es la restricción que manda en este proyecto. Aceptar el
diseño tal cual habría significado inventar nueve campos que el ERP no exporta.

El diseño se materializó en código mediante el agente. Los tokens viven en
`src/index.css` y quedaron fijados en la sección 3 de la skill
`catalogo-mayorista`, que es la que obliga al agente a respetarlos en cualquier
cambio posterior: ningún componente tiene permitido escribir un color literal.

## 4. Cumplimiento de las normativas

### Norma 1 — Cero código manual

Ninguna función, componente o integración se escribió a mano. Cada pieza procede
de una instrucción al agente; las instrucciones están transcritas en
`docs/PROMPTS.md` y el historial de commits conserva el orden en que se
generaron.

La regla se aplicó incluso contra la tentación de arreglar cosas triviales. En el
caso E-04 de la bitácora, la plantilla oficial de Vite venía con un aserto de no
nulidad (`document.getElementById('root')!`) que viola las reglas del proyecto:
en lugar de borrar el signo de admiración, se le pidió al agente que explicara
por qué era un problema y que lo reemplazara por una guarda con mensaje legible.

### Norma 2 — Integración de contexto de datos

El archivo base es `public/datos/productos.json`: 240 registros en 8 categorías,
con este contrato por producto.

```jsonc
{
  "id": string,                    // siempre presente
  "nombre": string,                // siempre presente
  "categoria": string,             // siempre presente
  "marca": string | null,
  "proveedor": string | null,
  "almacen": string | undefined,   // la clave puede NO existir
  "precioUnitario": number | null,
  "precioMayoreo": number | null,
  "unidadesPorCaja": number,
  "stock": number | null,
  "stockMinimo": number,
  "descuento": number,
  "activo": boolean,
  "fechaAlta": string | null,
  "descripcion": string | null
}
```

El archivo se inyectó como contexto de dos formas complementarias:

1. **Como especificación para el agente.** El contrato está transcrito en la
   skill `catalogo-mayorista`, que el agente carga antes de tocar cualquier
   vista. De ahí salieron los tipos de TypeScript y las reglas de tolerancia.
2. **Como fuente en tiempo de ejecución.** La aplicación lo descarga por `fetch`
   y deriva de él las categorías con su conteo, los rangos de precio y los
   umbrales del semáforo, en `src/hooks/useCatalogo.ts`.

Se generó con `scripts/generar-datos.mjs`, que usa una semilla fija para que el
resultado sea reproducible.

### Norma 3 — Skill y comandos personalizados

**Skill `catalogo-mayorista`** — especificación cargada automáticamente al tocar
cualquier vista. Fija el contrato del archivo, una tabla de tolerancia a nulos
caso por caso, los tokens de diseño y una lista de prohibiciones explícitas:
nada de `as any`, nada de asertos de no nulidad, nada de datos inventados dentro
de los componentes.

**Comando `/renderizar_tarjetas`** — orquesta la construcción de la rejilla en
cinco pasos encadenados: leer el contrato recorriendo el JSON real en lugar de
asumirlo, derivar las opciones desde los datos, construir la tarjeta resolviendo
los ocho casos de campos ausentes, construir la rejilla con su estado vacío y,
por último, verificar. El quinto paso es el que distingue al comando de una
petición suelta: el agente no puede declararse terminado sin ejecutar tipos,
compilación, búsqueda de literales del dominio y repaso de nulos.

**Comando `/auditar_datos`** — delega en el agente auditor, contrasta su reporte
contra el código citando archivo y línea, registra el resultado en la bitácora y
devuelve los pendientes ordenados por riesgo.

Los tres son prompts versionados: cualquiera que clone el repositorio obtiene el
mismo comportamiento del agente.

### Norma 4 — Agente personalizado

**Agente `auditor-datos`**, con alcance deliberadamente cerrado: solo lee el
archivo de datos, no tiene permiso de escritura sobre `src/` y tiene prohibido
opinar de diseño o de arquitectura de componentes.

Su trabajo es hacer el censo de claves del archivo, cuantificar anomalías
—claves ausentes, tipos mixtos, rangos inválidos, incoherencias internas,
identificadores duplicados— y **traducir cada una en un requisito verificable de
interfaz**, del tipo `stock === null debe renderizar "Sin dato" y quedar fuera
del promedio de inventario`. Cierra siempre con un veredicto de `APTO` o
`NO APTO`.

Su instrucción central es la que evita el fallo más común de un agente auditor:

> Todo número que reportes debe venir de un conteo real sobre el archivo. Nunca
> reportes una cifra que no calculaste.

El flujo entre agentes queda así: `/auditar_datos` invoca a `auditor-datos`, que
devuelve requisitos; el agente principal los contrasta contra el código y aplica
lo que falte siguiendo la skill. Auditar y construir están separados a propósito:
quien escribe el código no es quien decide si los datos están bien.

### Norma 5 — Refactorización y depuración autónoma

Seis fallos documentados en `docs/BITACORA.md`, todos resueltos con el mismo
ciclo: capturar el error tal cual, pedir la **causa raíz** antes que el parche,
aplicar la corrección del agente y volver a verificar.

El caso más ilustrativo es el **E-03**. La compilación falló con un error de
tipos en el formateador de la gráfica. La solución fácil —anotar el parámetro
como `any`— habría compilado en el primer intento. Pedir la causa antes que el
parche reveló que el error describía un caso real: la librería puede invocar ese
callback con un valor ausente, y silenciarlo reintroducía justamente el riesgo de
`NaN` que toda la interfaz está construida para evitar. La corrección correcta
fue estrechar el tipo dentro de la función y reutilizar el ayudante que ya
resolvía el caso nulo.

El **E-01** muestra el valor de verificar en lugar de confiar: el generador de
proyectos aceptó el comando, terminó con éxito y creó la plantilla equivocada,
sin ningún mensaje de error. Se detectó leyendo el `package.json` resultante.

Sobre los datos, la interfaz absorbe estos huecos del archivo origen:

| Campo | Registros | Qué muestra |
| --- | :-: | --- |
| `marca` en `null` | 27 | `Sin marca`, y sigue siendo filtrable |
| `proveedor` en `null` | 25 | `Sin proveedor` |
| `descripcion` en `null` | 22 | El párrafo no se renderiza |
| `precioUnitario` en `null` | 19 | `Sin precio`, excluido del promedio |
| clave `almacen` ausente | 16 | `Sin asignar` |
| `stock` en `null` | 15 | `Sin dato`, distinto de `Agotado` |
| `precioMayoreo` en `null` | 13 | `Sin precio` |
| `fechaAlta` en `null` | 12 | `—`, nunca `31 dic 1969` |

Ese último detalle es el que mejor resume el problema de las variables nulas:
en JavaScript `new Date(null)` no falla, devuelve la fecha de origen del sistema.
Sin la guarda correspondiente, los doce productos sin fecha habrían mostrado
*31 dic 1969* como si fuera un dato real. Es un fallo silencioso: no aparece en
consola, no rompe la página, simplemente miente.

Para que estas reglas no se pierdan con el tiempo, quedaron fijadas como pruebas
automáticas en `src/pruebas/`, que verifican el contrato de nulos y comprueban
que la aplicación monta con el archivo real sin emitir errores en consola y sin
dejar `NaN`, `undefined` ni fechas de 1969 visibles en la página.

### Norma 6 — Despliegue a producción

Aplicación compilada con Vite y publicada en Vercel, accesible por enlace
público. La compilación de producción se verifica antes de cada publicación con
`npm run verificar`, que ejecuta tipos, análisis estático, pruebas y build.

## 5. Prompts utilizados

La transcripción completa está en `docs/PROMPTS.md`. Se agrupan en tres tipos.

**Conversacionales** — los escritos en el chat. Fueron pocos y de alto nivel; el
primero pedía leer las directrices y explicar los entregables, el segundo
encargaba la construcción completa con la instrucción de buscar el proyecto más
simple que cumpliera las seis normas.

**Estructurados** — los guardados como archivos en `.opencode/`. Es donde vive el
grueso de la orquestación, y la diferencia práctica es grande: un prompt escrito
en el chat se ejecuta una vez y se pierde; uno guardado como comando se ejecuta
igual la décima vez, incluso en otra máquina.

**De depuración** — el patrón aplicado ante cada fallo:

> Este es el error exacto que devolvió `npm run build`:
> ```
> <salida pegada sin editar>
> ```
> Antes de proponer un parche, explícame la causa raíz: por qué el compilador
> considera esto un error y qué caso real está describiendo. Después aplica la
> corrección y vuelve a ejecutar la verificación.

La segunda mitad es la que importa. Sin ella, el agente entrega el parche que
hace desaparecer el mensaje, que no siempre es el que arregla el problema.

## 6. Conclusiones

**El contexto pesa más que la instrucción.** Los resultados mejoraron cuando el
contrato de datos y las reglas de diseño dejaron de repetirse en cada petición y
pasaron a vivir en la skill. A partir de ahí, instrucciones cortas producían
código que ya respetaba las convenciones.

**Los prompts que valen son los que se guardan.** Un comando versionado es
infraestructura reutilizable; una petición en el chat es de un solo uso. La
diferencia se nota al tener que rehacer una parte.

**Pedir la causa antes que el parche cambia el resultado.** En el caso E-03 la
solución rápida compilaba y era incorrecta. Preguntar por qué fallaba llevó a
descubrir que el error describía un caso real de los datos.

**Verificar no es opcional.** Dos de los seis fallos —la plantilla equivocada y
los archivos perdidos al mover el andamiaje— terminaron con código de salida
exitoso y sin mensaje de error. Solo aparecieron al comprobar el resultado en
lugar de confiar en que el comando hizo lo que decía.

**Delegar en un agente con alcance cerrado da mejores resultados que pedirlo
todo al mismo.** El auditor de datos no puede escribir código, y precisamente por
eso su reporte es útil: no tiene manera de justificar sus hallazgos con la
solución que ya tenía en mente.

---

### Anexos

| Documento | Contenido |
| --- | --- |
| `README.md` | Estructura del proyecto y puesta en marcha |
| `docs/PROMPTS.md` | Transcripción de los prompts utilizados |
| `docs/BITACORA.md` | Los seis fallos, con causa raíz y corrección |
| `.opencode/` | Skill, comandos y agente personalizados |
| `src/pruebas/` | Pruebas del contrato de datos |
