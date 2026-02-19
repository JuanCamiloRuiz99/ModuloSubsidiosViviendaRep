# Generated migration file

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Programa',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField()),
                ('entidad_responsable', models.CharField(max_length=255)),
                ('codigo_programa', models.CharField(max_length=20, unique=True)),
                ('estado', models.CharField(choices=[('BORRADOR', 'Borrador'), ('ACTIVO', 'Activo'), ('INHABILITADO', 'Inhabilitado')], default='BORRADOR', max_length=20)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Programa',
                'verbose_name_plural': 'Programas',
                'db_table': 'programas_programa',
                'ordering': ['-fecha_creacion'],
            },
        ),
        migrations.CreateModel(
            name='TipoDocumento',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=50, unique=True)),
                ('descripcion', models.TextField(blank=True)),
            ],
            options={
                'verbose_name': 'Tipo de Documento',
                'verbose_name_plural': 'Tipos de Documento',
                'db_table': 'programas_tipo_documento',
            },
        ),
        migrations.CreateModel(
            name='Postulante',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('apellido', models.CharField(max_length=255)),
                ('numero_documento', models.CharField(max_length=20, unique=True)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('telefono', models.CharField(blank=True, max_length=20)),
                ('estado', models.CharField(choices=[('ACTIVO', 'Activo'), ('INACTIVO', 'Inactivo'), ('RECHAZADO', 'Rechazado'), ('APROBADO', 'Aprobado'), ('SUSPENDIDO', 'Suspendido')], default='ACTIVO', max_length=20)),
                ('fecha_postulacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
                ('programa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='postulantes', to='database.programa')),
                ('tipo_documento', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='database.tipodocumento')),
            ],
            options={
                'verbose_name': 'Postulante',
                'verbose_name_plural': 'Postulantes',
                'db_table': 'programas_postulante',
                'ordering': ['-fecha_postulacion'],
            },
        ),
        migrations.CreateModel(
            name='Etapa',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField()),
                ('estado', models.CharField(choices=[('CONFIGURADA', 'Configurada'), ('ACTIVA', 'Activa'), ('CERRADA', 'Cerrada')], default='CONFIGURADA', max_length=20)),
                ('orden', models.PositiveIntegerField(default=1)),
                ('fecha_inicio', models.DateTimeField(blank=True, null=True)),
                ('fecha_fin', models.DateTimeField(blank=True, null=True)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True)),
                ('programa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='etapas', to='database.programa')),
            ],
            options={
                'verbose_name': 'Etapa',
                'verbose_name_plural': 'Etapas',
                'db_table': 'programas_etapa',
                'ordering': ['programa', 'orden'],
                'unique_together': {('programa', 'nombre')},
            },
        ),
    ]
