# Manually edited: only apply document type choices reorganization.
# LlamadaVisita/LlamadaPostulacion operations skipped — already handled in DB.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0032_fix_numero_radicado_maxlength'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documentogestionhogar',
            name='tipo_documento',
            field=models.CharField(choices=[
                ('RECIBO_PREDIAL',                 'Recibo predial'),
                ('CERTIFICADO_TRADICION_LIBERTAD', 'Certificado de tradición y libertad'),
                ('ESCRITURA_PUBLICA_PREDIO',       'Escritura pública del predio'),
                ('RECIBO_SERVICIOS_PUBLICOS',      'Recibo de servicios públicos'),
                ('DECLARACION_JURAMENTADA',        'Declaración juramentada'),
                ('CERTIFICADO_RESIDENCIA',         'Certificado de residencia'),
                ('OTRO',                           'Otro'),
            ], max_length=50),
        ),
        migrations.AlterField(
            model_name='documentomiembrohogar',
            name='tipo_documento',
            field=models.CharField(choices=[
                ('FOTO_CEDULA_FRENTE',        'Foto cédula frente'),
                ('FOTO_CEDULA_REVERSO',       'Foto cédula reverso'),
                ('REGISTRO_CIVIL',            'Registro civil'),
                ('TARJETA_IDENTIDAD',         'Tarjeta de identidad'),
                ('CERTIFICADO_SISBEN',        'Certificado SISBEN'),
                ('CERTIFICADO_DISCAPACIDAD',  'Certificado de discapacidad'),
                ('CERTIFICADO_VICTIMA',       'Certificado de víctima'),
                ('OTRO',                      'Otro'),
            ], max_length=30),
        ),
    ]
