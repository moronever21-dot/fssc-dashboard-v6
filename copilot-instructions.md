# Instrucciones del proyecto INGAMA — FSSC 22000 v6

## ⚠️ LEER SIEMPRE AL INICIO DE CADA CHAT
Este archivo es la memoria persistente del proyecto. Cada chat nuevo debe leerlo completo
para retomar el trabajo sin que Ever tenga que explicar nada desde cero.
Ever trabaja solo, desde distintas PCs. GitHub es la fuente de verdad.

---

## Sobre Ever (el usuario)
- Nombre: **Ever**
- Trabaja solo — no hay colaboradores
- Accede desde distintas PCs (trabajo y casa) — siempre hacer git pull al empezar
- Visión: crear su propia **agencia de IA**, replicar el sistema FSSC 22000 a otras empresas
- Los datos de Google Sheets están en OneDrive y se leen vía scraping público (sin API key)

---

## Repositorio
- GitHub: https://github.com/moronever21-dot/INGAMA (rama main)
- Flujo diario: `git pull` → trabajar → `git add . && git commit -m "..." && git push`
- Dashboard publicado en Vercel (outputDirectory: PPRo) — se actualiza en cada push

---

## Estructura de carpetas
- `PPRo/`         → Dashboard de Calidad (index.html + React CDN + Chart.js, sin Node)
- `Produccion/`   → Dashboard de Producción
- `TRAZABILIDAD/` → Apps Script Google Sheets (RC.PD + RC.CC)
- `sheets_config.py` → **archivo central de IDs** — única fuente de IDs de Google Sheets

---

## IDs de Google Sheets — Registros de Calidad (RC.CC)
> Usar estos IDs para: Dashboard Calidad (PPRo), App de Auditoría, App Cliente, Chatbot OCR

| Código     | Google Sheet ID                                  | Descripción |
|------------|--------------------------------------------------|-------------|
| RC.CC.01   | `1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE` | Control de Calidad 01 |
| RC.CC.1.1  | `1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4` | Control de Calidad 1.1 |
| RC.CC.02   | `180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU` | Control de Calidad 02 |
| RC.CC.04   | `1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g` | Control de Calidad 04 |
| RC.CC.05   | `19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA` | Control de Calidad 05 (PLLs) |
| RC.CC.06   | `1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI` | Control de Calidad 06 |
| RC.CC.07   | `1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0` | Control de Calidad 07 |
| RC.CC.08   | `1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM` | Control de Calidad 08 |
| RC.CC.09   | `1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK5o` | Control de Calidad 09 |
| RC.CC.10   | `1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU` | Control de Calidad 10 |
| RC.CC.11   | `1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI` | Control de Calidad 11 |
| RC.CC.13   | `1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0` | Control de Calidad 13 |
| RC.CC.14   | `16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0` | Control de Calidad 14 (mismo sheet que RC.CC.16) |
| RC.CC.16   | `16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0` | Control de Calidad 16 (alias de RC.CC.14) |
| RC.CC.17   | `1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs` | Control de Calidad 17 |

---

## IDs de Google Sheets — Registros de Producción (RC.PD)
> Usar estos IDs para: Dashboard Producción, Trazabilidad, App Cliente

| Código     | Google Sheet ID                                  | Descripción |
|------------|--------------------------------------------------|-------------|
| RC.PD.01   | `14E6s93GykPGqpVJH9f4gyKiXYV5yutpIvWOAFF7OmYg` | Hoja maestra/consolidado (EXTERNAL_RC_PD_01_ID) |
| RC.PD.02   | `1_aWiCwHrAx1bHpJ3twchTRwX0sCRtmwglVkPE7WrN04` | Producción 02 — contiene lista de lotes G6:G15 |
| RC.PD.03   | `1Ueb02r1KKiCSlsgr0DFm4LJNLSvHwMtpjsnMmLf82d8` | Producción 03 |
| RC.PD.04   | `1fOGAkJ1Yes7WDPusEEjbt71LBw6SP72bReHnCa44wKE` | Producción 04 |
| RC.PD.05   | `1l_WaU1PekIp_Cyk79jGhEGhtZkWJ0X6pOnupCnAhSQQ` | Producción 05 |
| RC.PD.06   | `17KcWzCQeIyGdsn9YNTjPNtqd7dq1kcB7aQVIGqXKyL8` | Producción 06 |
| RC.PD.07   | `1z7zUKc2-kS2BZA6e7Wakzuk0tgoBeV5_F8quvTu2qrA` | Producción 07 |
| RC.PD.08   | `1D9R19nsSb0bhqBgEWBCEbeDDdyOmpams8sLMhCAqdf4` | Producción 08 |
| RC.PD.09   | `1Ruel5WGlQtLjHIdXsX3LhV6bI3VaxiI4rk_C5qCNvlU` | Producción 09 |
| RC.PD.10   | `1IadQ8KERDI8rvKLBKervoSyaotP2Opdtu_n3FmgTJT4` | Producción 10 |
| RC.PD.11   | `1Ld8XA13BnSBYoJ6uMsQiptu7v_t4uKFdXwfBwtnFYaI` | Producción 11 |
| RC.PD.12   | `1W5eGAe2LOzIrQax_wLI386oZpDXQiAdp9rGgWxdqLQ4` | Producción 12 |
| RC.PD.13   | `1p9v0jkbcKgul_Ba40-2166b0vOucHh53U3qbp6aib0M` | Producción 13 |

