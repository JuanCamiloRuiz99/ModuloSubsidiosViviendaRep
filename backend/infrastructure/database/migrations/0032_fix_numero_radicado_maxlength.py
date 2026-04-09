# Manually edited: only apply the numero_radicado max_length fix and new postulacion indexes.
# LlamadaVisita/LlamadaPostulacion operations skipped — table already exists in DB from prior migration.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0031_cleanup_rename_tables'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gestionhogaretapa1',
            name='numero_radicado',
            field=models.CharField(max_length=40, unique=True),
        ),
        migrations.AddIndex(
            model_name='postulacion',
            index=models.Index(fields=['programa', 'estado'], name='idx_postulaciones_prog_estado'),
        ),
        migrations.AddIndex(
            model_name='postulacion',
            index=models.Index(fields=['funcionario_asignado'], name='idx_postulaciones_func_asig'),
        ),
        migrations.AddIndex(
            model_name='postulacion',
            index=models.Index(fields=['estado'], name='idx_postulaciones_estado'),
        ),
    ]
