from django.db import migrations, models
import django.db.models.deletion


def poblar_ruta_archivo_gestion_hogar(apps, schema_editor):
    DocumentoGestionHogar = apps.get_model('database', 'DocumentoGestionHogar')
    for doc in DocumentoGestionHogar.objects.all().iterator():
        ruta = getattr(doc, 'archivo', '') or ''
        if ruta and not doc.ruta_archivo:
            doc.ruta_archivo = str(ruta)
            doc.save(update_fields=['ruta_archivo'])


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0015_campos_incorrectos'),
    ]

    operations = [
        migrations.AddField(
            model_name='documentogestionhogar',
            name='ruta_archivo',
            field=models.CharField(blank=True, default='', max_length=500),
        ),
        migrations.AddField(
            model_name='documentogestionhogar',
            name='usuario_carga',
            field=models.ForeignKey(
                blank=True,
                db_column='usuario_carga',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='documentos_gestion_hogar_cargados',
                to='database.usuariosistema',
            ),
        ),
        migrations.AddField(
            model_name='documentogestionhogar',
            name='usuario_eliminacion',
            field=models.ForeignKey(
                blank=True,
                db_column='usuario_eliminacion',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='documentos_gestion_hogar_eliminados',
                to='database.usuariosistema',
            ),
        ),
        migrations.AddField(
            model_name='documentogestionhogar',
            name='fecha_eliminacion',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='documentogestionhogar',
            name='activo_logico',
            field=models.BooleanField(default=True),
        ),
        migrations.RunPython(
            poblar_ruta_archivo_gestion_hogar,
            migrations.RunPython.noop,
        ),
    ]