> **Nota técnica**: todos los sheets son públicos. Se leen vía endpoint `gviz/tq` sin API key ni autenticación.
> URL patrón: `https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:json`

---

## Estado actual del proyecto (Fase 1 — en desarrollo)

| Módulo | Estado | Archivo principal |
|--------|--------|-------------------|
| Dashboard Calidad (PPRo) | ✅ funcionando, publicado en Vercel | `PPRo/index.html` |
| Dashboard Producción | ✅ funcionando | `Produccion/scrape_produccion.py` |
| Trazabilidad RC.PD + RC.CC | ✅ funcionando (cadena 6 pasos anti-timeout) | `TRAZABILIDAD/RC_PD_Panel.gs` |
| Config central de IDs | ✅ creado | `sheets_config.py` |
| App de Auditoría | 🔜 Fase 2 — pendiente | — |
| App Cliente | 🔜 Fase 2 — pendiente | — |
| Chatbot OCR registros fotográficos | 🔜 Fase 3 — pendiente | — |

---

## Roadmap FSSC 22000 v6 — INGAMA

### Fase 1 (actual): Sistema automatizado base
- Dashboards de calidad y producción scrapeando Google Sheets públicas
- Trazabilidad automática RC.PD ↔ RC.CC via Apps Script
- Todo centralizado en GitHub, publicado en Vercel

### Fase 2: Apps
- **App de Auditoría**: interfaz web/móvil para que auditores internos/externos revisen registros
  - Usará los IDs de RC.CC y RC.PD para leer datos en tiempo real
- **App Cliente**: vista simplificada del estado del sistema de calidad para el cliente INGAMA

### Fase 3: Chatbot OCR
- Los encargados de área toman foto del registro físico (papel) y la mandan por la app
- La API de IA (Claude/GPT vision) extrae el contenido: texto, números, firma, fecha
- El sistema lo carga automáticamente al Google Sheet correspondiente (RC.CC o RC.PD)
- Se conserva el formato y lo que escribieron a mano
- **IDs a usar**: los de la tabla RC.CC arriba, según el tipo de registro fotografiado

### Fase 4: Agencia de IA
- Replicar todo el sistema a otras empresas del sector alimentario
- `sheets_config.py` es el archivo que cambia por empresa — el resto del código no se toca
- Documentar bien para que otro desarrollador pueda tomar el proyecto

---

## TRAZABILIDAD — Cadena de 6 pasos (anti-timeout)
- Paso A1a (1/6): `pullLotePasoA1a` → jala RC.PD.02–13
- Paso A1b (2/6): `pullLotePasoA1b` → jala RC.CC Grupo 1
- Paso A2a (3/6): `pullLotePasoA2a` → consolida RC.CC.04 / RC.CC.11 (_consolidarPorNombreTab_)
- Paso A2b (4/6): `pullLotePasoA2b` → consolida RC.CC.05 PLLs (_consolidarPorNombreTab_)
- Paso B1  (5/6): `pullLotePasoB1`  → jala RC.PD.01 (directo + fallback)
- Paso B2  (6/6): `pullLotePasoB2`  → consolida RC.CC.02 / RC.CC.13 (_consolidarPorCelda_)
- `CONTROL_TIMESTAMP_CELL = "C3"`
- Todos los pasos tienen live-view: `master.setActiveSheet(sheet)` + `SpreadsheetApp.flush()`

---

## Reglas de trabajo
- Leer este archivo al inicio de cada chat para retomar el contexto
- Prioridad: datos reales. Si no hay dato → "sin dato", nunca fallback estático
- No mover bloques visuales del dashboard sin que Ever lo pida
- No romper la lógica de consolidación de TRAZABILIDAD — está funcionando
- Si se toca RC_PD_Panel.gs, actualizar también RC_PD_Sidebar.html
- Código limpio y parametrizable — pensar siempre en replicabilidad a otras empresas
- Cuando se añada un nuevo registro (RC.CC.XX o RC.PD.XX), agregarlo en `sheets_config.py`

---

## Commit diario obligatorio
Al finalizar la sesión, recordar a Ever hacer push:
```
cd "c:\Users\Ingama\OneDrive - Escuela Militar de Ingenieria\INGAMA"
git add .
git commit -m "trabajo del dia: <descripcion breve>"
git push
```
