"""
Adds funcionario_asignado field to Postulacion model.
"""
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0020_visita_ddd_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='postulacion',
            name='funcionario_asignado',
            field=models.ForeignKey(
                blank=True,
                db_column='funcionario_asignado',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='postulaciones_asignadas',
                to='database.usuariosistema',
            ),
        ),
    ]
