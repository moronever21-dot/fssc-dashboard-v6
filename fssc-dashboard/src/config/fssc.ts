import type { FSSCChapter, ComplianceStatus } from '../types'

// FSSC 22000 v6 full chapter structure
// Scores and status are updated dynamically in the app; these are the structural defaults.

export const FSSC_CHAPTERS: Omit<FSSCChapter, 'score' | 'status'>[] = [
  {
    num: 4,
    title: 'Contexto de la Organización',
    icon: '🏢',
    clauses: [
      { id: '4.1', title: 'Comprensión de la organización y su contexto', status: 'nd' },
      { id: '4.2', title: 'Comprensión de necesidades de partes interesadas', status: 'nd' },
      { id: '4.3', title: 'Determinación del alcance del SGIA', status: 'nd' },
      { id: '4.4', title: 'Sistema de Gestión de Inocuidad Alimentaria (SGIA)', status: 'nd' },
    ],
  },
  {
    num: 5,
    title: 'Liderazgo',
    icon: '👔',
    clauses: [
      { id: '5.1', title: 'Liderazgo y compromiso', status: 'nd' },
      { id: '5.2', title: 'Política de inocuidad alimentaria', status: 'nd' },
      { id: '5.3', title: 'Roles, responsabilidades y autoridades', status: 'nd' },
    ],
  },
  {
    num: 6,
    title: 'Planificación',
    icon: '📋',
    clauses: [
      { id: '6.1', title: 'Acciones para abordar riesgos y oportunidades', status: 'nd' },
      { id: '6.2', title: 'Objetivos del SGIA y planificación', status: 'nd' },
      { id: '6.3', title: 'Planificación de cambios', status: 'nd' },
    ],
  },
  {
    num: 7,
    title: 'Apoyo',
    icon: '🔧',
    clauses: [
      { id: '7.1', title: 'Recursos', status: 'nd' },
      { id: '7.2', title: 'Competencia', status: 'nd' },
      { id: '7.3', title: 'Toma de conciencia', status: 'nd' },
      { id: '7.4', title: 'Comunicación', status: 'nd' },
      { id: '7.5', title: 'Información documentada', status: 'nd' },
    ],
  },
  {
    num: 8,
    title: 'Operación',
    icon: '⚙️',
    clauses: [
      { id: '8.1', title: 'Planificación y control operacional', status: 'nd' },
      { id: '8.2', title: 'Programas de prerrequisitos (PPR)', status: 'nd', linkedSheets: ['CONTROL_PLAGAS', 'LIMPIEZA_DESINFECCION', 'HIGIENE_PERSONAL'] },
      { id: '8.3', title: 'Sistema de trazabilidad', status: 'nd', linkedSheets: Object.keys({}) },
      { id: '8.4', title: 'Preparación y respuesta ante emergencias', status: 'nd' },
      { id: '8.5', title: 'Análisis de peligros', status: 'nd' },
      { id: '8.6', title: 'PPRo y plan HACCP', status: 'nd' },
      { id: '8.7', title: 'Actualización de información y PPR / plan HACCP', status: 'nd' },
      { id: '8.8', title: 'Control de monitoreo y medición', status: 'nd', linkedSheets: Object.keys({ 'RC.CC': '' }) },
      { id: '8.9', title: 'Verificación del SGIA', status: 'nd' },
      { id: '8.10', title: 'Control de NC de procesos / productos', status: 'nd' },
    ],
  },
  {
    num: 9,
    title: 'Evaluación del Desempeño',
    icon: '📊',
    clauses: [
      { id: '9.1', title: 'Seguimiento, medición, análisis y evaluación', status: 'nd' },
      { id: '9.2', title: 'Auditoría interna', status: 'nd' },
      { id: '9.3', title: 'Revisión por la dirección', status: 'nd' },
    ],
  },
  {
    num: 10,
    title: 'Mejora',
    icon: '🚀',
    clauses: [
      { id: '10.1', title: 'No conformidad y acción correctiva', status: 'nd' },
      { id: '10.2', title: 'Mejora continua', status: 'nd' },
      { id: '10.3', title: 'Actualización del SGIA', status: 'nd' },
    ],
  },
]

// Status color helpers
export function statusColor(s: ComplianceStatus): string {
  return {
    ok:    'text-green-400',
    warn:  'text-yellow-400',
    alert: 'text-red-400',
    nd:    'text-slate-400',
  }[s]
}

export function statusBg(s: ComplianceStatus): string {
  return {
    ok:    'bg-green-500/15 border-green-500/40',
    warn:  'bg-yellow-500/15 border-yellow-500/40',
    alert: 'bg-red-500/15 border-red-500/50',
    nd:    'bg-slate-700/40 border-slate-600/30',
  }[s]
}

export function statusLabel(s: ComplianceStatus): string {
  return {
    ok:    'CONFORME',
    warn:  'ATENCIÓN',
    alert: 'NO CONFORME',
    nd:    'SIN DATOS',
  }[s]
}

export function scoreToStatus(score: number): ComplianceStatus {
  if (score >= 90) return 'ok'
  if (score >= 70) return 'warn'
  if (score > 0)   return 'alert'
  return 'nd'
}
