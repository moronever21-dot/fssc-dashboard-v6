import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { KPICard } from '../components/ui/KPICard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { ComplianceBar, SegmentedBar } from '../components/ui/ComplianceBar'
import { FSSSRadarChart } from '../components/charts/RadarChart'
import { ComplianceBar as ChartBar } from '../components/charts/TrendChart'
import { FSSC_CHAPTERS, scoreToStatus } from '../config/fssc'
import { RC_CC, RC_PD, PPR, editLink } from '../config/sheets'
import type { AppUser } from '../types'

// Simulated aggregate scores (these would come from real sheet data)
// In production, these are computed by useMultiSheetData + aggregation logic
const CHAPTER_SCORES: Record<number, number> = {
  4: 85, 5: 78, 6: 72, 7: 88, 8: 91, 9: 76, 10: 69,
}

const MONTHLY_COMPLIANCE = [
  { label: 'Nov', value: 81 },
  { label: 'Dic', value: 84 },
  { label: 'Ene', value: 83 },
  { label: 'Feb', value: 87 },
  { label: 'Mar', value: 91 },
  { label: 'Abr', value: 89 },
]

const ALL_SHEETS = [
  ...Object.entries(RC_CC).map(([k, v]) => ({ code: k, id: v, cat: 'RC.CC' })),
  ...Object.entries(RC_PD).map(([k, v]) => ({ code: k, id: v, cat: 'RC.PD' })),
  ...Object.entries(PPR).map(([k, v]) => ({ code: k, id: v, cat: 'PPR' })),
]

interface Props {
  user: AppUser
}

export function Dashboard({ user }: Props) {
  const radarData = useMemo(() =>
    FSSC_CHAPTERS.map(ch => ({
      chapter: `Cap ${ch.num}`,
      score: CHAPTER_SCORES[ch.num] ?? 0,
      fullMark: 100,
    })),
  [])

  const avgScore = useMemo(() => {
    const vals = Object.values(CHAPTER_SCORES)
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
  }, [])

  const chapterList = useMemo(() =>
    FSSC_CHAPTERS.map(ch => ({
      ...ch,
      score: CHAPTER_SCORES[ch.num] ?? 0,
      status: scoreToStatus(CHAPTER_SCORES[ch.num] ?? 0),
    })),
  [])

  // Simulated quick-KPIs
  const kpis = [
    { label: 'Cumplimiento Global FSSC', value: avgScore, unit: '%', icon: '🛡️', status: scoreToStatus(avgScore), subtext: 'Capítulos 4–10 ISO 22000' },
    { label: 'Registros RC.CC activos', value: Object.keys(RC_CC).length, unit: 'hojas', icon: '📋', status: 'ok' as const, subtext: 'Controles de calidad' },
    { label: 'Registros RC.PD activos', value: Object.keys(RC_PD).length, unit: 'hojas', icon: '⚙️', status: 'ok' as const, subtext: 'Registros de producción' },
    { label: 'PPR monitoreados', value: Object.keys(PPR).length, unit: 'programas', icon: '🛡️', status: 'ok' as const, subtext: 'Prerrequisitos activos' },
    { label: 'No Conformidades Abiertas', value: 2, unit: 'NC', icon: '⚠️', status: 'warn' as const, subtext: 'Cap. 10.1', trend: 'down' as const, trendValue: '-1 vs mes ant.' },
    { label: 'Próxima Auditoría Interna', value: '14', unit: 'días', icon: '🔍', status: 'warn' as const, subtext: 'Planificada Jun 2026' },
    { label: 'Acciones Correctivas', value: 3, unit: 'abiertas', icon: '🔧', status: 'warn' as const, subtext: 'Cap. 10.1', trend: 'stable' as const, trendValue: 'Sin cambio' },
    { label: 'Documentos Vigentes Drive', value: '–', unit: 'docs', icon: '📁', status: 'nd' as const, subtext: 'Requiere config. Drive' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] p-4 flex items-center gap-4">
        <div className="text-3xl">🛡️</div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Bienvenido, {user.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistema de Gestión de Inocuidad Alimentaria · FSSC 22000 v6 · INGAMA
          </p>
        </div>
        <div className="ml-auto text-right hidden md:block">
          <div className="text-2xl font-bold font-mono text-cyan-400">{avgScore}%</div>
          <div className="text-[10px] text-slate-400">Cumplimiento global</div>
        </div>
      </div>

      {/* KPI grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Indicadores Clave
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map(k => (
            <KPICard key={k.label} {...k} />
          ))}
        </div>
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <div className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] p-4">
          <h3 className="text-sm font-semibold text-white mb-1">Radar de Cumplimiento FSSC</h3>
          <p className="text-[10px] text-slate-500 mb-3">Por capítulo ISO 22000 · Capítulos 4–10</p>
          <FSSSRadarChart data={radarData} />
        </div>

        {/* Monthly trend */}
        <div className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] p-4">
          <h3 className="text-sm font-semibold text-white mb-1">Tendencia de Cumplimiento</h3>
          <p className="text-[10px] text-slate-500 mb-3">Últimos 6 meses · % controles conformes</p>
          <ChartBar data={MONTHLY_COMPLIANCE} height={240} />
        </div>
      </div>

      {/* Chapter status grid */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Estado por Capítulo FSSC 22000
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {chapterList.map(ch => (
            <Link
              key={ch.num}
              to={`/cap/${ch.num}`}
              className="block rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] p-4 hover:border-cyan-500/40 hover:bg-[rgba(13,22,55,0.9)] transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-xs text-slate-500 font-mono">Cap. {ch.num}</div>
                  <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-2">
                    <span>{ch.icon}</span> {ch.title}
                  </div>
                </div>
                <StatusBadge status={ch.status} size="sm" />
              </div>
              <ComplianceBar value={ch.score} height="h-1.5" />
              <div className="mt-2 text-[10px] text-slate-500">
                {ch.clauses.length} cláusulas · {ch.clauses.filter(c => c.linkedSheets?.length).length} con datos en vivo
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sheet registry */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Registros Google Sheets ({ALL_SHEETS.length} hojas)
        </h3>
        <div className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-cyan-500/10 text-slate-500">
                  <th className="text-left px-4 py-2 font-semibold">Código</th>
                  <th className="text-left px-4 py-2 font-semibold">Categoría</th>
                  <th className="text-left px-4 py-2 font-semibold hidden sm:table-cell">Sheet ID</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {ALL_SHEETS.map(s => (
                  <tr key={s.code} className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
                    <td className="px-4 py-2 font-mono text-cyan-300">{s.code}</td>
                    <td className="px-4 py-2">
                      <span className={`
                        text-[10px] px-2 py-0.5 rounded-full border font-mono
                        ${s.cat === 'RC.CC' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' :
                          s.cat === 'RC.PD' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                          'border-green-500/30 text-green-400 bg-green-500/10'}
                      `}>{s.cat}</span>
                    </td>
                    <td className="px-4 py-2 font-mono text-slate-600 text-[10px] hidden sm:table-cell">
                      {s.id.substring(0, 20)}…
                    </td>
                    <td className="px-4 py-2 text-right">
                      <a
                        href={editLink(s.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                      >
                        ↗ Abrir
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
