import { KPICard } from '../components/ui/KPICard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { ComplianceBar } from '../components/ui/ComplianceBar'
import { TrendLine } from '../components/charts/TrendChart'
import { scoreToStatus } from '../config/fssc'
import type { ComplianceStatus } from '../types'
import { RC_CC, RC_PD, editLink } from '../config/sheets'

const MONTHS = ['Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr']

const KPIS = [
  // Safety KPIs
  {
    id: 'kpi-01',
    name: 'Índice de Cumplimiento Global FSSC',
    clause: 'Cap. 9.1',
    unit: '%',
    target: 95,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 81, target: 95 },
      { label: 'Dic', value: 84, target: 95 },
      { label: 'Ene', value: 83, target: 95 },
      { label: 'Feb', value: 87, target: 95 },
      { label: 'Mar', value: 91, target: 95 },
      { label: 'Abr', value: 89, target: 95 },
    ],
    category: 'Sistema',
  },
  {
    id: 'kpi-02',
    name: 'No Conformidades Abiertas',
    clause: 'Cap. 10.1',
    unit: 'NC',
    target: 0,
    direction: 'lower-better' as const,
    data: [
      { label: 'Nov', value: 5, target: 2 },
      { label: 'Dic', value: 4, target: 2 },
      { label: 'Ene', value: 6, target: 2 },
      { label: 'Feb', value: 3, target: 2 },
      { label: 'Mar', value: 2, target: 2 },
      { label: 'Abr', value: 2, target: 2 },
    ],
    category: 'Mejora',
  },
  {
    id: 'kpi-03',
    name: 'Eficacia de Acciones Correctivas',
    clause: 'Cap. 10.1',
    unit: '%',
    target: 90,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 75, target: 90 },
      { label: 'Dic', value: 80, target: 90 },
      { label: 'Ene', value: 72, target: 90 },
      { label: 'Feb', value: 85, target: 90 },
      { label: 'Mar', value: 88, target: 90 },
      { label: 'Abr', value: 83, target: 90 },
    ],
    category: 'Mejora',
  },
  {
    id: 'kpi-04',
    name: 'Cumplimiento PPR Limpieza y Desinfección',
    clause: 'Cap. 8.2',
    unit: '%',
    target: 95,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 82, target: 95 },
      { label: 'Dic', value: 86, target: 95 },
      { label: 'Ene', value: 84, target: 95 },
      { label: 'Feb', value: 89, target: 95 },
      { label: 'Mar', value: 91, target: 95 },
      { label: 'Abr', value: 88, target: 95 },
    ],
    category: 'PPR',
  },
  {
    id: 'kpi-05',
    name: 'Cumplimiento Control de Plagas',
    clause: 'Cap. 8.2',
    unit: '%',
    target: 100,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 90, target: 100 },
      { label: 'Dic', value: 92, target: 100 },
      { label: 'Ene', value: 88, target: 100 },
      { label: 'Feb', value: 94, target: 100 },
      { label: 'Mar', value: 96, target: 100 },
      { label: 'Abr', value: 92, target: 100 },
    ],
    category: 'PPR',
  },
  {
    id: 'kpi-06',
    name: 'Conformidad Controles de Calidad (RC.CC)',
    clause: 'Cap. 8.8',
    unit: '%',
    target: 95,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 88, target: 95 },
      { label: 'Dic', value: 90, target: 95 },
      { label: 'Ene', value: 87, target: 95 },
      { label: 'Feb', value: 92, target: 95 },
      { label: 'Mar', value: 93, target: 95 },
      { label: 'Abr', value: 91, target: 95 },
    ],
    category: 'Calidad',
  },
  {
    id: 'kpi-07',
    name: 'Trazabilidad de Lotes (RC.PD)',
    clause: 'Cap. 8.3',
    unit: '%',
    target: 100,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 95, target: 100 },
      { label: 'Dic', value: 97, target: 100 },
      { label: 'Ene', value: 96, target: 100 },
      { label: 'Feb', value: 98, target: 100 },
      { label: 'Mar', value: 99, target: 100 },
      { label: 'Abr', value: 98, target: 100 },
    ],
    category: 'Producción',
  },
  {
    id: 'kpi-08',
    name: 'Auditorías Internas Ejecutadas vs Planificadas',
    clause: 'Cap. 9.2',
    unit: '%',
    target: 100,
    direction: 'higher-better' as const,
    data: [
      { label: 'Nov', value: 100, target: 100 },
      { label: 'Dic', value: 100, target: 100 },
      { label: 'Ene', value: 100, target: 100 },
      { label: 'Feb', value: 100, target: 100 },
      { label: 'Mar', value: 100, target: 100 },
      { label: 'Abr', value: 75, target: 100 },
    ],
    category: 'Evaluación',
  },
]

