# Informe del Proyecto Final

**Curso de Desarrollo con Inteligencia Artificial**

| | |
| --- | --- |
| **Proyecto** | Catálogo Mayorista — panel de inventario dirigido por datos |
| **Autor** | _(completar nombre)_ |
| **Aplicación desplegada** | **https://proyecto-opencode.vercel.app** |
| **Fecha** | 30 de agosto de 2026 |

---

## 1. La aplicación

**Catálogo Mayorista** es un panel de inventario para un distribuidor mayorista.
Toma un archivo de datos con 240 productos y construye a partir de él dos
pantallas: un panel con los indicadores del negocio y la cola de reposición, y
un catálogo con búsqueda, filtros y vistas guardadas.

Construido con Vite, React 19, TypeScript y Tailwind CSS v4.

## 2. Herramientas utilizadas

| Función | Herramienta |
| --- | --- |
| Agente de desarrollo | **OpenCode**, en modos Plan y Build |
| Proveedor de modelo | **Google AI Studio** y **OpenRouter** (BYOK) |
| Diseño de interfaz | **Google Stitch** |
| Despliegue | Vercel |

**Sobre la herramienta de diseño.** Las directrices contemplan **Open Design** y
admiten alternativas siempre que se declaren. En este proyecto se utilizó
**Google Stitch**, que produjo un sistema llamado «Industrial Inventory Ledger»:
paleta sobre un verde de bodega, fondo de papel cálido e IBM Plex Sans y Mono.
El prompt completo y las pantallas exportadas están en `docs/PROMPT-STITCH.md` y
`docs/diseno/`.

No todo se adoptó. Su panel de detalle proponía nueve campos —peso, volumen,
material, origen, plazo, garantía, EAN, arancel y sincronización— que el archivo
de datos no tenía. En lugar de simularlos en la vista, se amplió el archivo
origen para que existieran de verdad.

## 3. Cumplimiento de las normativas

### Norma 1 — Cero código manual

Ninguna función, componente o integración se escribió a mano. Cada pieza procede
de una instrucción al agente, en modos Plan y Build: primero se pedía el plan de
arquitectura y se aprobaba, y solo entonces se construía.

Las instrucciones están transcritas en `docs/PROMPTS.md` y el historial de 25
commits conserva el orden en que se generaron.

La regla se aplicó incluso contra la tentación de arreglar cosas triviales: la
plantilla oficial de Vite venía con un aserto de no nulidad
(`document.getElementById('root')!`); en lugar de borrar el signo de admiración,
se le pidió al agente que explicara por qué era un problema y lo reemplazara.

### Norma 2 — Integración de contexto de datos

El archivo base es `public/datos/productos.json`: 240 registros en 8 categorías,
con 24 campos por producto. Tres están siempre presentes —`id`, `nombre` y
`categoria`—; el resto puede venir vacío, y una clave, `almacen`, puede no
existir en el registro.

Se inyectó como contexto de dos formas complementarias:

1. **Como especificación para el agente.** El contrato completo está transcrito
   en la skill `catalogo-mayorista`, que el agente carga antes de tocar
   cualquier vista. De ahí salieron los tipos de TypeScript y las reglas de
   tolerancia a valores ausentes.
2. **Como fuente en tiempo de ejecución.** La aplicación lo descarga por `fetch`
   y deriva de él las categorías con su conteo, los rangos y los umbrales del
   semáforo de inventario, en `src/hooks/useCatalogo.ts`.

No hay una sola categoría, marca, proveedor ni rango de precios escrito en el
código. Sustituir el archivo por otro con el mismo contrato cambia la aplicación
entera sin tocar una línea.

### Norma 3 — Skill y comandos personalizados

**Skill `catalogo-mayorista`** (`.opencode/skills/catalogo-mayorista/SKILL.md`).
Especificación que el agente carga automáticamente al tocar cualquier vista.
Fija el contrato del archivo, una tabla de tolerancia a valores ausentes caso
por caso, los tokens de diseño y una lista de prohibiciones explícitas: nada de
`as any`, nada de asertos de no nulidad, nada de datos inventados en los
componentes.

**Comando `/renderizar_tarjetas`** (`.opencode/commands/`). Orquesta la
construcción de la lista de productos en cinco pasos encadenados: leer el
contrato recorriendo el JSON real en lugar de asumirlo, derivar las opciones
desde los datos, resolver los casos de campos ausentes, construir la vista con
su estado vacío y, por último, verificar. El quinto paso es el que lo distingue
de una petición suelta: el agente no puede declararse terminado sin ejecutar
tipos, compilación y repaso de valores nulos.

**Comando `/auditar_datos`** (`.opencode/commands/`). Delega en el agente
auditor, contrasta su reporte contra el código y registra el resultado.

Los tres son prompts versionados: cualquiera que clone el repositorio obtiene el
mismo comportamiento del agente.

### Norma 4 — Agente personalizado

