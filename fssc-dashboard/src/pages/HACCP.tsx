import { StatusBadge } from '../components/ui/StatusBadge'
import { ComplianceBar } from '../components/ui/ComplianceBar'
import { KPICard } from '../components/ui/KPICard'
import { scoreToStatus } from '../config/fssc'
import { RC_CC, editLink } from '../config/sheets'
import type { HazardType, ComplianceStatus } from '../types'

const HAZARD_COLOR: Record<HazardType, string> = {
  B: 'text-red-400 bg-red-500/10 border-red-500/30',
  F: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  Q: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  A: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}
const HAZARD_LABEL: Record<HazardType, string> = {
  B: 'Biológico', F: 'Físico', Q: 'Químico', A: 'Alérgeno',
}

const PROCESS_STEPS = [
  { step: '1', name: 'Recepción de Materia Prima', hazards: ['B', 'Q', 'F'] as HazardType[], control: 'PRP-05', type: 'PRP' as const },
  { step: '2', name: 'Almacenamiento MP', hazards: ['B'] as HazardType[], control: 'PRP-06 (Temperatura)', type: 'PRP' as const },
  { step: '3', name: 'Selección / Clasificación', hazards: ['F', 'B'] as HazardType[], control: 'PPRo-01', type: 'PPRO' as const },
  { step: '4', name: 'Lavado / Desinfección', hazards: ['B', 'Q'] as HazardType[], control: 'PRP-02 + PCC-01', type: 'PCC' as const },
  { step: '5', name: 'Pesado / Calibrado', hazards: ['F'] as HazardType[], control: 'PPRo-02', type: 'PPRO' as const },
  { step: '6', name: 'Empaque', hazards: ['F', 'A'] as HazardType[], control: 'PPRo-03', type: 'PPRO' as const },
  { step: '7', name: 'Sellado / Etiquetado', hazards: ['A', 'F'] as HazardType[], control: 'PCC-02', type: 'PCC' as const },
  { step: '8', name: 'Almacenamiento Producto Final', hazards: ['B'] as HazardType[], control: 'PPRo-04', type: 'PPRO' as const },
  { step: '9', name: 'Despacho / Distribución', hazards: ['B', 'F'] as HazardType[], control: 'PRP (cadena frío)', type: 'PRP' as const },
]

const PCC_LIST = [
  {
    id: 'PCC-01',
    step: 'Lavado / Desinfección',
    hazard: 'Biológico — Patógenos (Salmonella, Listeria)',
    hazardType: 'B' as HazardType,
    criticalLimit: 'Concentración desinfectante: 50–200 ppm cloro libre · pH 6.5–7.5',
    monitoring: 'Medición de cloro y pH por lote',
    freq: 'Cada lote',
    responsable: 'Operador de lavado',
    corrective: 'Ajustar concentración, re-lavar, registrar NC',
    verification: 'Análisis microbiológicos semanales',
    lastReading: 125,
    limitMin: 50,
    limitMax: 200,
    unit: 'ppm',
    sheetCode: 'RC.CC.06',
    score: 93,
  },
  {
    id: 'PCC-02',
    step: 'Sellado / Etiquetado',
    hazard: 'Alérgeno — Declaración incorrecta en etiqueta',
    hazardType: 'A' as HazardType,
    criticalLimit: 'Etiqueta correcta 100% · Sellado hermético ≥ 98%',
    monitoring: 'Verificación visual cada 30 min + muestreo sellado',
    freq: 'Cada 30 minutos',
    responsable: 'Supervisor de línea',
    corrective: 'Detener línea, retener producto, revisar etiquetado',
    verification: 'Auditoría de etiquetado semanal',
    lastReading: 99.2,
    limitMin: 98,
    limitMax: 100,
    unit: '%',
    sheetCode: 'RC.CC.07',
    score: 89,
  },
]

