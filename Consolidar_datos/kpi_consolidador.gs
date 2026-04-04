// ============================================================
// CONSOLIDADOR DE KPIs — Google Apps Script
// Versión : 1.0.0  |  Zona horaria : America/La_Paz
// ============================================================
//
//  INSTRUCCIONES DE USO
//  1. Copia este código en el editor de Apps Script de tu Hoja Maestra.
//  2. Reemplaza CONFIG.MASTER_ID con el ID de la Hoja Maestra.
//  3. Ajusta SOURCE_CONFIG por cada ID (headerRow, colFecha, etc.).
//     Deja null en los campos que quieras que el motor detecte solo.
//  4. Ejecuta diagnosticarFuente() para verificar el mapeo antes de
//     correr la consolidación completa.
//  5. Ejecuta consolidarManual() o usa el menú 📊 KPI Consolidador.
// ============================================================


// ─────────────────────────────────────────────────────────────
// 1. CONSTANTES GLOBALES
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  // ← Reemplaza con el ID real de tu Hoja Maestra
  MASTER_ID: 'REEMPLAZA_CON_ID_DE_HOJA_MAESTRA',

  SHEET_DATA: 'Datos',
  SHEET_LOG:  'Log',
  TIMEZONE:   'America/La_Paz',

  // Encabezados estándar de la hoja Datos
  HEADERS_MASTER: [
    'Fecha',
    'ValorIndicador',
    'Responsable',
    'TipoRegistro',
    'SourceId',
    'SheetName',
    'TimestampCarga',
  ],

  // Palabras clave para detección dinámica de columnas
  // (comparadas en minúsculas, sin tildes, contra cada encabezado)
  KEYWORDS: {
    fecha:       ['fecha', 'date', 'dia', 'periodo', 'mes', 'tiempo'],
    valor:       ['valor', 'indicador', 'resultado', 'kpi', 'metrica',
                  'cantidad', 'total', 'porcentaje', '%', 'dato'],
    responsable: ['responsable', 'nombre', 'encargado', 'usuario',
                  'colaborador', 'operador', 'tecnico', 'ejecutor'],
  },
};


// ─────────────────────────────────────────────────────────────
// 2. CONFIGURACIÓN POR ARCHIVO FUENTE
// ─────────────────────────────────────────────────────────────
//
//  Por cada ID puedes definir:
//    sheetName     — nombre de la hoja a leer (null = primera hoja)
//    headerRow     — número de fila (base 1) donde están los encabezados
//    colFecha      — número de columna (base 1) con la Fecha      (null = auto)
//    colValor      — número de columna (base 1) con el Indicador  (null = auto)
//    colResponsable — número de columna (base 1) con Responsable  (null = auto)
//
//  EJEMPLO con valores manuales:
//    '1d0prT3L...': { sheetName: 'Calidad', headerRow: 2,
//                     colFecha: 1, colValor: 4, colResponsable: 6 }

const SOURCE_CONFIG = {
  '1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK4o': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
  '1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs': {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  },
};


// ─────────────────────────────────────────────────────────────
// 3. UTILIDADES
// ─────────────────────────────────────────────────────────────

/**
 * Normaliza texto a minúsculas, sin tildes ni espacios extra.
 * Usado para comparar encabezados con palabras clave.
 * @param  {*}      value
 * @return {string}
 */
function normalizeText_(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Abre un SpreadSheet por ID de forma segura.
 * Ante cualquier fallo registra en errorBuffer y devuelve null.
 * @param  {string}   id
 * @param  {Object[]} errorBuffer
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet|null}
 */
function openSpreadsheet_(id, errorBuffer) {
  try {
    return SpreadsheetApp.openById(id);
  } catch (e) {
    errorBuffer.push({
      timestamp:  new Date(),
      sourceId:   id,
      fileName:   '(no disponible)',
      sheet:      '',
      stage:      'APERTURA',
      message:    e.message,
      row:        '',
    });
    return null;
  }
}

