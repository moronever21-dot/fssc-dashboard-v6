import { useState, useEffect } from 'react'
import { listFolderFiles } from '../lib/driveApi'
import type { DriveFile } from '../types'

export function useDriveFiles(folderId: string, accessToken: string | undefined) {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!folderId || !accessToken) { setFiles([]); return }
    setLoading(true)
    setError(null)
    listFolderFiles(folderId, accessToken)
      .then(setFiles)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [folderId, accessToken])

  const byMime = (mime: string) => files.filter(f => f.mimeType === mime)
  const sheets       = byMime('application/vnd.google-apps.spreadsheet')
  const docs         = byMime('application/vnd.google-apps.document')
  const pdfs         = byMime('application/pdf')
  const images       = files.filter(f => f.mimeType.startsWith('image/'))

  return { files, sheets, docs, pdfs, images, loading, error }
}
