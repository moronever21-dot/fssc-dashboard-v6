import type { GvizResponse, ComplianceStatus, SheetRecord, SheetControl } from '../types'

// Fetch a public Google Sheet via gviz/tq (no API key required)
export async function fetchGviz(sheetId: string, gid = '0'): Promise<GvizResponse | null> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    // Strip gviz callback wrapper: google.visualization.Query.setResponse({...});
    const jsonStr = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/)?.[1]
    if (!jsonStr) return null
    return JSON.parse(jsonStr) as GvizResponse
  } catch {
    return null
  }
}

// Parse a row of gviz data into a plain string array
export function parseRow(row: GvizResponse['table']['rows'][0], cols: GvizResponse['table']['cols']): Record<string, string | number | null> {
  const obj: Record<string, string | number | null> = {}
  cols.forEach((col, i) => {
    const cell = row.c[i]
    const v = cell?.v
    obj[col.label || col.id || `col${i}`] = (typeof v === 'string' || typeof v === 'number') ? v : null
  })
  return obj
}

// Evaluate a single control value against its limit
export function evalControl(
  valor: number | null,
  limite: number,
  op: 'max' | 'min' | 'range',
  limiteMin?: number,
  limiteMax?: number,
): ComplianceStatus {
  if (valor === null) return 'nd'
  if (op === 'max') return valor <= limite ? 'ok' : 'alert'
  if (op === 'min') return valor >= limite ? 'ok' : 'alert'
  if (op === 'range' && limiteMin !== undefined && limiteMax !== undefined) {
    if (valor >= limiteMin && valor <= limiteMax) return 'ok'
    const range = limiteMax - limiteMin
    const margin = range * 0.1
    if (valor >= limiteMin - margin && valor <= limiteMax + margin) return 'warn'
    return 'alert'
  }
  return 'nd'
}

// Calculate overall compliance from a list of controls
export function calcCompliance(controls: SheetControl[]): number {
  const measured = controls.filter(c => c.valor !== null)
  if (measured.length === 0) return 0
  const ok = measured.filter(c => c.status === 'ok').length
  return Math.round((ok / measured.length) * 100)
}

// Aggregate compliance across multiple records
export function aggregateCompliance(records: SheetRecord[]): {
  total: number; ok: number; warn: number; alert: number; nd: number; pct: number
} {
  const allControls = records.flatMap(r => r.controles)
  const total = allControls.length
  const ok    = allControls.filter(c => c.status === 'ok').length
  const warn  = allControls.filter(c => c.status === 'warn').length
  const alert = allControls.filter(c => c.status === 'alert').length
  const nd    = allControls.filter(c => c.status === 'nd').length
  const measured = total - nd
  return {
    total,
    ok,
    warn,
    alert,
    nd,
    pct: measured > 0 ? Math.round((ok / measured) * 100) : 0,
  }
}
