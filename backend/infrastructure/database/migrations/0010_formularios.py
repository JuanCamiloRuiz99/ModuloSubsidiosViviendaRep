"""
Migration 0010 – Tablas para el constructor de formularios

Crea tres tablas nuevas:
    formularios_etapa   – plantilla de formulario ligada a una etapa (1-to-1)
    campos_formulario   – campos seleccionados por el gestor (orden + config)
    respuestas_formulario – respuestas de postulantes a esos campos
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0009_alter_etapa_nuevo_schema'),
    ]

    operations = [
        # ------------------------------------------------------------------ #
        # 1. formularios_etapa                                                #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name='FormularioEtapa',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('etapa', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='formulario',
                    to='database.etapa',
                )),
                ('estado', models.CharField(
                    choices=[('BORRADOR', 'Borrador'), ('PUBLICADO', 'Publicado')],
                    default='BORRADOR',
                    max_length=20,
                )),
                ('fecha_publicacion', models.DateTimeField(blank=True, null=True)),
                ('usuario_creacion', models.ForeignKey(
                    blank=True,
                    db_column='usuario_creacion',
                    null=True,
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='formularios_creados',
                    to='database.usuariosistema',
                )),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Formulario de Etapa',
                'verbose_name_plural': 'Formularios de Etapa',
                'db_table': 'formularios_etapa',
            },
        ),

        # ------------------------------------------------------------------ #
        # 2. campos_formulario                                                #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name='CampoFormulario',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('formulario', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='campos',
                    to='database.formularioetapa',
                )),
                ('campo_catalogo', models.CharField(
                    help_text='Identificador del campo en el catálogo (ej: primer_nombre)',
                    max_length=60,
                )),
                ('orden', models.PositiveSmallIntegerField(
                    help_text='Posición del campo en el formulario (1-based)',
                )),
                ('obligatorio', models.BooleanField(default=True)),
                ('texto_ayuda', models.CharField(blank=True, default='', max_length=300)),
            ],
            options={
                'verbose_name': 'Campo de Formulario',
                'verbose_name_plural': 'Campos de Formulario',
                'db_table': 'campos_formulario',
                'ordering': ['formulario', 'orden'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='campoformulario',
            unique_together={('formulario', 'campo_catalogo'), ('formulario', 'orden')},
        ),

        # ------------------------------------------------------------------ #
        # 3. respuestas_formulario                                            #
        # ------------------------------------------------------------------ #
        migrations.CreateModel(
            name='RespuestaFormulario',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('formulario', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='respuestas',
                    to='database.formularioetapa',
                )),
                ('postulante', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='respuestas_formulario',
                    to='database.postulante',
                )),
                ('campo_catalogo', models.CharField(
                    help_text='Debe coincidir con CampoFormulario.campo_catalogo',
                    max_length=60,
                )),
                ('valor', models.TextField()),
                ('fecha_respuesta', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Respuesta de Formulario',
                'verbose_name_plural': 'Respuestas de Formulario',
                'db_table': 'respuestas_formulario',
                'ordering': ['formulario', 'postulante', 'campo_catalogo'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='respuestaformulario',
            unique_together={('formulario', 'postulante', 'campo_catalogo')},
        ),
    ]
