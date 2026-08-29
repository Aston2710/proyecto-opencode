# Catálogo Mayorista

Panel de inventario que lee un archivo de datos externo y construye toda su
interfaz a partir de él: métricas, filtros, gráfica y rejilla de tarjetas.

Proyecto final del **Curso de Desarrollo con Inteligencia Artificial**. La
totalidad del código fue generada mediante agentes de IA; no se escribió lógica
de programación a mano.

- **Aplicación desplegada:** _(pendiente de publicar)_
- **Informe:** [`INFORME.md`](./INFORME.md)
- **Prompts utilizados:** [`docs/PROMPTS.md`](./docs/PROMPTS.md)
- **Bitácora de depuración:** [`docs/BITACORA.md`](./docs/BITACORA.md)

---

## Cumplimiento de las normativas

| # | Norma | Evidencia en este repositorio |
| :-: | --- | --- |
| 1 | Cero código manual | Historial de commits e [`docs/PROMPTS.md`](./docs/PROMPTS.md), con las instrucciones que originaron cada pieza |
| 2 | Integración de contexto de datos | [`public/datos/productos.json`](./public/datos/productos.json) — 240 registros cargados por `fetch`; todos los filtros se derivan de él en [`src/hooks/useCatalogo.ts`](./src/hooks/useCatalogo.ts) |
| 3 | Skill y comando personalizado | Skill [`catalogo-mayorista`](./.opencode/skills/catalogo-mayorista/SKILL.md) y comandos [`/renderizar_tarjetas`](./.opencode/commands/renderizar_tarjetas.md) y [`/auditar_datos`](./.opencode/commands/auditar_datos.md) |
| 4 | Agente personalizado | Agente [`auditor-datos`](./.opencode/agents/auditor-datos.md), invocado desde `/auditar_datos` |
| 5 | Refactorización y depuración autónoma | [`docs/BITACORA.md`](./docs/BITACORA.md) — 6 fallos con causa raíz y corrección, más [`src/pruebas/`](./src/pruebas/) que fija el contrato |
| 6 | Despliegue a producción | Enlace público al inicio de este documento |

---

## Cómo está construido

```
.opencode/
  agents/auditor-datos.md            Agente que audita el archivo de datos
  commands/renderizar_tarjetas.md    Comando que orquesta la rejilla
  commands/auditar_datos.md          Comando que delega en el agente
  skills/catalogo-mayorista/         Contrato de datos, diseño y prohibiciones
public/datos/productos.json          Archivo base. Fuente de verdad.
scripts/generar-datos.mjs            Generador reproducible del archivo base
src/
  componentes/                       Presentación pura, sin acceso a datos
  hooks/useCatalogo.ts               Carga, filtrado, métricas y series
  pruebas/                           Contrato de nulos y humo de la aplicación
  tipos.ts                           Contrato del archivo, en TypeScript
  utilidades.ts                      Única capa que decide qué mostrar si falta un dato
docs/                                Prompts y bitácora de depuración
```

**Vite · React 19 · TypeScript · Tailwind CSS v4 · Recharts**

### Principio de diseño

El archivo de datos manda. No hay una sola categoría, marca, proveedor ni rango
de precios escrito en el código: todo se deriva en tiempo de ejecución. Sustituir
`public/datos/productos.json` por otro archivo con el mismo contrato cambia por
completo la aplicación sin tocar una línea de código.

### Tolerancia a datos incompletos

El archivo imita una exportación de ERP e incluye huecos deliberados:

| Campo | Registros afectados | Qué muestra la interfaz |
| --- | :-: | --- |
| `marca` | 27 | `Sin marca`, y sigue siendo filtrable |
| `proveedor` | 25 | `Sin proveedor` |
| `descripcion` | 22 | El párrafo no se renderiza |
| `precioUnitario` | 19 | `Sin precio`, excluido del promedio |
| `almacen` (clave ausente) | 16 | `Sin asignar` |
| `stock` | 15 | `Sin dato`, distinto de `Agotado`, no suma como cero |
| `precioMayoreo` | 13 | `Sin precio` |
| `fechaAlta` | 12 | `—`, nunca `31 dic 1969` |

Ninguno produce `NaN`, `undefined` ni un error en consola. Las pruebas de
[`src/pruebas/`](./src/pruebas/) lo verifican en cada ejecución.

---

## Puesta en marcha

```
npm install
npm run dev
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación de producción |
| `npm test` | Pruebas del contrato de datos y de la aplicación |
| `npm run lint` | Análisis estático |
| `npm run datos` | Regenera `public/datos/productos.json` |
| `npm run verificar` | Tipos, lint, pruebas y compilación en una pasada |

---

## Trabajar con los agentes

Dentro del proyecto, con OpenCode:

```
/auditar_datos              Audita el archivo y devuelve pendientes de interfaz
/renderizar_tarjetas        Regenera la rejilla derivándola de los datos
/renderizar_tarjetas agrega el proveedor al pie de la tarjeta
```

La skill `catalogo-mayorista` se carga sola al tocar cualquier vista y obliga a
respetar el contrato de datos, los tokens de diseño y las prohibiciones del
proyecto.