const CATEGORIES = ['Sistema', 'PPR', 'Calidad', 'Producción', 'Mejora', 'Evaluación']

function kpiStatus(kpi: typeof KPIS[0]): ComplianceStatus {
  const last = kpi.data[kpi.data.length - 1].value
  if (kpi.direction === 'higher-better') {
    const ratio = last / kpi.target
    if (ratio >= 0.95) return 'ok'
    if (ratio >= 0.80) return 'warn'
    return 'alert'
  } else {
    if (last <= kpi.target) return 'ok'
    if (last <= kpi.target * 2) return 'warn'
    return 'alert'
  }
}

export function KPIs() {
  const kpiStatuses = KPIS.map(k => ({ ...k, status: kpiStatus(k) }))
  const okCount    = kpiStatuses.filter(k => k.status === 'ok').length
  const warnCount  = kpiStatuses.filter(k => k.status === 'warn').length
  const alertCount = kpiStatuses.filter(k => k.status === 'alert').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">📈</span>
          <div>
            <h2 className="text-lg font-bold text-white">KPIs · Indicadores de Inocuidad</h2>
            <p className="text-xs text-slate-400">FSSC 22000 v6 · Cláusula 9.1 · Seguimiento y Medición</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KPICard label="Total KPIs" value={KPIS.length} icon="📊" status="nd" subtext="Indicadores activos" />
          <KPICard label="En Meta" value={okCount} icon="✅" status="ok" subtext={`${Math.round(okCount/KPIS.length*100)}% del total`} />
          <KPICard label="Atención" value={warnCount} icon="⚠️" status="warn" subtext="Bajo la meta" />
          <KPICard label="Críticos" value={alertCount} icon="🚨" status={alertCount > 0 ? 'alert' : 'ok'} subtext="Requieren acción" />
        </div>
      </div>

      {/* KPI cards by category */}
      {CATEGORIES.map(cat => {
        const catKpis = kpiStatuses.filter(k => k.category === cat)
        if (!catKpis.length) return null
        return (
          <div key={cat}>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              {cat}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {catKpis.map(kpi => {
                const last = kpi.data[kpi.data.length - 1].value
                const prev = kpi.data[kpi.data.length - 2].value
                const diff = last - prev
                const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable'
                const trendOk = kpi.direction === 'higher-better' ? trend === 'up' : trend === 'down'

                return (
                  <div key={kpi.id} className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="text-[10px] font-mono text-slate-500 mb-0.5">{kpi.clause}</div>
                        <div className="text-sm font-semibold text-white">{kpi.name}</div>
                      </div>
                      <StatusBadge status={kpi.status} size="sm" />
                    </div>

                    <div className="flex items-end gap-3 mb-3">
                      <div>
                        <div className={`text-3xl font-bold font-mono ${
                          kpi.status === 'ok' ? 'text-green-400' :
                          kpi.status === 'warn' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{last}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{kpi.unit}</div>
                      </div>
                      <div className="flex-1 pb-1">
                        <ComplianceBar
                          value={kpi.direction === 'higher-better'
                            ? Math.round((last / kpi.target) * 100)
                            : Math.max(0, Math.round(100 - ((last / kpi.target) - 1) * 100))}
                          height="h-1.5"
                          showLabel={false}
                        />
                      </div>
                      <div className="text-right pb-1">
                        <div className="text-[10px] text-slate-500">Meta: <span className="text-slate-300 font-mono">{kpi.target}{kpi.unit}</span></div>
                        <div className={`text-[10px] font-mono ${trendOk ? 'text-green-400' : 'text-red-400'}`}>
                          {diff > 0 ? '+' : ''}{diff.toFixed(1)} {kpi.unit}
                        </div>
                      </div>
                    </div>

                    <TrendLine data={kpi.data} height={100} unit={kpi.unit} color={
                      kpi.status === 'ok' ? '#22c55e' :
                      kpi.status === 'warn' ? '#f59e0b' : '#ef4444'
                    } />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Quick links to sheets */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Acceso Rápido a Hojas de Control
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {[
            ...Object.entries(RC_CC).slice(0, 6).map(([k, v]) => ({ code: k, id: v, color: 'cyan' })),
            ...Object.entries(RC_PD).slice(0, 4).map(([k, v]) => ({ code: k, id: v, color: 'purple' })),
          ].map(s => (
            <a
              key={s.code}
              href={editLink(s.id)}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                block text-center py-2.5 px-3 rounded-lg border transition-colors text-xs font-mono font-semibold
                ${s.color === 'cyan'
                  ? 'border-cyan-500/25 bg-cyan-500/8 text-cyan-400 hover:bg-cyan-500/20'
                  : 'border-purple-500/25 bg-purple-500/8 text-purple-400 hover:bg-purple-500/20'}
              `}
            >
              ↗ {s.code}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
