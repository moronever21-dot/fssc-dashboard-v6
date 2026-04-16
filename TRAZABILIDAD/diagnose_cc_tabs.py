import urllib.request, re, json

CC_SOURCES = [
  ('RC.CC.01',  '1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE'),
  ('RC.CC.1.1', '1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4'),
  ('RC.CC.02',  '180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU'),
  ('RC.CC.04',  '1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g'),
  ('RC.CC.05',  '19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA'),
  ('RC.CC.06',  '1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI'),
  ('RC.CC.07',  '1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0'),
  ('RC.CC.08',  '1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM'),
  ('RC.CC.09',  '1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK5o'),
  ('RC.CC.10',  '1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU'),
  ('RC.CC.11',  '1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI'),
  ('RC.CC.13',  '1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0'),
  ('RC.CC.16',  '16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0'),
  ('RC.CC.17',  '1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs'),
]

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
