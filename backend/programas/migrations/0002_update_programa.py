# Migration to update Programa model with new fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('programas', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='programa',
            name='codigo_programa',
            field=models.CharField(default='', max_length=20, unique=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='programa',
            name='fecha_actualizacion',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AlterField(
            model_name='programa',
            name='descripcion',
            field=models.TextField(),
        ),
        migrations.AlterModelOptions(
            name='programa',
            options={'ordering': ['-fecha_creacion'], 'verbose_name': 'Programa', 'verbose_name_plural': 'Programas'},
        ),
    ]
