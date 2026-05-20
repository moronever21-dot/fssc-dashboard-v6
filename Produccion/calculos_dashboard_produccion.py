"""
calculos_dashboard_produccion.py
Genera calculos_dashboard_produccion.json/.js desde produccion_aggregates_generated.json
usando los parsers especializados (RC.PD.05/08/09/11) que ya tienen nombres reales.
"""

import json
import re
from pathlib import Path

# ─── Configuración ──────────────────────────────────────────────────────────
BASE = Path(__file__).parent
AGGREGATES_FILE = BASE / "produccion_aggregates_generated.json"
OUT_JSON = BASE / "calculos_dashboard_produccion.json"
OUT_JS   = BASE / "calculos_dashboard_produccion.js"

LOTES = ["RG 01-CV", "RG 02-CV", "RG 03-CV", "RG 04-CV", "BSI 01", "DA 01-CV", "DA 02-CV", "FV 01-CV", "RE 01-CV", "AA 01-26", "AA 02-26", "AA 03-26"]

# ─── Helpers ────────────────────────────────────────────────────────────────

def norm(s: str) -> str:
    return re.sub(r"\s+", " ", str(s or "").strip()).upper()


def find_tab_key(by_tab: dict, lote: str) -> str | None:
    """Busca la clave del tab más parecida al nombre de lote."""
    n = norm(lote)
    for k in by_tab:
        if norm(k) == n:
            return k
    # fuzzy: si el nombre del lote está contenido en la clave o viceversa
    for k in by_tab:
        if n in norm(k) or norm(k) in n:
            return k
    return None


def get_metric(agg: dict, register: str, lote: str, metric_name: str, use_sum: bool = False):
    """Extrae un valor de métrica del byTab de un registro para un lote dado."""
    reg = agg.get(register, {})
    by_tab = reg.get("byTab", {})
    tab_key = find_tab_key(by_tab, lote)
    if not tab_key:
        return None
    metrics = by_tab[tab_key].get("metrics", {})
    m = metrics.get(metric_name)
    if not m or not isinstance(m, dict):
        return None
    if use_sum:
        hist = m.get("hist", [])
        nums = [h for h in hist if isinstance(h, (int, float)) and h > 0]
        return round(sum(nums), 2) if nums else None
    v = m.get("valor")
    return v if v is not None and isinstance(v, (int, float)) else None


def get_metric_avg(agg: dict, register: str, lote: str, metric_name: str):
    """Extrae el promedio de una serie."""
    m = get_metric_obj(agg, register, lote, metric_name)
    if not m:
        return None
    return m.get("avg")


def get_metric_obj(agg: dict, register: str, lote: str, metric_name: str):
    reg = agg.get(register, {})
    by_tab = reg.get("byTab", {})
    tab_key = find_tab_key(by_tab, lote)
    if not tab_key:
        return None
    return by_tab[tab_key].get("metrics", {}).get(metric_name)


def safe_div(a, b, pct=False):
    if a is None or b is None or b == 0:
        return None
    result = (a / b) * (100 if pct else 1)
    return round(result, 2)


# ─── Lote por lote ──────────────────────────────────────────────────────────

