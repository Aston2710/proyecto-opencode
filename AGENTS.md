# Catálogo Mayorista — instrucciones del proyecto

Panel de inventario dirigido por datos. Antes de tocar cualquier vista, carga la
skill `catalogo-mayorista` (`.opencode/skills/catalogo-mayorista/SKILL.md`): es
la especificación del proyecto y manda sobre cualquier criterio general.

## Reglas que no se negocian

1. **La fuente de verdad es `public/datos/productos.json`.** Ninguna categoría,
   marca, proveedor ni rango de precios se escribe en el código: todo se deriva
   del archivo en tiempo de ejecución. Una constante literal del dominio es un
   error.
2. **Tolerancia a nulos obligatoria.** El archivo viene de un ERP y trae huecos.
   Toda lectura de un campo opcional pasa por los ayudantes de
   `src/utilidades.ts`. Nunca se formatea en línea dentro del JSX.
3. **Nada de `as any` ni de asertos de no nulidad (`!`).** Si TypeScript se
   queja, el error describe un caso real: estréchalo, no lo silencies.
4. **Sin peticiones de red a servicios externos.** La aplicación es estática.
5. **Nada de scroll infinito ni de scroll anidado.** Ver la sección de
   experiencia de usuario de la skill.

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `public/datos/productos.json` | Archivo base. Fuente de verdad. |
| `scripts/generar-datos.mjs` | Generador reproducible del archivo base |
| `src/tipos.ts` | Contrato del archivo, en TypeScript |
| `src/utilidades.ts` | Única capa que decide qué mostrar si falta un dato |
| `src/hooks/useCatalogo.ts` | Carga, filtrado, métricas y series |
| `src/componentes/` | Presentación pura. No leen el JSON: reciben props. |
| `src/pruebas/` | Contrato de nulos y humo de la aplicación |

Nombres de variables, funciones y comentarios en español.

## Antes de darte por terminado

```
npm run verificar
```

Ejecuta tipos, análisis estático, pruebas y compilación. No entregues con
ninguna de las cuatro en rojo.

## Comandos del proyecto

- `/renderizar_tarjetas` — regenera la rejilla derivándola de los datos
- `/auditar_datos` — delega en el subagente `@auditor-datos` y devuelve pendientes
