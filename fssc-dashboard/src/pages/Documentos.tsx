import { useState } from 'react'
import { useDriveFiles } from '../hooks/useDriveFiles'
import { DRIVE_FOLDER_AUTO_ID, DRIVE_FOLDER_IG_ID } from '../config/sheets'
import { mimeLabel, mimeIcon } from '../lib/driveApi'
import type { AppUser, DriveFile } from '../types'

interface Props {
  user: AppUser
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch { return iso }
}

function formatSize(size?: string): string {
  if (!size) return '—'
  const bytes = Number(size)
  if (bytes > 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes > 1_000)     return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

function FileRow({ file }: { file: DriveFile }) {
  return (
    <tr className="border-b border-cyan-500/5 hover:bg-cyan-500/5 transition-colors">
      <td className="px-4 py-2.5 text-base">{mimeIcon(file.mimeType)}</td>
      <td className="px-4 py-2.5">
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white hover:text-cyan-300 transition-colors"
        >
          {file.name}
        </a>
      </td>
      <td className="px-4 py-2.5 text-xs text-slate-500 hidden md:table-cell">{mimeLabel(file.mimeType)}</td>
      <td className="px-4 py-2.5 text-xs text-slate-500 hidden lg:table-cell">{formatDate(file.modifiedTime)}</td>
      <td className="px-4 py-2.5 text-xs text-slate-600 hidden xl:table-cell font-mono">{formatSize(file.size)}</td>
      <td className="px-4 py-2.5">
        <a
          href={file.webViewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
        >
          ↗ Abrir
        </a>
      </td>
    </tr>
  )
}

function FolderSection({
  name, folderId, token,
}: { name: string; folderId: string; token: string }) {
  const { files, sheets, docs, pdfs, images, loading, error } = useDriveFiles(folderId, token)
  const [filter, setFilter] = useState<'all' | 'sheets' | 'docs' | 'pdfs' | 'images'>('all')

  const displayed =
    filter === 'all'    ? files   :
    filter === 'sheets' ? sheets  :
    filter === 'docs'   ? docs    :
    filter === 'pdfs'   ? pdfs    :
    images

  return (
    <div className="rounded-xl border border-cyan-500/15 bg-[rgba(13,22,38,0.9)] overflow-hidden">
      <div className="px-4 py-3 border-b border-cyan-500/10 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-white">📁 {name}</h3>
          {!loading && !error && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              {files.length} archivos · {sheets.length} Sheets · {docs.length} Docs · {pdfs.length} PDFs · {images.length} imágenes
            </p>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'sheets', 'docs', 'pdfs', 'images'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                text-[10px] px-2.5 py-1 rounded-full border transition-colors
                ${filter === f
                  ? 'border-cyan-500/60 bg-cyan-500/20 text-cyan-300'
                  : 'border-slate-600/30 text-slate-500 hover:text-slate-300'}
              `}
            >
              {f === 'all' ? `Todos (${files.length})` :
               f === 'sheets' ? `Sheets (${sheets.length})` :
               f === 'docs'   ? `Docs (${docs.length})` :
               f === 'pdfs'   ? `PDFs (${pdfs.length})` :
               `Imgs (${images.length})`}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="px-4 py-8 text-center text-xs text-slate-500">
          <div className="inline-block w-4 h-4 border-2 border-cyan-500/50 border-t-cyan-400 rounded-full animate-spin mb-2" />
          <div>Cargando desde Google Drive…</div>
        </div>
      )}

      {error && (
        <div className="px-4 py-6 text-center text-xs text-red-400">
          ⚠️ Error al conectar con Drive: {error}
        </div>
      )}

      {!loading && !error && files.length === 0 && (
        <div className="px-4 py-6 text-center text-xs text-slate-500">
          No se encontraron archivos en esta carpeta.
        </div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-cyan-500/10">
                <th className="px-4 py-2 w-8" />
                <th className="text-left px-4 py-2 font-semibold">Nombre</th>
                <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Modificado</th>
                <th className="text-left px-4 py-2 font-semibold hidden xl:table-cell">Tamaño</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {displayed.map(f => <FileRow key={f.id} file={f} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function Documentos({ user }: Props) {
  const hasToken  = !!user.accessToken && user.accessToken !== 'demo-token'
  const hasConfig = !!DRIVE_FOLDER_AUTO_ID && !!DRIVE_FOLDER_IG_ID

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-xl border border-cyan-500/20 bg-[rgba(13,22,38,0.9)] p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📁</span>
          <div>
            <h2 className="text-lg font-bold text-white">Documentos · Google Drive</h2>
            <p className="text-xs text-slate-400">FSSC 22000 v6 · Carpetas FSSC_22000_Automatizacion y FSSC 22000 V.6 _IG_ AU-2026</p>
          </div>
        </div>
      </div>

      {/* Config notice */}
      {(!hasToken || !hasConfig) && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/8 p-4">
          <div className="text-sm font-semibold text-yellow-400 mb-2">⚙️ Configuración necesaria para ver archivos de Drive</div>
          <div className="space-y-1.5 text-xs text-slate-400">
            {!hasToken && (
              <div>
                ❌ <strong className="text-slate-300">Token de acceso:</strong> Inicia sesión con Google OAuth para que el dashboard pueda leer tus carpetas de Drive.
              </div>
            )}
            {!hasConfig && (
              <div>
                ❌ <strong className="text-slate-300">IDs de carpetas:</strong> Agrega <code className="text-cyan-300">VITE_DRIVE_FOLDER_AUTO_ID</code> y <code className="text-cyan-300">VITE_DRIVE_FOLDER_IG_ID</code> en tu archivo <code className="text-cyan-300">.env</code>.
              </div>
            )}
          </div>
          <div className="mt-3 text-[10px] text-slate-500">
            Los IDs están en la URL de Drive: <code className="text-slate-400">drive.google.com/drive/folders/<strong>FOLDER_ID_AQUI</strong></code>
          </div>
        </div>
      )}

      {/* Folder sections */}
      {hasToken && hasConfig && (
        <>
          <FolderSection
            name="FSSC_22000_Automatizacion"
            folderId={DRIVE_FOLDER_AUTO_ID}
            token={user.accessToken!}
          />
          <FolderSection
            name="FSSC 22000 V.6 · IG · AU-2026"
            folderId={DRIVE_FOLDER_IG_ID}
            token={user.accessToken!}
          />
        </>
      )}

      {/* When token present but no folder config */}
      {hasToken && !hasConfig && (
        <div className="rounded-xl border border-slate-700/40 bg-[rgba(13,22,38,0.9)] p-8 text-center">
          <div className="text-3xl mb-3">📁</div>
          <div className="text-sm text-slate-400">Configura los IDs de carpeta en <code className="text-cyan-300">.env</code> para ver los archivos.</div>
        </div>
      )}
    </div>
  )
}