def calcular_lote(agg: dict, lote: str) -> dict:
    # ── Entradas brutas ─────────────────────────────────────────────────────

    # RC.PD.02 — Recepción: kg entrada (Columna 8 = Kgs. utilizados)
    kg_entrada     = get_metric(agg, "RC.PD.02", lote, "Columna 8", use_sum=True)
    # Si Columna 8 tiene solo 1 valor, use_sum == valor único = correcto

    # RC.PD.05 — Cilindros: humedad entrada/salida, kg ingreso
    humedad_ent_pd05 = get_metric_avg(agg, "RC.PD.05", lote, "% Humedad Entrada")
    humedad_sal_pd05 = get_metric_avg(agg, "RC.PD.05", lote, "% Humedad Salida")
    kg_ingreso_cil   = get_metric(agg, "RC.PD.05", lote, "Kg Ingreso Cilindro", use_sum=True)

    # RC.PD.08 — Rendimiento pelado/clasificado
    corte_pct          = get_metric_avg(agg, "RC.PD.08", lote, "% Corte")
    kg_medium_pd08     = get_metric(agg, "RC.PD.08", lote, "Kg MEDIUM")
    kg_midget_pd08     = get_metric(agg, "RC.PD.08", lote, "Kg MIDGET")
    kg_tiny_pd08       = get_metric(agg, "RC.PD.08", lote, "Kg TINY")
    kg_total_pd08      = get_metric(agg, "RC.PD.08", lote, "Kg Total Clasificada")

    # RC.PD.09 — Deshidratación: temperatura y humedad final
    temp_pd09     = get_metric_avg(agg, "RC.PD.09", lote, "Temp Deshidratacion C")
    humedad_pd09  = get_metric_avg(agg, "RC.PD.09", lote, "% Humedad Final")

    # RC.PD.11 — Sellado: total de la planilla = SUM del hist
    cajas_medium_pd11 = get_metric(agg, "RC.PD.11", lote, "Cajas MEDIUM",  use_sum=True)
    cajas_midget_pd11 = get_metric(agg, "RC.PD.11", lote, "Cajas MIDGET",  use_sum=True)
    cajas_tiny_pd11   = get_metric(agg, "RC.PD.11", lote, "Cajas TINY",    use_sum=True)
    total_cajas_pd11  = get_metric(agg, "RC.PD.11", lote, "Total Cajas Selladas", use_sum=True)
    kg_sellados_pd11  = get_metric(agg, "RC.PD.11", lote, "Kg Sellados",   use_sum=True)

    # ── KPIs ────────────────────────────────────────────────────────────────

    # Escala inconsistente: PD.02 acumula 1 lote (~812 kg) vs PD.11 suma sesiones
    # (~19,000 kg). No es posible calcular rendimiento hasta confirmar unidades.
    rend_clasificacion = None
    rend_final         = None

    pcc_humedad = "SIN DATOS"
    if humedad_pd09 is not None:
        pcc_humedad = "VERDE" if humedad_pd09 <= 10 else ("AMARILLO" if humedad_pd09 <= 12 else "ROJO")

    temp_estado = "SIN DATOS"
    if temp_pd09 is not None:
        temp_estado = "VERDE" if 60 <= temp_pd09 <= 90 else "ALERTA"

    corte_alerta = "SIN DATOS"
    if corte_pct is not None:
        corte_alerta = "VERDE" if corte_pct <= 5 else ("AMARILLO" if corte_pct <= 8 else "ROJO")

    # Cascada de merma (waterfall)
    merma_cil    = None  # deshabilitado hasta confirmar unidades PD.02 vs PD.08
    merma_horno  = None  # deshabilitado hasta confirmar unidades PD.08 vs PD.11
    conciliacion = None  # RC.PD.12/13 sin parser completo aún

    def v(val, fuente=""):
        return {"valor": val, "fuente": fuente}

    return {
        "inputs": {
            "kg_entrada_pd02":          v(kg_entrada,          "Columna 8 – RC.PD.02"),
            "kg_ingreso_cil_pd05":      v(kg_ingreso_cil,      "Kg Ingreso Cilindro – RC.PD.05"),
            "humedad_entrada_pd05_pct": v(humedad_ent_pd05,    "% Humedad Entrada – RC.PD.05"),
            "humedad_salida_pd05_pct":  v(humedad_sal_pd05,    "% Humedad Salida – RC.PD.05"),
            "corte_pd08_pct":           v(corte_pct,           "% Corte – RC.PD.08"),
            "medium_pd08_kg":           v(kg_medium_pd08,      "Kg MEDIUM – RC.PD.08"),
            "midget_pd08_kg":           v(kg_midget_pd08,      "Kg MIDGET – RC.PD.08"),
            "tiny_pd08_kg":             v(kg_tiny_pd08,        "Kg TINY – RC.PD.08"),
            "kg_clasificada_pd08":      v(kg_total_pd08,       "Kg Total Clasificada – RC.PD.08"),
            "temperatura_pd09_c":       v(temp_pd09,           "Temp Deshidratacion – RC.PD.09"),
            "humedad_pd07_pct":         v(humedad_pd09,        "% Humedad Final – RC.PD.09"),
            "cajas_medium_pd11":        v(cajas_medium_pd11,   "Cajas MEDIUM sum – RC.PD.11"),
            "cajas_midget_pd11":        v(cajas_midget_pd11,   "Cajas MIDGET sum – RC.PD.11"),
            "cajas_tiny_pd11":          v(cajas_tiny_pd11,     "Cajas TINY sum – RC.PD.11"),
            # aliases for legacy chart code
            "medium_pd11":              v(cajas_medium_pd11,   "Cajas MEDIUM sum – RC.PD.11"),
            "midget_pd11":              v(cajas_midget_pd11,   "Cajas MIDGET sum – RC.PD.11"),
            "tiny_pd11":                v(cajas_tiny_pd11,     "Cajas TINY sum – RC.PD.11"),
            "kg_sellados_pd11":         v(kg_sellados_pd11,    "Kg Sellados sum – RC.PD.11"),
            "total_cajas_pd11":         v(total_cajas_pd11,    "Total Cajas sum – RC.PD.11"),
            "stock_pd12":               v(None,                "RC.PD.12 – pendiente parser"),
            "carga_pd13":               v(None,                "RC.PD.13 – pendiente parser"),
            "merma_cilindros_pd05_kg":  v(merma_cil,           "Estimado: PD02 - PD08"),
            "merma_horno_pd09_kg":      v(merma_horno,         "Estimado: PD08 - PD11"),
        },
        "kpis": {
            "rendimiento_clasificacion_pct":  rend_clasificacion,
            "rendimiento_pre_limpieza_pct":   rend_clasificacion,   # alias legacy
            "rendimiento_final_lote_pct":     rend_final,
            "pcc_humedad_estado":             pcc_humedad,
            "indice_dano_corte_pct":          corte_pct,
            "indice_dano_corte_alerta":       corte_alerta,
            "estabilidad_temperatura_estado": temp_estado,
            "conciliacion_almacen_carga_delta": conciliacion,
        },
        "waterfall_mermas": {
            "inicio_pd02_kg":              kg_entrada,
            "clasificada_pd08_kg":         kg_total_pd08,
            "menos_merma_cilindros_pd05_kg": merma_cil,
            "menos_merma_horno_pd09_kg":   merma_horno,
            "final_pd11_kg":               kg_sellados_pd11,
        },
    }


# ─── Build all ───────────────────────────────────────────────────────────────

def build():
    agg = json.loads(AGGREGATES_FILE.read_text(encoding="utf-8"))

    por_lote = {}
    for lote in LOTES:
        por_lote[lote] = calcular_lote(agg, lote)

    payload = {
        "version":  "2026-04-07-parsers-reales",
        "estado":   "operativo-por-lote",
        "origen":   "produccion_aggregates_generated.json",
        "lotes_disponibles": LOTES,
        "por_lote": por_lote,
    }

    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    OUT_JSON.write_text(json_text, encoding="utf-8")
    OUT_JS.write_text(
        "window.CALCULOS_DASHBOARD_PRODUCCION = " + json_text + ";",
        encoding="utf-8",
    )
    print(f"OK — {OUT_JSON} ({OUT_JSON.stat().st_size} bytes)")
    for lote, data in por_lote.items():
        rend = data["kpis"]["rendimiento_final_lote_pct"]
        corte = data["kpis"]["indice_dano_corte_pct"]
        temp = data["inputs"]["temperatura_pd09_c"]["valor"]
        print(f"  {lote:<12} rend={rend}%  corte={corte}%  temp={temp}°C")


if __name__ == "__main__":
    build()
