Set-Location $PSScriptRoot

$python = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

Write-Host "[1/2] Actualizando Calidad (PPRo)..." -ForegroundColor Cyan
Push-Location "PPRo"
& $python "scrape_quality.py" build-dashboard
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Fallo al actualizar Calidad"
}
Pop-Location

Write-Host "[2/2] Actualizando Produccion..." -ForegroundColor Cyan
Push-Location "Produccion"
& $python "scrape_produccion.py"
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Fallo al actualizar Produccion"
}
Pop-Location

Write-Host "OK: dashboard actualizado (calidad + produccion)." -ForegroundColor Green
Write-Host "Refresca el navegador con Ctrl+F5." -ForegroundColor Yellow
