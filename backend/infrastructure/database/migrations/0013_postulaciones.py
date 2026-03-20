# Migration 0013 – Postulaciones (tabla de ciclo de vida de solicitudes)
#
# Operaciones:
#   1. Crea la tabla `postulaciones` (modelo Postulacion)
#   2. Agrega FK nullable `postulacion_id` a `gestion_hogar_etapa1`
#   3. Hace nullable el campo `ciudadano_id` en `gestion_hogar_etapa1`

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0012_registro_hogar'),
    ]

    operations = [

        # ── 1. Crear tabla postulaciones ────────────────────────────────── #
        migrations.CreateModel(
            name='Postulacion',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID',
                )),
                ('estado', models.CharField(
                    choices=[
                        ('REGISTRADA',       'Registrada'),
                        ('EN_REVISION',      'En revisión'),
                        ('VISITA_PENDIENTE', 'Visita pendiente'),
                        ('VISITA_REALIZADA', 'Visita realizada'),
                        ('APROBADA',         'Aprobada'),
                        ('RECHAZADA',        'Rechazada'),
                    ],
                    default='REGISTRADA',
                    max_length=20,
                )),
                ('fecha_postulacion',  models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(blank=True, null=True)),
                ('activo_logico',      models.BooleanField(default=True)),
                ('programa', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='postulaciones',
                    to='database.programa',
                )),
                ('etapa_actual', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='postulaciones',
                    to='database.etapa',
                )),
                ('usuario_creacion', models.ForeignKey(
                    blank=True,
                    db_column='usuario_creacion',
                    null=True,
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='postulaciones_creadas',
                    to='database.usuariosistema',
                )),
                ('usuario_modificacion', models.ForeignKey(
                    blank=True,
                    db_column='usuario_modificacion',
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='postulaciones_modificadas',
                    to='database.usuariosistema',
                )),
            ],
            options={
                'verbose_name': 'Postulación',
                'verbose_name_plural': 'Postulaciones',
                'db_table': 'postulaciones',
                'ordering': ['-fecha_postulacion'],
                'indexes': [
                    models.Index(
                        fields=['programa'],
                        name='idx_postulaciones_programa',
                    ),
                ],
            },
        ),

        # ── 2. FK postulacion_id en gestion_hogar_etapa1 ────────────────── #
        migrations.AddField(
            model_name='gestionhogaretapa1',
            name='postulacion',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='gestion_hogar',
                to='database.postulacion',
            ),
        ),

        # ── 3. Hacer nullable ciudadano_id en gestion_hogar_etapa1 ──────── #
        migrations.AlterField(
            model_name='gestionhogaretapa1',
            name='ciudadano',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='postulaciones_hogar',
                to='database.ciudadano',
            ),
        ),
    ]
