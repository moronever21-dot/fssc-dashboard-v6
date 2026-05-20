import csv
import io
import json
import re
import sys
import time
import urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from sheets_config import RC_PD_SHEETS

# RC.PD.01 es la hoja maestra/consolidado — no se scrapea directamente aquí
PRODUCTION_SHEETS = {k: v for k, v in RC_PD_SHEETS.items() if k not in ("RC.PD.01",)}


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self._in_td = False
        self._in_th = False
        self._in_tr = False
        self._table = None
        self._row = None
        self._cell = []

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self._table = []
        elif tag == "tr" and self._table is not None:
            self._in_tr = True
            self._row = []
        elif tag in ("td", "th") and self._in_tr:
            self._in_td = tag == "td"
            self._in_th = tag == "th"
            self._cell = []
        elif tag == "br" and (self._in_td or self._in_th):
            self._cell.append(" ")

    def handle_endtag(self, tag):
        if tag in ("td", "th") and (self._in_td or self._in_th):
            value = "".join(self._cell).replace("\xa0", " ")
            value = re.sub(r"\s+", " ", value).strip()
            self._row.append(value)
            self._in_td = False
            self._in_th = False
            self._cell = []
        elif tag == "tr" and self._in_tr:
            if self._row and any(cell for cell in self._row):
                self._table.append(self._row)
            self._row = None
            self._in_tr = False
        elif tag == "table" and self._table is not None:
            self.tables.append(self._table)
            self._table = None

    def handle_data(self, data):
        if self._in_td or self._in_th:
            self._cell.append(data)


def fetch_text(url):
    last_error = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=45) as response:
                return response.read().decode("utf-8", "ignore")
        except Exception as error:
            last_error = error
            time.sleep(1.0 * (attempt + 1))
    raise last_error


def get_tabs(sheet_id):
    text = fetch_text(f"https://docs.google.com/spreadsheets/d/{sheet_id}/htmlview")
    pattern = re.compile(r'items\.push\(\{name: "([^"]+)", pageUrl: "([^"]+)", gid: "([^"]+)"')
    tabs = []
    for name, page_url, gid in pattern.findall(text):
        tabs.append(
            {
                "name": name.strip(),
                "gid": gid.strip(),
                "pageUrl": page_url.replace("\\/", "/").replace("\\x3d", "="),
            }
        )
    return tabs


def get_table(sheet_id, gid):
    text = fetch_text(f"https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:html&gid={gid}")
    parser = TableParser()
    parser.feed(text)
    return parser.tables[0] if parser.tables else []


def parse_number(value):
    text = str(value or "").strip()
    if not text:
        return None
    text = text.replace("%", "").replace(" ", "")
    text = text.replace("−", "-")
    if text.count(",") > 0 and text.count(".") > 0:
        text = text.replace(",", "")
    elif text.count(",") > 0 and text.count(".") == 0:
        text = text.replace(",", ".")
    text = re.sub(r"[^0-9.\-]", "", text)
    if not text or text in {"-", ".", "-."}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def parse_date(value):
    text = str(value or "").strip()
    if not text:
        return None
    m = re.search(r"(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})", text)
    if not m:
        return None
    a, b, c = m.groups()
    candidates = []
    if len(a) == 4:
        candidates.append((int(a), int(b), int(c)))
    if len(c) == 4:
        candidates.append((int(c), int(b), int(a)))
        candidates.append((int(c), int(a), int(b)))
    valid = []
    for year, month, day in candidates:
        try:
            dt = datetime(year=year, month=month, day=day)
            valid.append(dt)
        except ValueError:
            pass
    if not valid:
        return None
    return max(valid)


