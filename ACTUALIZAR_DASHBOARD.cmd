@echo off
setlocal
set "ROOT=%~dp0"
cd /d "%ROOT%"

echo [1/3] Actualizando Calidad (PPRo)...
pushd "PPRo"
"%ROOT%.venv\Scripts\python.exe" "scrape_quality.py" build-dashboard
if errorlevel 1 (
  popd
  echo ERROR: fallo al actualizar Calidad.
  exit /b 1
)
popd

echo [2/3] Actualizando Produccion...
pushd "Produccion"
"%ROOT%.venv\Scripts\python.exe" "scrape_produccion.py"
if errorlevel 1 (
  popd
  echo ERROR: fallo al actualizar Produccion.
  exit /b 1
)
popd

echo [3/3] Actualizando PPR (graficos prerrequisitos)...
pushd "PPR"
"%ROOT%.venv\Scripts\python.exe" "generar_ppr_charts.py"
if errorlevel 1 (
  popd
  echo ERROR: fallo al actualizar PPR.
  exit /b 1
)
popd

echo.
echo OK: dashboard actualizado (calidad + produccion + PPR).
echo Refresca el navegador con Ctrl+F5.
exit /b 0
