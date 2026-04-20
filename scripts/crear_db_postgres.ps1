# Script para instalar PostgreSQL 18, iniciar el servicio y crear la base de datos Modulo_subsidio
# Ejecutar como administrador

$ErrorActionPreference = 'Stop'

# 1. Instalar PostgreSQL 18 si no está instalado
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgInstalled) {
    Write-Host "Instalando PostgreSQL 18..."
    winget install --id PostgreSQL.PostgreSQL --exact --version 18.0.0 -h
    $env:Path += ";C:\Program Files\PostgreSQL\18\bin"
}

# 2. Iniciar el servicio de PostgreSQL
$service = Get-Service -Name postgresql* -ErrorAction SilentlyContinue
if ($service -and $service.Status -ne 'Running') {
    Start-Service $service.Name
    Write-Host "Servicio PostgreSQL iniciado."
}

# 3. Crear la base de datos Modulo_subsidio si no existe
$env:PGPASSWORD = "postgres"
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psqlPath)) { $psqlPath = "psql" }

$dbExists = & $psqlPath -U postgres -h localhost -p 5432 -tAc "SELECT 1 FROM pg_database WHERE datname='Modulo_subsidio'" 2>$null
if ($dbExists -ne '1') {
    Write-Host "Creando base de datos Modulo_subsidio..."
    & $psqlPath -U postgres -h localhost -p 5432 -c "CREATE DATABASE \"Modulo_subsidio\";"
    Write-Host "Base de datos creada."
} else {
    Write-Host "La base de datos Modulo_subsidio ya existe."
}
