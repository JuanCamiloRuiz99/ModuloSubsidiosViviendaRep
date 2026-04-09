from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0033_reorganize_document_type_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='miembrohogar',
            name='sexo',
            field=models.CharField(
                max_length=20,
                blank=True,
                choices=[
                    ('MASCULINO',        'Masculino'),
                    ('FEMENINO',         'Femenino'),
                    ('INTERSEXUAL',      'Intersexual'),
                    ('NO_BINARIO',       'No binario'),
                    ('PREFIERE_NO_DECIR', 'Prefiere no decir'),
                ],
                default='',
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='miembrohogar',
            name='telefono',
            field=models.CharField(max_length=20, blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='miembrohogar',
            name='correo_electronico',
            field=models.EmailField(max_length=150, blank=True, default=''),
            preserve_default=False,
        ),
    ]
