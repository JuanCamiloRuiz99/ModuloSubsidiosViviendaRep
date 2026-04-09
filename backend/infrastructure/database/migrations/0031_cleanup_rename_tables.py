"""
Migración: eliminar tablas muertas y renombrar tablas.

- Eliminar: programas_postulante, programas_tipo_documento, respuestas_formulario
- Renombrar: programas_programa → gestion_programa
- Renombrar: etapas_proceso → etapas_programas
- Renombrar: llamadas_postulacion → llamadas_visita
"""
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0030_add_culminado_programa_state'),
    ]

    operations = [
        # ── 1. Eliminar tablas muertas ──────────────────────────────────
        # RespuestaFormulario depende de Postulante, eliminar primero
        migrations.DeleteModel(name='RespuestaFormulario'),
        migrations.DeleteModel(name='Postulante'),
        migrations.DeleteModel(name='TipoDocumento'),

        # ── 2. Renombrar tablas ─────────────────────────────────────────
        migrations.AlterModelTable(
            name='Programa',
            table='gestion_programa',
        ),
        migrations.AlterModelTable(
            name='Etapa',
            table='etapas_programas',
        ),
        migrations.AlterModelTable(
            name='LlamadaPostulacion',
            table='llamadas_visita',
        ),

        # ── 3. Actualizar index de llamadas ─────────────────────────────
        migrations.RenameIndex(
            model_name='LlamadaPostulacion',
            old_name='idx_llamada_postulacion',
            new_name='idx_llamada_visita',
        ),
    ]
