# ============================================================
# run_consolidar.ps1 — Ejecutar la consolidacion de KPIs
# Requiere que hayas hecho el setup y deploy previos
# ============================================================
#
# REQUISITO: La API de Apps Script debe estar habilitada.
# Actívala en: https://script.google.com/home/usersettings
# ============================================================

Write-Host ""
Write-Host "[RUN] Ejecutando consolidacion de KPIs..." -ForegroundColor Cyan
clasp.cmd run consolidarManual
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Consolidacion ejecutada. Revisa tu Hoja Maestra." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERROR] No se pudo ejecutar. Checklist:" -ForegroundColor Red
    Write-Host "  1. Habilitaste la API de Apps Script?" -ForegroundColor Yellow
    Write-Host "     https://script.google.com/home/usersettings" -ForegroundColor White
    Write-Host "  2. Hiciste push del codigo? -> .\deploy.ps1" -ForegroundColor Yellow
    Write-Host "  3. MASTER_ID esta configurado en kpi_consolidador.gs?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Alternativa: Abre Apps Script en el navegador y ejecuta" -ForegroundColor Gray
    Write-Host "  manualmente la funcion 'consolidarManual'." -ForegroundColor Gray
}