/**
 * Obtiene una hoja por nombre; si sheetName es null, devuelve la primera.
 * Registra el error en errorBuffer y devuelve null si no se encuentra.
 * @param  {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param  {string|null}  sheetName
 * @param  {string}       id
 * @param  {Object[]}     errorBuffer
 * @return {GoogleAppsScript.Spreadsheet.Sheet|null}
 */
function getSheet_(ss, sheetName, id, errorBuffer) {
  try {
    const sheet = sheetName
      ? ss.getSheetByName(sheetName)
      : ss.getSheets()[0];
    if (!sheet) throw new Error('Hoja "' + sheetName + '" no encontrada.');
    return sheet;
  } catch (e) {
    errorBuffer.push({
      timestamp:  new Date(),
      sourceId:   id,
      fileName:   ss.getName(),
      sheet:      sheetName || '(primera)',
      stage:      'HOJA',
      message:    e.message,
      row:        '',
    });
    return null;
  }
}

/**
 * Convierte cualquier valor de celda a un objeto Date de JavaScript.
 * Soporta: Date nativo, serial numérico de Sheets, cadenas comunes.
 * Devuelve null si el valor no es interpretable como fecha.
 * @param  {*}     value
 * @return {Date|null}
 */
function parseDate_(value) {
  if (value === null || value === undefined || value === '') return null;

  // Ya es Date nativo (Sheets lo entrega así para celdas de tipo fecha)
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Serial numérico: días desde 30-dic-1899 (comportamiento de Sheets)
  if (typeof value === 'number') {
    const MS_PER_DAY = 86400000;
    const SHEETS_EPOCH = new Date(Date.UTC(1899, 11, 30));
    const result = new Date(SHEETS_EPOCH.getTime() + value * MS_PER_DAY);
    return isNaN(result.getTime()) ? null : result;
  }

  // Cadena de texto: probar formatos regionales comunes
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return null;

    const FORMATS = [
      // DD/MM/YYYY  o  DD-MM-YYYY
      {
        re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
        fn: (m) => new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])),
      },
      // YYYY-MM-DD  o  YYYY/MM/DD
      {
        re: /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/,
        fn: (m) => new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])),
      },
      // DD/MM/YY  o  DD-MM-YY  (año de 2 dígitos → 2000+)
      {
        re: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
        fn: (m) => new Date(Date.UTC(2000 + +m[3], +m[2] - 1, +m[1])),
      },
    ];

    for (var i = 0; i < FORMATS.length; i++) {
      var match = s.match(FORMATS[i].re);
      if (match) {
        var d = FORMATS[i].fn(match);
        if (!isNaN(d.getTime())) return d;
      }
    }

    // Fallback: dejar que el motor nativo lo interprete
    var fallback = new Date(s);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  return null;
}

/**
 * Formatea un Date a 'YYYY-MM-DD' usando UTC para evitar desfases.
 * @param  {Date}   date
 * @return {string}
 */
