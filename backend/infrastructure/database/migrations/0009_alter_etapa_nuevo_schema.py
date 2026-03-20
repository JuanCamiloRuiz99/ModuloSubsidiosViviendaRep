"""
Migration: Rediseño completo del modelo Etapa

Reemplaza los campos originales (nombre, descripcion, estado, orden, fechas)
por el nuevo esquema basado en numero_etapa, modulo_principal y trazabilidad.

Nota: existe una migración fantasma (0009_etapa_trazabilidad) aplicada en la DB
pero sin archivo de código. Esta migración limpia primero esas columnas residuales.
"""
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0008_alter_numero_documento_not_null_unique'),
    ]

    operations = [
        # ── Paso 0: limpiar columnas residuales del ghost migration ─────────────
        # La migración '0009_etapa_trazabilidad' fue aplicada a la DB pero su archivo
        # fue eliminado. Eliminamos sus columnas residuales para que los AddField
        # siguientes no fallen con DuplicateColumn.
        migrations.RunSQL(
            sql="""
                DELETE FROM django_migrations
                WHERE app = 'database' AND name = '0009_etapa_trazabilidad';

                ALTER TABLE programas_etapa DROP COLUMN IF EXISTS activo_logico;
                ALTER TABLE programas_etapa DROP COLUMN IF EXISTS fecha_modificacion;
                ALTER TABLE programas_etapa DROP COLUMN IF EXISTS fecha_eliminacion;
                ALTER TABLE programas_etapa DROP COLUMN IF EXISTS id_usuario_creador;
                ALTER TABLE programas_etapa DROP COLUMN IF EXISTS usuario_modificacion;
                ALTER TABLE programas_etapa DROP COLUMN IF EXISTS usuario_eliminacion;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),

        # ── Paso 1: eliminar unique_together antigua (referencia 'nombre') ──────
        migrations.AlterUniqueTogether(
            name='etapa',
            unique_together=set(),
        ),

        # ── Paso 2: eliminar campos del esquema anterior ─────────────────────────
        migrations.RemoveField(model_name='etapa', name='nombre'),
        migrations.RemoveField(model_name='etapa', name='descripcion'),
        migrations.RemoveField(model_name='etapa', name='estado'),
        migrations.RemoveField(model_name='etapa', name='orden'),
        migrations.RemoveField(model_name='etapa', name='fecha_inicio'),
        migrations.RemoveField(model_name='etapa', name='fecha_fin'),
        migrations.RemoveField(model_name='etapa', name='fecha_actualizacion'),

        # ── Paso 3: agregar nuevos campos ────────────────────────────────────────
        migrations.AddField(
            model_name='etapa',
            name='numero_etapa',
            field=models.PositiveIntegerField(default=1),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='etapa',
            name='modulo_principal',
            field=models.CharField(
                choices=[
                    ('REGISTRO_HOGAR', 'Registro del Hogar'),
                    ('VISITA_TECNICA', 'Visita Técnica'),
                    ('GESTION_DOCUMENTAL_INTERNA', 'Gestión Documental Interna'),
                ],
                default='REGISTRO_HOGAR',
                max_length=40,
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='etapa',
            name='usuario_creacion',
            field=models.ForeignKey(
                blank=True,
                db_column='usuario_creacion',
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name='etapas_creadas',
                to='database.usuariosistema',
            ),
        ),
        migrations.AddField(
            model_name='etapa',
            name='usuario_modificacion',
            field=models.ForeignKey(
                blank=True,
                db_column='usuario_modificacion',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='etapas_modificadas',
                to='database.usuariosistema',
            ),
        ),
        migrations.AddField(
            model_name='etapa',
            name='fecha_modificacion',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='etapa',
            name='activo_logico',
            field=models.BooleanField(default=True),
        ),

        # ── Paso 4: nueva restricción unique_together ────────────────────────────
        migrations.AlterUniqueTogether(
            name='etapa',
            unique_together={('programa', 'numero_etapa')},
        ),

        # ── Paso 5: actualizar opciones del modelo ───────────────────────────────
        migrations.AlterModelOptions(
            name='etapa',
            options={
                'ordering': ['programa', 'numero_etapa'],
                'verbose_name': 'Etapa',
                'verbose_name_plural': 'Etapas',
            },
        ),

        # ── Paso 6: renombrar tabla a etapas_proceso ─────────────────────────────
        migrations.AlterModelTable(
            name='etapa',
            table='etapas_proceso',
        ),
    ]

