# Guia de mensajes de commit

Esta guia te ayuda a mantener historial claro y facil de buscar.

## Estructura recomendada

tipo: alcance breve

descripcion concreta del cambio

## Tipos sugeridos

- feat: nueva funcionalidad
- fix: correccion de bug
- refactor: mejora interna sin cambiar resultado funcional
- chore: tareas de mantenimiento
- docs: documentacion

## Plantillas para este proyecto

1) Cambio en Calidad RC.CC.xx

fix: RC.CC.1.1 ajustar calculo de columna I

- actualiza parser en PPRo/scrape_quality.py
- regenera aggregates de calidad
- ajusta visualizacion en PPRo/index.html

2) Cambio en Produccion RC.PD.xx

feat: RC.PD.02 incluir campo exportado por lote

- actualiza extraccion en Produccion/scrape_produccion.py
- regenera produccion_aggregates y lote_info
- actualiza tarjetas relacionadas en PPRo/index.html

3) Cambio de solo interfaz

fix: dashboard calidad evitar fallback estatico en tendencias

- ajusta logica de fuente real en PPRo/index.html
- mantiene layout sin mover bloques

4) Cambio de estructura/documentacion

chore: reorganizar archivos de diagnostico

- mueve dumps e inspect a PPRo/diagnostico
- agrega guias de operacion y continuidad

## Ejemplos reales rapidos

- fix: RC.CC.01 usar datos reales por lote sin valores inventados
- fix: RC.CC.1.1 leer columna I en scraper
- feat: lotes calidad con alias IA-001 a IA-010
- chore: baseline dashboard fssc v6

## Flujo recomendado

1. Revisar cambios
   git status

2. Agregar cambios
   git add .

3. Commit
   git commit -m "fix: RC.CC.14 ajustar calculo de humedad"

4. Subir
   git push

## Regla practica

Si el cambio toca calculo y visualizacion, mencionarlo en el commit para que luego sea facil rastrear: scraper + json generado + index.