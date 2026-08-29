---
description: Lanza el agente auditor-datos sobre public/datos/productos.json y convierte su reporte en tareas concretas de interfaz.
---

# /auditar_datos

Enfoque solicitado: **$ARGUMENTS** (si viene vacío, audita el archivo completo)

## Paso 1 — Delegar

Invoca al subagente `@auditor-datos` con esta instrucción:

> Audita `public/datos/productos.json` siguiendo tu procedimiento completo.
> Enfoque: $ARGUMENTS. Devuelve censo de claves, tabla de anomalías, tabla de
> requisitos de interfaz y veredicto.

No hagas tú la auditoría. El agente es el dueño de esa tarea.

## Paso 2 — Contrastar

Cuando el agente responda, verifica contra el código actual, requisito por
requisito, cuáles ya están cubiertos y cuáles no. Cita archivo y línea donde el
requisito esté implementado.

## Paso 3 — Registrar

Añade a `docs/BITACORA.md` una entrada con la fecha, el veredicto del agente y la
lista de requisitos que quedaron pendientes.

## Paso 4 — Entregar plan

Devuelve una lista numerada de cambios pendientes en la interfaz, ordenada por
riesgo de romper la vista. Si no hay pendientes, dilo en una línea.
