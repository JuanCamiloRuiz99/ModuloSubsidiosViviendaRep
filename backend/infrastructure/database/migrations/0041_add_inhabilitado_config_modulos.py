"""
Migration 0041 – Agregar campo inhabilitado a configs de módulos especiales

Agrega el campo `inhabilitado` a ConfigRegistroHogar, ConfigVisitaTecnica, 
y ConfigGestionDocumental para rastrear cuando un formulario fue inhabilitado
(publicado anteriormente pero deshabilitado).
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0040_add_inhabilitado_estado_formulario'),
    ]

    operations = [
        migrations.AddField(
            model_name='configregistrohogar',
            name='inhabilitado',
            field=models.BooleanField(
                default=False,
                help_text='True cuando el formulario fue publicado pero después fue inhabilitado.',
            ),
        ),
        migrations.AddField(
            model_name='configvisitatecnica',
            name='inhabilitado',
            field=models.BooleanField(
                default=False,
                help_text='True cuando el formulario fue publicado pero después fue inhabilitado.',
            ),
        ),
        migrations.AddField(
            model_name='configgestiondocumental',
            name='inhabilitado',
            field=models.BooleanField(
                default=False,
                help_text='True cuando el formulario fue publicado pero después fue inhabilitado.',
            ),
        ),
    ]
