import json
import time
import re
import sys
import urllib.request
from collections import defaultdict
from datetime import date
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path
import unicodedata

sys.path.insert(0, str(Path(__file__).parent.parent))
from sheets_config import RC_CC_SHEETS

# Subconjunto de RC.CC que usa este dashboard (excluye RC.CC.16 — alias de RC.CC.14)
SHEETS = {k: v for k, v in RC_CC_SHEETS.items() if k != "RC.CC.16"}


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
        if tag == 'table':
            self._table = []
        elif tag == 'tr' and self._table is not None:
            self._in_tr = True
            self._row = []
        elif tag in ('td', 'th') and self._in_tr:
            self._in_td = tag == 'td'
            self._in_th = tag == 'th'
            self._cell = []
        elif tag == 'br' and (self._in_td or self._in_th):
            self._cell.append(' ')

    def handle_endtag(self, tag):
        if tag in ('td', 'th') and (self._in_td or self._in_th):
            value = ''.join(self._cell).replace('\xa0', ' ')
            value = re.sub(r'\s+', ' ', value).strip()
            self._row.append(value)
            self._in_td = False
            self._in_th = False
            self._cell = []
        elif tag == 'tr' and self._in_tr:
            if self._row and any(cell for cell in self._row):
                self._table.append(self._row)
            self._row = None
            self._in_tr = False
        elif tag == 'table' and self._table is not None:
            self.tables.append(self._table)
            self._table = None

    def handle_data(self, data):
        if self._in_td or self._in_th:
            self._cell.append(data)


def fetch_text(url):
    last_error = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(url, timeout=45) as response:
                return response.read().decode('utf-8', 'ignore')
        except Exception as error:
            last_error = error
            time.sleep(1.2 * (attempt + 1))
    raise last_error


def get_tabs(sheet_id):
    text = fetch_text(f'https://docs.google.com/spreadsheets/d/{sheet_id}/htmlview')
    pattern = re.compile(r'items\.push\(\{name: "([^"]+)", pageUrl: "([^"]+)", gid: "([^"]+)"')
    tabs = []
    for name, page_url, gid in pattern.findall(text):
        tabs.append({
            'name': name,
            'gid': gid,
            'pageUrl': page_url.replace('\\/', '/').replace('\\x3d', '='),
        })
    return tabs


@lru_cache(maxsize=None)
def get_table(sheet_id, gid):
    text = fetch_text(f'https://docs.google.com/spreadsheets/d/{sheet_id}/gviz/tq?tqx=out:html&gid={gid}')
    parser = TableParser()
    parser.feed(text)
    return parser.tables[0] if parser.tables else []


def inspect(code):
    sheet_id = SHEETS[code]
    tabs = get_tabs(sheet_id)
    payload = []
    for tab in tabs[:10]:
        rows = get_table(sheet_id, tab['gid'])
        payload.append({
            'name': tab['name'],
            'gid': tab['gid'],
            'rows': len(rows),
            'sample': rows[:5],
        })
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def dump_tab(code, tab_name):
    sheet_id = SHEETS[code]
    tabs = get_tabs(sheet_id)
    for tab in tabs:
        if tab['name'] == tab_name:
            rows = get_table(sheet_id, tab['gid'])
            print(json.dumps({
                'name': tab['name'],
                'gid': tab['gid'],
                'rows': rows,
            }, ensure_ascii=False, indent=2))
            return
    raise SystemExit(f'tab not found: {tab_name}')


def list_tabs(code):
    sheet_id = SHEETS[code]
    print(json.dumps(get_tabs(sheet_id), ensure_ascii=False, indent=2))


