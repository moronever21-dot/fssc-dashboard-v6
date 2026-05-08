import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuth } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { ChapterPage } from './pages/chapters/ChapterPage'
import { PRPs } from './pages/PRPs'
import { HACCP } from './pages/HACCP'
import { KPIs } from './pages/KPIs'
import { Documentos } from './pages/Documentos'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'no-client-id'

function AppRoutes() {
  const { user, login, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Login onLogin={login} />
  }

  return (
    <Routes>
      <Route element={<Layout user={user} onLogout={logout} />}>
        <Route index element={<Dashboard user={user} />} />
        <Route path="cap/:num" element={<ChapterPage />} />
        <Route path="prp" element={<PRPs />} />
        <Route path="haccp" element={<HACCP />} />
        <Route path="kpis" element={<KPIs />} />
        <Route path="docs" element={<Documentos user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}
