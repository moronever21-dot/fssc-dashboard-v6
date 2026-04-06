# Instrucciones del proyecto FSSC 22000 v6

- Proyecto principal dividido en dos carpetas: PPRo para Calidad y Produccion para registros RC.PD.
- El dashboard principal esta en PPRo/index.html y funciona con HTML + React CDN + Chart.js, sin Node.
- Los calculos de Calidad se modifican en PPRo/scrape_quality.py.
- Los calculos de Produccion se modifican en Produccion/scrape_produccion.py.
- Cuando se cambie un registro RC.CC.xx, se debe ajustar su parser correspondiente y luego regenerar los archivos generados.
- Cuando se cambie un registro RC.PD.xx, se debe ajustar su scraper correspondiente y luego regenerar los archivos generados.
- Prioridad del usuario: mostrar datos reales. Si no hay dato real por lote o registro, evitar fallback estatico o valores inventados.
- Preferencia operativa del usuario: puede trabajar sin Git local en otra PC, usando OneDrive + GitHub web cuando sea necesario.
- No mover bloques visuales grandes del dashboard si el usuario no lo pide explicitamente.
- Si un cambio afecta un registro especifico, mencionar claramente que parser o bloque fue modificado.
- Archivos operativos principales de Calidad: PPRo/index.html, PPRo/scrape_quality.py, PPRo/aggregates_by_tab_generated.json, PPRo/aggregates_by_tab_generated.js.
- Archivos operativos principales de Produccion: Produccion/scrape_produccion.py, Produccion/produccion_aggregates_generated.json, Produccion/produccion_aggregates_generated.js, Produccion/lote_info_pd02.json, Produccion/lote_info_pd02.js.