function formatDateISO_(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  var y = date.getUTCFullYear();
  var m = String(date.getUTCMonth() + 1).padStart(2, '0');
  var d = String(date.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}


// ─────────────────────────────────────────────────────────────
// 4. MOTOR DE MAPEO HÍBRIDO (manual → dinámico)
// ─────────────────────────────────────────────────────────────

/**
 * Resuelve los índices de columna (base 0) para Fecha, Valor y Responsable.
 * Prioridad: valor manual en SOURCE_CONFIG → detección por palabras clave.
 * Devuelve null y registra en errorBuffer si faltan Fecha o Valor.
 *
 * @param  {string[]} headers     - Encabezados de la fila de cabecera
 * @param  {Object}   cfg         - Entrada de SOURCE_CONFIG para este archivo
 * @param  {string}   id          - ID del archivo fuente
 * @param  {string}   fileName    - Nombre legible del archivo
 * @param  {Object[]} errorBuffer
 * @return {{idxFecha:number, idxValor:number, idxResponsable:number}|null}
 */
function resolveColumnIndices_(headers, cfg, id, fileName, errorBuffer) {
  var normalized = headers.map(normalizeText_);

  // Busca el primer índice cuyo encabezado contenga alguna palabra clave
  function findByKeywords(keywords) {
    for (var i = 0; i < normalized.length; i++) {
      for (var k = 0; k < keywords.length; k++) {
        if (normalized[i].indexOf(keywords[k]) !== -1) return i;
      }
    }
    return -1;
  }

  // Convertir configuración base-1 a base-0; null → detección automática
  var idxFecha = (cfg.colFecha !== null && cfg.colFecha !== undefined)
    ? cfg.colFecha - 1
    : findByKeywords(CONFIG.KEYWORDS.fecha);

  var idxValor = (cfg.colValor !== null && cfg.colValor !== undefined)
    ? cfg.colValor - 1
    : findByKeywords(CONFIG.KEYWORDS.valor);

  var idxResponsable = (cfg.colResponsable !== null && cfg.colResponsable !== undefined)
    ? cfg.colResponsable - 1
    : findByKeywords(CONFIG.KEYWORDS.responsable);

  // Validar campos obligatorios
  var missing = [];
  if (idxFecha  === -1) missing.push('Fecha');
  if (idxValor  === -1) missing.push('ValorIndicador');

  if (missing.length > 0) {
    errorBuffer.push({
      timestamp:  new Date(),
      sourceId:   id,
      fileName:   fileName,
      sheet:      '',
      stage:      'MAPEO_COLUMNAS',
      message:    'No se encontraron columnas requeridas: ' + missing.join(', ') +
                  '. Encabezados detectados: [' + headers.join(' | ') + ']',
      row:        '',
    });
    return null;
  }

  return { idxFecha: idxFecha, idxValor: idxValor, idxResponsable: idxResponsable };
}


// ─────────────────────────────────────────────────────────────
// 5. LECTOR / TRANSFORMADOR POR ARCHIVO FUENTE
// ─────────────────────────────────────────────────────────────

/**
 * Abre un archivo fuente, mapea sus columnas y extrae las filas
 * transformadas al esquema maestro.
 * Nunca lanza excepción: cualquier fallo se registra en errorBuffer.
 *
 * @param  {string}   id
 * @param  {Object}   cfg         - Entrada de SOURCE_CONFIG
 * @param  {Object[]} errorBuffer
 * @return {Array[]}  Filas con 7 columnas listas para la hoja Datos
 */
function extractFromSource_(id, cfg, errorBuffer) {
  var rows      = [];
  var timestamp = new Date();

  // ── Apertura ──────────────────────────────────────────────
  var ss = openSpreadsheet_(id, errorBuffer);
  if (!ss) return rows;

  var fileName = ss.getName();

  // ── Obtener hoja ──────────────────────────────────────────
  var sheet = getSheet_(ss, cfg.sheetName, id, errorBuffer);
  if (!sheet) return rows;

  var sheetName = sheet.getName();

  // ── Verificar que haya datos ──────────────────────────────
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow <= cfg.headerRow || lastCol === 0) {
    errorBuffer.push({
      timestamp:  timestamp,
      sourceId:   id,
      fileName:   fileName,
      sheet:      sheetName,
      stage:      'SIN_DATOS',
      message:    'La hoja no tiene filas de datos después del encabezado (fila ' + cfg.headerRow + ').',
      row:        '',
    });
    return rows;
  }

  // ── Leer bloque completo ──────────────────────────────────
  var allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();

  // ── Encabezados ───────────────────────────────────────────
  var headerRowIdx = cfg.headerRow - 1;  // base-0
  var headers      = allData[headerRowIdx].map(String);

  // ── Mapeo de columnas ─────────────────────────────────────
  var indices = resolveColumnIndices_(headers, cfg, id, fileName, errorBuffer);
  if (!indices) return rows;

  var idxFecha       = indices.idxFecha;
  var idxValor       = indices.idxValor;
  var idxResponsable = indices.idxResponsable;

  var tsFormatted = Utilities.formatDate(timestamp, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

  // ── Iterar filas de datos ─────────────────────────────────
  for (var r = cfg.headerRow; r < allData.length; r++) {
    var row = allData[r];

    // Ignorar filas completamente vacías
    var isEmpty = true;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) {
        isEmpty = false;
        break;
      }
    }
    if (isEmpty) continue;

    // Parsear y validar fecha
    var parsedDate = parseDate_(row[idxFecha]);
    if (!parsedDate) {
      errorBuffer.push({
        timestamp:  timestamp,
        sourceId:   id,
        fileName:   fileName,
        sheet:      sheetName,
        stage:      'PARSE_FECHA',
        message:    'Valor de fecha no reconocido: "' + row[idxFecha] + '"',
        row:        r + 1,
      });
      continue;  // omitir fila con fecha inválida
    }

    var responsable = (idxResponsable >= 0 && idxResponsable < row.length)
      ? String(row[idxResponsable] != null ? row[idxResponsable] : '')
      : '';

    rows.push([
      formatDateISO_(parsedDate),   // Fecha (YYYY-MM-DD)
      row[idxValor] != null ? row[idxValor] : '',  // ValorIndicador
      responsable,                  // Responsable
      fileName,                     // TipoRegistro  (nombre del archivo origen)
      id,                           // SourceId
      sheetName,                    // SheetName
      tsFormatted,                  // TimestampCarga
    ]);
  }

  return rows;
}


