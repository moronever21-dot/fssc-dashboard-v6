param(
    [string]$UserName = "",
    [string]$UserEmail = "",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git no esta instalado o no esta en PATH. Instala Git y vuelve a ejecutar este script."
}

if (-not (Test-Path ".git")) {
    git init | Out-Null
}

if ($UserName -and $UserEmail) {
    git config user.name $UserName
    git config user.email $UserEmail
}

git checkout -B $Branch | Out-Null
git add .

$status = git status --porcelain
if ($status) {
    git commit -m "chore: baseline dashboard fssc v6"
    Write-Output "Commit inicial creado."
} else {
    Write-Output "No hay cambios para commit."
}

Write-Output "Listo. Repositorio preparado en $root"
