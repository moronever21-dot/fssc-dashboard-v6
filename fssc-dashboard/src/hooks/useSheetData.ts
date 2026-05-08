import { useState, useEffect } from 'react'
import { fetchGviz } from '../lib/gviz'
import type { GvizResponse } from '../types'

interface UseSheetDataResult {
  data: GvizResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSheetData(sheetId: string, gid = '0'): UseSheetDataResult {
  const [data, setData] = useState<GvizResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!sheetId) return
    setLoading(true)
    setError(null)
    fetchGviz(sheetId, gid)
      .then(res => {
        if (res) setData(res)
        else setError('No se pudo cargar la hoja')
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [sheetId, gid, tick])

  return { data, loading, error, refetch: () => setTick(t => t + 1) }
}

// Fetch multiple sheets concurrently
export function useMultiSheetData(sheets: { id: string; gid?: string; key: string }[]) {
  const [results, setResults] = useState<Record<string, GvizResponse | null>>({})
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (sheets.length === 0) return
    setLoading(true)
    Promise.all(
      sheets.map(s => fetchGviz(s.id, s.gid ?? '0').then(d => ({ key: s.key, data: d })))
    ).then(all => {
      const map: Record<string, GvizResponse | null> = {}
      all.forEach(({ key, data }) => { map[key] = data })
      setResults(map)
    }).finally(() => setLoading(false))
  }, [sheets.map(s => s.id + s.gid).join(','), tick])

  return { results, loading, refetch: () => setTick(t => t + 1) }
}
