"""
scrape_rc_cc.py
Extrae datos de los 14 registros RC.CC de la Beneficiadora usando
el endpoint gviz/tq de Google Sheets (publico, sin API Key, sin cuenta).
Guarda: rc_cc_data_raw.json  (datos crudos por registro)
        rc_cc_data_clean.json (solo filas con datos reales, columnas nombradas)
"""

import json
import re
import urllib.request
from datetime import datetime

# ─── REGISTROS RC.CC ─────────────────────────────────────────────────────────
SHEETS = [
    {"codigo": "RC.CC.01",   "id": "1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE"},
    {"codigo": "RC.CC.1.1",  "id": "1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4"},
    {"codigo": "RC.CC.02",   "id": "180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU"},
    {"codigo": "RC.CC.04",   "id": "1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g"},
    {"codigo": "RC.CC.05",   "id": "19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA"},
    {"codigo": "RC.CC.06",   "id": "1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI"},
    {"codigo": "RC.CC.07",   "id": "1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0"},
    {"codigo": "RC.CC.08",   "id": "1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM"},
    {"codigo": "RC.CC.09",   "id": "1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK5o"},
    {"codigo": "RC.CC.10",   "id": "1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU"},
    {"codigo": "RC.CC.11",   "id": "1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI"},
    {"codigo": "RC.CC.13",   "id": "1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0"},
    {"codigo": "RC.CC.16",   "id": "16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0"},
    {"codigo": "RC.CC.17",   "id": "1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs"},
]

GVIZ_URL = "https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:json"

# ─── HELPERS ─────────────────────────────────────────────────────────────────

def fetch_gviz(sheet_id: str) -> dict | None:
    """Descarga y parsea la respuesta gviz/tq de un Google Sheet público."""
    url = GVIZ_URL.format(id=sheet_id)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
        # La respuesta viene envuelta: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
        match = re.search(r"setResponse\((\{.*\})\);?\s*$", raw, re.DOTALL)
        if not match:
            return None
        return json.loads(match.group(1))
    except Exception as e:
        print(f"  ERROR descargando {sheet_id}: {e}")
        return None


def parse_date_value(cell: dict) -> str | None:
    """Convierte el valor de una celda tipo date de gviz a string dd/mm/yyyy."""
    if not cell:
        return None
    # Formato gViz: Date(yyyy, mm_0based, dd)
    v = cell.get("v", "")
    f = cell.get("f", "")
    if f:
        return str(f).strip()
    if isinstance(v, str) and v.startswith("Date("):
        parts = re.findall(r"\d+", v)
        if len(parts) == 3:
            y, m, d = int(parts[0]), int(parts[1]) + 1, int(parts[2])
            return f"{d:02d}/{m:02d}/{y}"
    return None


def cell_value(cell: dict) -> str | int | float | None:
    """Extrae el valor formateado o numérico de una celda gviz."""
    if not cell:
        return None
    f = cell.get("f")
    v = cell.get("v")
    if f is not None:
        return str(f).strip()
    if v is None:
        return None
    if isinstance(v, str) and v.startswith("Date("):
        return parse_date_value(cell)
    return v


def row_has_data(row_cells: list) -> bool:
    """Devuelve True si al menos una celda no nula en la fila."""
    return any(cell_value(c) not in (None, "", " ") for c in row_cells if c)


def extract_rows(gviz_data: dict) -> tuple[list[str], list[list]]:
    """Devuelve (columnas, filas_con_datos) de la tabla gviz."""
    table = gviz_data.get("table", {})
    cols_meta = table.get("cols", [])
    rows_raw  = table.get("rows", [])

    # Nombres de columna: usar label si existe, si no la letra (A,B,C...)
    col_names = []
    for c in cols_meta:
        label = str(c.get("label", "")).strip().replace("\n", " ")
        col_id = c.get("id", "")
        col_names.append(label if label else col_id)

    rows_out = []
    for row in rows_raw:
        cells = row.get("c", []) if row else []
        # Rellenar con None si faltan columnas
        while len(cells) < len(col_names):
            cells.append(None)
        if not row_has_data(cells):
            continue
        row_vals = [cell_value(c) for c in cells]
        rows_out.append(row_vals)

    return col_names, rows_out


# ─── MAIN ────────────────────────────────────────────────────────────────────

def main():
    raw_output   = {}
    clean_output = {}
    errores      = []

    print(f"\n{'='*55}")
    print(f"  scrape_rc_cc.py  —  {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print(f"{'='*55}\n")

    for sheet in SHEETS:
        codigo = sheet["codigo"]
        sid    = sheet["id"]
        print(f"→ {codigo} ...", end=" ", flush=True)

        data = fetch_gviz(sid)
        if data is None or data.get("status") != "ok":
            msg = "sin acceso o error en respuesta"
            print(f"✗ {msg}")
            errores.append({"codigo": codigo, "error": msg})
            raw_output[codigo]   = {"error": msg}
            clean_output[codigo] = {"error": msg}
            continue

        cols, rows = extract_rows(data)
        print(f"✓  {len(rows)} filas con datos  ({len(cols)} columnas)")

        raw_output[codigo] = {
            "id":      sid,
            "columnas": cols,
            "filas":   rows,
            "total_filas": len(rows),
        }

        clean_output[codigo] = {
            "id":      sid,
            "columnas": cols,
            "registros": [
                {cols[i]: v for i, v in enumerate(row) if v not in (None, "", " ")}
                for row in rows
            ],
            "total_registros": len(rows),
            "ultima_actualizacion": datetime.now().strftime("%d/%m/%Y %H:%M"),
        }

    # Guardar archivos
    with open("rc_cc_data_raw.json", "w", encoding="utf-8") as f:
        json.dump(raw_output, f, ensure_ascii=False, indent=2, default=str)

    with open("rc_cc_data_clean.json", "w", encoding="utf-8") as f:
        json.dump(clean_output, f, ensure_ascii=False, indent=2, default=str)

    print(f"\n{'─'*55}")
    print(f"  Guardado: rc_cc_data_raw.json")
    print(f"  Guardado: rc_cc_data_clean.json")
    if errores:
        print(f"\n  Registros con error ({len(errores)}):")
        for e in errores:
            print(f"    • {e['codigo']}: {e['error']}")
    print(f"{'─'*55}\n")


if __name__ == "__main__":
    main()
