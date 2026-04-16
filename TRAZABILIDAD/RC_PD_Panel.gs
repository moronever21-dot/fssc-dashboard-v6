// Script principal: panel con selección por fuente y lote
// Operaciones de lote incluyen RC.PD.02 -> RC.PD.13
// + Consolidación automática hacia RC.PD.01 desde el link externo (14E6s93...)
//   leyendo la lista desde RC.PD.02!G6:G15 y trayendo por cada pestaña encontrada
//   el bloque A1:P[N] (filas dinámicas) pegándolo uno debajo del otro en RC.PD.01.
//
// AJUSTE IMPORTANTE:
// - Para no dañar el modelo ni mover celdas combinadas,
//   YA NO se limpia ni se rompen merges de todo el rango grande.
// - Ahora se trabaja SOLO BLOQUE POR BLOQUE.
// - Cada bloque destino se limpia de forma local y luego se replican sus merges.
//
// OBJETIVO:
// - Mantener fórmulas si la celda tiene fórmula
// - Mantener números como números
// - Mantener texto como texto
// - Mantener texto sin formato como texto sin formato
// - Mantener checkboxes y su marca
// - Mantener validaciones, notas, merges, estilos, alturas y anchos

const SOURCES = [
  { label: "RC.PD.01", id: "14E6s93GykPGqpVJH9f4gyKiXYV5yutpIvWOAFF7OmYg" },
  { label: "RC.PD.02", id: "1_aWiCwHrAx1bHpJ3twchTRwX0sCRtmwglVkPE7WrN04" },
  { label: "RC.PD.03", id: "1Ueb02r1KKiCSlsgr0DFm4LJNLSvHwMtpjsnMmLf82d8" },
  { label: "RC.PD.04", id: "1fOGAkJ1Yes7WDPusEEjbt71LBw6SP72bReHnCa44wKE" },
  { label: "RC.PD.05", id: "1l_WaU1PekIp_Cyk79jGhEGhtZkWJ0X6pOnupCnAhSQQ" },
  { label: "RC.PD.06", id: "17KcWzCQeIyGdsn9YNTjPNtqd7dq1kcB7aQVIGqXKyL8" },
  { label: "RC.PD.07", id: "1z7zUKc2-kS2BZA6e7Wakzuk0tgoBeV5_F8quvTu2qrA" },
  { label: "RC.PD.08", id: "1D9R19nsSb0bhqBgEWBCEbeDDdyOmpams8sLMhCAqdf4" },
  { label: "RC.PD.09", id: "1Ruel5WGlQtLjHIdXsX3LhV6bI3VaxiI4rk_C5qCNvlU" },
  { label: "RC.PD.10", id: "1IadQ8KERDI8rvKLBKervoSyaotP2Opdtu_n3FmgTJT4" },
  { label: "RC.PD.11", id: "1Ld8XA13BnSBYoJ6uMsQiptu7v_t4uKFdXwfBwtnFYaI" },
  { label: "RC.PD.12", id: "1W5eGAe2LOzIrQax_wLI386oZpDXQiAdp9rGgWxdqLQ4" },
  { label: "RC.PD.13", id: "1p9v0jkbcKgul_Ba40-2166b0vOucHh53U3qbp6aib0M" }
];

const EXTERNAL_RC_PD_01_ID = "14E6s93GykPGqpVJH9f4gyKiXYV5yutpIvWOAFF7OmYg";
const PAD_LEN_FOR_EXTERNAL_SHEETNAMES = 6;

const CONTROL_TIMESTAMP_CELL = "C3";

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("RC.PD Panel")
      .addItem("Abrir Panel", "showSidebar")
      .addToUi();
  } catch (e) {
    // Sin contexto UI (ejecución manual desde el editor) — se omite silenciosamente
  }
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("RC_PD_Sidebar")
    .setTitle("RC.PD Panel");
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Busca una pestaña en un spreadsheet ignorando espacios al inicio/fin y
 * diferencias de non-breaking space (\u00A0). Devuelve Sheet o null.
 */
function _getSheetByNameNorm_(ss, name) {
  const norm = String(name).replace(/\u00A0/g, " ").trim().toLowerCase();
  return ss.getSheets().find(sh => String(sh.getName()).replace(/\u00A0/g, " ").trim().toLowerCase() === norm) || null;
}

