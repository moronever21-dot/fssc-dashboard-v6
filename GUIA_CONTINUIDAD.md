# Continuidad del proyecto FSSC 22000 v6

## 1) Donde guardar el proyecto
- Carpeta de trabajo: esta raiz (INGAMA) en OneDrive.
- Recomendado: repositorio privado en GitHub para historial, versionado y trabajo en otra PC.

## 1.1) Modo preferido del usuario (sin Git local)
- El usuario puede trabajar sin instalar Git en otra PC.
- Flujo permitido: OneDrive + GitHub web (Upload files / Download ZIP).
- Nota: este modo es mas manual y puede generar conflictos si se edita en dos PCs al mismo tiempo.

## 2) Estado del proyecto
- Calidad: PPRo/
- Produccion: Produccion/
- Dashboard principal: PPRo/index.html

## 3) Que hacer una sola vez (cuando Git ya este instalado)
1. Abrir PowerShell en esta carpeta raiz.
2. Ejecutar:
   .\CONFIGURAR_GIT.ps1 -UserName "TU NOMBRE" -UserEmail "tu_correo@dominio.com"

## 4) Publicar a GitHub (nuevo repo privado)
1. Crear repo vacio en GitHub (sin README).
2. Ejecutar:
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main

## 5) Flujo para futuras mejoras
- Traer cambios: git pull
- Trabajar cambios
- Guardar version:
  git add .
  git commit -m "feat: descripcion"
  git push

## 6) Trabajar desde otra PC
1. Instalar Git y VS Code.
2. Clonar repo:
   git clone https://github.com/TU_USUARIO/TU_REPO.git
3. Abrir carpeta clonada en VS Code.
4. Crear entorno Python si aplica (.venv) y ejecutar scrapers.

## 6.1) Trabajar desde otra PC sin Git (alternativa)
1. Instalar VS Code.
2. Abrir OneDrive con la misma cuenta y trabajar en la misma carpeta sincronizada.
3. Si necesitas traer cambios desde GitHub sin Git:
   - abrir el repo en GitHub
   - usar Download ZIP
   - extraer y copiar solo archivos necesarios a tu carpeta OneDrive
4. Si necesitas subir cambios a GitHub sin Git:
   - abrir el repo en GitHub
   - usar Add file > Upload files
   - subir los archivos modificados

## 6.2) Regla de sincronizacion
- OneDrive se actualiza automaticamente al guardar archivos (si hay internet y sync activo).
- GitHub NO se actualiza automaticamente cuando editas localmente.
- GitHub solo cambia cuando haces push (con Git) o upload manual en la web.

## 7) Regla de datos reales
- El dashboard se mantiene en modo datos reales.
- Si no hay dato real para un lote/registro, debe verse como sin dato (no fallback inventado).

## 8) Actualizacion rapida de calculos
- Cuando agregues registros nuevos en los Google Sheets, ejecuta en la raiz del proyecto:
   - ACTUALIZAR_DASHBOARD.cmd
- Esto regenera:
   - PPRo/aggregates_by_tab_generated.json + .js
   - Produccion/produccion_aggregates_generated.json + .js
   - Produccion/lote_info_pd02.json + .js
- Luego refresca el navegador con Ctrl+F5.
