import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import type { AppUser } from '../../types'

interface Props {
  user: AppUser
  onLogout: () => void
}

export function Layout({ user, onLogout }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="min-h-screen text-white"
      style={{
        background: '#080e1a',
        backgroundImage:
          'linear-gradient(rgba(6,182,212,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.04) 1px,transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      <Sidebar user={user} onLogout={onLogout} collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <Header sidebarCollapsed={collapsed} />
      <main
        className={`pt-14 min-h-screen transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}
      >
        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