def extract_tab_metrics(rows):
    if not rows:
        return {"metrics": {}, "latestDate": "", "latestDateTs": 0, "rows": 0}

    headers = rows[0]
    width = max(len(r) for r in rows)
    norm_rows = [r + [""] * (width - len(r)) for r in rows]
    if len(headers) < width:
        headers = headers + [f"Col {i+1}" for i in range(len(headers), width)]

    data_rows = norm_rows[1:] if len(norm_rows) > 1 else []
    label_col = [r[0] for r in data_rows] if data_rows else []

    latest_date = ""
    latest_ts = 0
    for label in label_col:
        dt = parse_date(label)
        if dt and dt.timestamp() > latest_ts:
            latest_ts = dt.timestamp()
            latest_date = label

    metrics = {}
    for col_idx in range(width):
        raw_values = [r[col_idx] for r in data_rows]
        parsed_values = [parse_number(v) for v in raw_values]
        numeric_points = [(i, v) for i, v in enumerate(parsed_values) if v is not None]
        if len(numeric_points) < 3:
            continue
        metric_name = headers[col_idx].strip() if col_idx < len(headers) else ""
        if not metric_name:
            metric_name = f"Columna {col_idx + 1}"
        hist = [round(v, 4) for _, v in numeric_points]
        labels = []
        for i, _ in numeric_points:
            lbl = label_col[i] if i < len(label_col) and label_col[i] else f"M{i+1}"
            labels.append(lbl)
        metrics[metric_name] = {
            "valor": hist[-1],
            "hist": hist,
            "labels": labels,
            "min": round(min(hist), 4),
            "max": round(max(hist), 4),
            "avg": round(sum(hist) / len(hist), 4),
        }

    return {
        "metrics": metrics,
        "latestDate": latest_date,
        "latestDateTs": latest_ts,
        "rows": len(rows),
    }


def _cell(row, idx):
    """Safe cell access stripped."""
    if idx < len(row):
        return row[idx].strip()
    return ""


def _pn(row, idx):
    """parse_number from cell."""
    return parse_number(_cell(row, idx))


def _find_date_in_rows(rows, col=0):
    """Return latest datetime found in a column."""
    best, best_ts = None, 0
    for row in rows:
        dt = parse_date(_cell(row, col))
        if dt and dt.timestamp() > best_ts:
            best_ts = dt.timestamp()
            best = _cell(row, col)
    return best or ""


def _series_from_col(rows, date_col, val_col, min_pts=2):
    """Extract (date_label, value) pairs from data rows."""
    pts = []
    for row in rows:
        v = _pn(row, val_col)
        if v is None:
            continue
        label = _cell(row, date_col) or f"M{len(pts)+1}"
        pts.append((label, v))
    if len(pts) < min_pts:
        return None
    return pts


def _make_metric(pts):
    labels = [p[0] for p in pts]
    hist = [round(p[1], 4) for p in pts]
    return {
        "valor": hist[-1],
        "hist": hist,
        "labels": labels,
        "min": round(min(hist), 4),
        "max": round(max(hist), 4),
        "avg": round(sum(hist) / len(hist), 4),
    }


# ── RC.PD.05: Control de Ingreso a Cilindros ──────────────────────────────────
def parse_rc_pd_05(rows):
    """Parsea RC.PD.05: extrae Kg Ingreso, %H Entrada, %H Salida por sesion de cilindrado."""
    metrics = {}
    data = rows[3:] if len(rows) > 3 else []
    # col 5 = fecha ingreso, col 17 o 8 = kg ingreso (varía por depósito)
    # col 18 = %H entrada, col 19 = %H salida
    kg_pts, h_ent_pts, h_sal_pts = [], [], []
    latest, latest_ts = "", 0
    for row in data:
        fecha = _cell(row, 5)
        # Kg ingreso: buscar en col 17, 8, 11, 14, 20 (varía por depósito)
        kg = None
        for c in (17, 8, 11, 14, 20):
            v = _pn(row, c)
            if v and v > 100:
                kg = v
                break
        # %H entrada y salida: col 18/19, o 12/13, o 15/16, o 21/22
        h_ent = None
        for c in (18, 12, 15, 21, 9):
            v = _pn(row, c)
            if v and 5 < v < 60:
                h_ent = v
                break
        h_sal = None
        for c in (19, 13, 16, 22, 10):
            v = _pn(row, c)
            if v and 3 < v < 40:
                h_sal = v
                break
        label = fecha if fecha else f"M{len(kg_pts)+1}"
        dt = parse_date(fecha)
        if dt and dt.timestamp() > latest_ts:
            latest_ts = dt.timestamp()
            latest = fecha
        if kg:
            kg_pts.append((label, kg))
        if h_ent:
            h_ent_pts.append((label, h_ent))
        if h_sal:
            h_sal_pts.append((label, h_sal))
    if len(kg_pts) >= 2:
        metrics["Kg Ingreso Cilindro"] = _make_metric(kg_pts)
    if len(h_ent_pts) >= 2:
        metrics["% Humedad Entrada"] = _make_metric(h_ent_pts)
    if len(h_sal_pts) >= 2:
        metrics["% Humedad Salida"] = _make_metric(h_sal_pts)
    return {"metrics": metrics, "latestDate": latest, "latestDateTs": latest_ts, "rows": len(rows)}


