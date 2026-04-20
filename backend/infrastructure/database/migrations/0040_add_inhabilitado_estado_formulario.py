"""
Migration 0040 – Agregar estado INHABILITADO a FormularioEtapa

Permite tener tres estados para el formulario:
- BORRADOR: nunca fue publicado
- PUBLICADO: actualmente publicado y accesible
- INHABILITADO: fue publicado pero ahora está deshabilitado
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0039_add_asignada_estado_visita'),
    ]

    operations = [
        migrations.AlterField(
            model_name='formularioetapa',
            name='estado',
            field=models.CharField(
                choices=[
                    ('BORRADOR', 'Borrador'),
                    ('PUBLICADO', 'Publicado'),
                    ('INHABILITADO', 'Inhabilitado'),
                ],
                default='BORRADOR',
                max_length=20,
            ),
        ),
    ]
