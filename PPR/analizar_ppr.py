import json

with open('ppr_data.json','r',encoding='utf-8') as f:
    d = json.load(f)

# === ELIMINACION RESIDUOS - datos completos ===
print("=== ELIMINACION RESIDUOS - Hoja Datos ===")
er = d.get('Eliminacion_Residuos', [])
for arch in er:
    if 'error' in arch: continue
    for h in arch['hojas']:
        if 'Datos' in h['hoja']:
            print(f"HOJA: {h['hoja']} - {h['total_filas']} filas")
            # Collect all rows with data
            for fila in h['filas']:
                if len(fila) >= 3 and fila[0] not in ['Nº IA','']:
                    print(f"  {fila}")

# === BPM RC.HP.05 - Lavado Ropa TODAS las filas ===
print()
print("=== BPM RC.HP.05 - LAVADO ROPA (todas las filas de datos) ===")
bpm = d.get('BPM_2026', [])
for arch in bpm:
    for h in arch['hojas']:
        if 'Lavado' in h['hoja']:
            print(f"TOTAL FILAS: {h['total_filas']}")
            cols = None
            for fila in h['filas']:
                if 'Feche de entrega' in str(fila) or 'CASACA' in str(fila):
                    cols = fila
                    print(f"COLS: {fila}")
                    continue
                # Data rows - has date
                if fila and len(fila) > 3 and '2026' in str(fila[0]):
                    print(f"  {fila}")

# === MATERIALES QUEBRADIZOS - Riesgo y Control data ===
print()
print("=== MATERIALES QUEBRADIZOS - Riesgo por area ===")
mq = d.get('Materiales_Quebradizos', {})
for subcarpeta, archivos in mq.items():
    print(f"\n--- {subcarpeta} ---")
    for arch in archivos:
        if 'error' in arch: continue
        nombre = arch['archivo']
        for h in arch['hojas']:
            if 'Riesgo' in h['hoja'] or 'RC.GV.02' in h['hoja'] or 'RC.GM.02' in h['hoja'] or 'RC.MM.02' in h['hoja']:
                # Extract area name and risk values
                area_nombre = ''
                for fila in h['filas']:
                    if 'ÁREA' in str(fila) or 'Area' in str(fila):
                        area_nombre = str(fila)
                    if len(fila) > 5 and any(str(x) in ['1.0','2.0','3.0','1','2','3'] for x in fila[:3]):
                        print(f"  [{nombre[:40]}] area=[{area_nombre[:60]}] fila={fila[:8]}")