# ── RC.PD.08: Rendimiento Almendra Pelada Clasificada ────────────────────────
def parse_rc_pd_08(rows):
    """Parsea RC.PD.08: busca filas MEDIUM/MIDGET/TINY/TOTAL y extrae kg y % corte."""
    metrics = {}
    fecha_sanc = _cell(rows[1], 2) if len(rows) > 1 else ""
    fecha_quebr = _cell(rows[2], 2) if len(rows) > 2 else ""
    latest = fecha_quebr or fecha_sanc
    latest_ts = 0
    for f in (fecha_quebr, fecha_sanc):
        dt = parse_date(f)
        if dt and dt.timestamp() > latest_ts:
            latest_ts = dt.timestamp()

    tipo_map = {}
    for row in rows:
        tipo = _cell(row, 1).upper().strip()
        if tipo in ("MEDIUM", "MIDGET", "TINY", "TOTAL", "PODRIDA", "PEDAZOS", "CHÍA", "CHIA"):
            # col 8 = kg, col 9 col 10 = kg total1ª, col 7 = %corte aprox
            kg = _pn(row, 8)
            pct_corte_row = None
            # row 3 tiene "% Corte" label en col 9
            for c in (7, 6):
                v = _pn(row, c)
                if v and 0 < v < 50:
                    pct_corte_row = v
                    break
            tipo_map[tipo] = {"kg": kg, "pct": pct_corte_row}

    # % Corte general: fila 3 col 6 o col 10
    pct_corte = None
    if len(rows) > 3:
        for c in (6, 10):
            v = _pn(rows[3], c)
            if v and 0 < v < 50:
                pct_corte = v
                break

    label = latest or "L1"
    if tipo_map.get("TOTAL") and tipo_map["TOTAL"]["kg"]:
        metrics["Kg Total Clasificada"] = _make_metric([(label, tipo_map["TOTAL"]["kg"])])
    for tipo_k in ("MEDIUM", "MIDGET", "TINY"):
        d = tipo_map.get(tipo_k)
        if d and d["kg"]:
            metrics[f"Kg {tipo_k}"] = _make_metric([(label, d["kg"])])
    if pct_corte:
        metrics["% Corte"] = _make_metric([(label, pct_corte)])
    return {"metrics": metrics, "latestDate": latest, "latestDateTs": latest_ts, "rows": len(rows)}


# ── RC.PD.09: Deshidratación – Temp y Humedad ────────────────────────────────
def parse_rc_pd_09(rows):
    """Parsea RC.PD.09: extrae temperatura y % humedad por hora de la primera planilla."""
    metrics = {}
    latest, latest_ts = "", 0
    # filas 5+ : col 0 = hora, col 1 = temp_texto "47º", col 4 = % humedad
    temp_pts, hum_pts = [], []
    for row in rows[5:]:
        hora = _cell(row, 0)
        temp_raw = _cell(row, 1).replace("°", "").replace("º", "").replace("C", "").strip()
        temp = parse_number(temp_raw)
        hum = _pn(row, 4)
        if not hora:
            continue
        label = hora
        if temp and 20 < temp < 120:
            temp_pts.append((label, temp))
        if hum and 0 < hum < 100:
            hum_pts.append((label, hum))
    # Latest date: fila 2 col 2 or fila 3
    for r_idx in (2, 3):
        if r_idx < len(rows):
            dt = parse_date(_cell(rows[r_idx], 2))
            if dt and dt.timestamp() > latest_ts:
                latest_ts = dt.timestamp()
                latest = _cell(rows[r_idx], 2)
    if len(temp_pts) >= 2:
        metrics["Temp Deshidratacion C"] = _make_metric(temp_pts)
    if len(hum_pts) >= 2:
        metrics["% Humedad Final"] = _make_metric(hum_pts)
    return {"metrics": metrics, "latestDate": latest, "latestDateTs": latest_ts, "rows": len(rows)}


