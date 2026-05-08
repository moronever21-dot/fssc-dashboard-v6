// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────
export type UserRole = 'gerencia' | 'tecnico' | 'auditor'

export interface AppUser {
  name: string
  email: string
  picture?: string
  role: UserRole
  accessToken?: string
}

// ──────────────────────────────────────────────
// FSSC Chapter structure
// ──────────────────────────────────────────────
export type ComplianceStatus = 'ok' | 'warn' | 'alert' | 'nd'

export interface FSSCClause {
  id: string          // e.g. "8.2.3"
  title: string
  status: ComplianceStatus
  score?: number      // 0-100
  notes?: string
  linkedSheets?: string[]
}

export interface FSSCChapter {
  num: number         // 4-10
  title: string
  icon: string
  clauses: FSSCClause[]
  score: number       // computed 0-100
  status: ComplianceStatus
}

// ──────────────────────────────────────────────
// Google Sheets data
// ──────────────────────────────────────────────
export interface SheetControl {
  name: string
  limite: number
  op: 'max' | 'min' | 'range'
  unidad: string
  valor: number | null
  status: ComplianceStatus
  fecha?: string
}

export interface SheetRecord {
  id: number
  codigo: string
  nombre: string
  link: string
  ultimaFecha: string
  responsable: string
  controles: SheetControl[]
  compliance: number  // 0-100
  status: ComplianceStatus
}

// ──────────────────────────────────────────────
// PPR / PPRO
// ──────────────────────────────────────────────
export interface PPRItem {
  code: string
  name: string
  category: string    // ISO 22000 annex reference
  sheetId: string
  status: ComplianceStatus
  lastInspection: string
  compliance: number
  findings: number    // open findings
  responsable: string
}

// ──────────────────────────────────────────────
// HACCP
// ──────────────────────────────────────────────
export type HazardType = 'B' | 'F' | 'Q' | 'A'   // Biológico, Físico, Químico, Alérgeno

export interface HazardPoint {
  id: string          // PCC-01, PPRO-01, etc.
  type: 'PCC' | 'PPRO' | 'PRP'
  step: string        // process step
  hazard: string
  hazardType: HazardType
  criticalLimit?: string
  monitoringFreq: string
  lastReading?: number
  limitValue?: number
  status: ComplianceStatus
  corrective?: string
}

// ──────────────────────────────────────────────
// KPIs
// ──────────────────────────────────────────────
export interface KPI {
  id: string
  name: string
  value: number
  unit: string
  target: number
  direction: 'higher-better' | 'lower-better'
  trend: number[]     // last 6 periods
  status: ComplianceStatus
  chapter: string     // FSSC clause reference
}

// ──────────────────────────────────────────────
// Drive files
// ──────────────────────────────────────────────
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: string
  webViewLink: string
  folder: string
}

// ──────────────────────────────────────────────
// GViz raw response
// ──────────────────────────────────────────────
export interface GvizResponse {
  table: {
    cols: { id: string; label: string; type: string }[]
    rows: { c: ({ v: unknown; f?: string } | null)[] }[]
  }
}
