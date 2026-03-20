# Generated migration – registro del hogar (Etapa 1)

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0011_ciudadanos'),
    ]

    operations = [
        # ── GestionHogarEtapa1 ───────────────────────────────────────────── #
        migrations.CreateModel(
            name='GestionHogarEtapa1',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                # Ubicación
                ('departamento',            models.CharField(max_length=150)),
                ('municipio',               models.CharField(max_length=150)),
                ('zona',                    models.CharField(choices=[('URBANA', 'Urbana'), ('RURAL', 'Rural')], max_length=10)),
                ('tipo_predio',             models.CharField(blank=True, max_length=50)),
                ('comuna',                  models.CharField(blank=True, max_length=100)),
                ('barrio_vereda',           models.CharField(blank=True, max_length=150)),
                ('direccion',               models.CharField(max_length=300)),
                ('observaciones_direccion', models.TextField(blank=True)),
                # Predio
                ('estrato',                models.CharField(blank=True, max_length=10)),
                ('es_propietario',         models.BooleanField(blank=True, null=True)),
                ('numero_predial',         models.CharField(blank=True, max_length=50)),
                ('matricula_inmobiliaria', models.CharField(blank=True, max_length=50)),
                ('avaluo_catastral',       models.CharField(blank=True, max_length=50)),
                # Servicios
                ('numero_matricula_agua',   models.CharField(blank=True, max_length=50)),
                ('numero_contrato_energia', models.CharField(blank=True, max_length=50)),
                # Info adicional
                ('tiempo_residencia',               models.CharField(blank=True, max_length=100)),
                ('tiene_dependientes',              models.BooleanField(blank=True, null=True)),
                ('personas_con_discapacidad_hogar', models.BooleanField(blank=True, null=True)),
                ('acepta_terminos_condiciones',     models.BooleanField(default=False)),
                # Radicado
                ('numero_radicado', models.CharField(max_length=20, unique=True)),
                ('fecha_radicado',  models.DateTimeField(auto_now_add=True)),
                # FKs
                ('etapa', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='postulaciones_hogar',
                    to='database.etapa',
                )),
                ('ciudadano', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='postulaciones_hogar',
                    to='database.ciudadano',
                )),
            ],
            options={
                'verbose_name': 'Gestión Hogar Etapa 1',
                'verbose_name_plural': 'Gestiones Hogar Etapa 1',
                'db_table': 'gestion_hogar_etapa1',
                'ordering': ['-fecha_radicado'],
            },
        ),

        # ── MiembroHogar ────────────────────────────────────────────────── #
        migrations.CreateModel(
            name='MiembroHogar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                # Datos personales
                ('tipo_documento',   models.CharField(choices=[
                    ('CEDULA_CIUDADANIA', 'Cédula de ciudadanía'),
                    ('CEDULA_EXTRANJERIA', 'Cédula de extranjería'),
                    ('TARJETA_IDENTIDAD', 'Tarjeta de identidad'),
                    ('PASAPORTE', 'Pasaporte'),
                    ('REGISTRO_CIVIL', 'Registro civil'),
                    ('PERMISO_PROTECCION_TEMPORAL', 'Permiso protección temporal'),
                ], max_length=30)),
                ('numero_documento', models.CharField(max_length=30)),
                ('primer_nombre',    models.CharField(max_length=100)),
                ('segundo_nombre',   models.CharField(blank=True, max_length=100)),
                ('primer_apellido',  models.CharField(max_length=100)),
                ('segundo_apellido', models.CharField(blank=True, max_length=100)),
                ('fecha_nacimiento', models.DateField()),
                # Vínculo
                ('parentesco', models.CharField(choices=[
                    ('PADRE', 'Padre'), ('MADRE', 'Madre'), ('HIJO', 'Hijo'), ('HIJA', 'Hija'),
                    ('CONYUGE', 'Cónyuge'), ('COMPANERO_PERMANENTE', 'Compañero(a) permanente'),
                    ('HERMANO', 'Hermano'), ('HERMANA', 'Hermana'),
                    ('ABUELO', 'Abuelo'), ('ABUELA', 'Abuela'), ('NIETO', 'Nieto'), ('NIETA', 'Nieta'),
                    ('TIO', 'Tío'), ('TIA', 'Tía'), ('SOBRINO', 'Sobrino'), ('SOBRINA', 'Sobrina'),
                    ('PRIMO', 'Primo'), ('PRIMA', 'Prima'), ('YERNO', 'Yerno'), ('NUERA', 'Nuera'),
                    ('SUEGRO', 'Suegro'), ('SUEGRA', 'Suegra'), ('CUNADO', 'Cuñado'), ('CUNADA', 'Cuñada'),
                    ('PADRASTRO', 'Padrastro'), ('MADRASTRA', 'Madrastra'),
                    ('HIJASTRO', 'Hijastro'), ('HIJASTRA', 'Hijastra'),
                    ('FAMILIAR_A_CARGO', 'Familiar a cargo'),
                    ('PERSONA_BAJO_CUIDADO', 'Persona bajo cuidado'),
                    ('OTRO', 'Otro'),
                ], max_length=30)),
                ('parentesco_otro', models.CharField(blank=True, max_length=100)),
                ('es_cabeza_hogar', models.BooleanField(default=False)),
                # Socioeconómica
                ('nivel_educativo',    models.CharField(blank=True, max_length=100)),
                ('situacion_laboral',  models.CharField(blank=True, choices=[
                    ('EMPLEADO', 'Empleado'), ('INDEPENDIENTE', 'Independiente'),
                    ('DESEMPLEADO', 'Desempleado'), ('OTRO', 'Otro'),
                ], max_length=20)),
                ('ingresos_mensuales', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('fuente_ingresos',    models.CharField(blank=True, max_length=200)),
                # SISBEN
                ('pertenece_sisben', models.BooleanField(blank=True, null=True)),
                ('grupo_sisben',     models.CharField(blank=True, max_length=10)),
                ('puntaje_sisben',   models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                # Discapacidad
                ('tiene_discapacidad',       models.BooleanField(default=False)),
                ('grado_discapacidad',       models.CharField(blank=True, max_length=100)),
                ('certificado_discapacidad', models.BooleanField(blank=True, null=True)),
                ('numero_certificado',       models.CharField(blank=True, max_length=50)),
                # Víctima
                ('es_victima_conflicto',     models.BooleanField(default=False)),
                ('numero_ruv',               models.CharField(blank=True, max_length=50)),
                ('hecho_victimizante',       models.CharField(blank=True, max_length=200)),
                ('fecha_hecho_victimizante', models.DateField(blank=True, null=True)),
                # Desplazamiento
                ('es_desplazado',         models.BooleanField(default=False)),
                ('fecha_desplazamiento',  models.DateField(blank=True, null=True)),
                ('municipio_origen',      models.CharField(blank=True, max_length=150)),
                ('departamento_origen',   models.CharField(blank=True, max_length=150)),
                ('motivo_desplazamiento', models.CharField(blank=True, max_length=200)),
                # Firmante de paz
                ('es_firmante_paz',                models.BooleanField(default=False)),
                ('codigo_reincorporacion',          models.CharField(blank=True, max_length=50)),
                ('etcr',                            models.CharField(blank=True, max_length=100)),
                ('estado_proceso_reincorporacion',  models.CharField(blank=True, max_length=100)),
                # FK
                ('postulacion', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='miembros',
                    to='database.gestionhogaretapa1',
                )),
            ],
            options={
                'verbose_name': 'Miembro del Hogar',
                'verbose_name_plural': 'Miembros del Hogar',
                'db_table': 'miembros_hogar',
            },
        ),

        # ── DocumentoGestionHogar ────────────────────────────────────────── #
        migrations.CreateModel(
            name='DocumentoGestionHogar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo_documento', models.CharField(choices=[
                    ('FOTO_CEDULA_FRENTE', 'Foto cédula frente'),
                    ('FOTO_CEDULA_REVERSO', 'Foto cédula reverso'),
                    ('RECIBO_PREDIAL', 'Recibo predial'),
                    ('CERTIFICADO_TRADICION_LIBERTAD', 'Certificado de tradición y libertad'),
                    ('ESCRITURA_PUBLICA_PREDIO', 'Escritura pública del predio'),
                    ('RECIBO_SERVICIOS_PUBLICOS', 'Recibo de servicios públicos'),
                    ('DECLARACION_JURAMENTADA', 'Declaración juramentada'),
                    ('CERTIFICADO_RESIDENCIA', 'Certificado de residencia'),
                    ('CERTIFICADO_SISBEN', 'Certificado SISBEN'),
                    ('CERTIFICADO_DISCAPACIDAD', 'Certificado de discapacidad'),
                    ('REGISTRO_VICTIMA', 'Registro de víctima (RUV)'),
                    ('OTRO', 'Otro'),
                ], max_length=50)),
                ('archivo',       models.FileField(upload_to='documentos/hogar/%Y/%m/')),
                ('observaciones', models.TextField(blank=True)),
                ('fecha_carga',   models.DateTimeField(auto_now_add=True)),
                ('postulacion', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='documentos',
                    to='database.gestionhogaretapa1',
                )),
            ],
            options={
                'verbose_name': 'Documento de Gestión Hogar',
                'verbose_name_plural': 'Documentos de Gestión Hogar',
                'db_table': 'documentos_gestion_hogar_etapa1',
            },
        ),

        # ── DocumentoMiembroHogar ────────────────────────────────────────── #
        migrations.CreateModel(
            name='DocumentoMiembroHogar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo_documento', models.CharField(choices=[
                    ('CEDULA', 'Cédula de ciudadanía'),
                    ('REGISTRO_CIVIL', 'Registro civil'),
                    ('TARJETA_IDENTIDAD', 'Tarjeta de identidad'),
                    ('CERTIFICADO_DISCAPACIDAD', 'Certificado de discapacidad'),
                    ('CERTIFICADO_VICTIMA', 'Certificado de víctima'),
                    ('OTRO', 'Otro'),
                ], max_length=30)),
                ('archivo',       models.FileField(upload_to='documentos/miembros/%Y/%m/')),
                ('observaciones', models.TextField(blank=True)),
                ('fecha_carga',   models.DateTimeField(auto_now_add=True)),
                ('miembro', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='documentos',
                    to='database.miembrohogar',
                )),
            ],
            options={
                'verbose_name': 'Documento de Miembro',
                'verbose_name_plural': 'Documentos de Miembro',
                'db_table': 'documentos_miembro_hogar',
            },
        ),

        # ── ConfigRegistroHogar ──────────────────────────────────────────── #
        migrations.CreateModel(
            name='ConfigRegistroHogar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('campos', models.JSONField(
                    default=dict,
                    help_text='Dict: { campo_id: { "requerido": bool, "habilitado": bool } }',
                )),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('etapa', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='config_registro_hogar',
                    to='database.etapa',
                )),
            ],
            options={
                'verbose_name': 'Configuración Registro Hogar',
                'verbose_name_plural': 'Configuraciones Registro Hogar',
                'db_table': 'config_registro_hogar',
            },
        ),
    ]