# ── RC.PD.11: Control de Sellado ─────────────────────────────────────────────
def parse_rc_pd_11(rows):
    """Parsea RC.PD.11 - Control de Sellado.
    col1 = día (ej. '16-1'), col3 = lote_trazabilidad, col6=cajas MEDIUM,
    col9=cajas MIDGET, col12=cajas TINY, col13=total cajas, col15=kg total.
    Fila 14 = TOTAL (acumulado del lote).
    """
    metrics = {}
    cajas_med, cajas_mid, cajas_tin, total_caj, kg_tots = [], [], [], [], []
    labels = []
    latest, latest_ts = "", 0
    # Detectar fecha de cabecera (fila 2 o 3 puede tener fecha en col ~2)
    for r_idx in (1, 2, 3):
        if r_idx < len(rows):
            for ci in range(min(5, len(rows[r_idx]))):
                dt = parse_date(_cell(rows[r_idx], ci))
                if dt and dt.timestamp() > latest_ts:
                    latest_ts = dt.timestamp()
                    latest = _cell(rows[r_idx], ci)
    # Iterar filas de datos (5 en adelante, hasta donde haya contenido)
    for row in rows[5:]:
        dia = _cell(row, 1)  # ej. "16-1"
        if not dia or dia == "':":
            continue
        c_med = _pn(row, 6)
        c_mid = _pn(row, 9)
        c_tin = _pn(row, 12)
        t_caj = _pn(row, 13)
        kg_raw = _cell(row, 15).replace(",", "")
        kg = parse_number(kg_raw) if kg_raw else None
        tot = t_caj or (c_med or 0) + (c_mid or 0) + (c_tin or 0)
        if tot and tot > 0:
            labels.append(dia)
            cajas_med.append(c_med or 0)
            cajas_mid.append(c_mid or 0)
            cajas_tin.append(c_tin or 0)
            total_caj.append(tot)
            if kg and kg > 0:
                kg_tots.append(round(kg, 0))
    def make_m(hist):
        if not hist:
            return None
        return {"valor": hist[-1], "hist": hist, "labels": labels[: len(hist)], "min": min(hist), "max": max(hist), "avg": round(sum(hist) / len(hist), 2)}
    if total_caj:
        metrics["Total Cajas Selladas"] = make_m(total_caj)
    if cajas_med:
        metrics["Cajas MEDIUM"] = make_m(cajas_med)
    if cajas_mid:
        metrics["Cajas MIDGET"] = make_m(cajas_mid)
    if cajas_tin:
        metrics["Cajas TINY"] = make_m(cajas_tin)
    if kg_tots:
        metrics["Kg Sellados"] = make_m(kg_tots)
    return {"metrics": metrics, "latestDate": latest, "latestDateTs": latest_ts, "rows": len(rows)}


# ── Dispatcher de parsers especializados ─────────────────────────────────────
_CUSTOM_PARSERS = {
    "RC.PD.05": parse_rc_pd_05,
    "RC.PD.08": parse_rc_pd_08,
    "RC.PD.09": parse_rc_pd_09,
    "RC.PD.11": parse_rc_pd_11,
}


def parse_tab(code, rows):
    """Usa parser especializado si existe, sino el genérico."""
    fn = _CUSTOM_PARSERS.get(code)
    if fn:
        return fn(rows)
    return extract_tab_metrics(rows)


def summarize_record(code, sheet_id):
    record = {
        "codigo": code,
        "sheetId": sheet_id,
        "link": f"https://docs.google.com/spreadsheets/d/{sheet_id}/edit",
        "status": "ok",
        "error": "",
        "tabs": [],
        "tabsCount": 0,
        "latestTab": "",
        "latestDate": "",
        "byTab": {},
        "metrics": {},
    }

    try:
        tabs = get_tabs(sheet_id)
        record["tabs"] = [t["name"] for t in tabs]
        record["tabsCount"] = len(tabs)
        record["latestTab"] = tabs[-1]["name"] if tabs else ""

        metric_pool = {}
        best_date_ts = 0

        for tab in tabs:
            try:
                rows = get_table(sheet_id, tab["gid"])
                info = parse_tab(code, rows)
                record["byTab"][tab["name"]] = {
                    "rows": info["rows"],
                    "metrics": info["metrics"],
                    "latestDate": info["latestDate"],
                }
                if info["latestDateTs"] > best_date_ts:
                    best_date_ts = info["latestDateTs"]
                    record["latestDate"] = info["latestDate"]

                for metric_name, metric in info["metrics"].items():
                    if metric_name not in metric_pool:
                        metric_pool[metric_name] = []
                    metric_pool[metric_name].append((tab["name"], metric["avg"]))
            except Exception:
                record["byTab"][tab["name"]] = {
                    "rows": 0,
                    "metrics": {},
                    "latestDate": "",
                }

        for metric_name, values in metric_pool.items():
            labels = [tab_name for tab_name, _ in values]
            hist = [round(val, 4) for _, val in values]
            record["metrics"][metric_name] = {
                "valor": hist[-1],
                "hist": hist,
                "labels": labels,
                "min": round(min(hist), 4),
                "max": round(max(hist), 4),
                "avg": round(sum(hist) / len(hist), 4),
            }

    except Exception as ex:
        record["status"] = "error"
        record["error"] = str(ex)

    return record


