// Generic chapter page for chapters 4, 5, 6, 7, 9, 10 (no live sheet data)
import { useParams } from 'react-router-dom'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ComplianceBar } from '../../components/ui/ComplianceBar'
import { FSSC_CHAPTERS, scoreToStatus, statusColor } from '../../config/fssc'
import type { ComplianceStatus } from '../../types'

// Static clause assessment data — update here as FSSC audits are completed
const CLAUSE_DATA: Record<string, { score: number; notes: string; evidencias: string[] }> = {
  '4.1': { score: 85, notes: 'Análisis FODA documentado. Contexto externo e interno definido.', evidencias: ['Matriz FODA 2026', 'Análisis partes interesadas'] },
  '4.2': { score: 80, notes: 'Registro de partes interesadas actualizado. Requisitos legales identificados.', evidencias: ['Registro partes interesadas', 'Matriz requisitos legales'] },
  '4.3': { score: 90, notes: 'Alcance definido y documentado. Incluye líneas de producción activas.', evidencias: ['Manual SGIA — Sección 4.3', 'Mapa de procesos'] },
  '4.4': { score: 82, notes: 'SGIA establecido, documentado y mantenido.', evidencias: ['Manual SGIA v3', 'Lista maestra de documentos'] },
  '5.1': { score: 75, notes: 'Compromiso de la alta dirección demostrado. Revisión gerencial programada.', evidencias: ['Actas revisión gerencial', 'Designación Equipo SGIA'] },
  '5.2': { score: 88, notes: 'Política de inocuidad aprobada, publicada y comunicada a todo el personal.', evidencias: ['Política Inocuidad v2 2026', 'Registro difusión política'] },
  '5.3': { score: 70, notes: 'Organigrama actualizado. Líder SGIA designado. Funciones documentadas.', evidencias: ['Organigrama INGAMA 2026', 'Perfiles de cargo SGIA'] },
  '6.1': { score: 72, notes: 'Registro de riesgos y oportunidades elaborado. Tratamiento en curso.', evidencias: ['Matriz riesgos SGIA', 'Plan tratamiento riesgos'] },
  '6.2': { score: 68, notes: 'Objetivos definidos con indicadores. Seguimiento mensual en progreso.', evidencias: ['Objetivos SGIA 2026', 'Tablero KPIs'] },
  '6.3': { score: 78, notes: 'Procedimiento de gestión de cambios implementado.', evidencias: ['PR-GC-01 Gestión de Cambios'] },
  '7.1': { score: 88, notes: 'Infraestructura, equipos y ambiente de trabajo gestionados.', evidencias: ['Plan mantenimiento 2026', 'Registro calibración equipos'] },
  '7.2': { score: 82, notes: 'Competencias del personal evaluadas. Plan de capacitación actualizado.', evidencias: ['Evaluación de competencias 2026', 'Plan capacitación FSSC'] },
  '7.3': { score: 79, notes: 'Personal consciente de su contribución a la inocuidad alimentaria.', evidencias: ['Registros inducción', 'Evaluaciones de capacitación'] },
  '7.4': { score: 85, notes: 'Comunicación interna y externa documentada.', evidencias: ['Matriz de comunicaciones', 'Registros reuniones equipo SGIA'] },
  '7.5': { score: 91, notes: 'Sistema de control de documentos y registros funcionando.', evidencias: ['Lista maestra documentos', 'Procedimiento control docs'] },
  '8.1': { score: 88, notes: 'Procesos productivos planificados y controlados.', evidencias: ['Flujogramas de proceso', 'Parámetros de operación'] },
  '8.2': { score: 91, notes: 'PPRs implementados. Ver sección PPR/PPRo para detalle.', evidencias: ['RC.CC — Controles calidad', 'Programa limpieza y desinfección'] },
  '8.3': { score: 89, notes: 'Trazabilidad completa de lotes. RC.PD vinculados.', evidencias: ['RC.PD.01 — Consolidado', 'Sistema trazabilidad lotes'] },
  '8.4': { score: 75, notes: 'Plan de emergencias actualizado. Simulacros pendientes.', evidencias: ['Plan contingencias 2026'] },
  '8.5': { score: 87, notes: 'Análisis de peligros actualizado. Ver sección HACCP.', evidencias: ['Análisis peligros v4', 'HACCP plan 2026'] },
  '8.6': { score: 85, notes: 'PPRos y PCCs definidos, monitoreados y verificados.', evidencias: ['Plan HACCP', 'Registros monitoreo PCCs'] },
  '8.7': { score: 80, notes: 'Información prerrequisitos y HACCP actualizada anualmente.', evidencias: ['Revisión anual HACCP 2026'] },
  '8.8': { score: 92, notes: '14 equipos calibrados. Registros al día.', evidencias: ['Certificados calibración', 'Programa metrología'] },
  '8.9': { score: 85, notes: 'Actividades de verificación programadas y ejecutadas.', evidencias: ['Plan verificación SGIA', 'Registros auditorías internas'] },
  '8.10': { score: 73, notes: '2 NC abiertas en seguimiento. Ver Cap. 10.', evidencias: ['Registro NC-2026-01', 'Registro NC-2026-02'] },
  '9.1': { score: 76, notes: 'KPIs monitoreados mensualmente. Tablero actualizado.', evidencias: ['Tablero KPIs INGAMA', 'Informes mensuales'] },
  '9.2': { score: 72, notes: 'Auditoría interna programada para Jun 2026. Última: Dic 2025.', evidencias: ['Programa auditorías 2026', 'Informe auditoría Dic 2025'] },
  '9.3': { score: 80, notes: 'Revisión gerencial realizada Mar 2026. Próxima: Sep 2026.', evidencias: ['Acta revisión gerencial Mar 2026'] },
  '10.1': { score: 68, notes: '3 acciones correctivas en curso. 2 NC sin cerrar.', evidencias: ['Registro NC y AC 2026', 'Seguimiento acciones correctivas'] },
  '10.2': { score: 72, notes: 'Proyectos de mejora identificados. 2 en ejecución.', evidencias: ['Plan mejora 2026', 'Proyectos inocuidad'] },
  '10.3': { score: 75, notes: 'SGIA actualizado tras última revisión gerencial.', evidencias: ['Acta actualización SGIA 2026'] },
}

