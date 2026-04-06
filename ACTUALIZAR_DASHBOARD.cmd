@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo [1/2] Actualizando Calidad (PPRo)...
pushd "PPRo"
"%ROOT%.venv\Scripts\python.exe" "scrape_quality.py" build-dashboard
if errorlevel 1 (
  popd
  echo ERROR: fallo al actualizar Calidad.
  exit /b 1
)
popd

echo [2/2] Actualizando Produccion...
pushd "Produccion"
"%ROOT%.venv\Scripts\python.exe" "scrape_produccion.py"
if errorlevel 1 (
  popd
  echo ERROR: fallo al actualizar Produccion.
  exit /b 1
)
popd

echo.
echo OK: dashboard actualizado (calidad + produccion).
echo Refresca el navegador con Ctrl+F5.
exit /b 0
