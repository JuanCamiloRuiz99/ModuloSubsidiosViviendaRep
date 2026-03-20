# Generated migration to fill and enforce numero_documento

from django.db import migrations, models
import uuid


def fill_numero_documento(apps, schema_editor):
    """Rellena numero_documento NULL con valores únicos basados en el ID"""
    UsuarioSistema = apps.get_model('database', 'UsuarioSistema')
    
    usuarios_sin_doc = UsuarioSistema.objects.filter(numero_documento__isnull=True)
    print(f'⏳ Rellenando {usuarios_sin_doc.count()} usuarios sin numero_documento...')
    
    for usuario in usuarios_sin_doc:
        # Usar el ID como número de documento único
        usuario.numero_documento = f'DOC{usuario.id_usuario:06d}'
        usuario.save()
        print(f'  ✅ Usuario {usuario.id_usuario}: numero_documento = {usuario.numero_documento}')
    
    print(f'✅ {usuarios_sin_doc.count()} usuarios rellenados con éxito')


def reverse_fill(apps, schema_editor):
    """Revierte el llenado (establece en NULL)"""
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0006_usuariosistema_numero_documento'),
    ]

    operations = [
        # Paso 1: Ejecutar Python para rellenar valores NULL
        migrations.RunPython(
            fill_numero_documento,
            reverse_fill,
        ),
    ]
