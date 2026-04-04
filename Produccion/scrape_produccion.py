import csv
import io
import json
import re
import time
import urllib.request
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

PRODUCTION_SHEETS = {
    "RC.PD.02": "1_aWiCwHrAx1bHpJ3twchTRwX0sCRtmwglVkPE7WrN04",
    "RC.PD.03": "1Ueb02r1KKiCSlsgr0DFm4LJNLSvHwMtpjsnMmLf82d8",
    "RC.PD.05": "1l_WaU1PekIp_Cyk79jGhEGhtZkWJ0X6pOnupCnAhSQQ",
    "RC.PD.06": "17KcWzCQeIyGdsn9YNTjPNtqd7dq1kcB7aQVIGqXKyL8",
    "RC.PD.07": "1z7zUKc2-kS2BZA6e7Wakzuk0tgoBeV5_F8quvTu2qrA",
    "RC.PD.08": "1D9R19nsSb0bhqBgEWBCEbeDDdyOmpams8sLMhCAqdf4",
    "RC.PD.09": "1Ruel5WGlQtLjHIdXsX3LhV6bI3VaxiI4rk_C5qCNvlU",
    "RC.PD.10": "1IadQ8KERDI8rvKLBKervoSyaotP2Opdtu_n3FmgTJT4",
    "RC.PD.11": "1Ld8XA13BnSBYoJ6uMsQiptu7v_t4uKFdXwfBwtnFYaI",
    "RC.PD.12": "1W5eGAe2LOzIrQax_wLI386oZpDXQiAdp9rGgWxdqLQ4",
    "RC.PD.13": "1p9v0jkbcKgul_Ba40-2166b0vOucHh53U3qbp6aib0M",
}


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
                info = extract_tab_metrics(rows)
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
    Path("produccion_aggregates_generated.json").write_text(json_text, encoding="utf-8")
    Path("produccion_aggregates_generated.js").write_text(
        "window.PRODUCCION_AGGREGATES_GENERATED = " + json_text + ";",
        encoding="utf-8",
    )


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
