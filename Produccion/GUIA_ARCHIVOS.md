# Guia de archivos - Produccion

## Operativos (no renombrar)
- scrape_produccion.py: Scraper + calculos RC.PD.xx.
- produccion_aggregates_generated.json: Agregados por registro/lote.
- produccion_aggregates_generated.js: Misma data para navegador (window.PRODUCCION_AGGREGATES_GENERATED).
- lote_info_pd02.json: Lote proveedor, trazabilidad, recepcion, exportado.
- lote_info_pd02.js: Misma data para navegador (window.LOTE_INFO_PD02).
- calculos_dashboard_produccion.json: Resumen de apoyo del dashboard.
- calculos_dashboard_produccion.js: Misma data para navegador.

## Flujo recomendado
1. Editar scrape_produccion.py
2. Ejecutar el scraper
3. Verificar que se actualicen los .json/.js generados
