# ════════════════════════════════════════════════════════════════════════════
# DIAGNÓSTICO Y REPARACIÓN: Error en config_registro_hogar.inhabilitado
# ════════════════════════════════════════════════════════════════════════════

Write-Host "`n✓ DIAGNÓSTICO DE MIGRACIONES Y BASE DE DATOS" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════`n" -ForegroundColor Cyan

# 1. Verificar estado actual de migraciones
Write-Host "1️⃣  Estado de migraciones (app database):" -ForegroundColor Yellow
python manage.py showmigrations database | grep -E "0041|0040|0042"

Write-Host "`n2️⃣  Migraciones pendientes:" -ForegroundColor Yellow
python manage.py showmigrations database --plan | grep "\[ \]"

# 2. Verificar si la tabla tiene la columna
Write-Host "`n3️⃣  Verificando columnas en config_registro_hogar:" -ForegroundColor Yellow
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
cursor = connection.cursor()
cursor.execute(\"SELECT column_name FROM information_schema.columns WHERE table_name='config_registro_hogar'\")
cols = [row[0] for row in cursor.fetchall()]
print('Columnas encontradas:', cols)
print('¿Tiene inhabilitado?:', 'inhabilitado' in cols)
"

# 3. REPARACIÓN: Aplicar todas las migraciones pendientes
Write-Host "`n" -ForegroundColor Green
Write-Host "🔧 APLICANDO MIGRACIONES PENDIENTES..." -ForegroundColor Green
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
python manage.py migrate database

Write-Host "`n4️⃣  Verificando después de migrate:" -ForegroundColor Yellow
python manage.py showmigrations database | grep "0041"

Write-Host "`n✅ REPARACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "`nPrueba ahora: GET /api/etapas/?programa=3`n" -ForegroundColor Cyan
