import { KPICard } from '../components/ui/KPICard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { ComplianceBar } from '../components/ui/ComplianceBar'
import { scoreToStatus } from '../config/fssc'
import { PPR, RC_CC, editLink } from '../config/sheets'
import type { ComplianceStatus } from '../types'

// PRPs mapped to FSSC 22000 Annex 2 categories
const PRP_LIST = [
  {
    code: 'PRP-01',
    name: 'Control de Plagas',
    category: 'Plagas — Annex 2 cl. 2.4',
    sheetKey: 'CONTROL_PLAGAS',
    sheetId: PPR.CONTROL_PLAGAS,
    responsable: 'Responsable Sanidad',
    frecuencia: 'Mensual / Visual diario',
    ultimaRevision: 'Abr 2026',
    score: 92,
    findings: 0,
  },
  {
    code: 'PRP-02',
    name: 'Limpieza y Desinfección',
    category: 'Higiene — Annex 2 cl. 2.3',
    sheetKey: 'LIMPIEZA_DESINFECCION',
    sheetId: PPR.LIMPIEZA_DESINFECCION,
    responsable: 'Jefe de Planta',
    frecuencia: 'Diario / Semanal / Mensual',
    ultimaRevision: 'Abr 2026',
    score: 88,
    findings: 1,
  },
  {
    code: 'PRP-03',
    name: 'Higiene Personal',
    category: 'Personal — Annex 2 cl. 2.7',
    sheetKey: 'HIGIENE_PERSONAL',
    sheetId: PPR.HIGIENE_PERSONAL,
    responsable: 'RRHH / Jefe de Planta',
    frecuencia: 'Diario / Mensual',
    ultimaRevision: 'Mar 2026',
    score: 85,
    findings: 1,
  },
  {
    code: 'PRP-04',
    name: 'Control de Seleccionado (% Podrida/Ombligo)',
    category: 'Producto — PPRo Cap. 8.6',
    sheetKey: 'RC.CC.01',
    sheetId: RC_CC['RC.CC.01'],
    responsable: 'Mery Saavedra Chipunavi',
    frecuencia: 'Por lote',
    ultimaRevision: 'Ene 2026',
    score: 94,
    findings: 0,
  },
  {
    code: 'PRP-05',
    name: 'Control Físico-Químico',
    category: 'Producto — PPRo Cap. 8.6',
    sheetKey: 'RC.CC.02',
    sheetId: RC_CC['RC.CC.02'],
    responsable: 'Laboratorio Calidad',
    frecuencia: 'Diario',
    ultimaRevision: 'Mar 2026',
    score: 90,
    findings: 0,
  },
  {
    code: 'PRP-06',
    name: 'Control de Temperatura',
    category: 'Ambiente — Annex 2 cl. 2.5',
    sheetKey: 'RC.CC.05',
    sheetId: RC_CC['RC.CC.05'],
    responsable: 'Operaciones',
    frecuencia: 'Continuo / Registro 3h',
    ultimaRevision: 'Abr 2026',
    score: 87,
    findings: 1,
  },
]

// PPRo items (Operational PRPs)
const PPRO_LIST = [
  { code: 'PPRo-01', step: 'Selección', hazard: 'Físico/Biológico', limit: '% Podrida ≤ 2%, % Ombligo ≤ 5%', freq: 'Por lote', sheet: 'RC.CC.01', score: 94 },
  { code: 'PPRo-02', step: 'Pesado / Calibrado', hazard: 'Físico', limit: 'Peso neto ± 2g', freq: 'Cada 30 min', sheet: 'RC.CC.04', score: 91 },
  { code: 'PPRo-03', step: 'Empaque', hazard: 'Físico / Alérgeno', limit: 'Sellado > 98%', freq: 'Cada hora', sheet: 'RC.CC.07', score: 88 },
  { code: 'PPRo-04', step: 'Almacenamiento Frío', hazard: 'Biológico', limit: 'T° ≤ 6°C', freq: 'Cada 3 horas', sheet: 'RC.CC.05', score: 87 },
  { code: 'PPRo-05', step: 'Recepción de MP', hazard: 'Biológico/Químico', limit: 'Conformidad proveedor', freq: 'Por recepción', sheet: 'RC.CC.08', score: 82 },
]

