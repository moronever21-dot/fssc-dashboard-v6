import type { ComplianceStatus } from '../../types'

const BORDER: Record<ComplianceStatus, string> = {
  ok:    'border-green-500/35 bg-[rgba(5,15,10,0.85)]',
  warn:  'border-yellow-500/50 bg-[rgba(20,15,5,0.85)]',
  alert: 'border-red-500/60 bg-[rgba(20,4,4,0.9)]',
  nd:    'border-slate-600/25 bg-[rgba(15,15,20,0.7)]',
}

const VALUE_COLOR: Record<ComplianceStatus, string> = {
  ok:    'text-green-400',
  warn:  'text-yellow-400',
  alert: 'text-red-400',
  nd:    'text-slate-400',
}

interface Props {
  label: string
  value: string | number
  unit?: string
  icon?: string
  subtext?: string
  status?: ComplianceStatus
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  href?: string
  onClick?: () => void
}

export function KPICard({
  label, value, unit, icon, subtext,
  status = 'nd', trend, trendValue, href, onClick,
}: Props) {
  const TREND_ICON = { up: '▲', down: '▼', stable: '━' }
  const TREND_CLR  = { up: 'text-green-400', down: 'text-red-400', stable: 'text-slate-400' }

  const Wrapper = href ? 'a' : onClick ? 'button' : 'div'
  const extra = href ? { href, target: '_blank', rel: 'noopener noreferrer' }
               : onClick ? { onClick, type: 'button' as const }
               : {}

  return (
    <Wrapper
      {...extra}
      className={`
        block rounded-xl border backdrop-blur-sm p-4 transition-all duration-200
        ${BORDER[status]}
        ${(href || onClick) ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer' : ''}
        text-left w-full
      `}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-400 leading-tight">{label}</span>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <div className="flex items-end gap-1.5">
        <span className={`text-3xl font-bold font-mono ${VALUE_COLOR[status]}`}>{value}</span>
        {unit && <span className="text-sm text-slate-400 mb-0.5">{unit}</span>}
      </div>
      <div className="mt-2 flex items-center justify-between">
        {subtext && <span className="text-[10px] text-slate-500 truncate">{subtext}</span>}
        {trend && trendValue && (
          <span className={`text-[10px] font-mono ml-auto ${TREND_CLR[trend]}`}>
            {TREND_ICON[trend]} {trendValue}
          </span>
        )}
      </div>
    </Wrapper>
  )
}