**Agente `auditor-datos`** (`.opencode/agents/auditor-datos.md`), con alcance
deliberadamente cerrado. Se declara con `mode: subagent` y `permission` de
`edit` y `write` en `deny`, de modo que la separación de responsabilidades es
una restricción del entorno y no una recomendación escrita en prosa: puede leer
el archivo y contar sobre él, pero no puede tocar el código.

Su trabajo es censar las claves del archivo, cuantificar anomalías —claves
ausentes, tipos mixtos, rangos inválidos, incoherencias internas— y traducir
cada una en un requisito verificable de interfaz. Su instrucción central evita
el fallo más común de un agente auditor:

> Todo número que reportes debe venir de un conteo real sobre el archivo. Nunca
> reportes una cifra que no calculaste.

**Flujo entre agentes, verificado en ejecución.** Al lanzar `/auditar_datos
stock`, el comando desplegó sus cuatro pasos y delegó el primero:

```
[•] Delegar auditoría de stock al subagente @auditor-datos
      Auditor-Datos Task — Auditoría de stock en productos.json
        Bash  node "...\opencode\auditar.mjs"
```

La última línea es la relevante: el subagente no estimó las cifras, escribió un
script desechable y contó sobre el archivo, que es exactamente lo que su
instrucción le exige.

### Norma 5 — Refactorización y depuración autónoma

Ningún error se corrigió a mano. El ciclo fue siempre el mismo: capturar el
error tal cual, pedir al agente la **causa raíz** antes que el parche, aplicar
su corrección y volver a verificar. Los siete casos están en `docs/BITACORA.md`;
dos ilustran por qué el orden importa.

**Error de tipos en la gráfica.** La compilación falló con `TS2322`. La solución
fácil —anotar el parámetro como `any`— habría compilado al primer intento. Pedir
la causa antes que el parche reveló que el error describía un caso real: la
librería puede invocar ese callback con un valor ausente, y silenciarlo
reintroducía el riesgo de `NaN` que toda la interfaz está construida para
evitar.

**Descuento sobre un precio inexistente.** Tres productos mostraban «-18 %»
junto a «Sin precio». El dato era legítimo —son dos altas distintas del ERP—;
lo incorrecto era la vista, que hacía pasar por sensata una combinación que no
lo es. El porcentaje dejó de dibujarse y la incoherencia se reporta aparte.

Sobre los valores nulos, la interfaz distingue **tres cosas que no son lo
mismo**: el dato que falta por capturar, el que no aplica a ese artículo y el
que vale cero. Colapsarlas en una sola etiqueta haría mentir a la interfaz.
Ejemplos: `stock` en `null` es «Sin dato» y nunca «Agotado»; `garantiaMeses` en
`null` es «No aplica» y no se atenúa; `fechaAlta` en `null` muestra `—` y jamás
construye `new Date(null)`, que devolvería el 31 de diciembre de 1969 como si
fuera un dato real.

Estas reglas quedaron fijadas como 31 pruebas automáticas en `src/pruebas/`, que
montan la aplicación con el archivo real y comprueban que no llega ningún `NaN`,
`undefined` ni fecha de 1969 al DOM.

### Norma 6 — Despliegue a producción

Aplicación publicada en Vercel y accesible en
**https://proyecto-opencode.vercel.app**

Antes de cada publicación se ejecuta `npm run verificar`, que corre tipos,
análisis estático, pruebas y compilación.

## 4. Prompts utilizados

La transcripción completa está en `docs/PROMPTS.md`. Se agrupan en tres tipos.

**Conversacionales**, escritos en el chat. Fueron pocos y de alto nivel: el
primero pedía leer las directrices y explicar los entregables; el segundo
encargaba la construcción con la instrucción de buscar el proyecto más simple
que cumpliera las seis normas.

**Estructurados**, guardados como archivos en `.opencode/`. Es donde vive el
grueso de la orquestación, y la diferencia práctica es grande: un prompt escrito
en el chat se ejecuta una vez y se pierde; uno guardado como comando se ejecuta
igual la décima vez, incluso en otra máquina.

**De depuración**, con este patrón ante cada fallo:

> Este es el error exacto que devolvió `npm run build`:
> ```
> <salida pegada sin editar>
> ```
> Antes de proponer un parche, explícame la causa raíz: por qué el compilador
> considera esto un error y qué caso real está describiendo. Después aplica la
> corrección y vuelve a ejecutar la verificación.

La segunda mitad es la que importa. Sin ella, el agente entrega el parche que
hace desaparecer el mensaje, que no siempre es el que arregla el problema.

---

### Documentos de apoyo

| Documento | Contenido |
| --- | --- |
| `docs/PROMPTS.md` | Transcripción de los prompts utilizados |
| `docs/BITACORA.md` | Los siete fallos, con causa raíz y corrección |
| `docs/PROMPT-STITCH.md` | Prompt de diseño y análisis del resultado |
| `docs/diseno/` | Pantallas exportadas de Google Stitch |
| `.opencode/` | Skill, comandos y agente personalizados |