def to_float(value):
    text = str(value).strip().replace('%', '').replace(',', '.')
    text = text.replace('<', '').replace('>', '').replace('~', '')
    if not text:
        return None
    sci = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*[xX]\s*10\^(\-?[0-9]+)', text)
    if sci:
        base = float(sci.group(1))
        exp = int(sci.group(2))
        return base * (10 ** exp)
    text = re.sub(r'[^0-9.\-]', '', text)
    if text.count('.') > 1:
        parts = text.split('.')
        text = ''.join(parts[:-1]) + '.' + parts[-1]
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def normalize_text(value):
    text = str(value or '').strip().upper()
    text = unicodedata.normalize('NFKD', text)
    text = ''.join(char for char in text if not unicodedata.combining(char))
    text = re.sub(r'[^A-Z0-9]+', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def mean(values):
    valid = [value for value in values if isinstance(value, (int, float))]
    if not valid:
        return None
    return round(sum(valid) / len(valid), 2)


def extract_numeric_cells(cells):
    values = []
    for cell in cells:
        value = to_float(cell)
        if value is not None:
            values.append(value)
    return values


def make_series_payload(values, labels, mode='last'):
    cleaned = [(label, value) for label, value in zip(labels, values) if isinstance(value, (int, float))]
    if not cleaned:
        return {'valor': None}
    clean_labels = [label for label, _ in cleaned]
    clean_values = [round(value, 2) for _, value in cleaned]
    if mode == 'mean':
        valor = round(sum(clean_values) / len(clean_values), 2)
    else:
        valor = clean_values[-1]
    return {
        'valor': valor,
        'hist': clean_values,
        'labels': clean_labels,
    }


DATE_PATTERN = re.compile(r'(?<!\d)(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?!\d)')


def parse_date_value(day, month, year):
    day_i = int(day)
    month_i = int(month)
    year_i = int(year)
    if year_i < 100:
        year_i += 2000
    try:
        parsed = date(year_i, month_i, day_i)
    except ValueError:
        return None
    return {
        'sort_key': parsed.isoformat(),
        'display': f'{day_i:02d}-{month_i:02d}-{year_i}',
    }


def find_latest_date_in_rows(rows):
    latest = None
    for row in rows:
        for cell in row:
            for match in DATE_PATTERN.finditer(str(cell or '')):
                parsed = parse_date_value(match.group(1), match.group(2), match.group(3))
                if not parsed:
                    continue
                if latest is None or parsed['sort_key'] > latest['sort_key']:
                    latest = parsed
    return latest


def parse_rc_cc_13(rows):
    data_rows = [row for row in rows[1:] if len(row) > 26 and row[0].strip().isdigit()]
    tara = [to_float(row[24]) for row in data_rows if to_float(row[24]) is not None]
    neto = [to_float(row[23]) for row in data_rows if to_float(row[23]) is not None]
    cumple = all((row[26] or '').strip().upper() == 'SI' for row in data_rows if len(row) > 26)
    return {
        'Tara Promedio (kg)': round(sum(tara) / len(tara), 2) if tara else None,
        'Peso Neto (kg)': round(sum(neto) / len(neto), 2) if neto else None,
        'Cumple': 'SI' if cumple else 'NO',
    }


def parse_rc_cc_02(rows):
    primera = []
    pedazos = []
    chias = []
    for row in rows:
        if len(row) < 4:
            continue
        label = normalize_text(row[1])
        value = to_float(row[3])
        if value is None:
            continue
        if label == 'PRIMERA':
            primera.append(value)
        elif label == 'PEDAZOS':
            pedazos.append(value)
        elif label in {'CHIAS', 'CHIA'}:
            chias.append(value)
    return {
        '% Primera Banadera': mean(primera),
        '% Pedazos Lona 1': mean(pedazos),
        '% Chias Lona 1': mean(chias),
    }


def parse_rc_cc_01(rows):
    ombligo = []
    podrida = []
    labels = []
    for row in rows:
        if len(row) < 32:
            continue
        v_ombligo = to_float(row[30])
        v_podrida = to_float(row[31])
        label = str(row[29] or row[1] or f'M{len(labels) + 1}').strip()
        if v_ombligo is not None:
            ombligo.append(v_ombligo)
            if len(labels) < len(ombligo):
                labels.append(label)
        if v_podrida is not None:
            podrida.append(v_podrida)
    return {
        '% Ombligo (Lona)': make_series_payload(ombligo, labels[:len(ombligo)], 'last'),
        '% Podrida (Lona)': make_series_payload(podrida, labels[:len(podrida)], 'last'),
    }


def parse_rc_cc_011(rows):
    corte = []
    labels = []
    for row in rows[1:]:
        if len(row) < 9:
            continue
        val = to_float(row[8])
        if val is not None:
            corte.append(val)
            labels.append(str(row[0] or f'M{len(corte)}').strip())
    return {
        '% Corte Chias': make_series_payload(corte, labels, 'last'),
    }


def parse_rc_cc_04(rows):
    danadas = []
    severas = []
    chias = []
    pending_label = ''
    for row in rows:
        if len(row) < 4:
            continue
        raw_label = row[1].strip() if len(row) > 1 else ''
        raw_unit = row[2].strip() if len(row) > 2 else ''
        label = normalize_text(raw_label)
        if raw_label:
            pending_label = label
        if raw_unit != '%':
            continue
        active_label = label if label else pending_label
        row_values = extract_numeric_cells(row[3:])
        if not row_values:
            continue
        if 'SEVER' in active_label:
            severas.extend(row_values)
        elif 'DANAD' in active_label:
            danadas.extend(row_values)
        elif 'CHIA' in active_label:
            chias.extend(row_values)
    return {
        '% Dannadas': mean(danadas),
        '% Severamente Dannadas': mean(severas),
        '% Chias': mean(chias),
    }


def parse_rc_cc_05(rows):
    data_rows = [row for row in rows[7:] if len(row) > 23 and row[0].strip().isdigit() and row[1].strip()]
    danadas = []
    severas = []
    ausente = True
    for row in data_rows:
        pct_vals = [to_float(cell) for cell in row if '%' in cell]
        pct_vals = [value for value in pct_vals if value is not None]
        if len(pct_vals) >= 2:
            danadas.append(pct_vals[-2])
            severas.append(pct_vals[-1])
        if 'AUSENTE' not in row:
            ausente = False
    return {
        '% Danadas': round(sum(danadas) / len(danadas), 2) if danadas else None,
        '% Sev. Danadas': round(sum(severas) / len(severas), 2) if severas else None,
        'Mat. Extranos': 'AUSENTE' if ausente else 'OBSERVAR',
    }


def parse_rc_cc_11(rows):
    data_rows = [row for row in rows[6:] if len(row) > 21 and row[0].strip().isdigit()]
    podrida = []
    chias = []
    punto_cafe = []
    for row in data_rows:
        podrida_value = to_float(row[8]) if len(row) > 8 else None
        chias_value = to_float(row[10]) if len(row) > 10 else None
        punto_cafe_value = to_float(row[14]) if len(row) > 14 else None
        if podrida_value is not None and 0 <= podrida_value <= 100:
            podrida.append(podrida_value)
        if chias_value is not None and 0 <= chias_value <= 100:
            chias.append(chias_value)
        if punto_cafe_value is not None and 0 <= punto_cafe_value <= 100:
            punto_cafe.append(punto_cafe_value)
    return {
        '% Podrida Broken N': round(sum(podrida) / len(podrida), 2) if podrida else None,
        'Chias Broken': round(sum(chias) / len(chias), 2) if chias else None,
        'Punto Cafe': round(sum(punto_cafe) / len(punto_cafe), 2) if punto_cafe else None,
        'Mat. Extranos': 'AUSENTE',
    }


def parse_rc_cc_06(rows):
    reembazadas = []
    labels = []
    for row in rows[1:]:
        if len(row) < 13:
            continue
        value = to_float(row[11])
        if value is not None:
            reembazadas.append(value)
            label = ' '.join(part for part in [str(row[2] or '').strip(), str(row[4] or '').strip()] if part)
            labels.append(label or f'M{len(reembazadas)}')
    promedio = mean(reembazadas)
    if promedio is None:
        status = 'NO REGISTRA'
    elif promedio <= 10:
        status = 'CONTROLADO'
    else:
        status = 'OBSERVAR'
    return {
        'Cajas Reembazadas (Promedio)': make_series_payload(reembazadas, labels, 'mean'),
        'Estado Reemplazo': status,
    }


def _is_fail_cell(raw):
    """Devuelve True si la celda esta vacia, es guion o es X (falla/no aplica).
    Devuelve False para checkmarks u otros valores positivos."""
    raw_stripped = str(raw or '').strip()
    return raw_stripped == '' or raw_stripped == '-' or raw_stripped.upper() == 'X'


def parse_rc_cc_07(rows):
    fe_ok = True
    no_fe_ok = True
    inox_ok = True
    samples = 0
    count_all_ok = 0
    primera_total = 0
    segunda_total = 0
    latest = find_latest_date_in_rows(rows)
    for row in rows[1:]:
        if len(row) < 6 or not row[0].strip().isdigit():
            continue
        samples += 1
        fe_fail = _is_fail_cell(row[3])
        no_fe_fail = _is_fail_cell(row[4])
        inox_fail = _is_fail_cell(row[5])
        if fe_fail:
            fe_ok = False
        if no_fe_fail:
            no_fe_ok = False
        if inox_fail:
            inox_ok = False
        if not fe_fail and not no_fe_fail and not inox_fail:
            count_all_ok += 1
        # Cajas almendra de primera (MEDIUM col6, MIDGET col8, TINY col10)
        for idx in [6, 8, 10]:
            v = to_float(row[idx]) if len(row) > idx else None
            if v is not None:
                primera_total += v
        # Cajas almendra de segunda (CHIPPE col12, BROKE A col14, BROKE N col16)
        for idx in [12, 14, 16]:
            v = to_float(row[idx]) if len(row) > idx else None
            if v is not None:
                segunda_total += v
    if samples == 0:
        return {
            'Ferroso Fe 3mm': 'NO REGISTRA',
            'No Ferroso 3.5mm': 'NO REGISTRA',
            'Acero Inox 4mm': 'NO REGISTRA',
            'Pasajes Verificados': 0,
            'Ultima Fecha Registro': latest['display'] if latest else 'SIN FECHA',
        }
    result = {
        'Ferroso Fe 3mm': 'ATRAPA ok' if fe_ok else 'REVISAR',
        'No Ferroso 3.5mm': 'ATRAPA ok' if no_fe_ok else 'REVISAR',
        'Acero Inox 4mm': 'ATRAPA ok' if inox_ok else 'REVISAR',
        'Pasajes Verificados': count_all_ok,
        'Ultima Fecha Registro': latest['display'] if latest else 'SIN FECHA',
    }
    if primera_total > 0:
        result['Cajas Almendra 1ra'] = round(primera_total)
    if segunda_total > 0:
        result['Cajas Almendra 2da'] = round(segunda_total)
    return result


def parse_rc_cc_08(rows):
    alambre_detectado = False
    pernos_detectado = False
    clavos_detectado = False
    clips_detectado = False
    pre_pases_ok = 0
    latest = find_latest_date_in_rows(rows)
    for row in rows[1:]:
        if len(row) < 16:
            continue
        periodo = normalize_text(row[4])
        # Verificar pase de patrones antes de iniciar el proceso
        if 'PASE' in periodo and 'ANTES' in periodo:
            # SI columns [8,10,12,14]: checkmark = detector atrapa patron OK
            si_ok = all(not _is_fail_cell(row[idx]) for idx in [8, 10, 12, 14] if len(row) > idx)
            if si_ok:
                pre_pases_ok += 1
        if 'PASE' not in periodo and 'POST' not in periodo:
            continue
        alambre_no = normalize_text(row[9])
        pernos_no = normalize_text(row[11])
        clavos_no = normalize_text(row[13])
        clips_no = normalize_text(row[15])
        if alambre_no == 'X':
            alambre_detectado = True
        if pernos_no == 'X':
            pernos_detectado = True
        if clavos_no == 'X':
            clavos_detectado = True
        if clips_no == 'X':
            clips_detectado = True
    return {
        'Alambre 1.5cm': 'DETECTADO' if alambre_detectado else 'AUSENTE',
        'Pernos 2cm': 'DETECTADO' if pernos_detectado else 'AUSENTE',
        'Clavos/Clips': 'DETECTADO' if (clavos_detectado or clips_detectado) else 'AUSENTE',
        'Pase Patrones Pre OK': pre_pases_ok,
        'Ultima Fecha Registro': latest['display'] if latest else 'SIN FECHA',
    }


def parse_rc_cc_09(rows):
    map_values = {
        'aflatoxina b1': None,
        'total aflatoxinas': None,
        'humedad': None,
        'total bacterias': None,
        'e. coli': 'AUSENTE',
        'salmonella': 'AUSENTE',
    }
    for row in rows:
        if not row:
            continue
        label = normalize_text(row[0])
        label_raw = str(row[0] or '').lower()
        value_cell = row[4] if len(row) > 4 else ''
        value_num = to_float(value_cell)
        value_txt = normalize_text(value_cell)
        if 'AFLATOXIN' in label and '(B1)' in label_raw:
            map_values['aflatoxina b1'] = value_num
        elif 'TOTAL AFLATOXINS' in label:
            map_values['total aflatoxinas'] = value_num
        elif 'MOISTURE' in label or 'HUMEDAD' in label:
            if value_num is not None:
                map_values['humedad'] = value_num
        elif 'TOTAL BACTERIA' in label or 'TOTAL PLATE COUNT' in label:
            if value_num is not None:
                map_values['total bacterias'] = value_num
        elif 'E COLI' in label:
            if 'ABSENT' in value_txt or 'AUSENTE' in value_txt:
                map_values['e. coli'] = 'AUSENTE'
            elif value_txt:
                map_values['e. coli'] = 'OBSERVAR'
        elif 'SALMONELLA' in label:
            if 'ABSENT' in value_txt or 'AUSENTE' in value_txt:
                map_values['salmonella'] = 'AUSENTE'
            elif value_txt:
                map_values['salmonella'] = 'OBSERVAR'

    return {
        'Aflatoxina B1': map_values['aflatoxina b1'],
        'Total Aflatoxinas': map_values['total aflatoxinas'],
        'Humedad': map_values['humedad'],
        'Total Bacterias': map_values['total bacterias'],
        'E. coli': map_values['e. coli'],
        'Salmonella': map_values['salmonella'],
    }


def parse_rc_cc_14(rows):
    humedad_entrada = []
    humedad_salida = []
    labels_entrada = []
    labels_salida = []
    ultima_fecha_salida = None
    for row in rows[1:]:
        if len(row) < 11:
            continue
        entrada = to_float(row[2])
        if entrada is not None:
            humedad_entrada.append(entrada)
            labels_entrada.append(str(row[0] or row[8] or f'M{len(humedad_entrada)}').strip())

        fecha_salida = str(row[9] or '').strip()
        salida = to_float(row[10])
        if salida is not None:
            humedad_salida.append(salida)
            labels_salida.append(fecha_salida or str(row[8] or f'S{len(humedad_salida)}').strip())
            if fecha_salida:
                ultima_fecha_salida = fecha_salida

    return {
        '% Humedad Recepcion': make_series_payload(humedad_entrada, labels_entrada, 'mean'),
        '% Humedad Salida Proceso': make_series_payload(humedad_salida, labels_salida, 'last'),
        'Ultima Salida a Proceso': ultima_fecha_salida or 'SIN FECHA',
    }


def parse_rc_cc_17(rows):
    man_dist = []
    man_auto = []
    corte = []
    labels = []
    for row in rows[1:]:
        if len(row) < 9:
            continue
        dist = to_float(row[7])
        auto = to_float(row[8])
        cor = to_float(row[6])
        label = ' '.join(part for part in [str(row[0] or '').strip(), f"P{str(row[1] or '').strip()}" if str(row[1] or '').strip() else ''] if part)
        if dist is not None:
            man_dist.append(dist)
            if len(labels) < len(man_dist):
                labels.append(label or f'M{len(man_dist)}')
        if auto is not None:
            man_auto.append(auto)
        if cor is not None:
            corte.append(cor)
    return {
        'Manometro Distribuidor': make_series_payload(man_dist, labels[:len(man_dist)], 'mean'),
        'Manometro Autoclave': make_series_payload(man_auto, labels[:len(man_auto)], 'mean'),
        '% Corte (max aceptable)': make_series_payload(corte, labels[:len(corte)], 'mean'),
    }


def pll_number(tab_name):
    normalized = normalize_text(tab_name)
    match = re.search(r'PLL\s*0*(\d+)', normalized)
    if not match and re.fullmatch(r'\d+', normalized):
        match = re.match(r'(\d+)', normalized)
    if not match:
        return None
    return int(match.group(1))


def _lot_from_rows(rows):
    """Escanea las primeras 8 filas del tab buscando un identificador de lote en los datos.
    Retorna el nombre canónico del lote o None si no se encuentra."""
    for row in rows[:8]:
        for cell in row:
            s = str(cell).strip().upper()
            if 'ORG. 01' in s:             return 'AA 01-26'
            if 'ORG. 02' in s:             return 'AA 02-26'
            if 'ORG. 03' in s:             return 'BSI 01'
            if 'BSI 01' in s or 'BSI01' in s: return 'BSI 01'
            if 'RG.02-CV' in s or 'RG 02-CV' in s: return 'RG 02-CV'
            if 'RG.01-CV' in s or 'RG 01-CV' in s: return 'RG 01-CV'
            if 'DA 01-CV' in s or 'DA.01-CV' in s: return 'DA 01-CV'
            if 'AA 01-26' in s:            return 'AA 01-26'
            if 'AA 02-26' in s:            return 'AA 02-26'
    return None


def canonical_tab_name(tab_name):
    name = normalize_text(tab_name)
    compact = re.sub(r'[^A-Z0-9]', '', str(tab_name or '').upper())
    if re.search(r'\bRG\s*01\s*CV\b', name) or 'RG01CV' in compact:
        return 'RG 01-CV'
    if re.search(r'\bRG\s*02\s*CV\b', name) or 'RG02CV' in compact:
        return 'RG 02-CV'
    if re.search(r'\bRG\s*03\s*CV\b', name) or 'RG03CV' in compact:
        return 'RG 03-CV'
    if re.search(r'\bRG\s*04\s*CV\b', name) or 'RG04CV' in compact:
        return 'RG 04-CV'
    if re.search(r'\bDA\s*01\s*CV\b', name) or 'DA01CV' in compact:
        return 'DA 01-CV'
    if re.search(r'\bBSI\s*01\b', name) or 'BSI01' in compact:
        return 'BSI 01'
    if re.search(r'\bAA\s*01\s*26\b', name) or 'AA0126' in compact:
        return 'AA 01-26'
    if re.search(r'\bAA\s*02\s*26\b', name) or 'AA0226' in compact:
        return 'AA 02-26'
    if re.search(r'\bAA\s*03\s*26\b', name) or 'AA0326' in compact:
        return 'AA 03-26'
    if re.search(r'\bFV\s*01\s*CV\b', name) or 'FV01CV' in compact:
        return 'FV 01-CV'
    return None


REFERENCE_TAB_ORDER = [
    'RG 01-CV',
    'RG 02-CV',
    'BSI 01',
    'DA 01-CV',
    'AA 01-26',
    'AA 02-26',
    'RG 03-CV',
    'AA 03-26',
    'RG 04-CV',
    'FV 01-CV',
]


def group_name(code, tab_name, tab_index=0, rows=None):
    direct_name = canonical_tab_name(tab_name)
    if code in {'RC.CC.01', 'RC.CC.1.1', 'RC.CC.06', 'RC.CC.08', 'RC.CC.09', 'RC.CC.13', 'RC.CC.14', 'RC.CC.17'}:
        if direct_name:
            return direct_name
        if 1 <= tab_index <= len(REFERENCE_TAB_ORDER):
            return REFERENCE_TAB_ORDER[tab_index - 1]
        return direct_name

    # Para registros con pestañas numéricas (RC.CC.02/04/05/07/11):
    # 1. Nombre canónico embebido en el nombre de la pestaña (ej: 'PLL9 RG 02-CV')
    if direct_name:
        return direct_name

    # 2. Identificador de lote en los datos del tab (ej: 'ORG. 01', 'RG.02-CV')
    if rows is not None:
        row_lot = _lot_from_rows(rows)
        if row_lot:
            return row_lot

    # 3. Fallback por rango numérico para tabs sin identificador explícito
    number = pll_number(tab_name)
    if number is None and code == 'RC.CC.07':
        number = tab_index
    if number is None:
        return None
    if number <= 8:         return 'RG 01-CV'
    if number <= 14:        return 'RG 02-CV'
    if number <= 21:        return 'BSI 01'    # Corrección: 15-21 = BSI 01 (no DA 01-CV)
    if number <= 28:        return 'DA 01-CV'  # PLLs 22-28 sin identificador = DA 01-CV
    return None  # Rangos desconocidos sin identificador: omitir para evitar clasificación errónea


def summarize_code(code):
    parsers = {
        'RC.CC.01': parse_rc_cc_01,
        'RC.CC.1.1': parse_rc_cc_011,
        'RC.CC.02': parse_rc_cc_02,
        'RC.CC.04': parse_rc_cc_04,
        'RC.CC.05': parse_rc_cc_05,
        'RC.CC.06': parse_rc_cc_06,
        'RC.CC.07': parse_rc_cc_07,
        'RC.CC.08': parse_rc_cc_08,
        'RC.CC.09': parse_rc_cc_09,
        'RC.CC.11': parse_rc_cc_11,
        'RC.CC.13': parse_rc_cc_13,
        'RC.CC.14': parse_rc_cc_14,
        'RC.CC.17': parse_rc_cc_17,
    }
    parser = parsers[code]
    sheet_id = SHEETS[code]
    buckets = defaultdict(list)
    samples = defaultdict(int)
    for index, tab in enumerate(get_tabs(sheet_id), start=1):
        rows = get_table(sheet_id, tab['gid'])
        bucket = group_name(code, tab['name'], index, rows=rows)
        if not bucket:
            continue
        summary = parser(rows)
        buckets[bucket].append(summary)
        samples[bucket] += 1

    output = {}
    for bucket, values in buckets.items():
        merged = {}
        all_keys = set()
        for item in values:
            all_keys.update(item.keys())
        for key in sorted(all_keys):
            payload_items = [item[key] for item in values if isinstance(item.get(key), dict) and 'valor' in item.get(key, {})]
            if payload_items:
                if len(payload_items) == 1:
                    merged[key] = payload_items[0]
                    continue
                numeric_payloads = [payload.get('valor') for payload in payload_items if isinstance(payload.get('valor'), (int, float))]
                if numeric_payloads:
                    merged[key] = {
                        'valor': round(sum(numeric_payloads) / len(numeric_payloads), 2),
                        'hist': [round(value, 2) for value in numeric_payloads],
                    }
                    continue
            numeric = [item[key] for item in values if isinstance(item.get(key), (int, float))]
            if numeric:
                merged[key] = {
                    'valor': round(sum(numeric) / len(numeric), 2),
                    'hist': [round(value, 2) for value in numeric],
                }
            else:
                non_null = [item.get(key) for item in values if item.get(key) is not None]
                merged[key] = {
                    'valor': non_null[-1] if non_null else None,
                }

        output[bucket] = {
            'muestras': samples[bucket],
            'controles': merged,
        }
    return output


def summarize_all(codes):
    final = defaultdict(dict)
    for code in codes:
        by_bucket = summarize_code(code)
        for bucket, payload in by_bucket.items():
            final[bucket][code] = payload
    return final


def collect_dashboard_metadata(codes):
    lot_presence = defaultdict(set)
    latest_records = []
    for code in codes:
        sheet_id = SHEETS[code]
        latest = None
        latest_tab = None
        tabs = get_tabs(sheet_id)
        for index, tab in enumerate(tabs, start=1):
            rows = get_table(sheet_id, tab['gid'])
            lot_name = group_name(code, tab['name'], index, rows=rows) or canonical_tab_name(tab['name']) or tab['name'].strip()
            if lot_name:
                lot_presence[lot_name].add(code)
            current_latest = find_latest_date_in_rows(rows)
            if current_latest and (latest is None or current_latest['sort_key'] > latest['sort_key']):
                latest = current_latest
                latest_tab = tab['name'].strip()

        latest_records.append({
            'codigo': code,
            'ultimaFecha': latest['display'] if latest else '',
            'ultimaHoja': latest_tab or '',
            'timestamp': latest['sort_key'] if latest else '',
        })

    lot_audit = []
    lot_names = sorted(lot_presence.keys())
    for lot_name in lot_names:
        present = [code for code in codes if code in lot_presence[lot_name]]
        missing = [code for code in codes if code not in lot_presence[lot_name]]
        lot_audit.append({
            'tab': lot_name,
            'present': present,
            'missing': missing,
            'isComplete': len(missing) == 0,
        })

    latest_records.sort(key=lambda item: item['timestamp'], reverse=True)
    return {
        'latestRecords': latest_records,
        'lotAudit': lot_audit,
    }


def build_dashboard_files():
    aggregate_codes = [
        'RC.CC.01',
        'RC.CC.1.1',
        'RC.CC.02',
        'RC.CC.04',
        'RC.CC.05',
        'RC.CC.06',
        'RC.CC.07',
        'RC.CC.08',
        'RC.CC.09',
        'RC.CC.11',
        'RC.CC.13',
        'RC.CC.14',
        'RC.CC.17',
    ]
    aggregate_payload = summarize_all(aggregate_codes)
    metadata_payload = collect_dashboard_metadata(list(SHEETS.keys()))

    aggregate_json = json.dumps(aggregate_payload, ensure_ascii=False, indent=2)
    metadata_json = json.dumps(metadata_payload, ensure_ascii=False, indent=2)

    Path('aggregates_by_tab_generated.json').write_text(aggregate_json, encoding='utf-8')
    Path('aggregates_by_tab_generated.js').write_text(
        'window.AGGREGATES_BY_TAB_GENERATED = ' + aggregate_json + ';',
        encoding='utf-8',
    )
    Path('dashboard_meta_generated.json').write_text(metadata_json, encoding='utf-8')
    Path('dashboard_meta_generated.js').write_text(
        'window.DASHBOARD_META_GENERATED = ' + metadata_json + ';',
        encoding='utf-8',
    )
    return {
        'aggregatesTabs': len(aggregate_payload),
        'metadataLots': len(metadata_payload['lotAudit']),
        'metadataRecords': len(metadata_payload['latestRecords']),
    }


def summarize(code):
    print(json.dumps(summarize_code(code), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('usage: python scrape_quality.py <list|inspect|dump|summarize|summarize-all> [CODE] [TAB NAME|OUTFILE]')
        raise SystemExit(1)
    command = sys.argv[1]
    code = sys.argv[2] if len(sys.argv) >= 3 else None
    if command == 'list':
        if not code:
            raise SystemExit('list requires CODE')
        list_tabs(code)
    elif command == 'inspect':
        if not code:
            raise SystemExit('inspect requires CODE')
        inspect(code)
    elif command == 'dump':
        if not code:
            raise SystemExit('dump requires CODE')
        if len(sys.argv) < 4:
            raise SystemExit('dump requires TAB NAME')
        dump_tab(code, sys.argv[3])
    elif command == 'summarize':
        if not code:
            raise SystemExit('summarize requires CODE')
        summarize(code)
    elif command == 'summarize-all':
        codes = [
            'RC.CC.01',
            'RC.CC.1.1',
            'RC.CC.02',
            'RC.CC.04',
            'RC.CC.05',
            'RC.CC.06',
            'RC.CC.07',
            'RC.CC.08',
            'RC.CC.09',
            'RC.CC.11',
            'RC.CC.13',
            'RC.CC.14',
            'RC.CC.17',
        ]
        payload = summarize_all(codes)
        output = json.dumps(payload, ensure_ascii=False, indent=2)
        output_path = None
        if code and code.upper() not in {'ALL', '-'}:
            output_path = code
        elif len(sys.argv) >= 4:
            output_path = sys.argv[3]
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as handle:
                handle.write(output)
            print(output_path)
        else:
            print(output)
    elif command == 'build-dashboard':
        result = build_dashboard_files()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        raise SystemExit(f'unknown command: {command}')
