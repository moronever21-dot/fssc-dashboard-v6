// Central registry of all Google Sheet IDs for INGAMA
// Mirrors sheets_config.py — single source of truth for the frontend

export const EMPRESA = import.meta.env.VITE_EMPRESA || 'INGAMA'

export const RC_CC: Record<string, string> = {
  'RC.CC.01':  '1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE',
  'RC.CC.1.1': '1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4',
  'RC.CC.02':  '180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU',
  'RC.CC.04':  '1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g',
  'RC.CC.05':  '19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA',
  'RC.CC.06':  '1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI',
  'RC.CC.07':  '1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0',
  'RC.CC.08':  '1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM',
  'RC.CC.09':  '1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK5o',
  'RC.CC.10':  '1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU',
  'RC.CC.11':  '1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI',
  'RC.CC.13':  '1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0',
  'RC.CC.14':  '16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0',
  'RC.CC.16':  '16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0',
  'RC.CC.17':  '1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs',
}

export const RC_PD: Record<string, string> = {
  'RC.PD.01': '14E6s93GykPGqpVJH9f4gyKiXYV5yutpIvWOAFF7OmYg',
  'RC.PD.02': '1_aWiCwHrAx1bHpJ3twchTRwX0sCRtmwglVkPE7WrN04',
  'RC.PD.03': '1Ueb02r1KKiCSlsgr0DFm4LJNLSvHwMtpjsnMmLf82d8',
  'RC.PD.04': '1fOGAkJ1Yes7WDPusEEjbt71LBw6SP72bReHnCa44wKE',
  'RC.PD.05': '1l_WaU1PekIp_Cyk79jGhEGhtZkWJ0X6pOnupCnAhSQQ',
  'RC.PD.06': '17KcWzCQeIyGdsn9YNTjPNtqd7dq1kcB7aQVIGqXKyL8',
  'RC.PD.07': '1z7zUKc2-kS2BZA6e7Wakzuk0tgoBeV5_F8quvTu2qrA',
  'RC.PD.08': '1D9R19nsSb0bhqBgEWBCEbeDDdyOmpams8sLMhCAqdf4',
  'RC.PD.09': '1Ruel5WGlQtLjHIdXsX3LhV6bI3VaxiI4rk_C5qCNvlU',
  'RC.PD.10': '1IadQ8KERDI8rvKLBKervoSyaotP2Opdtu_n3FmgTJT4',
  'RC.PD.11': '1Ld8XA13BnSBYoJ6uMsQiptu7v_t4uKFdXwfBwtnFYaI',
  'RC.PD.12': '1W5eGAe2LOzIrQax_wLI386oZpDXQiAdp9rGgWxdqLQ4',
  'RC.PD.13': '1p9v0jkbcKgul_Ba40-2166b0vOucHh53U3qbp6aib0M',
}

export const PPR: Record<string, string> = {
  CONTROL_PLAGAS:        '1Lrs4UFXJSEmTyuyGMwFMf78bpbjxvZNf',
  LIMPIEZA_DESINFECCION: '19lKYweHbMm0hD_ADeTGFA6cDKnYH2a9kijJ6LFU1obI',
  HIGIENE_PERSONAL:      '1m7TWDl9dxK4betTK4n1667m-_QFD5m-VnbQR-18GbRg',
}

// Drive folder IDs (set in .env)
export const DRIVE_FOLDER_AUTO_ID = import.meta.env.VITE_DRIVE_FOLDER_AUTO_ID || ''
export const DRIVE_FOLDER_IG_ID   = import.meta.env.VITE_DRIVE_FOLDER_IG_ID   || ''

// Helper: build gviz/tq URL for a sheet
export function gvizUrl(sheetId: string, gid = '0', query = '') {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`
  const params = new URLSearchParams({ tqx: 'out:json', gid })
  if (query) params.set('tq', query)
  return `${base}?${params}`
}

// Helper: build edit link
export function editLink(sheetId: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
}
