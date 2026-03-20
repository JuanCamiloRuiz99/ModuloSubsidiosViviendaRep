# Generated migration to enforce NOT NULL and UNIQUE on numero_documento

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0007_fill_numero_documento'),
    ]

    operations = [
        # Cambiar el campo a NOT NULL y UNIQUE
        migrations.AlterField(
            model_name='usuariosistema',
            name='numero_documento',
            field=models.CharField(
                max_length=20,
                blank=False,
                null=False,
                unique=True,
                help_text='Número de documento/cédula del usuario',
                db_index=False,
            ),
        ),
    ]
