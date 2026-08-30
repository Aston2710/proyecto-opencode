# Bitácora de depuración autónoma

Registro de cada fallo encontrado durante la construcción y de cómo se resolvió.

Cumple la **norma 5** de las directrices: ningún error se corrigió a mano
razonando sobre el código. En todos los casos el ciclo fue el mismo:

1. se capturó el error tal cual lo emitió la herramienta,
2. se le pidió al agente el **porqué** del fallo, no solo el parche,
3. se aplicó la corrección que el agente propuso,
4. se volvió a ejecutar la verificación hasta dejarla en verde.

---

## E-01 · La plantilla generada no era React

**Síntoma.** Tras ejecutar `npm create vite@latest _tmp -- --template react-ts`,
la carpeta contenía `src/main.ts`, `src/counter.ts` y `src/style.css`, y el
`package.json` no listaba `react` ni `react-dom`. La plantilla creada era
`vanilla-ts`.

**Causa raíz.** La versión de `create-vite` que resuelve `@latest` (v8, línea
Rolldown) cambió el contrato de la línea de comandos. El flag `--template` ya no
selecciona la plantilla como en v5/v6, y al no encontrar una selección válida en
modo no interactivo, el generador cae a la plantilla por defecto en lugar de
fallar. No hubo mensaje de error: el comando terminó con éxito y salida engañosa.

**Corrección.** Fijar la versión del generador en lugar de confiar en `@latest`:

```
npx --yes create-vite@6 app-tmp --template react-ts
```

**Lección incorporada.** Los generadores de andamiaje se invocan con versión
fija. Y el andamiaje se verifica leyendo `package.json`, no asumiendo que el
comando hizo lo que decía su flag.

**Verificación.** `src/App.tsx` presente y `react` en las dependencias.

---

## E-02 · Archivos perdidos al mover el andamiaje

**Síntoma.** Al mover el contenido de la carpeta temporal a la raíz con
`Get-ChildItem | Move-Item`, llegaron `src/` y `package.json` pero faltaban
`vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json` y `eslint.config.js`.

**Causa raíz.** El cmdlet enumera y mueve en la misma canalización. Al modificar
el directorio que está recorriendo, el enumerador pierde entradas. Es un problema
de la operación, no de permisos ni de archivos ocultos: por eso falló en silencio
y con código de salida 0.

**Corrección.** Usar una herramienta pensada para copiar árboles completos, que
resuelve el listado antes de mover:

```
robocopy app-tmp . /E /MOVE
```

**Nota.** `robocopy` devuelve 3 cuando copia archivos y encuentra extras en el
destino. Es éxito, no fallo: los códigos menores a 8 no son errores.

**Verificación.** Los 11 archivos del andamiaje presentes en la raíz.

---

## E-03 · `TS2322` en el formateador del tooltip de Recharts

**Síntoma.** `npm run build` falló:

```
src/componentes/GraficaCategorias.tsx(75,17): error TS2322:
Type '(valor: number, nombre: string) => [string, string]' is not assignable to
type 'Formatter<ValueType, NameType> & ...'
  Types of parameters 'valor' and 'value' are incompatible.
    Type 'ValueType | undefined' is not assignable to type 'number'.
```

**Causa raíz.** Se anotó el parámetro como `number`, pero Recharts v3 declara el
primer argumento del `formatter` como `ValueType | undefined`. En TypeScript los
parámetros de una función que se pasa como callback son **contravariantes**:
declarar un tipo más estrecho que el esperado es un error, porque la librería
podría invocar el callback con `undefined` y la función no lo soportaría. El
error no era cosmético: describía un caso real, la serie puede traer huecos.

**Corrección rechazada.** `formatter={(valor: any, nombre: any) => ...}` — silencia
el compilador y reintroduce exactamente el riesgo de `NaN` que la interfaz
intenta evitar. La skill del proyecto prohíbe `as any` por este motivo.

**Corrección aplicada.** Quitar la anotación para que TypeScript infiera el tipo
de la librería y estrechar dentro del cuerpo, reutilizando el ayudante que ya
maneja el caso nulo:

```tsx
formatter={(valor, nombre) => [
  formatearEntero(typeof valor === 'number' ? valor : null),
  nombre === 'unidades' ? 'Unidades' : 'Artículos',
]}
```

