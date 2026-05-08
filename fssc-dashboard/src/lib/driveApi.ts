import type { DriveFile } from '../types'

const BASE = 'https://www.googleapis.com/drive/v3'

async function driveGet(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${await res.text()}`)
  return res.json()
}

export async function listFolderFiles(folderId: string, token: string): Promise<DriveFile[]> {
  if (!folderId || !token) return []
  const data = await driveGet('/files', token, {
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
    pageSize: '200',
    orderBy: 'modifiedTime desc',
  })
  return (data.files || []) as DriveFile[]
}

export async function searchDriveFiles(query: string, token: string): Promise<DriveFile[]> {
  if (!token) return []
  const data = await driveGet('/files', token, {
    q: `name contains '${query}' and trashed = false`,
    fields: 'files(id,name,mimeType,modifiedTime,size,webViewLink)',
    pageSize: '50',
    orderBy: 'modifiedTime desc',
  })
  return (data.files || []) as DriveFile[]
}

// Map MIME types to human-readable labels
export function mimeLabel(mime: string): string {
  const map: Record<string, string> = {
    'application/vnd.google-apps.spreadsheet': 'Google Sheets',
    'application/vnd.google-apps.document':    'Google Docs',
    'application/vnd.google-apps.presentation': 'Google Slides',
    'application/pdf':                          'PDF',
    'image/jpeg':                               'Imagen JPG',
    'image/png':                                'Imagen PNG',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  }
  return map[mime] || mime.split('/')[1] || 'Archivo'
}

export function mimeIcon(mime: string): string {
  if (mime.includes('spreadsheet') || mime.includes('excel')) return '📊'
  if (mime.includes('document') || mime.includes('word'))     return '📄'
  if (mime.includes('presentation'))                          return '📑'
  if (mime === 'application/pdf')                             return '📕'
  if (mime.includes('image'))                                 return '🖼️'
  return '📁'
}
