# Registro de prompts

Instrucciones que se dieron al agente para construir el proyecto, en el orden en
que ocurrieron. Se transcriben tal cual se escribieron.

Los prompts de este proyecto son de tres tipos:

- **Conversacionales** — escritos en el chat durante la sesión.
- **Estructurados** — guardados como archivos en `.opencode/` para poder repetirse
  de forma idéntica cuantas veces haga falta (skill, comandos, agente).
- **De depuración** — el error pegado en crudo más la petición de causa raíz.

---

## 1. Prompts conversacionales

### P-01 · Lectura de requisitos

> Ok, lee el .md que se encuentra en el archivo y que me expliques a profundidad
> como se debe hacer la tarea, como está constituida (lo que se debe entregar),
> que hay que hacer paso a paso

Resultado: desglose de las 6 normativas como rúbrica de auditoría y lista de
entregables inferidos.

### P-02 · Encargo de construcción

> necesito que montes la estructura y que hagas el desarrollo ya que voy a
> trabajar contigo en esto, necesito que se cumplan todos los requerimientos,
> busca el proyecto que se vea más simple, más cómodo, no nos vayamos a lo
> complejo, en esta tarea específica el objetivo es entregar y terminar el curso

Decisiones que se tomaron a partir de este prompt, respondiendo a las preguntas
que el agente devolvió:

| Decisión | Elección |
| --- | --- |
| Tema | Catálogo de productos mayorista |
| Diseño | Sistema propio limpio, sin plantilla |
| Despliegue | Vercel |
| Control de versiones | Git + GitHub |

### P-03 · Corrección de entregables

> parece ser que en el documento no se pide un informe pero la tarea sí, debe
> haber un informe y lo que se entrega es el link de despliegue

Resultado: se añadieron `INFORME.md` y este registro de prompts al alcance, y se
incorporó la declaración de la herramienta de diseño utilizada.

---

## 2. Prompts estructurados

El grueso de la orquestación no vive en el chat sino en archivos versionados.
Son prompts reutilizables: cualquiera que clone el repositorio obtiene el mismo
comportamiento del agente.

### Skill · `.opencode/skills/catalogo-mayorista/SKILL.md`

Especificación que el agente carga antes de tocar la interfaz. Fija cuatro cosas:

1. El contrato de `productos.json` y la regla de que **la fuente de verdad es el
   archivo**: prohibido escribir categorías, marcas o rangos en el código.
2. Una tabla de tolerancia a nulos, caso por caso, con el comportamiento exigido.
3. Los tokens de diseño, la escala tipográfica y el semáforo de inventario.
4. Prohibiciones explícitas: nada de `as any`, nada de `!`, nada de datos
   inventados dentro de los componentes.

### Comando · `/renderizar_tarjetas`

Orquesta la construcción de la rejilla en cinco pasos encadenados:

```
Paso 1 — Leer el contrato real recorriendo el JSON, no el asumido.
Paso 2 — Derivar categorías, marcas y rangos desde los datos. Toda constante
         literal del dominio es un error.
Paso 3 — Construir la tarjeta con los 8 casos de nulos resueltos.
Paso 4 — Construir la rejilla, con estado vacío y conteo accesible.
Paso 5 — Verificar: tsc, build, búsqueda de literales y repaso de nulos.
         No entregar con verificaciones en rojo.
```

El paso 5 es el que convierte el comando en algo distinto de una petición
suelta: el agente no puede declararse terminado sin ejecutar las comprobaciones.

### Comando · `/auditar_datos`

Delega en el agente `auditor-datos`, contrasta su reporte contra el código
existente citando archivo y línea, escribe el resultado en la bitácora y devuelve
la lista de pendientes ordenada por riesgo.

### Agente · `auditor-datos`

Subagente con alcance cerrado: solo `datos`, herramientas de lectura, sin acceso
de escritura a `src/`. Su instrucción central:

> Todo número que reportes debe venir de un conteo real sobre el archivo. Nunca
> reportes una cifra que no calculaste. Cierra con `APTO` o `NO APTO`.

Traduce cada anomalía del archivo en un requisito verificable de interfaz, del
tipo `stock === null debe renderizar "Sin dato" y quedar fuera del promedio`.

---

## 3. Prompts de depuración

Patrón aplicado ante cada fallo. El detalle completo de cada caso está en
[`BITACORA.md`](./BITACORA.md).

> Este es el error exacto que devolvió `npm run build`:
> ```
> <salida pegada sin editar>
> ```
> Antes de proponer un parche, explícame la causa raíz: por qué el compilador
> considera esto un error y qué caso real está describiendo. Después aplica la
> corrección y vuelve a ejecutar la verificación.

La segunda mitad del prompt es la importante. Pedir la causa antes del parche fue
lo que descartó la solución fácil en el caso E-03: anotar el parámetro como `any`
compilaba, pero reintroducía el riesgo de `NaN` que toda la interfaz está
construida para evitar.

---

## 4. Prompt de generación del archivo de datos

> Genera un script de Node que produzca un catálogo mayorista de 240 productos
> repartidos en 8 categorías reales. El archivo debe imitar una exportación de
> ERP: incluye huecos intencionales — precios nulos, stock nulo, marcas y
> proveedores vacíos, y algunos registros donde la clave `almacen` directamente
> no exista. Usa una semilla fija para que el resultado sea reproducible.

La decisión de sembrar los huecos a propósito es deliberada: la norma 5 pide
demostrar el manejo de variables nulas, y para demostrarlo hace falta un archivo
que efectivamente las tenga.
