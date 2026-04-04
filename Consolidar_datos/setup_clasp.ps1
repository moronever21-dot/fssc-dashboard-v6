# ============================================================
# SETUP INICIAL - KPI Consolidador con clasp
# Ejecutar una sola vez despues de instalar Node.js
# ============================================================

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   KPI Consolidador - Configuracion inicial clasp   " -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Usa .cmd para evitar bloqueos de npm.ps1 por ExecutionPolicy.
$NpmCmd = "npm.cmd"
$ClaspCmd = "clasp.cmd"

# 1) Verificar Node.js
Write-Host "[1/5] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = & node --version 2>&1
    $npmVer = & $NpmCmd --version 2>&1
    Write-Host "      Node.js : $nodeVer" -ForegroundColor Green
    Write-Host "      npm     : $npmVer" -ForegroundColor Green
}
catch {
    Write-Host "" 
    Write-Host "  ERROR: Node.js no encontrado." -ForegroundColor Red
    Write-Host "  Descargalo desde https://nodejs.org (LTS)." -ForegroundColor Red
    Write-Host "  Luego cierra y abre VS Code/PowerShell y ejecuta de nuevo." -ForegroundColor Red
    exit 1
}

# 2) Instalar clasp globalmente
Write-Host ""
Write-Host "[2/5] Instalando @google/clasp globalmente..." -ForegroundColor Yellow
& $NpmCmd install -g @google/clasp
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR instalando clasp. Revisa tu conexion a internet." -ForegroundColor Red
    exit 1
}
Write-Host "      clasp instalado correctamente." -ForegroundColor Green

# 3) Login con Google
Write-Host ""
Write-Host "[3/5] Autenticando con tu cuenta de Google..." -ForegroundColor Yellow
Write-Host "      Se abrira el navegador para autorizar." -ForegroundColor White
& $ClaspCmd login
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR en login. Prueba: clasp.cmd login --no-localhost" -ForegroundColor Red
    exit 1
}
Write-Host "      Login exitoso." -ForegroundColor Green

# 4) Conectar con el proyecto Apps Script
Write-Host ""
Write-Host "[4/5] Conectando con el proyecto de Apps Script..." -ForegroundColor Yellow
Write-Host "  Pega el Script ID (de la URL de Apps Script)." -ForegroundColor White
$scriptId = Read-Host "  Script ID"
if (-not $scriptId -or $scriptId.Trim() -eq "") {
    Write-Host "  ERROR: Script ID vacio." -ForegroundColor Red
    exit 1
}
$scriptId = $scriptId.Trim()

$claspConfig = @{ scriptId = $scriptId; rootDir = "." } | ConvertTo-Json
Set-Content -Path ".clasp.json" -Value $claspConfig -Encoding UTF8
Write-Host "      .clasp.json actualizado." -ForegroundColor Green

# 5) Push de codigo
Write-Host ""
Write-Host "[5/5] Subiendo codigo al proyecto Apps Script..." -ForegroundColor Yellow
& $ClaspCmd push --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR al hacer push. Verifica Script ID y API habilitada." -ForegroundColor Red
    Write-Host "  https://script.google.com/home/usersettings" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "   SETUP COMPLETADO" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "  Siguiente uso diario:" -ForegroundColor White
Write-Host "  .\deploy.cmd" -ForegroundColor Yellow
Write-Host "  .\run_consolidar.cmd" -ForegroundColor Yellow
Write-Host ""