function pullSheetToMaster(label, sheetName) {
  try {
    const src = SOURCES.find(s => s.label === label);
    if (!src) return { success: false, error: "Fuente no configurada para " + label };

    const srcSS = SpreadsheetApp.openById(src.id);
    const sourceSheet = _getSheetByNameNorm_(srcSS, sheetName);
    if (!sourceSheet) return { success: false, error: "La pestaña '" + sheetName + "' no existe en el origen." };

    const master = SpreadsheetApp.getActiveSpreadsheet();
    const existingMasterSheet = master.getSheetByName(label);

    const tempSheet = sourceSheet.copyTo(master);
    // "Copy of [sheetName]" nunca colisiona con label → tmpName intermedio eliminado (−2 API calls/hoja)
    if (existingMasterSheet) {
      let targetIndex = null;
      try { targetIndex = existingMasterSheet.getIndex(); } catch (e) { targetIndex = null; }
      if (targetIndex !== null) {
        master.setActiveSheet(tempSheet);
        master.moveActiveSheet(targetIndex);
      }
      master.deleteSheet(existingMasterSheet);
    }

    try {
      tempSheet.setName(label);
    } catch (e) {
      return { success: false, error: "No se pudo renombrar la hoja copiada a '" + label + "'. Mensaje: " + e.message };
    }

    // tempSheet ya fue renombrado a label → usarlo directamente (evita getSheetByName extra)
    try { tempSheet.getRange(CONTROL_TIMESTAMP_CELL).setValue(new Date()); } catch (e) {}
    try { master.setActiveSheet(tempSheet); SpreadsheetApp.flush(); } catch (_e_) {}

    return { success: true, message: "Pestaña copiada y reemplazada en '" + label + "'." };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function getAllUniqueSheetNames() {
  try {
    const set = new Set();
    const rcPd02 = SOURCES.find(s => s.label === "RC.PD.02");
    if (!rcPd02) return { success: false, error: "RC.PD.02 no está configurada" };

    const ss = SpreadsheetApp.openById(rcPd02.id);
    ss.getSheets().forEach(sh => set.add(sh.getName()));

    const arr = Array.from(set).sort((a,b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
    return { success: true, names: arr };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function getSourcesContainingSheet(sheetName) {
  try {
    const result = [];
    // RC.PD: verificar si tiene la pestaña del lote
    SOURCES.forEach(src => {
      try {
        const ss = SpreadsheetApp.openById(src.id);
        if (_getSheetByNameNorm_(ss, sheetName)) result.push(src.label);
      } catch (e) {
        Logger.log("getSourcesContainingSheet PD error: " + src.label + ": " + e.message);
      }
    });
    // CC Grupo 1 (lote en nombre de pestaña): verificar si tiene la pestaña (normalizado)
    const CC_G1_LABELS = ["RC.CC.01","RC.CC.1.1","RC.CC.06","RC.CC.08","RC.CC.09","RC.CC.10","RC.CC.14","RC.CC.17"];
    CC_SOURCES.filter(s => CC_G1_LABELS.includes(s.label)).forEach(src => {
      try {
        const ss = SpreadsheetApp.openById(src.id);
        if (_getSheetByNameNorm_(ss, sheetName)) result.push(src.label);
      } catch (e) {
        Logger.log("getSourcesContainingSheet CC1 error: " + src.label + ": " + e.message);
      }
    });
    // CC Grupo 2 (lote en celda/tab híbrido): siempre se intentará consolidar
    // RC.CC.07 ya no va aquí — está en Grupo 1 (copyTo por nombre de pestaña)
    ["RC.CC.02","RC.CC.04","RC.CC.05","RC.CC.11","RC.CC.13"].forEach(label => {
      if (CC_SOURCES.find(s => s.label === label)) result.push(label + " (consolida)");
    });
    return { success: true, sources: result };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

/**
 * Paso A1a: RC.PD.02–13 (copyTo directo por nombre de pestaña).
 * Separado de A1b para garantizar que cada paso quede bajo el límite de 6 min:
 * 12 × ~8s = ~96s máx ≈ 1.6 min holgado.
 */
function pullLotePasoA1a(sheetName) {
  const results = [];
  // RC.PD.02-13 (índice 1 en adelante; RC.PD.01 → Paso B)
  for (let i = 1; i < SOURCES.length; i++) {
    const src = SOURCES[i];
    try {
      const r = pullSheetToMaster(src.label, sheetName);
      if (r.success) {
        results.push({ label: src.label, ok: true, message: r.message });
      } else if (!String(r.error || "").includes("no existe en el origen")) {
        results.push({ label: src.label, ok: false, message: r.error || "error" });
      }
    } catch (e) {
      results.push({ label: src.label, ok: false, message: "Error: " + e.message });
    }
  }
  SpreadsheetApp.flush();
  return { success: true, results: results };
}

/**
 * Paso A1b: RC.CC Grupo 1 (copyTo directo por nombre de pestaña).
 * Separado de A1a para garantizar que cada paso quede bajo el límite de 6 min:
 * 9 × ~8s = ~72s máx ≈ 1.2 min holgado.
 */
function pullLotePasoA1b(sheetName) {
  const results = [];
  const CC_GRUPO1 = ["RC.CC.01","RC.CC.1.1","RC.CC.06","RC.CC.07","RC.CC.08","RC.CC.09","RC.CC.10","RC.CC.14","RC.CC.17"];
  for (let i = 0; i < CC_SOURCES.length; i++) {
    const src = CC_SOURCES[i];
    if (!CC_GRUPO1.includes(src.label)) continue;
    try {
      const r = pullCCSheetToMaster(src.label, sheetName);
      if (r.success) {
        results.push({ label: src.label, ok: true, message: r.message });
      } else if (!String(r.error || "").includes("no existe en ")) {
        results.push({ label: src.label, ok: false, message: r.error || "error" });
      }
    } catch (e) {
      results.push({ label: src.label, ok: false, message: "Error: " + e.message });
    }
  }
  SpreadsheetApp.flush();
  return { success: true, results: results };
}

/**
 * Paso A2a: RC.CC.04 + RC.CC.11 (consolidación por nombre canónico de pestaña).
 * Separado de A2b (RC.CC.05) porque CC.05 puede tener 8+ tabs coincidentes
 * y necesita su propio margen de 6 min.
 */
function pullLotePasoA2a(sheetName) {
  const master  = SpreadsheetApp.getActiveSpreadsheet();
  const results = [];
  const _dims_ = {
    "RC.CC.04": { fixedRows: 37, fixedCols: 15, maxTabIndex: null },
    "RC.CC.11": { fixedRows: 27, fixedCols: 25, maxTabIndex: 21 }
  };
  ["RC.CC.04", "RC.CC.11"].forEach(function(label) {
    const src = CC_SOURCES.find(function(s) { return s.label === label; });
    if (!src) return;
    try {
      const cfg = _dims_[label];
      const srcSS = SpreadsheetApp.openById(src.id);
      const dst   = _prepararTabDestino_(master, label);
      try { master.setActiveSheet(dst); SpreadsheetApp.flush(); } catch (_e_) {}
      const state = { writeRow: 1, widthsCopied: false };
      _consolidarPorNombreTab_(srcSS, sheetName, dst, state, cfg.fixedRows, cfg.fixedCols, cfg.maxTabIndex);
      const m = state.matched || 0;
      results.push({ label: label, ok: true,
        message: m > 0 ? m + " hoja(s), " + (state.writeRow - 1) + " filas."
                       : "Sin coincidencias para '" + sheetName + "'." });
    } catch (e) {
      results.push({ label: label, ok: false, message: e.message });
    }
  });
  SpreadsheetApp.flush();
  return { success: true, results: results };
}

/**
 * Paso A2b: RC.CC.05 solo (PLLs por rango numérico).
 * RC.CC.05 puede coincidir con 8+ tabs por lote → necesita su propia ejecución.
 * Cada tab match: copyTo (~6s) + escribirBloque (~8s) = ~14s × 8 = ~112s máx.
 */
function pullLotePasoA2b(sheetName) {
  const master  = SpreadsheetApp.getActiveSpreadsheet();
  const results = [];
  const src = CC_SOURCES.find(function(s) { return s.label === "RC.CC.05"; });
  if (src) {
    try {
      const srcSS = SpreadsheetApp.openById(src.id);
      const dst   = _prepararTabDestino_(master, "RC.CC.05");
      try { master.setActiveSheet(dst); SpreadsheetApp.flush(); } catch (_e_) {}
      const state = { writeRow: 1, widthsCopied: false };
      _consolidarPorNombreTab_(srcSS, sheetName, dst, state, null, null, null);
      const m = state.matched || 0;
      results.push({ label: "RC.CC.05", ok: true,
        message: m > 0 ? m + " hoja(s), " + (state.writeRow - 1) + " filas."
                       : "Sin coincidencias para '" + sheetName + "'." });
    } catch (e) {
      results.push({ label: "RC.CC.05", ok: false, message: e.message });
    }
  }
  SpreadsheetApp.flush();
  return { success: true, results: results };
}

/**
 * Paso B1: RC.PD.01 únicamente.
 * Separado de B2 porque el fallback (consolidarRC_PD_01_desdeLink) puede
 * copiar hasta 10 hojas = ~150s — necesita su propio margen de 6 min.
 *
 * Intenta primero copyTo directo (pestaña = nombre del lote).
 * Si no existe esa pestaña en RC.PD.01, recae en consolidarRC_PD_01_desdeLink
 * que lee la lista desde RC.PD.02!G6:G15.
 */
function pullLotePasoB1(sheetName) {
  const results = [];
  try {
    const rDirect = pullSheetToMaster("RC.PD.01", sheetName);
    if (rDirect.success) {
      results.push({ label: "RC.PD.01", ok: true, message: rDirect.message });
    } else if (String(rDirect.error || "").includes("no existe en el origen")) {
      const r = consolidarRC_PD_01_desdeLink();
      results.push({ label: "RC.PD.01", ok: r.success,
        message: r.success ? r.message : (r.error || "error") });
    } else {
      results.push({ label: "RC.PD.01", ok: false, message: rDirect.error || "error" });
    }
  } catch (e) {
    results.push({ label: "RC.PD.01", ok: false, message: e.message });
  }
  SpreadsheetApp.flush();
  return { success: true, results: results };
}

/**
 * Paso B2: RC.CC.02 + RC.CC.13 (lote identificado por celda interna).
 * Separado de B1 para que la posible consolidación lenta de RC.PD.01
 * no acumule tiempo con estos dos registros.
 *
 * NOTA: RC.CC.04/05/11/07 NO van aquí — ya cubiertos por Pasos A.
 */
function pullLotePasoB2(sheetName) {
  const master  = SpreadsheetApp.getActiveSpreadsheet();
  const results = [];

  // ── RC.CC.02: lote en celda C7 ─────────────────────────────────────────────
  try {
    const src = CC_SOURCES.find(function(s) { return s.label === "RC.CC.02"; });
    if (src) {
      const srcSS = SpreadsheetApp.openById(src.id);
      const dst   = _prepararTabDestino_(master, "RC.CC.02");
      try { master.setActiveSheet(dst); SpreadsheetApp.flush(); } catch (_e_) {}
      const state = { writeRow: 1, widthsCopied: false };
      _consolidarPorCelda_(srcSS, "RC.CC.02", sheetName, "C7",
                           1, 1, 19, 100, dst, state, null, null);
      const m = state.matched || 0;
      results.push({ label: "RC.CC.02", ok: true,
        message: m > 0 ? m + " hoja(s), " + (state.writeRow - 1) + " filas."
                       : "Sin coincidencias — lote '" + sheetName + "' no encontrado en C7." });
    }
  } catch (e) {
    results.push({ label: "RC.CC.02", ok: false, message: e.message });
  }

  // ── RC.CC.13: lote en celda D9 ─────────────────────────────────────────────
  try {
    const src13 = CC_SOURCES.find(function(s) { return s.label === "RC.CC.13"; });
    if (src13) {
      const srcSS13 = SpreadsheetApp.openById(src13.id);
      const dst13   = _prepararTabDestino_(master, "RC.CC.13");
      try { master.setActiveSheet(dst13); SpreadsheetApp.flush(); } catch (_e_) {}
      const state13 = { writeRow: 1, widthsCopied: false };
      _consolidarPorCelda_(srcSS13, "RC.CC.13", sheetName, "D9",
                           1, 1, null, null, dst13, state13, null, null);
      const m13 = state13.matched || 0;
      results.push({ label: "RC.CC.13", ok: true,
        message: m13 > 0 ? m13 + " hoja(s), " + (state13.writeRow - 1) + " filas."
                         : "Sin coincidencias — lote '" + sheetName + "' no encontrado en D9." });
    }
  } catch (e) {
    results.push({ label: "RC.CC.13", ok: false, message: e.message });
  }

  SpreadsheetApp.flush();
  return { success: true, results: results };
}

// pullLotePorCelda mantenida como alias para compatibilidad con llamadas directas desde editor
function pullLotePorCelda(sheetName) {
  const r1 = pullLotePasoB1(sheetName);
  const r2 = pullLotePasoB2(sheetName);
  return { success: true, results: (r1.results || []).concat(r2.results || []) };
}

function pushMasterToSource(label, sheetName) {
  try {
    const master = SpreadsheetApp.getActiveSpreadsheet();
    const masterSheet = master.getSheetByName(label);
    if (!masterSheet) return { success: false, error: "La hoja '" + label + "' no existe en el master." };

    const src = SOURCES.find(s => s.label === label);
    if (!src) return { success: false, error: "Fuente no configurada para " + label };

    const srcSS = SpreadsheetApp.openById(src.id);
    const temp = masterSheet.copyTo(srcSS);

    const tmpName = makeSafeSheetName("__tmp__push__" + label + "__" + Date.now());
    try { temp.setName(tmpName); } catch (e) {}

    const existing = srcSS.getSheetByName(sheetName);
    if (existing) srcSS.deleteSheet(existing);

    try {
      temp.setName(sheetName);
    } catch (e) {
      return { success: false, error: "No se pudo renombrar la hoja copiada en el origen: " + e.message };
    }

    return { success: true, message: "Sincronizado master → origen: " + label + " → " + sheetName };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

function makeSafeSheetName(name) {
  const cleaned = name.replace(/[\\\/\?\*\[\]\:]/g, "-");
  return cleaned.substring(0, 100);
}

/* =========================
   CONSOLIDACIÓN RESPETANDO TIPOS
   ========================= */

function _padLeftZeros_(value, len) {
  const s = String(value);
  if (s.length >= len) return s;
  return ("0".repeat(len - s.length)) + s;
}

function _normalizeExternalSheetName_(s) {
  const cleaned = String(s || "").replace(/\u00A0/g, " ").trim();
  if (!cleaned) return "";
  if (/^\d+$/.test(cleaned) && cleaned.length < PAD_LEN_FOR_EXTERNAL_SHEETNAMES) {
    return _padLeftZeros_(cleaned, PAD_LEN_FOR_EXTERNAL_SHEETNAMES);
  }
  return cleaned;
}

function _copyColumnWidths_(srcSheet, dstSheet, srcStartCol, dstStartCol, numCols) {
  for (let j = 0; j < numCols; j++) {
    dstSheet.setColumnWidth(dstStartCol + j, srcSheet.getColumnWidth(srcStartCol + j));
  }
}

function consolidarRC_PD_01_desdeLink() {
  try {
    const master = SpreadsheetApp.getActiveSpreadsheet();

    const listSheet = master.getSheetByName("RC.PD.02");
    if (!listSheet) return { success: false, error: "No existe la hoja 'RC.PD.02' en la hoja base." };

    const names = listSheet.getRange("G6:G15").getDisplayValues().flat()
      .map(v => _normalizeExternalSheetName_(v))
      .filter(v => v !== "");

    const extSS = SpreadsheetApp.openById(EXTERNAL_RC_PD_01_ID);

    // Normalizar también las claves del mapa para que coincidan con los nombres normalizados
    const map = {};
    extSS.getSheets().forEach(sh => {
      map[_normalizeExternalSheetName_(sh.getName())] = sh;
    });

    const numCols = 16; // A:P = ancho fijo del formulario RC.PD.01

    const found   = [];
    const missing = [];

    // Preparar hoja destino: limpia contenido, formato y filas sobrantes del lote anterior
    const target = _prepararTabDestino_(master, "RC.PD.01");
    try { master.setActiveSheet(target); SpreadsheetApp.flush(); } catch (_e_) {}

    let writeRow     = 1;
    let widthsCopied = false;

    // ── Pre-cachear todas las hojas encontradas antes del loop ───────────────────
    // Evita N interleaves copyTo→format→delete. Todas las copies del mismo SS externo
    // se hacen primero en lote, luego _escribirBloque_ las reutiliza vía ssCache.
    const _pd01Cache_ = new Map();
    const _namesToCopy_ = names.filter(function(n) { return !!map[n]; });
    if (_namesToCopy_.length > 0) {
      const _sheetMapPD01_ = {};
      _namesToCopy_.forEach(function(normName) {
        const _sh_ = map[normName];
        try {
          const _lc_ = _sh_.copyTo(master);
          const _origName_ = _sh_.getName();
          try { _lc_.setName('__ssc__pd01__' + _origName_.slice(0, 20)); } catch(_e_) {}
          _sheetMapPD01_[_origName_] = _lc_;
        } catch(_e_) {}
      });
      _pd01Cache_.set(EXTERNAL_RC_PD_01_ID, { sheets: _sheetMapPD01_ });
    }

    names.forEach(function(name) {
      const srcSh = map[name];
      if (!srcSh) { missing.push(name); return; }

      const srcNumRows = 45; // A1:P45 — rango fijo del formulario RC.PD.01
      const wrote = _escribirBloque_(srcSh, 1, 1, srcNumRows, numCols,
                                     target, writeRow, 1, !widthsCopied, _pd01Cache_);
      if (!widthsCopied) widthsCopied = true;
      found.push(name);
      writeRow += wrote;
      // Navegar a RC.PD.01 después de cada bloque pegado (live-view B1-fallback)
      try { master.setActiveSheet(target); SpreadsheetApp.flush(); } catch(_e_) {}
    });

    // Limpiar hojas del caché RC.PD.01
    if (_pd01Cache_.has(EXTERNAL_RC_PD_01_ID)) {
      const _ePD01_ = _pd01Cache_.get(EXTERNAL_RC_PD_01_ID);
      Object.keys(_ePD01_.sheets).forEach(function(k) {
        try { master.deleteSheet(_ePD01_.sheets[k]); } catch(_ce_) {}
      });
    }

    return {
      success: true,
      message: "Consolidado RC.PD.01 OK. Encontradas: " + found.length +
               " | Bloques pegados: " + found.length + " | Filas totales: " + (writeRow - 1) + ".",
      foundSheets:   found,
      missingSheets: missing,
      blocksWritten: found.length,
      rowsWritten:   writeRow - 1,
      namesRead:     names
    };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

/* =========================
   RC.CC — CONTROL DE CALIDAD
   Estructura paralela a RC.PD:
   - Cada fuente CC = un registro (RC.CC.01, RC.CC.02, ...)
   - Cada pestaña dentro = un lote de proveedor ("RG 01-CV", etc.)
   - Al jalar un lote, el master recibe pestañas "RC.CC.01", "RC.CC.06", etc.
   - Nombres distintos a RC.PD → no hay conflicto
   ========================= */

const CC_SOURCES = [
  { label: "RC.CC.01",  id: "1d0prT3LWszhEhg4zvmgBxQf4bxrLz_e7kF8AAhNijcE" },
  { label: "RC.CC.1.1", id: "1YhGfSrQ3YtOL535wnerlmCYNxPni8ThzX41WDfy-Fs4" },
  { label: "RC.CC.02",  id: "180CSHCjVKgng9xKAYFTthUfNr_qhNKeGuEXjIPF7tLU" },
  { label: "RC.CC.04",  id: "1HHW21Eql5j_AlgWrEg92hquBqkEo6t7wCiqpZ2fO_8g" },
  { label: "RC.CC.05",  id: "19tAPT8hR8gUziLQNxVL5V0eo866C4IUr9ljzXWI5mnA" },
  { label: "RC.CC.06",  id: "1Azuyxj2TNKLmNzqx6QvYCLHTlF9v7xr3CJkK0_mt0uI" },
  { label: "RC.CC.07",  id: "1o9WflLxWc2CzcMb_kbXVAq7aGCvfWDx-aVqKAkDsRR0" },
  { label: "RC.CC.08",  id: "1QEiNvG3e4qz9REdlro3O5_7oI26uwy92VwpHFabgCPM" },
  { label: "RC.CC.09",  id: "1UNmL2BFzyBM-MXShC5lpxaMOstnkLh3NO8lXJeQyK5o" },
  { label: "RC.CC.10",  id: "1OKBjSUd7rIdDkHs2fh6Jmp2vudXVcLjtBcq43r7J4CU" },
  { label: "RC.CC.11",  id: "1apbRKPoVq8OXEYfGviZXBRkMvGc-W9Rdy--9RwDXVwI" },
  { label: "RC.CC.13",  id: "1xCVOvIesYySTqYB9qbroVoJtCHhfgPd6Wo0xg5ceZq0" },
  { label: "RC.CC.14",  id: "16mBCHcPztf_YGDI_zqmU5idmzllhw40-rIpyleZgLI0" },
  { label: "RC.CC.17",  id: "1ZRXfyPBLpqDc0ycwpEG_nkhWd36kCT78calkszVeSvs" },
];

/** Copia la pestaña loteName del registro ccLabel al master
 *  con el nombre ccLabel (p.ej. "RC.CC.06")
 *  — paralelo a pullSheetToMaster() */
function pullCCSheetToMaster(ccLabel, loteName) {
  try {
    const src = CC_SOURCES.find(s => s.label === ccLabel);
    if (!src) return { success: false, error: "Fuente CC no configurada: " + ccLabel };

    const srcSS = SpreadsheetApp.openById(src.id);
    const sourceSheet = _getSheetByNameNorm_(srcSS, loteName);
    if (!sourceSheet) return { success: false, error: "La pestaña '" + loteName + "' no existe en " + ccLabel };

    const master = SpreadsheetApp.getActiveSpreadsheet();
    const existingMasterSheet = master.getSheetByName(ccLabel);
    const tempSheet = sourceSheet.copyTo(master);
    // "Copy of [loteName]" nunca colisiona con ccLabel → tmpName intermedio eliminado (−2 API calls/hoja)
    if (existingMasterSheet) {
      let targetIndex = null;
      try { targetIndex = existingMasterSheet.getIndex(); } catch (e) {}
      if (targetIndex !== null) {
        master.setActiveSheet(tempSheet);
        master.moveActiveSheet(targetIndex);
      }
      master.deleteSheet(existingMasterSheet);
    }

    try {
      tempSheet.setName(ccLabel);
    } catch (e) {
      return { success: false, error: "No se pudo renombrar a '" + ccLabel + "': " + e.message };
    }
    try { master.setActiveSheet(tempSheet); SpreadsheetApp.flush(); } catch (_e_) {}

    return { success: true, message: "'" + loteName + "' de " + ccLabel + " copiado al master." };
  } catch (e) {
    return { success: false, error: e.message || String(e) };
  }
}

/* =========================
   CONSOLIDACIÓN RC.CC — REGISTROS CON LOTE EN CELDA
   Para registros donde el nombre del lote NO está en el nombre de la pestaña
   sino en una celda específica dentro de cada hoja.
   Se apilan los bloques encontrados uno debajo del otro en una pestaña
   del master con el nombre del REGISTRO (ej: "RC.CC.02").
   ========================= */

/**
 * Escribe un bloque (srcSheet, rango) al destino dstSheet en writeRow.
 * Estrategia: copia srcSheet completa al master como hoja temporal (mismo SS),
 * luego opera intra-SS → DataValidation (checkboxes), bordes, merges y formatos
 * se copian con plena fidelidad, igual que pullSheetToMaster / pullCCSheetToMaster.
 *
 * Optimización de caché: si se pasa `ssCache` (Map de ssId → Sheet temporal ya copiada
 * en el master), la copia del SS externo se reutiliza entre bloques del mismo SS.
 * Esto evita N copyTo por cada hoja coincidente del mismo spreadsheet externo.
 *
 * @param {Map|null} ssCache - cache opcional { ssId → {tmpSS, sheets} } manejado externamente
 * @returns número de filas escritas
 */
function _escribirBloque_(srcSheet, srcStartRow, srcStartCol, srcNumRows, numCols,
                          dstSheet, writeRow, dstStartCol, copyWidths, ssCache) {
  // ── Obtener _tmpSh_ PRIMERO — convierte getMaxRows/Cols de cross-SS a intra-SS ──
  // Al mover la adquisición aquí, podemos usar _tmpSh_ (copia local en el mismo SS)
  // para las lecturas de dimensión, evitando 2 llamadas cross-SS por bloque.
  var master = dstSheet.getParent();
  var _srcSheetName_ = srcSheet.getName();
  var _srcSsId_ = null;
  try { _srcSsId_ = srcSheet.getParent().getId(); } catch(_e_) {}

  var _tmpSh_ = null;
  var _usedCache_ = false;
  if (ssCache && _srcSsId_ && ssCache.has(_srcSsId_)) {
    // Reutilizar hoja del SS externo ya copiado al master (mismo SS → intra-SS)
    var _cachedEntry_ = ssCache.get(_srcSsId_);
    try {
      _tmpSh_ = _cachedEntry_.sheets[_srcSheetName_] || null;
      if (_tmpSh_) _usedCache_ = true;
    } catch(_e_) { _tmpSh_ = null; }
  }
  if (!_tmpSh_) {
    try { _tmpSh_ = srcSheet.copyTo(master); } catch(_ce_) {}
  }

  // ── Clamp a dimensiones reales — usar _tmpSh_ (intra-SS) para evitar cross-SS ──
  var _dimSh_ = _tmpSh_ || srcSheet;
  var shMaxR = _dimSh_.getMaxRows();
  var shMaxC = _dimSh_.getMaxColumns();
  // Si srcNumRows / numCols llega null/undefined, leer desde _dimSh_ ya disponible
  // (intra-SS cuando _tmpSh_ existe → evita llamadas getLastRow/getLastColumn cross-SS)
  if (srcNumRows === null || srcNumRows === undefined) {
    try { srcNumRows = (_dimSh_.getLastRow() || 1); } catch(_lre_) { srcNumRows = shMaxR; }
  }
  if (numCols === null || numCols === undefined) {
    try { numCols = (_dimSh_.getLastColumn() || 1); } catch(_lce_) { numCols = shMaxC; }
  }
  var actualRows = Math.max(1, Math.min(srcNumRows, shMaxR - srcStartRow + 1));
  var actualCols = Math.max(1, Math.min(numCols,    shMaxC - srcStartCol + 1));

  // ── Expandir hoja destino si no tiene suficientes filas/columnas ─────────────
  var _dstMaxR_ = dstSheet.getMaxRows();
  var _dstMaxC_ = dstSheet.getMaxColumns();
  var _neededR_ = writeRow + actualRows - 1;
  var _neededC_ = dstStartCol + actualCols - 1;
  if (_neededR_ > _dstMaxR_) {
    try { dstSheet.insertRowsAfter(_dstMaxR_, _neededR_ - _dstMaxR_); } catch(_e_) {}
  }
  if (_neededC_ > _dstMaxC_) {
    try { dstSheet.insertColumnsAfter(_dstMaxC_, _neededC_ - _dstMaxC_); } catch(_e_) {}
  }

  var dstRange = dstSheet.getRange(writeRow, dstStartCol, actualRows, actualCols);
  try { dstRange.breakApart(); } catch(_e_) {}

  if (_tmpSh_) {
    var tmpRange = _tmpSh_.getRange(srcStartRow, srcStartCol, actualRows, actualCols);

    // Paso 1: Formato completo intra-SS (bordes, fondos, fuentes, merges)
    try {
      tmpRange.copyTo(dstRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    } catch(_fe_) {
      try { dstRange.setBackgrounds(tmpRange.getBackgrounds());                   } catch(_e_) {}
      try { dstRange.setFontColors(tmpRange.getFontColors());                     } catch(_e_) {}
      try { dstRange.setFontWeights(tmpRange.getFontWeights());                   } catch(_e_) {}
      try { dstRange.setFontSizes(tmpRange.getFontSizes());                       } catch(_e_) {}
      try { dstRange.setFontFamilies(tmpRange.getFontFamilies());                 } catch(_e_) {}
      try { dstRange.setFontStyles(tmpRange.getFontStyles());                     } catch(_e_) {}
      try { dstRange.setHorizontalAlignments(tmpRange.getHorizontalAlignments()); } catch(_e_) {}
      try { dstRange.setVerticalAlignments(tmpRange.getVerticalAlignments());     } catch(_e_) {}
      try { dstRange.setWraps(tmpRange.getWraps());                               } catch(_e_) {}
      try { dstRange.setWrapStrategies(tmpRange.getWrapStrategies());             } catch(_e_) {}
    }
    // WrapStrategy explícito post-PASTE_FORMAT (OVERFLOW/WRAP/CLIP)
    try { dstRange.setWrapStrategies(tmpRange.getWrapStrategies()); } catch(_e_) {}

    // Paso 1b: DataValidation / checkboxes — intra-SS: funciona con plena fidelidad
    try {
      tmpRange.copyTo(dstRange, SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    } catch(_dve_) {}

    // PASTE_FORMAT re-aplicó merges → soltar antes de setValues
    try { dstRange.breakApart(); } catch(_ba2_) {}

    // Paso 2: Valores con normalización texto→número (preserva leading zeros como texto)
    var _vals_;
    try { _vals_ = tmpRange.getValues(); } catch(_gve_) {}
    if (_vals_) {
      for (var _ri_ = 0; _ri_ < _vals_.length; _ri_++) {
        for (var _ci_ = 0; _ci_ < _vals_[_ri_].length; _ci_++) {
          var _cv_ = _vals_[_ri_][_ci_];
          if (typeof _cv_ !== 'string' || _cv_.trim() === '') continue;
          var _s_ = _cv_.trim();
          if (_s_.length > 1 && _s_[0] === '0' && _s_[1] !== '.') continue;
          var _p_;
          if      (/^-?\d+(\.\d+)?$/.test(_s_))  _p_ = Number(_s_);
          else if (/^-?\d+,\d+$/.test(_s_))       _p_ = Number(_s_.replace(',', '.'));
          else continue;
          if (!isNaN(_p_)) _vals_[_ri_][_ci_] = _p_;
        }
      }
      try { dstRange.setValues(_vals_); } catch(_sve_) {}
    }

    // Paso 3: Merges backup (PASTE_FORMAT los copió; este es el seguro)
    try {
      var merges = tmpRange.getMergedRanges();
      merges.forEach(function(mg) {
        var relR1 = mg.getRow()        - srcStartRow;
        var relC1 = mg.getColumn()     - srcStartCol;
        var relR2 = mg.getLastRow()    - srcStartRow;
        var relC2 = mg.getLastColumn() - srcStartCol;
        if (relR1 < 0 || relC1 < 0 || relR2 >= actualRows || relC2 >= actualCols) return;
        try {
          dstSheet.getRange(
            writeRow   + relR1, dstStartCol + relC1,
            relR2 - relR1 + 1,  relC2 - relC1 + 1
          ).merge();
        } catch(_me_) {}
      });
    } catch(_e_) {}

    // Paso 4: Restaurar bordes completos — breakApart() puede haber limpiado
    // bordes interiores y exteriores de celdas combinadas. Un segundo PASTE_FORMAT
    // los restaura sin tocar valores (ya escritos). La temp sigue existiendo → intra-SS.
    try {
      tmpRange.copyTo(dstRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    } catch(_fe2_) {}
    // Restaurar wrap strategy (PASTE_FORMAT puede resetear OVERFLOW/WRAP/CLIP)
    try { dstRange.setWrapStrategies(tmpRange.getWrapStrategies()); } catch(_e_) {}

    // ── Anchos de columna: PASTE_COLUMN_WIDTHS (1 llamada intra-SS) ──────────────
    // Reemplaza N lecturas getColumnWidth + N escrituras setColumnWidth → 1 API call.
    if (copyWidths) {
      try {
        tmpRange.copyTo(dstRange, SpreadsheetApp.CopyPasteType.PASTE_COLUMN_WIDTHS, false);
      } catch(_cwe_) {
        // Fallback manual si PASTE_COLUMN_WIDTHS no esta disponible
        for (var _pcw_ = 0; _pcw_ < actualCols; _pcw_++) {
          try { dstSheet.setColumnWidth(dstStartCol + _pcw_, _tmpSh_.getColumnWidth(srcStartCol + _pcw_)); } catch(_e_) {}
        }
      }
    }

    // ── Alturas de fila: lectura 2-puntos + setRowHeights batch ──────────────────
    // Lee 1ra y ultima fila. Si iguales: formulario uniforme -> 1 llamada setRowHeights.
    // Si difieren: leer todas N -> agrupar consecutivas iguales -> setRowHeights por grupo.
    // Para plantillas FSSC uniformes: de N*2 llamadas -> 2-3 llamadas por bloque.
    var _firstH_ = 21;
    try { _firstH_ = _tmpSh_.getRowHeight(srcStartRow) || 21; } catch(_e_) {}
    var _lastH_ = _firstH_;
    if (actualRows > 1) {
      try { _lastH_ = _tmpSh_.getRowHeight(srcStartRow + actualRows - 1) || 21; } catch(_e_) {}
    }
    if (_firstH_ === _lastH_) {
      // Todas las filas tienen la misma altura -- 1 sola llamada API
      if (_firstH_ !== 21) {
        try { dstSheet.setRowHeights(writeRow, actualRows, _firstH_); } catch(_e_) {}
      }
    } else {
      // Alturas mixtas -- leer todas y aplicar en grupos consecutivos
      var _allH_ = [_firstH_];
      for (var _phi_ = 1; _phi_ < actualRows - 1; _phi_++) {
        try { _allH_.push(_tmpSh_.getRowHeight(srcStartRow + _phi_) || 21); } catch(_e_) { _allH_.push(21); }
      }
      _allH_.push(_lastH_);
      var _rhi_ = 0;
      while (_rhi_ < _allH_.length) {
        var _rh_ = _allH_[_rhi_] || 21;
        var _cnt_ = 1;
        while (_rhi_ + _cnt_ < _allH_.length && (_allH_[_rhi_ + _cnt_] || 21) === _rh_) _cnt_++;
        if (_rh_ !== 21) {
          try { dstSheet.setRowHeights(writeRow + _rhi_, _cnt_, _rh_); } catch(_e_) {}
        }
        _rhi_ += _cnt_;
      }
    }

    // Limpieza: eliminar hoja temporal solo si NO viene del cache
    // (las hojas del cache las elimina quien llama, al final del loop)
    if (!_usedCache_) {
      try { master.deleteSheet(_tmpSh_); } catch(_de_) {}
    }

  } else {
    // ── Fallback cross-SS (si copyTo del sheet entero fallo) ─────────────────────
    var srcRange = srcSheet.getRange(srcStartRow, srcStartCol, actualRows, actualCols);
    try {
      srcRange.copyTo(dstRange, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
    } catch(_fe_) {
      try { dstRange.setNumberFormats(srcRange.getNumberFormats());               } catch(_e_) {}
      try { dstRange.setBackgrounds(srcRange.getBackgrounds());                   } catch(_e_) {}
      try { dstRange.setFontColors(srcRange.getFontColors());                     } catch(_e_) {}
      try { dstRange.setFontWeights(srcRange.getFontWeights());                   } catch(_e_) {}
      try { dstRange.setFontSizes(srcRange.getFontSizes());                       } catch(_e_) {}
      try { dstRange.setFontFamilies(srcRange.getFontFamilies());                 } catch(_e_) {}
      try { dstRange.setFontStyles(srcRange.getFontStyles());                     } catch(_e_) {}
      try { dstRange.setHorizontalAlignments(srcRange.getHorizontalAlignments()); } catch(_e_) {}
      try { dstRange.setVerticalAlignments(srcRange.getVerticalAlignments());     } catch(_e_) {}
      try { dstRange.setWraps(srcRange.getWraps());                               } catch(_e_) {}
      try { dstRange.setWrapStrategies(srcRange.getWrapStrategies());             } catch(_e_) {}
    }
    try { dstRange.setWrapStrategies(srcRange.getWrapStrategies()); } catch(_e_) {}
    try { dstRange.breakApart(); } catch(_ba2_) {}
    var _vals2_;
    try { _vals2_ = srcRange.getValues(); } catch(_gve_) {}
    if (_vals2_) {
      for (var _ri2_ = 0; _ri2_ < _vals2_.length; _ri2_++) {
        for (var _ci2_ = 0; _ci2_ < _vals2_[_ri2_].length; _ci2_++) {
          var _cv2_ = _vals2_[_ri2_][_ci2_];
          if (typeof _cv2_ !== 'string' || _cv2_.trim() === '') continue;
          var _s2_ = _cv2_.trim();
          if (_s2_.length > 1 && _s2_[0] === '0' && _s2_[1] !== '.') continue;
          var _p2_;
          if      (/^-?\d+(\.\d+)?$/.test(_s2_))  _p2_ = Number(_s2_);
          else if (/^-?\d+,\d+$/.test(_s2_))       _p2_ = Number(_s2_.replace(',', '.'));
          else continue;
          if (!isNaN(_p2_)) _vals2_[_ri2_][_ci2_] = _p2_;
        }
      }
      try { dstRange.setValues(_vals2_); } catch(_sve_) {}
    }
    try {
      var merges2 = srcRange.getMergedRanges();
      merges2.forEach(function(mg) {
        var relR1 = mg.getRow()        - srcStartRow;
        var relC1 = mg.getColumn()     - srcStartCol;
        var relR2 = mg.getLastRow()    - srcStartRow;
        var relC2 = mg.getLastColumn() - srcStartCol;
        if (relR1 < 0 || relC1 < 0 || relR2 >= actualRows || relC2 >= actualCols) return;
        try {
          dstSheet.getRange(
            writeRow   + relR1, dstStartCol + relC1,
            relR2 - relR1 + 1,  relC2 - relC1 + 1
          ).merge();
        } catch(_me_) {}
      });
    } catch(_e_) {}
    // Fallback: anchos y alturas cross-SS
    if (copyWidths) {
      _copyColumnWidths_(srcSheet, dstSheet, srcStartCol, dstStartCol, actualCols);
    }
    for (var _rhi2_ = 0; _rhi2_ < actualRows; _rhi2_++) {
      try {
        var _rh2_ = srcSheet.getRowHeight(srcStartRow + _rhi2_) || 21;
        if (_rh2_ !== 21) dstSheet.setRowHeight(writeRow + _rhi2_, _rh2_);
      } catch(_e_) {}
    }
  }
  return actualRows;
}

/**
 * Prepara (o recrea) la pestaña destino en el master con masterTabName.
 * Devuelve la Sheet destino.
 */
function _prepararTabDestino_(master, masterTabName) {
  const existing = master.getSheetByName(masterTabName);
  if (existing) {
    existing.clear(); // clearContents + clearFormats en una sola llamada API (−1 call por pestaña)
    // Eliminar filas sobrantes del lote anterior para que no queden datos viejos
    // cuando el nuevo lote tiene menos filas. Se deja 1 fila mínima (Sheets lo exige).
    const maxRow = existing.getMaxRows();
    if (maxRow > 1) {
      try { existing.deleteRows(2, maxRow - 1); } catch(_e_) {}
    }
    try { existing.setRowHeight(1, 21); } catch(_rhe_) {} // reset fila sobrante a default
    return existing;
  }
  return master.insertSheet(masterTabName);
}

/**
 * Normaliza nombre de lote: quita &nbsp;, puntos, colapsa espacios, lowercase.
 * "RG. 01-CV" → "rg 01-cv" == "rg 01-cv"
 * Definida globalmente para que _consolidarPorNombreTab_ y _consolidarPorCelda_ la compartan.
 */
function _nLote_(s) {
  return String(s || "").replace(/\u00A0/g, " ").replace(/\./g, "").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Helpers para identificar el lote en RC.CC.05 (tabs con nombre "PLL N" o "PLLn LOTE").
 * Implementa la misma lógica que canonical_tab_name + pll_number + lote_by_range del scraper.
 */
function _canonicalLoteFromTabName_(tabName) {
  var n = String(tabName || '').toUpperCase().replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ');
  var c = String(tabName || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/\bRG\s*01\s*CV\b/.test(n) || c.indexOf('RG01CV') !== -1) return 'RG 01-CV';
  if (/\bRG\s*02\s*CV\b/.test(n) || c.indexOf('RG02CV') !== -1) return 'RG 02-CV';
  if (/\bRG\s*03\s*CV\b/.test(n) || c.indexOf('RG03CV') !== -1) return 'RG 03-CV';
  if (/\bRG\s*04\s*CV\b/.test(n) || c.indexOf('RG04CV') !== -1) return 'RG 04-CV';
  if (/\bDA\s*01\s*CV\b/.test(n) || c.indexOf('DA01CV') !== -1) return 'DA 01-CV';
  if (/\bBSI\s*01\b/.test(n)    || c.indexOf('BSI01')  !== -1) return 'BSI 01';
  if (/\bAA\s*01\s*26\b/.test(n)|| c.indexOf('AA0126') !== -1) return 'AA 01-26';
  if (/\bAA\s*02\s*26\b/.test(n)|| c.indexOf('AA0226') !== -1) return 'AA 02-26';
  if (/\bAA\s*03\s*26\b/.test(n)|| c.indexOf('AA0326') !== -1) return 'AA 03-26';
  if (/\bFV\s*01\s*CV\b/.test(n) || c.indexOf('FV01CV') !== -1) return 'FV 01-CV';
  return null;
}

function _pllNumber_(tabName) {
  var m = String(tabName || '').match(/PLL\s*0*(\d+)/i);
  if (!m) m = String(tabName || '').match(/^(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

function _loteByPllRange_(num) {
  // Rango según la distribución actual de lotes en RC.CC.05 y RC.CC.11
  if (num <= 8)  return 'RG 01-CV';
  if (num <= 14) return 'RG 02-CV';
  if (num <= 21) return 'BSI 01';
  if (num <= 28) return 'DA 01-CV';
  return null; // PLLs 29+ sin identificador → omitir
}

/**
 * Consolidación híbrida para RC.CC.05 (tabs numéricos "PLL N" con lote
 * embebido en nombre ó determinado por rango numérico).
 * Usa _canonicalLoteFromTabName_ primero; si falla, usa _loteByPllRange_.
 */
function _consolidarPorNombreTab_(srcSS, loteName, dstSheet, state, fixedRows, fixedCols, maxTabIndex) {
  var loteNorm = _nLote_(loteName);
  if (!state.matched) state.matched = 0;
  var sheets = srcSS.getSheets();

  // ── Caché de SS externo: copiar TODAS las hojas coincidentes de una vez ───────
  // Primero identificamos cuáles hojas coinciden, luego las copiamos de una sola
  // vez al master. Así evitamos N copyTo independientes por el mismo SS externo.
  var master = dstSheet.getParent();
  var ssCache = (state._ssCache_ = state._ssCache_ || new Map());
  var srcSsId = null;
  try { srcSsId = srcSS.getId(); } catch(_e_) {}

  // Pre-identificar hojas coincidentes para saber si necesitamos precachear
  var coincidentes = [];
  sheets.forEach(function(sh, idx) {
    var tabIndex = idx + 1;
    var tabName = sh.getName();
    var canonical = _canonicalLoteFromTabName_(tabName);
    if (!canonical) {
      var pllNum = _pllNumber_(tabName);
      if (pllNum !== null) canonical = _loteByPllRange_(pllNum);
    }
    if (!canonical || _nLote_(canonical) !== loteNorm) return;
    coincidentes.push({ sh: sh, idx: idx, tabIndex: tabIndex, tabName: tabName });
  });

  // Si hay más de 1 coincidencia y no está en caché, precachear TODO el SS externo
  // de una sola vez usando copyTo de cada hoja coincidente al master
  if (coincidentes.length > 1 && srcSsId && !ssCache.has(srcSsId)) {
    var sheetMap = {};
    coincidentes.forEach(function(item) {
      try {
        var localCopy = item.sh.copyTo(master);
        try { localCopy.setName('__ssc__' + srcSsId.slice(-6) + '__' + item.tabName.slice(0, 20)); } catch(_e_) {}
        sheetMap[item.tabName] = localCopy;
      } catch(_e_) {}
    });
    ssCache.set(srcSsId, { sheets: sheetMap });
  }

  coincidentes.forEach(function(item) {
    var sh = item.sh;
    var tabIndex = item.tabIndex;
    // Usar dims fijas si se pasaron y la pestaña está dentro del límite (o sin límite)
    var useFixed = (fixedRows !== null && fixedRows !== undefined) &&
                   (maxTabIndex === null || maxTabIndex === undefined || tabIndex <= maxTabIndex);
    var lastRow = useFixed ? fixedRows : null;
    var lastCol = (fixedCols !== null && fixedCols !== undefined && useFixed) ? fixedCols : null;
    var wrote = _escribirBloque_(sh, 1, 1, lastRow, lastCol,
                                dstSheet, state.writeRow, 1, !state.widthsCopied, ssCache);
    if (!state.widthsCopied) state.widthsCopied = true;
    state.writeRow += wrote;
    state.matched++;
    // Navegar a la hoja destino después de cada bloque escrito (live-view A2a / A2b)
    try { master.setActiveSheet(dstSheet); SpreadsheetApp.flush(); } catch(_e_) {}
  });

  // Limpiar hojas temporales del caché creadas en este llamado
  if (srcSsId && ssCache.has(srcSsId)) {
    var entry = ssCache.get(srcSsId);
    Object.keys(entry.sheets).forEach(function(k) {
      try { master.deleteSheet(entry.sheets[k]); } catch(_e_) {}
    });
    ssCache.delete(srcSsId);
  }
}

/**
 * Lee en UNA sola llamada HTTP el valor de `rangeFn` de TODAS las hojas del SS,
 * usando el Advanced Google Sheets Service (Sheets API v4).
 * Devuelve null si el servicio no está habilitado o falla → fallback hoja a hoja.
 *
 * Para habilitarlo: Apps Script → Servicios → "Google Sheets API" → Añadir.
 *
 * @param {string}          ssId    - ID del spreadsheet
 * @param {Sheet[]}         sheets  - hojas del SS ya abierto
 * @param {string|function} rangeFn - celda/rango fijo "C7" o función (sh,i)=>rngStr
 * @returns {ValueRange[]|null} array paralelo a sheets, o null si no disponible
 */
function _batchGetAllCells_(ssId, sheets, rangeFn) {
  if (typeof Sheets === 'undefined' || !Sheets || !Sheets.Spreadsheets || !Sheets.Spreadsheets.Values) {
    return null; // Advanced Sheets API no habilitada → fallback por hoja
  }
  try {
    const ranges = sheets.map((sh, i) => {
      const r = (typeof rangeFn === 'function') ? rangeFn(sh, i) : rangeFn;
      return "'" + sh.getName().replace(/'/g, "\\'") + "'!" + r;
    });
    const res = Sheets.Spreadsheets.Values.batchGet(ssId, {
      ranges: ranges,
      valueRenderOption: 'FORMATTED_VALUE'
    });
    return (res && res.valueRanges) ? res.valueRanges : null;
  } catch(e) {
    return null; // Error inesperado → fallback individual
  }
}

/**
 * Consolidación genérica: para una fuente CC dada, recorre todas sus hojas,
 * lee loteCell (ej: "C7") y si su valor normalizado == loteName, copia el bloque.
 * Para RC.CC.11: hojas 1–21 → celda D4 / A1:Y27; hojas 22+ → tab name (copyTo).
 *
 * @param {SpreadsheetApp.Spreadsheet} srcSS   - sheet externo abierto
 * @param {string}  ccLabel      - "RC.CC.02", etc.
 * @param {string}  loteName     - nombre del lote a buscar
 * @param {string}  loteCell     - celda donde leer el lote (ej: "C7")
 * @param {number}  srcStartRow  - 1
 * @param {number}  srcStartCol  - 1
 * @param {number}  numCols      - nro de columnas del bloque
 * @param {number|null} fixedRows - nro fijo de filas; null = variable (última fila con datos en col A)
 * @param {SpreadsheetApp.Sheet} dstSheet - hoja destino en el master
 * @param {Object}  state        - { writeRow, widthsCopied } — modificado en lugar
 * @param {number}  maxTabIndex  - índice máximo de pestaña del grupo (para RC.CC.11: 21)
 *                                 null = sin límite
 * @param {function|null} fallbackFn - si la hoja supera maxTabIndex, llamar esta función
 */
function _consolidarPorCelda_(srcSS, ccLabel, loteName, loteCell,
                               srcStartRow, srcStartCol, numCols, fixedRows,
                               dstSheet, state, maxTabIndex, fallbackFn) {
  const sheets = srcSS.getSheets();
  const loteNorm = _nLote_(loteName);
  if (!state.matched) state.matched = 0;  // contador de hojas que coincidieron

  // ── Caché de SS externo: igual que en _consolidarPorNombreTab_ ─────────────
  const master = dstSheet.getParent();
  const ssCache = (state._ssCache_ = state._ssCache_ || new Map());
  let srcSsId = null;
  try { srcSsId = srcSS.getId(); } catch(_e_) {}

  // ── Batch: 1 HTTP call para leer la celda del lote de TODAS las hojas ────────
  // Si Advanced Sheets Service está activo → _batchGetAllCells_ devuelve array
  // paralelo a sheets[]. Si no → null → fallback al getDisplayValue() individual.
  const _batchVals_ = _batchGetAllCells_(srcSsId, sheets, loteCell);

  // Primero identificar todas las hojas coincidentes (lectura de celda, sin copyTo aún)
  const coincidentes = [];
  sheets.forEach((sh, idx) => {
    const tabIndex = idx + 1;
    if (maxTabIndex !== null && tabIndex > maxTabIndex) {
      if (fallbackFn) fallbackFn(sh, tabIndex);
      return;
    }
    let cellVal = "";
    if (_batchVals_) {
      // Batch disponible: sin llamada cross-SS adicional
      cellVal = String((((_batchVals_[idx] || {}).values || [['']])[0] || [''])[0] || '');
    } else {
      try { cellVal = String(sh.getRange(loteCell).getDisplayValue()); } catch(e) { return; }
    }
    if (_nLote_(cellVal) !== loteNorm) return;
    coincidentes.push({ sh, tabIndex });
  });

  // Precachear si hay más de 1 coincidencia
  if (coincidentes.length > 1 && srcSsId && !ssCache.has(srcSsId)) {
    const sheetMap = {};
    coincidentes.forEach(item => {
      try {
        const localCopy = item.sh.copyTo(master);
        const sname = item.sh.getName();
        try { localCopy.setName('__ssc__' + srcSsId.slice(-6) + '__' + sname.slice(0, 20)); } catch(_e_) {}
        sheetMap[sname] = localCopy;
      } catch(_e_) {}
    });
    ssCache.set(srcSsId, { sheets: sheetMap });
  }

  coincidentes.forEach(item => {
    const sh = item.sh;
    state.matched++;
    const numRows = (fixedRows !== null) ? fixedRows : null;
    const resolvedCols = (numCols === null) ? null : numCols;
    const wrote = _escribirBloque_(
      sh, srcStartRow, srcStartCol, numRows, resolvedCols,
      dstSheet, state.writeRow, 1, !state.widthsCopied, ssCache
    );
    if (!state.widthsCopied) state.widthsCopied = true;
    state.writeRow += wrote;
    // Navegar a la hoja destino después de cada bloque escrito (live-view B2)
    try { master.setActiveSheet(dstSheet); SpreadsheetApp.flush(); } catch(_e_) {}
  });

  // Limpiar hojas temporales del caché creadas en este llamado
  if (srcSsId && ssCache.has(srcSsId)) {
    const entry = ssCache.get(srcSsId);
    Object.keys(entry.sheets).forEach(k => {
      try { master.deleteSheet(entry.sheets[k]); } catch(_e_) {}
    });
    ssCache.delete(srcSsId);
  }
}

/**
 * DIAGNÓSTICO — ejecutar manualmente desde el editor de Apps Script:
 *   1. Abre https://script.google.com → abre este proyecto
 *   2. Pon el nombre del lote en la línea `loteName = ...` abajo
 *   3. Run → diagnosticarCCGrupo2
 *   4. Ver resultado en Apps Script → Executions → View log
 *
 * Muestra cada hoja de cada fuente CC grupo 2, el valor que encontró
 * en la celda de lote correspondiente y si coincide o no con el lote buscado.
 */
function diagnosticarCCGrupo2(loteName) {
  if (!loteName) {
    // ← Pon aquí el nombre exacto del lote tal como aparece en el dropdown:
    loteName = "PON_AQUI_EL_NOMBRE_DEL_LOTE";
  }
  const loteNorm = _nLote_(loteName);
  const out = [
    "==============================",
    "DIAGNÓSTICO CC GRUPO 2",
    "Lote buscado :  '" + loteName + "'",
    "Normalizado  :  '" + loteNorm + "'",
    "==============================", ""
  ];

  const configs = [
    { label: "RC.CC.02", loteCell: "C7" },
    // RC.CC.04/05/11 se identifican por nombre de pestaña (_consolidarPorNombreTab_ en Paso A)
    // → no aplica diagnóstico por celda para estos registros
    { label: "RC.CC.13", loteCell: "D9" },
  ];

  configs.forEach(function(cfg) {
    const src = CC_SOURCES.find(function(s) { return s.label === cfg.label; });
    if (!src) { out.push("--- " + cfg.label + ": no está en CC_SOURCES ---\n"); return; }
    out.push("--- " + cfg.label + " (lote en celda " + cfg.loteCell + ") ---");
    try {
      const ss = SpreadsheetApp.openById(src.id);
      var matches = 0;
      ss.getSheets().forEach(function(sh, i) {
        try {
          var raw   = sh.getRange(cfg.loteCell).getDisplayValue();
          var norm  = String(raw).replace(/\u00A0/g, " ").trim();
          var hit   = _nLote_(raw) === loteNorm ? "  ← COINCIDE" : "";
          if (hit) matches++;
          out.push("  [" + (i+1) + "] \"" + sh.getName() + "\"  =>  '" + norm + "'" + hit);
        } catch(e) {
          out.push("  [" + (i+1) + "] \"" + sh.getName() + "\"  =>  ERROR: " + e.message);
        }
      });
      out.push("  → Coincidencias: " + matches + "\n");
    } catch(e) {
      out.push("  ERROR abriendo " + cfg.label + ": " + e.message + "\n");
    }
  });

  // RC.CC.07 ya está en Grupo 1 (copyTo por nombre de pestaña en pullLotePasoA1)
  // → no requiere diagnóstico de consolida aquí

  const report = out.join("\n");
  Logger.log(report);
  return report;
}

// ── Informe de jalada: abre modal SOBRE la hoja de Sheets ─────────────────────
function mostrarInformeJalada(lote, resultsJson) {
  const results = JSON.parse(resultsJson);

  // Clasificar resultados
  const okPD = [], okCC = [], warn = [], err = [];
  results.forEach(function(r) {
    if (!r.ok) {
      err.push(r);
    } else if (r.message && r.message.indexOf('Sin coincidencias') !== -1) {
      warn.push(r);
    } else if (r.label && r.label.indexOf('RC.PD') !== -1) {
      okPD.push(r);
    } else {
      okCC.push(r);
    }
  });

  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function box(cls, icon, title, items, emptyMsg, showMsg) {
    var h = '<div class="rp-box">';
    h += '<div class="rp-hdr ' + cls + '">' + icon + ' ' + title + ' (' + items.length + ')</div>';
    h += '<div class="rp-body ' + cls + '">';
    if (items.length === 0) {
      h += '<div class="rp-item rp-empty">' + emptyMsg + '</div>';
    } else {
      items.forEach(function(r) {
        var msg = showMsg ? ('<br><span class="rp-sub">' + esc(r.message) + '</span>') : '';
        h += '<div class="rp-item"><b>' + esc(r.label) + '</b>' + msg + '</div>';
      });
    }
    h += '</div></div>';
    return h;
  }

  var body = '<div class="rp-title">\uD83D\uDCCB Informe \u2014 &ldquo;' + esc(lote) + '&rdquo;</div>';
  body += '<div class="rp-grid">';
  body += box('ok',   '\u2705', 'RC.PD jalados',     okPD, 'Ninguno encontrado',       true);
  body += box('ok',   '\u2705', 'RC.CC jalados',     okCC, 'Ninguno encontrado',       true);
  body += '<div class="rp-col-right">';
  body += box('warn', '\u26A0\uFE0F', 'Sin coincidencias', warn, 'Todos con coincidencia \u2713', false);
  body += box('err',  '\u274C', 'Errores',           err,  'Sin errores \u2713',        true);
  body += '</div></div>';

  var css = '<style>' +
    'body{font-family:Arial,sans-serif;font-size:12px;margin:12px;padding:0}' +
    '.rp-title{font-weight:700;font-size:13px;margin-bottom:10px;color:#333;' +
      'padding:6px 8px;background:#f1f3f4;border-radius:6px;text-align:center}' +
    '.rp-grid{display:flex;gap:6px;align-items:stretch;height:calc(100vh - 60px)}' +
    '.rp-box{border-radius:6px;overflow:hidden;border:1px solid #ddd;' +
      'display:flex;flex-direction:column}' +
    '.rp-grid > .rp-box{flex:1}' +
    '.rp-col-right{flex:1;display:flex;flex-direction:column;gap:6px}' +
    '.rp-col-right .rp-box{flex:1;min-height:0}' +
    '.rp-hdr{padding:5px 7px;font-weight:700;font-size:11px;text-align:center}' +
    '.rp-hdr.ok{background:#34a853;color:#fff}' +
    '.rp-hdr.warn{background:#f9ab00;color:#fff}' +
    '.rp-hdr.err{background:#d93025;color:#fff}' +
    '.rp-body{padding:5px 7px 7px;flex:1;overflow-y:auto}' +
    '.rp-body.ok{background:#e6f4ea}' +
    '.rp-body.warn{background:#fef9e7}' +
    '.rp-body.err{background:#fce8e6}' +
    '.rp-item{padding:2px 0;line-height:1.45}' +
    '.rp-item b{color:#222}' +
    '.rp-empty{color:#aaa;font-style:italic;font-size:11px}' +
    '.rp-sub{color:#555;font-size:10px}' +
    '</style>';

  var html = HtmlService.createHtmlOutput(css + body)
    .setWidth(640)
    .setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(html, 'Informe de jalada \u2014 ' + lote);
}