def build_all():
    return {code: summarize_record(code, sheet_id) for code, sheet_id in PRODUCTION_SHEETS.items()}


def write_files(payload):
    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    out_dir = Path(__file__).parent
    (out_dir / "produccion_aggregates_generated.json").write_text(json_text, encoding="utf-8")
    js_content = "window.PRODUCCION_AGGREGATES_GENERATED = " + json_text + ";\nwindow.PRODUCCION_AGGREGATES = window.PRODUCCION_AGGREGATES_GENERATED;"
    (out_dir / "produccion_aggregates_generated.js").write_text(js_content, encoding="utf-8")


def fetch_csv_text(url):
    last_error = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(url, timeout=45) as response:
                return response.read().decode("utf-8", "ignore")
        except Exception as error:
            last_error = error
            time.sleep(1.0 * (attempt + 1))
    raise last_error


def get_sheet_rows_csv(sheet_id, gid):
    """Devuelve lista de filas (listas de strings) preservando posicion de filas vacias."""
    url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
    text = fetch_csv_text(url)
    reader = csv.reader(io.StringIO(text))
    return list(reader)


def extract_lote_info_from_csv(rows):
    """Extrae D6, E6 y ultimo valor no-vacio de columna I del RC.PD.02."""
    def safe_cell(r_idx, c_idx):
        if r_idx < len(rows):
            row = rows[r_idx]
            if c_idx < len(row):
                return rows[r_idx][c_idx].strip()
        return ""

    # Fila 6 = indice 5 (0-based); D=3, E=4
    lote_proveedor = safe_cell(5, 3)
    lote_trazabilidad = safe_cell(5, 4)

    # Ultimo valor numerico en columna I (indice 8)
    recepcion_mp = None
    for row in rows:
        if len(row) > 8 and row[8].strip():
            val = parse_number(row[8])
            if val is not None:
                recepcion_mp = val

    return {
        "lote_proveedor": lote_proveedor,
        "lote_trazabilidad": lote_trazabilidad,
        "recepcion_mp": recepcion_mp,
    }


def extract_exportado_pd11_from_csv(rows):
    """Extrae D23 del RC.PD.11."""
    if len(rows) <= 22:
        return None
    row = rows[22]
    if len(row) <= 3:
        return None
    raw = (row[3] or "").strip()
    if not raw:
        return None
    val = parse_number(raw)
    return val if val is not None else raw


def build_lote_info_pd02():
    """Para cada pestaña combina RC.PD.02(D6,E6,last I) + RC.PD.11(D23 exportado)."""
    sheet_id = PRODUCTION_SHEETS["RC.PD.02"]
    sheet11_id = PRODUCTION_SHEETS["RC.PD.11"]
    result = {}
    try:
        tabs = get_tabs(sheet_id)
        tabs11 = get_tabs(sheet11_id)
        tabs11_by_name = {t["name"]: t for t in tabs11}
        for tab in tabs:
            try:
                rows = get_sheet_rows_csv(sheet_id, tab["gid"])
                info = extract_lote_info_from_csv(rows)
                tab11 = tabs11_by_name.get(tab["name"])
                if tab11:
                    rows11 = get_sheet_rows_csv(sheet11_id, tab11["gid"])
                    info["exportado"] = extract_exportado_pd11_from_csv(rows11)
                else:
                    info["exportado"] = None
                result[tab["name"]] = info
            except Exception as exc:
                result[tab["name"]] = {
                    "lote_proveedor": "",
                    "lote_trazabilidad": "",
                    "recepcion_mp": None,
                    "exportado": None,
                    "error": str(exc),
                }
    except Exception as exc:
        result["_error"] = str(exc)
    return result


def write_lote_info(payload):
    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    Path("lote_info_pd02.json").write_text(json_text, encoding="utf-8")
    Path("lote_info_pd02.js").write_text(
        "window.LOTE_INFO_PD02 = " + json_text + ";",
        encoding="utf-8",
    )


if __name__ == "__main__":
    data = build_all()
    write_files(data)
    lote_data = build_lote_info_pd02()
    write_lote_info(lote_data)
    ok_count = sum(1 for item in data.values() if item.get("status") == "ok")
    print(json.dumps({"registros": len(data), "ok": ok_count, "lotes_info": len(lote_data)}, ensure_ascii=False))
