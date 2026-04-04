# En PowerShell
mkdir C:\QualityDashboard<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Trazabilidad ISO 22000</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: #f5f5f5; }
        .card { border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .btn-iso { background: #28a745; color: white; }
        .form-section { background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
        .preview-img { max-width: 300px; border: 2px dashed #ccc; border-radius: 10px; }
        .status-badge { font-size: 0.9em; padding: 5px 10px; border-radius: 20px; }
    </style>
</head>
<body>
    <div class="container mt-4">
        <!-- HEADER -->
        <div class="row mb-4">
            <div class="col">
                <div class="card">
                    <div class="card-body text-center">
                        <h1 class="text-success">🏭 SISTEMA DE TRAZABILIDAD ISO 22000</h1>
                        <p class="text-muted">Registro RC.PD.01 - Recepción Materia Prima</p>
                        <span class="status-badge bg-success">CONECTADO</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <!-- COLUMNA IZQUIERDA: CARGA DE FORMULARIO -->
            <div class="col-md-6">
                <div class="form-section">
                    <h3 class="mb-4">📤 CARGAR FORMULARIO MANUSCRITO</h3>
                    
                    <!-- Paso 1: Subir imagen -->
                    <div class="mb-4">
                        <label class="form-label fw-bold">1. Tomar foto del formulario:</label>
                        <input type="file" id="fotoFormulario" accept="image/*" class="form-control" capture="environment">
                        <small class="text-muted">Usa tu celular o cámara para fotografiar el RC.PD.01 completo</small>
                    </div>

                    <!-- Vista previa -->
                    <div class="mb-4">
                        <label class="form-label fw-bold">Vista previa:</label>
                        <div id="previewContainer" class="text-center">
                            <img id="previewImage" class="preview-img img-fluid" src="" alt="Vista previa" style="display:none;">
                            <div id="placeholder" class="text-muted p-4">
                                📷 La imagen aparecerá aquí
                            </div>
                        </div>
                    </div>

                    <!-- Paso 2: Procesar automáticamente -->
                    <div class="mb-4">
                        <label class="form-label fw-bold">2. Procesar automáticamente:</label>
                        <button id="btnProcesar" class="btn btn-iso w-100 py-3" disabled>
                            <span id="btnText">⏳ PROCESAR CON INTELIGENCIA ARTIFICIAL</span>
                            <div id="loadingSpinner" class="spinner-border spinner-border-sm d-none" role="status"></div>
                        </button>
                        <small class="text-muted">La IA extraerá automáticamente todos los datos</small>
                    </div>

                    <!-- Resultados de procesamiento -->
                    <div id="resultadoProcesamiento" style="display:none;">
                        <div class="alert alert-success">
                            <h5>✅ DATOS EXTRAÍDOS CORRECTAMENTE</h5>
                            <div id="datosExtraidos"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- COLUMNA DERECHA: VERIFICACIÓN Y ENVÍO -->
            <div class="col-md-6">
                <div class="form-section">
                    <h3 class="mb-4">📝 VERIFICAR DATOS EXTRAÍDOS</h3>
                    
                    <!-- Formulario de verificación -->
                    <form id="formVerificacion">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Fecha Recepción:</label>
                                <input type="date" id="fechaRecepcion" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Nº Formulario:</label>
                                <input type="text" id="numeroFormulario" class="form-control" value="RC.PD.01-" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Proveedor:</label>
                            <input type="text" id="proveedor" class="form-control" required>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Lote Proveedor:</label>
                                <input type="text" id="loteProveedor" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Lote Trazabilidad:</label>
                                <input type="text" id="loteTrazabilidad" class="form-control" required>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Total Sacos:</label>
                                <input type="number" id="totalSacos" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Peso Neto (Kg):</label>
                                <input type="number" step="0.01" id="pesoNeto" class="form-control" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Conformidad:</label>
                            <select id="conformidad" class="form-select" required>
                                <option value="SI">✅ SI - Cumple requisitos</option>
                                <option value="NO">❌ NO - No cumple</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Responsable:</label>
                            <input type="text" id="responsable" class="form-control" value="" required>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Observaciones:</label>
                            <textarea id="observaciones" class="form-control" rows="2"></textarea>
                        </div>

                        <!-- BOTÓN MÁGICO DE ENVÍO -->
                        <div class="d-grid gap-2">
                            <button type="button" id="btnEnviarExcel" class="btn btn-success btn-lg py-3" disabled>
                                <i class="bi bi-save"></i> 📊 GUARDAR EN EXCEL Y REGISTRAR
                            </button>
                            <button type="button" id="btnVerRegistros" class="btn btn-outline-primary">
                                📋 VER TODOS LOS REGISTROS
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- SECCIÓN: REGISTROS GUARDADOS -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="form-section">
                    <h3>📈 REGISTROS ALMACENADOS</h3>
                    <div id="tablaRegistros">
                        <p class="text-muted">Los registros aparecerán aquí...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="app.js"></script>
</body>
</html>