export function HACCP() {
  const avgPcc = Math.round(PCC_LIST.reduce((s, p) => s + p.score, 0) / PCC_LIST.length)
  const pccCount = PCC_LIST.length
  const pprocCount = PROCESS_STEPS.filter(s => s.type === 'PPRO').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="text-lg font-bold text-white">HACCP · Análisis de Peligros y PCCs</h2>
            <p className="text-xs text-slate-400">FSSC 22000 v6 · Cláusulas 8.5 y 8.6</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="PCCs Identificados" value={pccCount} icon="🎯" status="ok" subtext="Puntos Críticos Control" />
          <KPICard label="PPRos" value={pprocCount} icon="⚙️" status="ok" subtext="Pre-requisitos Operac." />
          <KPICard label="Cumplimiento PCCs" value={avgPcc} unit="%" status={scoreToStatus(avgPcc)} icon="📊" subtext="Monitoreo activo" />
          <KPICard label="Análisis Peligros" value="v4" icon="📋" status="ok" subtext="Actualizado 2026" />
        </div>
      </div>

      {/* Hazard legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(HAZARD_LABEL) as HazardType[]).map(h => (
          <span key={h} className={`text-xs px-3 py-1 rounded-full border font-semibold ${HAZARD_COLOR[h]}`}>
            {h} — {HAZARD_LABEL[h]}
          </span>
        ))}
      </div>

      {/* Process flow */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Diagrama de Flujo del Proceso
        </h3>
        <div className="space-y-2">
          {PROCESS_STEPS.map((s, i) => (
            <div key={s.step} className="flex items-center gap-3">
              {/* Connector */}
              <div className="flex flex-col items-center w-6 flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  s.type === 'PCC'  ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                  s.type === 'PPRO' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                  'bg-slate-700/50 border-slate-600/40 text-slate-400'
                }`}>{s.step}</div>
                {i < PROCESS_STEPS.length - 1 && (
                  <div className="w-px h-4 bg-slate-700 mt-1" />
                )}
              </div>

              {/* Step card */}
              <div className={`flex-1 rounded-lg border px-4 py-2.5 flex items-center justify-between gap-3 ${
                s.type === 'PCC'  ? 'border-red-500/30 bg-[rgba(20,4,4,0.7)]' :
                s.type === 'PPRO' ? 'border-yellow-500/25 bg-[rgba(20,15,5,0.7)]' :
                'border-slate-600/20 bg-[rgba(15,15,20,0.6)]'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white font-medium">{s.name}</span>
                  <div className="flex gap-1">
                    {s.hazards.map(h => (
                      <span key={h} className={`text-[9px] px-1.5 py-0.5 rounded border ${HAZARD_COLOR[h]}`}>{h}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-mono font-bold ${
                    s.type === 'PCC' ? 'text-red-400' :
                    s.type === 'PPRO' ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>{s.type}</span>
                  <span className="text-[10px] text-slate-500">{s.control}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PCC detail cards */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Puntos Críticos de Control (PCCs) — Detalle
        </h3>
        <div className="space-y-4">
          {PCC_LIST.map(pcc => {
            const st = scoreToStatus(pcc.score)
            const inLimit = pcc.lastReading >= pcc.limitMin && pcc.lastReading <= pcc.limitMax
            const sheetId = RC_CC[pcc.sheetCode as keyof typeof RC_CC]
            return (
              <div key={pcc.id} className={`rounded-xl border p-5 ${
                st === 'ok' ? 'border-green-500/30 bg-[rgba(5,15,10,0.85)]' :
                st === 'warn' ? 'border-yellow-500/35 bg-[rgba(20,15,5,0.85)]' :
                'border-red-500/45 bg-[rgba(20,4,4,0.9)]'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-xs font-mono text-red-400 font-bold">{pcc.id}</div>
                    <h4 className="text-base font-bold text-white mt-1">{pcc.step}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">⚠️ {pcc.hazard}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={st} />
                    <div className="text-xl font-bold font-mono text-slate-200">{pcc.score}%</div>
                  </div>
                </div>

                {/* Limit indicator */}
                <div className="rounded-lg bg-[rgba(0,0,0,0.3)] border border-cyan-500/10 p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Última lectura</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold font-mono ${inLimit ? 'text-green-400' : 'text-red-400'}`}>
                        {pcc.lastReading} {pcc.unit}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded border ${inLimit ? 'border-green-500/30 text-green-400' : 'border-red-500/40 text-red-400'}`}>
                        {inLimit ? '✓ En límite' : '✗ Fuera de límite'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">🎯 L. Crítico: {pcc.criticalLimit}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="space-y-1.5">
                    <div className="text-slate-400">📋 <strong className="text-slate-300">Monitoreo:</strong> {pcc.monitoring}</div>
                    <div className="text-slate-400">🕐 <strong className="text-slate-300">Frecuencia:</strong> {pcc.freq}</div>
                    <div className="text-slate-400">👤 <strong className="text-slate-300">Responsable:</strong> {pcc.responsable}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-slate-400">⚡ <strong className="text-slate-300">Acción correctiva:</strong> {pcc.corrective}</div>
                    <div className="text-slate-400">✅ <strong className="text-slate-300">Verificación:</strong> {pcc.verification}</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <ComplianceBar value={pcc.score} height="h-1.5" showLabel={false} />
                </div>

                {sheetId && (
                  <a
                    href={editLink(sheetId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                  >
                    ↗ Ver registro {pcc.sheetCode}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
