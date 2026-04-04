# ============================================================
# deploy.ps1 — Subir cambios del codigo a Apps Script
# Ejecutar cada vez que edites kpi_consolidador.gs en VS Code
# ============================================================

Write-Host ""
Write-Host "[DEPLOY] Subiendo cambios a Apps Script..." -ForegroundColor Cyan
clasp.cmd push --force
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Codigo actualizado exitosamente." -ForegroundColor Green
    Write-Host "     Ejecuta .\run_consolidar.ps1 para correr la consolidacion." -ForegroundColor White
} else {
    Write-Host "[ERROR] Fallo al subir. Verifica que hiciste el setup inicial (.\setup_clasp.ps1)." -ForegroundColor Red
}