export function PRPs() {
  const avgPrp = Math.round(PRP_LIST.reduce((s, p) => s + p.score, 0) / PRP_LIST.length)
  const avgPpro = Math.round(PPRO_LIST.reduce((s, p) => s + p.score, 0) / PPRO_LIST.length)
  const totalFindings = PRP_LIST.reduce((s, p) => s + p.findings, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h2 className="text-lg font-bold text-white">Programas Prerrequisito (PPR / PPRo)</h2>
            <p className="text-xs text-slate-400">FSSC 22000 v6 · Cláusula 8.2 y 8.6 · Annex 2</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Cumplimiento PPR" value={avgPrp} unit="%" status={scoreToStatus(avgPrp)} icon="🛡️" subtext={`${PRP_LIST.length} programas`} />
          <KPICard label="Cumplimiento PPRo" value={avgPpro} unit="%" status={scoreToStatus(avgPpro)} icon="⚙️" subtext={`${PPRO_LIST.length} puntos`} />
          <KPICard label="Hallazgos Abiertos" value={totalFindings} unit="hall." status={totalFindings === 0 ? 'ok' : 'warn'} icon="🔍" subtext="Requieren acción" />
          <KPICard label="Hojas de Control" value={Object.keys(PPR).length + 6} unit="activas" status="ok" icon="📊" subtext="Google Sheets vivo" />
        </div>
      </div>

      {/* PPR table */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Programas Prerrequisito (PRP) — Cláusula 8.2
        </h3>
        <div className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cyan-500/10 text-slate-500">
                  <th className="text-left px-4 py-3 font-semibold">Código</th>
                  <th className="text-left px-4 py-3 font-semibold">Programa</th>
                  <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Responsable</th>
                  <th className="text-center px-4 py-3 font-semibold">Estado</th>
                  <th className="text-right px-4 py-3 font-semibold">Cumpl.</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {PRP_LIST.map(p => {
                  const st = scoreToStatus(p.score)
                  return (
                    <tr key={p.code} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-cyan-300 font-bold">{p.code}</td>
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{p.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{p.frecuencia}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{p.category}</td>
                      <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{p.responsable}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={st} size="sm" />
                        {p.findings > 0 && (
                          <div className="text-[9px] text-yellow-400 mt-1">{p.findings} hallazgo{p.findings > 1 ? 's' : ''}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-mono font-bold text-slate-200">{p.score}%</div>
                        <div className="w-16 ml-auto mt-1">
                          <ComplianceBar value={p.score} height="h-1" showLabel={false} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={editLink(p.sheetId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors whitespace-nowrap"
                        >
                          ↗ Hoja
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PPRo table */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Programas Prerrequisito Operacionales (PPRo) — Cláusula 8.6
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {PPRO_LIST.map(p => {
            const st = scoreToStatus(p.score)
            const sheetId = RC_CC[p.sheet as keyof typeof RC_CC] ?? ''
            return (
              <div key={p.code} className={`rounded-lg border p-4 ${
                st === 'ok' ? 'border-green-500/30 bg-[rgba(5,15,10,0.85)]' :
                st === 'warn' ? 'border-yellow-500/35 bg-[rgba(20,15,5,0.85)]' :
                'border-red-500/40 bg-[rgba(20,4,4,0.9)]'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-[10px] font-mono text-cyan-400">{p.code}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{p.step}</div>
                  </div>
                  <StatusBadge status={st} size="sm" />
                </div>
                <div className="text-[11px] text-slate-400 mb-1">⚠️ {p.hazard}</div>
                <div className="text-[11px] text-slate-400 mb-1">🎯 {p.limit}</div>
                <div className="text-[10px] text-slate-500 mb-3">🕐 {p.freq}</div>
                <ComplianceBar value={p.score} height="h-1.5" />
                {sheetId && (
                  <a
                    href={editLink(sheetId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-center text-[10px] px-2 py-1 rounded bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 hover:bg-cyan-500/15 transition-colors"
                  >
                    ↗ Ver registro {p.sheet}
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
