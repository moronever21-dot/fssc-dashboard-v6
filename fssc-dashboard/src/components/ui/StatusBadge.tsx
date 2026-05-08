import type { ComplianceStatus } from '../../types'
import { statusLabel } from '../../config/fssc'

const STYLES: Record<ComplianceStatus, string> = {
  ok:    'bg-green-500/15 border-green-500/40 text-green-400',
  warn:  'bg-yellow-500/15 border-yellow-500/40 text-yellow-400',
  alert: 'bg-red-500/15 border-red-500/50 text-red-400',
  nd:    'bg-slate-700/40 border-slate-600/30 text-slate-400',
}

const DOT: Record<ComplianceStatus, string> = {
  ok:    'bg-green-400',
  warn:  'bg-yellow-400',
  alert: 'bg-red-400 animate-pulse',
  nd:    'bg-slate-500',
}

interface Props {
  status: ComplianceStatus
  size?: 'sm' | 'md'
  showDot?: boolean
}

export function StatusBadge({ status, size = 'md', showDot = true }: Props) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 border rounded px-2 font-mono font-semibold tracking-wider
        ${STYLES[status]}
        ${size === 'sm' ? 'text-[9px] py-0.5' : 'text-[10px] py-1'}
      `}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${DOT[status]}`} />}
      {statusLabel(status)}
    </span>
  )
}
