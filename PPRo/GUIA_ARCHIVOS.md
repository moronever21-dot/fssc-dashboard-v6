# Guia de archivos - Calidad (PPRo)

## Operativos (no renombrar)
- index.html: Dashboard principal (consume los .js generados).
- scrape_quality.py: Scraper + calculos por registro RC.CC.xx.
- aggregates_by_tab_generated.json: Calculos por lote y por registro.
- aggregates_by_tab_generated.js: Misma data para navegador (window.AGGREGATES_BY_TAB_GENERATED).
- dashboard_meta_generated.json: Metadatos de fechas/cobertura.
- dashboard_meta_generated.js: Misma metadata para navegador.

## Diagnostico
- carpeta diagnostico/: dumps, inspect, resumentes y logs temporales.

## Donde tocar cuando cambie un registro
- RC.CC.01 -> funcion parse_rc_cc_01 en scrape_quality.py.
- RC.CC.1.1 -> funcion parse_rc_cc_011 en scrape_quality.py.
- Cualquier RC.CC.xx -> buscar parse_rc_cc_xx y actualizar su logica.

## Flujo recomendado
1. Editar scrape_quality.py
2. Ejecutar: python scrape_quality.py build-dashboard
3. Verificar que se actualicen:
   - aggregates_by_tab_generated.json
   - aggregates_by_tab_generated.js