**Verificación.** `tsc -b && vite build` en verde, 624 módulos transformados.

---

## E-04 · Aserto de no nulidad en el punto de entrada

**Síntoma.** No es un error de ejecución, sino una violación de la skill
`catalogo-mayorista`, sección 6, detectada al revisar el andamiaje generado:

```tsx
createRoot(document.getElementById('root')!).render(...)
```

**Causa raíz.** El `!` le afirma al compilador algo que este no puede comprobar.
Si `#root` no existiera —por un `index.html` mal desplegado o una ruta base
incorrecta en producción— el fallo aparecería en consola como
`Cannot read properties of null (reading 'appendChild')`, sin ninguna pista sobre
la causa real. El aserto no evita el fallo: solo borra la evidencia.

**Corrección.** Guarda explícita con mensaje accionable:

```tsx
const contenedor = document.getElementById('root')
if (contenedor === null) {
  throw new Error('No se encontró el elemento #root en index.html.')
}
createRoot(contenedor).render(...)
```

**Lección incorporada.** El andamiaje generado por terceros también se audita
contra las reglas del proyecto. Que venga de una plantilla oficial no lo exime.

---

## E-05 · Aviso de tamaño de paquete en el build

**Síntoma.**

```
(!) Some chunks are larger than 500 kB after minification.
dist/assets/index-*.js  582.09 kB │ gzip: 175.36 kB
```

**Causa raíz.** Recharts arrastra su capa de D3 y queda en el paquete inicial
junto a React. La cifra que importa es la comprimida —175 kB— porque es lo que
viaja por la red; el aviso de Vite compara contra el tamaño sin comprimir.

**Decisión.** Se acepta el aviso en esta entrega. La gráfica es visible al cargar
la página, así que diferirla con `import()` cambiaría un aviso de build por un
salto de contenido al renderizar. Para una aplicación de una sola vista y 240
registros, 175 kB comprimidos no justifican esa complejidad.

**Registrado como deuda técnica**, no como fallo: si se añade una segunda vista,
la gráfica se separa en su propio fragmento.

---

## E-06 · La herramienta de shell POSIX no arranca en el entorno

**Síntoma.** Cualquier comando lanzado por Bash abortaba antes de ejecutarse:

```
bash.exe: *** fatal error - add_item ("\??\C:\...\Git", "/", ...) failed, errno 1
```

**Causa raíz.** Error de la capa de compatibilidad de Git para Windows al montar
su tabla de rutas; el proceso muere antes de interpretar el comando. Es del
entorno, no del proyecto: ningún comando habría funcionado.

**Corrección.** Migrar toda la orquestación de terminal a PowerShell, que es el
intérprete nativo de la máquina. Consecuencia práctica sobre el proyecto: los
scripts de `package.json` se mantienen en Node puro y sin sintaxis de shell
(`&&`, comillas simples, variables `$VAR`), de modo que corren igual en Windows,
Linux y en el entorno de compilación de Vercel.

---

## E-07 · `npm install` girando durante media hora sin avanzar

**Síntoma.** Tras reescribir `package.json` con nombre y scripts propios, todo
`npm install` posterior dejaba de terminar. El proceso consumía CPU de forma
sostenida —más de 500 segundos acumulados— pero `node_modules` no crecía ni un
byte y no se imprimía ningún mensaje. Tres intentos se abandonaron por tiempo
de espera.

**Diagnóstico inicial equivocado.** Se atribuyó a lentitud de red y al antivirus
inspeccionando `node_modules`. Dos señales lo desmentían: el registro respondía
`200` al consultarlo directamente, y el proceso estaba gastando CPU en lugar de
esperar en red. Un descargador lento espera; este calculaba.

**Causa raíz.** Al reescribir `package.json` se anotaron rangos de versión de
memoria, sin comprobarlos. Cuatro eran incorrectos y uno era imposible:

| Declarado | Existente |
| --- | --- |
| `typescript: ~5.9.4` | 5.8.3 — **la versión no existe** |
| `@vitejs/plugin-react: ^5.1.1` | 4.7.0 |
| `eslint-plugin-react-hooks: ^7.1.0` | 5.2.0 |
| `@eslint/js: ^9.39.1` | 9.39.5 |

