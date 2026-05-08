import { GoogleLogin } from '@react-oauth/google'
import type { useAuth } from '../hooks/useAuth'

interface TokenPayload {
  email: string
  name: string
  picture?: string
  sub: string
}

function decodeJwt(token: string): TokenPayload {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as TokenPayload
}

interface Props {
  onLogin: ReturnType<typeof useAuth>['login']
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const EMPRESA   = import.meta.env.VITE_EMPRESA || 'INGAMA'

export function Login({ onLogin }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: '#080e1a',
        backgroundImage:
          'linear-gradient(rgba(6,182,212,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.04) 1px,transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      <div className="w-full max-w-sm mx-4">
        {/* Logo card */}
        <div className="rounded-2xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] backdrop-blur-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{EMPRESA}</h1>
          <div className="text-xs text-cyan-400 tracking-widest font-mono mb-2">
            FSSC 22000 v6 · DASHBOARD
          </div>
          <p className="text-xs text-slate-500 mb-8">
            Sistema integrado de gestión de inocuidad alimentaria
          </p>

          {CLIENT_ID ? (
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={cred => {
                  if (!cred.credential) return
                  const profile = decodeJwt(cred.credential)
                  onLogin(
                    { email: profile.email, name: profile.name, picture: profile.picture },
                    cred.credential,
                  )
                }}
                onError={() => console.error('Google login failed')}
                theme="filled_black"
                shape="pill"
                text="signin_with"
                locale="es"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 px-4 py-3 text-left">
                <div className="text-xs text-yellow-400 font-semibold mb-1">⚙️ Configuración requerida</div>
                <div className="text-[11px] text-slate-400">
                  Crea un <code className="text-cyan-300">.env</code> con tu{' '}
                  <code className="text-cyan-300">VITE_GOOGLE_CLIENT_ID</code> para activar el login con Google.
                </div>
              </div>
              {/* Demo access button */}
              <button
                onClick={() =>
                  onLogin(
                    { email: 'demo@ingama.com', name: 'Modo Demo', picture: undefined },
                    'demo-token',
                  )
                }
                className="w-full py-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/25 transition-colors"
              >
                Entrar en modo demo
              </button>
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="mt-4 text-center text-[10px] text-slate-600">
          Datos en tiempo real desde Google Drive · FSSC 22000:2023 v6
        </div>
      </div>
    </div>
  )
}
