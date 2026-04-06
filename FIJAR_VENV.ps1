# Ejecutar DESPUÉS de renombrar la carpeta a INGAMA
# Corrige las rutas del entorno virtual Python (.venv)
# Uso: click derecho > Ejecutar con PowerShell (o desde terminal VS Code)

$oldName = "Visual Code"
$newName = "INGAMA"
$venvScripts = Join-Path $PSScriptRoot ".venv\Scripts"

$files = @(
    "activate.bat",
    "activate",
    "Activate.ps1"
)

foreach ($f in $files) {
    $path = Join-Path $venvScripts $f
    if (Test-Path $path) {
        $content = Get-Content $path -Raw
        if ($content -match [regex]::Escape($oldName)) {
            $content = $content -replace [regex]::Escape($oldName), $newName
            Set-Content -Path $path -Value $content -NoNewline
            Write-Host "OK: $f actualizado" -ForegroundColor Green
        } else {
            Write-Host "Ya OK (sin cambio): $f" -ForegroundColor Yellow
        }
    } else {
        Write-Host "No encontrado: $f" -ForegroundColor Red
    }
}

# Actualizar pyvenv.cfg (informativo, no crítico)
$cfgPath = Join-Path $PSScriptRoot ".venv\pyvenv.cfg"
if (Test-Path $cfgPath) {
    $cfg = Get-Content $cfgPath -Raw
    $cfg = $cfg -replace [regex]::Escape($oldName), $newName
    Set-Content -Path $cfgPath -Value $cfg -NoNewline
    Write-Host "OK: pyvenv.cfg actualizado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Listo. El entorno Python (.venv) apunta correctamente a la carpeta INGAMA." -ForegroundColor Cyan
Write-Host "Ahora puedes usar el dashboard normalmente." -ForegroundColor Cyan
