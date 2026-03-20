"""
Migration: agrega campo `publicado` a ConfigRegistroHogar.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0013_postulaciones'),
    ]

    operations = [
        migrations.AddField(
            model_name='configregistrohogar',
            name='publicado',
            field=models.BooleanField(
                default=False,
                help_text='True cuando el gestor ha publicado el formulario de registro del hogar.',
            ),
        ),
    ]
