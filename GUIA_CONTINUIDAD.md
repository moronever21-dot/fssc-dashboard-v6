# Continuidad del proyecto FSSC 22000 v6

## 1) Donde guardar el proyecto
- Carpeta de trabajo: esta raiz (Visual Code) en OneDrive.
- Recomendado: repositorio privado en GitHub para historial, versionado y trabajo en otra PC.

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

## 7) Regla de datos reales
- El dashboard se mantiene en modo datos reales.
- Si no hay dato real para un lote/registro, debe verse como sin dato (no fallback inventado).
