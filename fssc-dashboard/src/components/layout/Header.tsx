import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/':        'Dashboard General · FSSC 22000 v6',
  '/cap/4':   'Capítulo 4 — Contexto de la Organización',
  '/cap/5':   'Capítulo 5 — Liderazgo',
  '/cap/6':   'Capítulo 6 — Planificación',
  '/cap/7':   'Capítulo 7 — Apoyo',
  '/cap/8':   'Capítulo 8 — Operación',
  '/cap/9':   'Capítulo 9 — Evaluación del Desempeño',
  '/cap/10':  'Capítulo 10 — Mejora',
  '/prp':     'Programas Prerrequisito (PPR / PPRo)',
  '/haccp':   'HACCP · Análisis de Peligros y PCCs',
  '/kpis':    'KPIs · Indicadores de Inocuidad',
  '/docs':    'Documentos · Google Drive',
}

export function Header({ sidebarCollapsed }: { sidebarCollapsed: boolean }) {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'FSSC 22000 v6 — INGAMA'
  const now = new Date()
  const dateStr = now.toLocaleDateString('es-PE', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  })

  return (
    <header
      className={`
        fixed top-0 right-0 z-20 h-14 flex items-center px-6
        border-b border-cyan-500/15 bg-[#080e1a]/95 backdrop-blur-sm
        transition-all duration-200
        ${sidebarCollapsed ? 'left-16' : 'left-60'}
      `}
    >
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
      </div>
      <div className="text-xs text-slate-500 capitalize hidden sm:block">{dateStr}</div>
      <div className="ml-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Datos en vivo" />
        <span className="text-[10px] text-slate-500">EN VIVO</span>
      </div>
    </header>
  )
}