// ─────────────────────────────────────────────────────────────
// 6. ESCRITURA EN HOJA MAESTRA — modo recarga total
// ─────────────────────────────────────────────────────────────

/**
 * Limpia la hoja Datos, reescribe encabezados con formato y vuelca
 * todas las filas consolidadas en una sola operación.
 * @param {Array[]} allRows
 */
function writeMaster_(allRows) {
  var ss    = SpreadsheetApp.openById(CONFIG.MASTER_ID);
  var sheet = ss.getSheetByName(CONFIG.SHEET_DATA);
  if (!sheet) sheet = ss.insertSheet(CONFIG.SHEET_DATA);

  // Recarga total: borrar todo el contenido previo
  sheet.clearContents();
  sheet.clearFormats();

  // Encabezados con formato visual
  var headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS_MASTER.length);
  headerRange
    .setValues([CONFIG.HEADERS_MASTER])
    .setFontWeight('bold')
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  // Datos en bloque (una sola llamada a setValues)
  if (allRows.length > 0) {
    sheet.getRange(2, 1, allRows.length, CONFIG.HEADERS_MASTER.length)
      .setValues(allRows);
  }

  sheet.autoResizeColumns(1, CONFIG.HEADERS_MASTER.length);

  // Fijar fila de encabezados
  sheet.setFrozenRows(1);
}


// ─────────────────────────────────────────────────────────────
// 7. ESCRITURA EN HOJA LOG
// ─────────────────────────────────────────────────────────────

/**
 * Agrega los eventos del errorBuffer a la hoja Log (append, no reemplaza).
 * Crea la hoja y los encabezados si aún no existen.
 * @param {Object[]} errorBuffer
 */
