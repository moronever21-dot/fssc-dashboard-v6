import type { ComplianceStatus } from '../../types'

interface Props {
  value: number        // 0-100
  showLabel?: boolean
  height?: string
  animate?: boolean
}

function barColor(v: number): string {
  if (v >= 90) return 'bg-green-500'
  if (v >= 70) return 'bg-yellow-500'
  if (v > 0)   return 'bg-red-500'
  return 'bg-slate-600'
}

export function ComplianceBar({ value, showLabel = true, height = 'h-2', animate = true }: Props) {
  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full ${barColor(value)} ${animate ? 'transition-all duration-500' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-500">Cumplimiento</span>
          <span className="text-[10px] font-mono text-slate-300">{value}%</span>
        </div>
      )}
    </div>
  )
}

// Multi-segment compliance bar (OK / WARN / ALERT)
interface SegmentProps {
  ok: number; warn: number; alert: number; nd: number; total: number
}

export function SegmentedBar({ ok, warn, alert, nd, total }: SegmentProps) {
  if (total === 0) return <div className="h-2 bg-slate-800 rounded-full" />
  const pOk    = (ok    / total) * 100
  const pWarn  = (warn  / total) * 100
  const pAlert = (alert / total) * 100
  const pNd    = (nd    / total) * 100
  return (
    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
      <div className="h-full bg-green-500  transition-all duration-500" style={{ width: `${pOk}%` }} />
      <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${pWarn}%` }} />
      <div className="h-full bg-red-500    transition-all duration-500" style={{ width: `${pAlert}%` }} />
      <div className="h-full bg-slate-600  transition-all duration-500" style={{ width: `${pNd}%` }} />
    </div>
  )
}
