import { NavLink } from 'react-router-dom'
import type { AppUser } from '../../types'

interface Props {
  user: AppUser
  onLogout: () => void
  collapsed: boolean
  onToggle: () => void
}

const NAV = [
  { to: '/',         label: 'General',           icon: '🏠' },
  { to: '/cap/4',    label: 'Cap. 4 · Contexto', icon: '🏢' },
  { to: '/cap/5',    label: 'Cap. 5 · Liderazgo',icon: '👔' },
  { to: '/cap/6',    label: 'Cap. 6 · Planif.',  icon: '📋' },
  { to: '/cap/7',    label: 'Cap. 7 · Apoyo',    icon: '🔧' },
  { to: '/cap/8',    label: 'Cap. 8 · Operación',icon: '⚙️' },
  { to: '/cap/9',    label: 'Cap. 9 · Evaluación',icon: '📊' },
  { to: '/cap/10',   label: 'Cap. 10 · Mejora',  icon: '🚀' },
  null,
  { to: '/prp',      label: 'PPR / PPRo',        icon: '🛡️' },
  { to: '/haccp',    label: 'HACCP',             icon: '⚠️' },
  { to: '/kpis',     label: 'KPIs',              icon: '📈' },
  { to: '/docs',     label: 'Documentos Drive',  icon: '📁' },
]

const ROLE_LABEL: Record<string, string> = {
  gerencia: 'Gerencia',
  tecnico:  'Técnico',
  auditor:  'Auditor (lectura)',
}

export function Sidebar({ user, onLogout, collapsed, onToggle }: Props) {
  return (
    <aside
      className={`
        flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-200
        bg-[#080e1a] border-r border-cyan-500/15
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-cyan-500/15 flex-shrink-0">
        <div className="w-8 h-8 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs flex-shrink-0">
          IG
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold text-white tracking-wider">INGAMA</span>
            <span className="text-[10px] text-cyan-400 tracking-widest">FSSC 22000 v6</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto text-slate-500 hover:text-cyan-400 text-xs"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {NAV.map((item, i) =>
          item === null ? (
            <div key={i} className="my-2 border-t border-cyan-500/10 mx-3" />
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-none
                 ${isActive
                   ? 'text-cyan-300 bg-cyan-500/10 border-l-2 border-cyan-400'
                   : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-l-2 border-transparent'
                 }`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-cyan-500/15 p-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {user.picture ? (
            <img src={user.picture} alt="" className="w-7 h-7 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs flex-shrink-0">
              {user.name[0]}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white truncate">{user.name}</div>
              <div className="text-[10px] text-cyan-400">{ROLE_LABEL[user.role]}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onLogout}
              className="text-slate-500 hover:text-red-400 text-xs flex-shrink-0"
              title="Cerrar sesión"
            >
              ⏏
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