function writeLog_(errorBuffer) {
  if (!errorBuffer || errorBuffer.length === 0) return;

  var ss       = SpreadsheetApp.openById(CONFIG.MASTER_ID);
  var logSheet = ss.getSheetByName(CONFIG.SHEET_LOG);

  if (!logSheet) {
    logSheet = ss.insertSheet(CONFIG.SHEET_LOG);
    logSheet.getRange(1, 1, 1, 7)
      .setValues([['Timestamp', 'SourceId', 'Archivo', 'Hoja', 'Etapa', 'Mensaje', 'Fila']])
      .setFontWeight('bold')
      .setBackground('#ea4335')
      .setFontColor('#ffffff');
  }

  var logRows = errorBuffer.map(function(e) {
    return [
      Utilities.formatDate(e.timestamp, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
      e.sourceId,
      e.fileName,
      e.sheet,
      e.stage,
      e.message,
      e.row,
    ];
  });

  var lastRow = logSheet.getLastRow();
  logSheet.getRange(lastRow + 1, 1, logRows.length, 7).setValues(logRows);
}


// ─────────────────────────────────────────────────────────────
// 8. ORQUESTADOR PRINCIPAL
// ─────────────────────────────────────────────────────────────

/**
 * Recorre los 14 IDs, extrae datos de cada uno con tolerancia a fallos,
 * consolida todo en la hoja Datos y vuelca el log de errores/avisos.
 * @param  {boolean} silentMode  true = no mostrar alerta UI (para triggers)
 * @return {Object}  Resumen de la ejecución
 */
function consolidarKPIs_(silentMode) {
  var errorBuffer = [];
  var allRows     = [];
  var ids         = Object.keys(SOURCE_CONFIG);

  var summary = {
    totalIds:   ids.length,
    procesados: 0,
    filas:      0,
    errores:    0,
  };

  Logger.log('[INICIO] Consolidación de ' + ids.length + ' archivos fuente.');

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    Logger.log('[' + (i + 1) + '/' + ids.length + '] Procesando: ' + id);

    try {
      var rows = extractFromSource_(id, SOURCE_CONFIG[id], errorBuffer);
      for (var j = 0; j < rows.length; j++) allRows.push(rows[j]);
      summary.procesados++;
      summary.filas += rows.length;
      Logger.log('  → ' + rows.length + ' filas extraídas.');
    } catch (e) {
      // Captura cualquier error no manejado dentro de extractFromSource_
      summary.errores++;
      errorBuffer.push({
        timestamp:  new Date(),
        sourceId:   id,
        fileName:   '(error crítico)',
        sheet:      '',
        stage:      'ORQUESTADOR',
        message:    e.message,
        row:        '',
      });
      Logger.log('  [ERROR CRÍTICO] ' + e.message);
    }
  }

  // Escribir hoja Datos
  Logger.log('[ESCRITURA] ' + allRows.length + ' filas en hoja maestra...');
  writeMaster_(allRows);

  // Escribir Log si hay eventos
  if (errorBuffer.length > 0) {
    summary.errores += errorBuffer.length;
    Logger.log('[LOG] Registrando ' + errorBuffer.length + ' eventos...');
    writeLog_(errorBuffer);
  }

  var msg = 'Consolidación completada\n' +
            'Archivos procesados : ' + summary.procesados + '/' + summary.totalIds + '\n' +
            'Filas consolidadas  : ' + summary.filas + '\n' +
            'Errores / Avisos    : ' + summary.errores;

  Logger.log('[FIN] ' + msg.replace(/\n/g, ' | '));

  if (!silentMode) {
    SpreadsheetApp.getUi().alert('KPI Consolidador', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  }

  return summary;
}


// ─────────────────────────────────────────────────────────────
// 9. PUNTOS DE ENTRADA PÚBLICOS
// ─────────────────────────────────────────────────────────────

/**
 * Ejecución manual (desde el editor o el menú personalizado).
 * Muestra alerta con el resumen al finalizar.
 */
function consolidarManual() {
  consolidarKPIs_(false);
}

/**
 * Ejecución desde trigger programado.
 * No abre diálogos de UI para no bloquear el trigger.
 */
function consolidarTrigger() {
  consolidarKPIs_(true);
}

/**
 * Diagnóstico interactivo de un archivo fuente.
 * Muestra encabezados detectados y el mapeo calculado antes de hacer
 * la consolidación completa. Úsalo para calibrar SOURCE_CONFIG.
 *
 * @param {string} [idOverride]  Si se pasa, omite el prompt de UI.
 */
function diagnosticarFuente(idOverride) {
  var ui = SpreadsheetApp.getUi();
  var id = idOverride;

  if (!id) {
    var response = ui.prompt(
      'Diagnóstico de Fuente',
      'Ingresa el ID del archivo a inspeccionar:',
      ui.ButtonSet.OK_CANCEL
    );
    if (response.getSelectedButton() !== ui.Button.OK) return;
    id = response.getResponseText().trim();
  }
  if (!id) return;

  var cfg = SOURCE_CONFIG[id] || {
    sheetName: null, headerRow: 1,
    colFecha: null, colValor: null, colResponsable: null,
  };

  var errorBuffer = [];

  var ss = openSpreadsheet_(id, errorBuffer);
  if (!ss) {
    ui.alert('Error de apertura',
      'No se pudo abrir:\n' + id + '\n\n' + errorBuffer.map(function(e) { return e.message; }).join('\n'),
      ui.ButtonSet.OK);
    return;
  }

  var sheet = getSheet_(ss, cfg.sheetName, id, errorBuffer);
  if (!sheet) {
    ui.alert('Error de hoja',
      errorBuffer.map(function(e) { return e.message; }).join('\n'),
      ui.ButtonSet.OK);
    return;
  }

  var lastCol    = sheet.getLastColumn();
  var headerIdx  = cfg.headerRow;  // base-1 para getRange
  var headers    = sheet.getRange(headerIdx, 1, 1, lastCol).getValues()[0].map(String);
  var indices    = resolveColumnIndices_(headers, cfg, id, ss.getName(), errorBuffer);

  var report = 'Archivo  : ' + ss.getName() + '\n' +
               'Hoja     : ' + sheet.getName() + '\n' +
               'Encabezados (fila ' + cfg.headerRow + '):\n';

  for (var i = 0; i < headers.length; i++) {
    report += '  Col ' + (i + 1) + ': ' + headers[i] + '\n';
  }
  report += '\n';

  if (indices) {
    report += 'Mapeo calculado:\n';
    report += '  FECHA         → Col ' + (indices.idxFecha + 1)       + '  (' + (headers[indices.idxFecha]       || 'N/A') + ')\n';
    report += '  VALOR         → Col ' + (indices.idxValor + 1)       + '  (' + (headers[indices.idxValor]       || 'N/A') + ')\n';
    report += '  RESPONSABLE   → ' +
      (indices.idxResponsable >= 0
        ? 'Col ' + (indices.idxResponsable + 1) + '  (' + headers[indices.idxResponsable] + ')'
        : 'No detectado (campo opcional)') + '\n';
  } else {
    report += '⚠ Mapeo incompleto — ajusta SOURCE_CONFIG para este ID.\n';
    if (errorBuffer.length) {
      report += '\nEventos:\n' + errorBuffer.map(function(e) { return '  [' + e.stage + '] ' + e.message; }).join('\n');
    }
  }

  ui.alert('Diagnóstico: ' + ss.getName(), report, ui.ButtonSet.OK);
}

/**
 * Instala un trigger diario a las 06:00 AM.
 * Elimina triggers duplicados del mismo handler antes de crear el nuevo.
 * Ejecutar una sola vez desde el editor de Apps Script.
 */
function instalarTriggerDiario() {
  // Eliminar triggers previos para consolidarTrigger
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'consolidarTrigger') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('consolidarTrigger')
    .timeBased()
    .everyDays(1)
    .atHour(6)   // 06:00 AM  (hora del servidor de GAS; ajustar si necesario)
    .create();

  SpreadsheetApp.getUi().alert(
    'Trigger instalado',
    'La consolidación se ejecutará automáticamente cada día a las 06:00 AM.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Crea el menú personalizado al abrir la Hoja Maestra.
 * Se ejecuta automáticamente por el trigger onOpen de Apps Script.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 KPI Consolidador')
    .addItem('▶  Consolidar ahora',       'consolidarManual')
    .addSeparator()
    .addItem('🔍 Diagnosticar fuente',     'diagnosticarFuente')
    .addItem('⏰ Instalar trigger diario', 'instalarTriggerDiario')
    .addToUi();
}