export function ChapterPage() {
  const { num } = useParams<{ num: string }>()
  const chNum = Number(num)
  const chapter = FSSC_CHAPTERS.find(c => c.num === chNum)

  if (!chapter) {
    return <div className="text-slate-400 text-sm">Capítulo no encontrado.</div>
  }

  const clauseScores = chapter.clauses.map(cl => {
    const d = CLAUSE_DATA[cl.id]
    return d?.score ?? 0
  }).filter(s => s > 0)
  const avgScore = clauseScores.length
    ? Math.round(clauseScores.reduce((a, b) => a + b, 0) / clauseScores.length)
    : 0
  const status = scoreToStatus(avgScore)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Chapter header */}
      <div className="rounded-xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 font-mono mb-1">ISO 22000:2018 / FSSC 22000 v6</div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <span className="text-2xl">{chapter.icon}</span>
              Capítulo {chapter.num}: {chapter.title}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={status} />
            <div className="text-2xl font-bold font-mono text-cyan-400">{avgScore}%</div>
          </div>
        </div>
        <div className="mt-4">
          <ComplianceBar value={avgScore} height="h-2" />
        </div>
      </div>

      {/* Clauses */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Cláusulas — Capítulo {chapter.num}
        </h3>
        <div className="space-y-2">
          {chapter.clauses.map(cl => {
            const d = CLAUSE_DATA[cl.id]
            const score = d?.score ?? 0
            const st = scoreToStatus(score) as ComplianceStatus
            return (
              <div
                key={cl.id}
                className="rounded-lg border border-cyan-500/10 bg-[rgba(13,22,38,0.9)] p-4 hover:border-cyan-500/25 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <span className={`text-xs font-mono font-bold ${statusColor(st)} mr-2`}>{cl.id}</span>
                    <span className="text-sm text-white">{cl.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-mono font-bold text-slate-300">{score}%</span>
                    <StatusBadge status={st} size="sm" />
                  </div>
                </div>
                <ComplianceBar value={score} height="h-1" showLabel={false} />
                {d && (
                  <div className="mt-2 text-[11px] text-slate-500">{d.notes}</div>
                )}
                {d?.evidencias?.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {d.evidencias.map(ev => (
                      <span
                        key={ev}
                        className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/8 border border-cyan-500/15 text-cyan-400"
                      >
                        📄 {ev}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] p-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Resumen Capítulo {chapter.num}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          {(['ok', 'warn', 'alert', 'nd'] as ComplianceStatus[]).map(st => {
            const count = chapter.clauses.filter(cl => scoreToStatus(CLAUSE_DATA[cl.id]?.score ?? 0) === st).length
            const colors: Record<ComplianceStatus, string> = {
              ok: 'text-green-400', warn: 'text-yellow-400', alert: 'text-red-400', nd: 'text-slate-400'
            }
            const labels: Record<ComplianceStatus, string> = {
              ok: 'Conforme', warn: 'Atención', alert: 'No conforme', nd: 'Sin datos'
            }
            return (
              <div key={st} className="rounded-lg bg-[rgba(0,0,0,0.3)] p-3">
                <div className={`text-2xl font-bold font-mono ${colors[st]}`}>{count}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{labels[st]}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