Ante un rango insatisfacible, el resolvedor de npm no falla de inmediato:
retrocede y explora combinaciones alternativas del árbol completo buscando una
que encaje. Como ninguna puede encajar, agota el espacio de búsqueda antes de
rendirse. De ahí el consumo de CPU sin descargas y sin salida.

**Cómo apareció el mensaje real.** Al ejecutar con `--legacy-peer-deps`, que
recorta la exploración de dependencias de pares, el resolvedor llegó al final y
por fin reportó:

```
npm error code ETARGET
npm error notarget No matching version found for typescript@~5.9.4.
```

**Corrección.** Leer las versiones realmente instaladas y escribirlas:

```
foreach ($p in $paquetes) { (Get-Content "node_modules\$p\package.json" | ConvertFrom-Json).version }
```

**Lección incorporada.** Los rangos de versión no se escriben de memoria: se
copian de lo instalado. Y cuando un proceso consume CPU sin producir salida ni
tráfico, el problema no es de velocidad sino de una búsqueda que no puede
terminar.

---

## Casos de datos verificados

Escenarios que el archivo origen produce y que la interfaz debe absorber sin
romperse. Cada uno se comprobó contra `public/datos/productos.json`.

| Caso | Registros | Manejo | Dónde |
| --- | --- | --- | --- |
| `precioUnitario` en `null` | 19 | Muestra `Sin precio`; excluido del promedio | `utilidades.ts` → `formatearMoneda`, `promedioSeguro` |
| `stock` en `null` | 15 | Estado `Sin dato`, distinto de `Agotado`; no suma como cero | `utilidades.ts` → `clasificarInventario`, `sumaSegura` |
| `marca` en `null` | 27 | Muestra `Sin marca`; sigue siendo buscable | `TarjetaProducto.tsx`, `useCatalogo.ts` |
| Clave `almacen` ausente | 16 | Acceso opcional, misma salida que `null` | `tipos.ts` (`almacen?`), `textoOpcional` |
| `fechaAlta` en `null` | 12 | Muestra `—`; nunca se construye `new Date(null)` | `utilidades.ts` → `formatearFecha` |
| `descripcion` en `null` | 22 | El párrafo no se renderiza | `TarjetaProducto.tsx` |
| Filtro sin resultados | — | Estado vacío con botón para limpiar | `EstadoVacio.tsx` |
| Archivo corrupto o 404 | — | Alerta con la causa; no se renderiza nada parcial | `useCatalogo.ts`, `App.tsx` |
| Registro sin `id`/`nombre`/`categoria` | 0 hoy | Se descarta y se avisa el conteo | `useCatalogo.ts` → `esProductoUtilizable` |

> `new Date(null)` devuelve la época Unix, no una fecha inválida. Sin la guarda,
> los registros sin fecha habrían mostrado *31 dic 1969* como si fuera un dato
> real. Es el tipo de fallo silencioso que el archivo origen provoca y que la
> interfaz tiene que interceptar.
> 
> ---
> 
> ## Auditoría de Stock (30 ago 2026)
> 
> **Veredicto del subagente:** `APTO — el dataset puede alimentar la interfaz respetando los 5 requisitos listados.`
> 
> **Requisitos pendientes:**
> 1.  **Stock nulo:** Cambiar "Sin dato" por "Consultar disponibilidad" en `src/utilidades.ts`.
> 2.  **Stock agotado:** Mostrar badge "Sin stock" en `src/componentes/TarjetaProducto.tsx`.
> 3.  **Ubicación nula:** Cambiar "Sin asignar" por "Almacén Central" en `src/componentes/TarjetaProducto.tsx` y asegurar agrupación en filtros.
> 4.  **Inactivos con stock:** Atenuar el stock específicamente cuando el producto está inactivo en `src/componentes/TarjetaProducto.tsx`.
> 5.  **Marca nula:** Cambiar "Sin marca" por "Genérico" en `src/componentes/TarjetaProducto.tsx` y filtros.
> 6.  **Precios nulos:** Cambiar "Sin precio" por "Precio no disponible" en `src/utilidades.ts`.
