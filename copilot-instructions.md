# Instrucciones del proyecto INGAMA — FSSC 22000 v6

## Repositorio
- Repo privado en GitHub: https://github.com/moronever21-dot/INGAMA (rama main)
- Remote local configurado: https://github.com/moronever21-dot/INGAMA.git
- Flujo diario: git add . → git commit -m "mensaje" → git push
- Página pública del dashboard en Vercel (configurada via vercel.json, outputDirectory: PPRo)

## Estructura de carpetas
- PPRo/          → Dashboard de Calidad (index.html, scrape_quality.py, aggregates generados)
- Produccion/    → Dashboard de Producción (scrape_produccion.py, aggregates generados)
- TRAZABILIDAD/  → Sistema Apps Script de trazabilidad RC.PD + RC.CC para Google Sheets

## TRAZABILIDAD — Archivos clave
- TRAZABILIDAD/RC_PD_Panel.gs       → lógica principal Apps Script (cadena 6 pasos, ~1245 líneas)
- TRAZABILIDAD/RC_PD_Sidebar.html   → sidebar HTML del panel lateral en Google Sheets
- TRAZABILIDAD/scrape_rc_cc.py      → scraper diagnóstico de RC.CC
- TRAZABILIDAD/diagnose_cc_tabs.py  → diagnóstico de pestañas CC

## TRAZABILIDAD — Cadena de 6 pasos (anti-timeout)
- Paso A1a (1/6): pullLotePasoA1a → jala RC.PD.02–13 (pullSheetToMaster por hoja)
- Paso A1b (2/6): pullLotePasoA1b → jala RC.CC Grupo 1 (pullCCSheetToMaster por hoja)
- Paso A2a (3/6): pullLotePasoA2a → consolida RC.CC.04 / RC.CC.11 (_consolidarPorNombreTab_)
- Paso A2b (4/6): pullLotePasoA2b → consolida RC.CC.05 PLLs (_consolidarPorNombreTab_)
- Paso B1  (5/6): pullLotePasoB1  → jala RC.PD.01 (directo + fallback consolidarRC_PD_01_desdeLink)
- Paso B2  (6/6): pullLotePasoB2  → consolida RC.CC.02 / RC.CC.13 (_consolidarPorCelda_)
- Todos los pasos tienen live-view: master.setActiveSheet(sheet) + SpreadsheetApp.flush() por bloque

## TRAZABILIDAD — Constantes importantes
- CONTROL_TIMESTAMP_CELL = "C3"
- EXTERNAL_RC_PD_01_ID = ID externo del spreadsheet RC.PD.01
- SOURCES = array de RC.PD.01–13 con sus IDs de spreadsheet
- CC_SOURCES = array de RC.CC.01–17 con sus IDs de spreadsheet

## Dashboard Calidad (PPRo)
- Archivo principal: PPRo/index.html (HTML + React CDN + Chart.js, sin Node)
- Datos: PPRo/aggregates_by_tab_generated.json / .js
- Scraper: PPRo/scrape_quality.py
- Publicado en Vercel — actualiza automáticamente en cada git push

## Dashboard Producción
- Scraper: Produccion/scrape_produccion.py
- Datos: Produccion/produccion_aggregates_generated.json / .js
- Info de lote: Produccion/lote_info_pd02.json / .js

## Sobre el usuario
- Nombre: Ever
- Trabaja solo — no hay colaboradores en el proyecto
- Accede desde distintas PCs (trabajo y casa) usando OneDrive + GitHub como fuente de verdad
- Visión a futuro: crear su propia agencia de IA, replicar el sistema FSSC 22000 a otras empresas

## Visión del proyecto INGAMA
El proyecto central es un **sistema automatizado de gestión FSSC 22000 v6** para la empresa INGAMA.

### Objetivos:
1. **Automatización máxima** del sistema de calidad FSSC 22000 v6
2. **App de auditoría** — interfaz para auditores internos/externos
3. **App para el cliente** — acceso a sus registros y estado de calidad
4. **Chatbot con extracción de imágenes (OCR/AI)**:
   - Los encargados mandan fotos de sus registros físicos por la app
   - Se extrae el contenido con la API de IA (OCR + interpretación)
   - El sistema carga automáticamente los datos al registro de calidad correspondiente, conservando formato y texto escrito
5. **Replicabilidad**: el sistema será una plantilla/producto para ofrecer a otras empresas del sector alimentario

### Roadmap general:
- Fase 1: Sistema automatizado FSSC 22000 (actual — dashboards, trazabilidad, scraping)
- Fase 2: App de auditoría + app cliente
- Fase 3: Chatbot con OCR/extracción de registros fotográficos
- Fase 4: Agencia de IA — replicar y comercializar el sistema

## Reglas de trabajo
- Prioridad: mostrar datos reales. Si no hay dato real por lote/registro → mostrar "sin dato", nunca fallback estático.
- No mover bloques visuales grandes del dashboard si el usuario no lo pide explícitamente.
- Si un cambio afecta un registro específico, mencionar claramente qué parser o bloque fue modificado.
- No romper la lógica de consolidación de TRAZABILIDAD — está funcionando correctamente.
- Si se agrega un nuevo paso o función en RC_PD_Panel.gs, actualizar también RC_PD_Sidebar.html.
- El usuario puede trabajar desde cualquier PC usando OneDrive + GitHub web.
- Siempre tener en cuenta la visión de replicabilidad: el código debe ser limpio, parametrizable y documentado para facilitar adaptarlo a otras empresas.

## Commit diario obligatorio
- Al finalizar cada sesión de trabajo, recordar al usuario hacer git push de todo lo trabajado en INGAMA.
- Comando estándar al cerrar el día:
  cd "c:\Users\Ingama\OneDrive - Escuela Militar de Ingenieria\INGAMA"
  git add .
  git commit -m "trabajo del dia: <descripcion breve>"
  git push
- Si durante la sesión se modificaron archivos, ofrecer ejecutar el commit al terminar sin que el usuario tenga que pedirlo.