import sys
import urllib.request, re, json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from sheets_config import RC_CC_SHEETS

# Excluye RC.CC.14 (alias de RC.CC.16 — misma hoja física)
CC_SOURCES = [(k, v) for k, v in RC_CC_SHEETS.items() if k != "RC.CC.14"]

def get_sheet_tabs(sheet_id):
    url = 'https://docs.google.com/spreadsheets/d/' + sheet_id + '/edit'
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            html = r.read().decode('utf-8', errors='replace')
        # Pattern 1: "name":"TABNAME" in JSON blobs
        tabs = re.findall(r'"name":"([^"]{1,60})"', html)
        # Remove HTML/JS noise
        noise = {'undefined', 'null', 'true', 'false', 'object', 'string', 'number'}
        clean = [t for t in tabs if t not in noise and len(t) > 0 and '\\' not in t]
        # Deduplicate while preserving order
        seen = set()
        result = []
        for t in clean:
            if t not in seen:
                seen.add(t)
                result.append(t)
        return result[:30]
    except Exception as e:
        return ['ERROR: ' + str(e)]

def get_gviz_first_row(sheet_id, sheet_name=None):
    if sheet_name:
        url = ('https://docs.google.com/spreadsheets/d/' + sheet_id +
               '/gviz/tq?tqx=out:json&sheet=' + urllib.request.quote(sheet_name) + '&tq=select+*+limit+5')
    else:
        url = 'https://docs.google.com/spreadsheets/d/' + sheet_id + '/gviz/tq?tqx=out:json&tq=select+*+limit+5'
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            raw = r.read().decode('utf-8', errors='replace')
        m = re.search(r'setResponse\((.*)\);?\s*$', raw, re.DOTALL)
        if not m:
            return []
        obj = json.loads(m.group(1))
        rows_data = obj.get('table', {}).get('rows', [])
        result = []
        for row in rows_data[:5]:
            cells = [str(c['v'])[:50] for c in row.get('c', []) if c and c.get('v') is not None and str(c.get('v','')).strip()]
            if cells:
                result.append(cells[:4])
        return result
    except Exception as e:
        return [['gviz_error: ' + str(e)]]

print('Analizando nombre de pestanas de todos los RC.CC...')
print('='*75)
for label, sid in CC_SOURCES:
    tabs = get_sheet_tabs(sid)
    print(f'\n{label} (id: {sid[:20]}...)')
    
    # Heuristic: are tabs named like lotes (RG, PLL, BSI, DA, CV, CONV)?
    lote_like = [t for t in tabs if any(kw in t.upper() for kw in ['RG ', 'PLL', 'BSI', 'DA ', 'CV', 'CONV', 'LOTE', 'LN '])]
    generic_like = [t for t in tabs if re.match(r'^(Hoja|Sheet|hoja|sheet)\s*\d+$', t)]
    
    print(f'  Todas las tabs: {tabs}')
    if lote_like:
        print(f'  -> LOTE en nombre de tab: {lote_like}')
    elif generic_like or not any(t for t in tabs if len(t) > 1):
        # Fetch first sheet to see if lote is in a cell
        first_rows = get_gviz_first_row(sid)
        print(f'  -> POSIBLEMENTE lote en celda. Primeras filas: {first_rows}')
    else:
        print(f'  -> Tabs con nombre especifico (verificar manualmente)')
    
print('\n' + '='*75)
print('FIN. Revisa los registros marcados como "lote en celda".')
