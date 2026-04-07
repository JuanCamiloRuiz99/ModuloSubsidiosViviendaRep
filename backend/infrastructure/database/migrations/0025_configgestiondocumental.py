import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0024_configvisitatecnica'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfigGestionDocumental',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('campos', models.JSONField(default=dict, help_text='Dict: { campo_id: { "requerido": bool, "habilitado": bool } }')),
                ('publicado', models.BooleanField(default=False, help_text='True cuando el gestor ha publicado el formulario de gestión documental.')),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('etapa', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='config_gestion_documental', to='database.etapa')),
            ],
            options={
                'verbose_name': 'Configuración Gestión Documental',
                'verbose_name_plural': 'Configuraciones Gestión Documental',
                'db_table': 'config_gestion_documental',
            },
        ),
    ]
