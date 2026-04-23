# Ejecuta los seeders del proyecto desde backend\
# Uso: powershell -ExecutionPolicy Bypass -File .\run_seeders.ps1

Set-Location $PSScriptRoot

Write-Host "== Iniciando seeders en `$(Get-Location)` =="

$seeders = @(
    "seed_usuarios_login.py",
    "seed_programa_etapa1.py",
    "seed_programa_prueba.py",
    "seed_registro_hogar.py",
    "seed_postulante_hogar.py",
    "seed_todos_estados.py",
    "seed_reconstruccion_10.py",
    "seed_reconstruccion_en_revision.py",
    "seed_mejoramiento_viviendo_prueba_2026.py",
    "seed_mi_casa3.py"
)

foreach ($seeder in $seeders) {
    Write-Host "`n=== Ejecutando $seeder ==="
    $scriptPath = Join-Path "..\scripts" $seeder
    python $scriptPath
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: El seeder $seeder falló con código $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host "`n== Seeders completados con éxito ==" -ForegroundColor Green
