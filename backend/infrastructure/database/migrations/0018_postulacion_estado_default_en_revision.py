from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0017_documentos_miembro_hogar_trazabilidad'),
    ]

    operations = [
        migrations.AlterField(
            model_name='postulacion',
            name='estado',
            field=models.CharField(
                choices=[
                    ('REGISTRADA', 'Registrada'),
                    ('EN_REVISION', 'En revisión'),
                    ('VISITA_PENDIENTE', 'Visita pendiente'),
                    ('VISITA_REALIZADA', 'Visita realizada'),
                    ('APROBADA', 'Aprobada'),
                    ('RECHAZADA', 'Rechazada'),
                ],
                default='EN_REVISION',
                max_length=20,
            ),
        ),
    ]
