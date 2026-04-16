"""
Modelos de base de datos para la capa de infraestructura.

Estos modelos Django mapean directamente a las entidades de dominio.
"""
from django.db import models
import uuid


class Programa(models.Model):
    """Modelo ORM para el programa de subsidios de vivienda"""

    ESTADOS = [
        ('BORRADOR', 'Borrador'),
        ('ACTIVO', 'Activo'),
        ('INHABILITADO', 'Inhabilitado'),
        ('CULMINADO', 'Culminado'),
    ]

    nombre = models.CharField(max_length=255, blank=False)
    descripcion = models.TextField(blank=False)
    entidad_responsable = models.CharField(max_length=255, blank=False)
    codigo_programa = models.CharField(max_length=20, unique=True, blank=False)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='BORRADOR')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Programa'
        verbose_name_plural = 'Programas'
        db_table = 'gestion_programa'

    def __str__(self):
        return f"{self.nombre} ({self.codigo_programa})"

    def save(self, *args, **kwargs):
        # Generar código automático si no existe
        if not self.codigo_programa:
            from datetime import datetime
            year = datetime.now().year
            random_suffix = str(uuid.uuid4().hex[:4]).upper()
            self.codigo_programa = f"{year}BS{random_suffix}"
        super().save(*args, **kwargs)


class Etapa(models.Model):
    """Modelo ORM para las etapas de proceso de un programa"""

    MODULOS = [
        ('REGISTRO_HOGAR', 'Registro del Hogar'),
        ('VISITA_TECNICA', 'Visita Técnica'),
        ('GESTION_DOCUMENTAL_INTERNA', 'Gestión Documental Interna'),
    ]

    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='etapas')
    numero_etapa = models.PositiveIntegerField()
    modulo_principal = models.CharField(max_length=40, choices=MODULOS)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    usuario_creacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='etapas_creadas',
        db_column='usuario_creacion',
    )
    usuario_modificacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='etapas_modificadas',
        db_column='usuario_modificacion',
    )
    fecha_modificacion = models.DateTimeField(null=True, blank=True)
    activo_logico = models.BooleanField(default=True)
    finalizada = models.BooleanField(default=False)
    fecha_finalizacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['programa', 'numero_etapa']
        verbose_name = 'Etapa'
        verbose_name_plural = 'Etapas'
        db_table = 'etapas_programas'
        unique_together = [('programa', 'numero_etapa')]

    def __str__(self):
        return f"{self.programa.nombre} - Etapa {self.numero_etapa}"


class FormularioEtapa(models.Model):
    """
    Plantilla de formulario asociada a una etapa de proceso.
    Una etapa tiene exactamente un formulario (UNIQUE en etapa).
    Estado BORRADOR mientras se construye; PUBLICADO cuando el gestor lo activa.
    """

    ESTADOS = [
        ('BORRADOR', 'Borrador'),
        ('PUBLICADO', 'Publicado'),
    ]

    etapa = models.OneToOneField(
        Etapa,
        on_delete=models.CASCADE,
        related_name='formulario',
    )
    estado = models.CharField(max_length=20, choices=ESTADOS, default='BORRADOR')
    fecha_publicacion = models.DateTimeField(null=True, blank=True)
    usuario_creacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='formularios_creados',
        db_column='usuario_creacion',
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_modificacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'formularios_etapa'
        verbose_name = 'Formulario de Etapa'
        verbose_name_plural = 'Formularios de Etapa'

    def __str__(self):
        return f"Formulario Etapa {self.etapa.numero_etapa} ({self.estado})"


class CampoFormulario(models.Model):
    """
    Campo individual seleccionado por el gestor para un formulario.
    campo_catalogo referencia el identificador del catálogo de campos
    (ej: 'primer_nombre', 'tipo_documento'), no una FK a otra tabla
    porque el catálogo es estático en el front-end.
    """

    formulario = models.ForeignKey(
        FormularioEtapa,
        on_delete=models.CASCADE,
        related_name='campos',
    )
    campo_catalogo = models.CharField(
        max_length=60,
        help_text="Identificador del campo en el catálogo (ej: primer_nombre)",
    )
    orden = models.PositiveSmallIntegerField(
        help_text="Posición del campo en el formulario (1-based)",
    )
    obligatorio = models.BooleanField(default=True)
    texto_ayuda = models.CharField(max_length=300, blank=True, default='')

    class Meta:
        db_table = 'campos_formulario'
        unique_together = [
            ('formulario', 'campo_catalogo'),
            ('formulario', 'orden'),
        ]
        ordering = ['formulario', 'orden']
        verbose_name = 'Campo de Formulario'
        verbose_name_plural = 'Campos de Formulario'

    def __str__(self):
        return f"{self.formulario} · {self.campo_catalogo} (#{self.orden})"


class Ciudadano(models.Model):
    """
    Registro de un ciudadano que completó un formulario de postulación.
    La clave única del ciudadano es (tipo_documento, numero_documento):
    si vuelve a enviar el formulario se actualiza su información.
    Se conserva referencia al último formulario enviado para trazabilidad.
    """

    TIPO_DOCUMENTO_CHOICES = [
        ('CEDULA_CIUDADANIA',           'Cédula de ciudadanía'),
        ('CEDULA_EXTRANJERIA',          'Cédula de extranjería'),
        ('TARJETA_IDENTIDAD',           'Tarjeta de identidad'),
        ('PASAPORTE',                   'Pasaporte'),
        ('REGISTRO_CIVIL',              'Registro civil'),
        ('PERMISO_PROTECCION_TEMPORAL', 'Permiso protección temporal'),
    ]

    SEXO_CHOICES = [
        ('MASCULINO',   'Masculino'),
        ('FEMENINO',    'Femenino'),
        ('INTERSEXUAL', 'Intersexual'),
    ]

    id_persona = models.AutoField(primary_key=True)

    tipo_documento = models.CharField(max_length=30, choices=TIPO_DOCUMENTO_CHOICES)
    numero_documento = models.CharField(max_length=30)

    primer_nombre = models.CharField(max_length=100)
    segundo_nombre = models.CharField(max_length=100, null=True, blank=True)

    primer_apellido = models.CharField(max_length=100)
    segundo_apellido = models.CharField(max_length=100, null=True, blank=True)

    fecha_nacimiento = models.DateField()

    sexo = models.CharField(max_length=15, choices=SEXO_CHOICES)
    genero = models.CharField(max_length=50, null=True, blank=True)

    nacionalidad = models.CharField(max_length=100)

    telefono = models.CharField(max_length=20, null=True, blank=True)
    correo_electronico = models.EmailField(max_length=150, null=True, blank=True)

    departamento_nacimiento = models.CharField(max_length=150, null=True, blank=True)
    municipio_nacimiento = models.CharField(max_length=150, null=True, blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    # Campo operacional: referencia al formulario en el que registró sus datos
    formulario = models.ForeignKey(
        FormularioEtapa,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ciudadanos',
    )

    class Meta:
        db_table = 'ciudadanos'
        ordering = ['-fecha_creacion']
        unique_together = [('tipo_documento', 'numero_documento')]
        verbose_name = 'Ciudadano'
        verbose_name_plural = 'Ciudadanos'

    def __str__(self):
        return f'{self.primer_nombre} {self.primer_apellido} ({self.numero_documento})'


# ─────────────────────────────────────────────────────────────────────────── #
# Registro del Hogar – Etapa 1                                                #
# ─────────────────────────────────────────────────────────────────────────── #

class GestionHogarEtapa1(models.Model):
    """Registro principal de un hogar para Etapa 1 (Registro del Hogar)."""

    ZONA_CHOICES = [
        ('URBANA', 'Urbana'),
        ('RURAL',  'Rural'),
    ]

    postulacion = models.OneToOneField(
        'database.Postulacion',
        on_delete=models.CASCADE,
        related_name='gestion_hogar',
        null=True,
        blank=True,
    )
    etapa     = models.ForeignKey(
        Etapa,
        on_delete=models.PROTECT,
        related_name='postulaciones_hogar',
    )
    ciudadano = models.ForeignKey(
        Ciudadano,
        on_delete=models.PROTECT,
        related_name='postulaciones_hogar',
        null=True,
        blank=True,
    )

    # Ubicación
    departamento            = models.CharField(max_length=150)
    municipio               = models.CharField(max_length=150)
    zona                    = models.CharField(max_length=10, choices=ZONA_CHOICES)
    tipo_predio             = models.CharField(max_length=50, blank=True)
    comuna                  = models.CharField(max_length=100, blank=True)
    barrio_vereda           = models.CharField(max_length=150, blank=True)
    direccion               = models.CharField(max_length=300)
    observaciones_direccion = models.TextField(blank=True)

    # Predio
    estrato                 = models.CharField(max_length=10, blank=True)
    es_propietario          = models.BooleanField(null=True, blank=True)
    numero_predial          = models.CharField(max_length=50, blank=True)
    matricula_inmobiliaria  = models.CharField(max_length=50, blank=True)
    avaluo_catastral        = models.CharField(max_length=50, blank=True)

    # Servicios públicos
    numero_matricula_agua   = models.CharField(max_length=50, blank=True)
    numero_contrato_energia = models.CharField(max_length=50, blank=True)

    # Información adicional
    tiempo_residencia               = models.CharField(max_length=100, blank=True)
    tiene_dependientes              = models.BooleanField(null=True, blank=True)
    personas_con_discapacidad_hogar = models.BooleanField(null=True, blank=True)

    acepta_terminos_condiciones = models.BooleanField(default=False)

    # Revisión interna
    campos_incorrectos   = models.JSONField(default=list, blank=True)
    observaciones_revision = models.TextField(blank=True, default='')

    numero_radicado = models.CharField(max_length=40, unique=True)
    fecha_radicado  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'gestion_hogar_etapa1'
        ordering = ['-fecha_radicado']
        verbose_name = 'Gestión Hogar Etapa 1'
        verbose_name_plural = 'Gestiones Hogar Etapa 1'

    def __str__(self):
        return f'Postulación {self.numero_radicado} – {self.ciudadano}'


class MiembroHogar(models.Model):
    """Miembro del hogar registrado como parte de una postulación."""

    TIPO_DOCUMENTO_CHOICES = [
        ('CEDULA_CIUDADANIA',           'Cédula de ciudadanía'),
        ('CEDULA_EXTRANJERIA',          'Cédula de extranjería'),
        ('TARJETA_IDENTIDAD',           'Tarjeta de identidad'),
        ('PASAPORTE',                   'Pasaporte'),
        ('REGISTRO_CIVIL',              'Registro civil'),
        ('PERMISO_PROTECCION_TEMPORAL', 'Permiso protección temporal'),
    ]

    PARENTESCO_CHOICES = [
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
    ]

    SITUACION_LABORAL_CHOICES = [
        ('EMPLEADO',      'Empleado'),
        ('INDEPENDIENTE', 'Independiente'),
        ('DESEMPLEADO',   'Desempleado'),
        ('OTRO',          'Otro'),
    ]

    postulacion = models.ForeignKey(
        GestionHogarEtapa1,
        on_delete=models.CASCADE,
        related_name='miembros',
    )

    # Datos personales
    SEXO_CHOICES = [
        ('MASCULINO',   'Masculino'),
        ('FEMENINO',    'Femenino'),
        ('INTERSEXUAL', 'Intersexual'),
        ('NO_BINARIO',  'No binario'),
        ('PREFIERE_NO_DECIR', 'Prefiere no decir'),
    ]

    tipo_documento   = models.CharField(max_length=30, choices=TIPO_DOCUMENTO_CHOICES)
    numero_documento = models.CharField(max_length=30)
    primer_nombre    = models.CharField(max_length=100)
    segundo_nombre   = models.CharField(max_length=100, blank=True)
    primer_apellido  = models.CharField(max_length=100)
    segundo_apellido = models.CharField(max_length=100, blank=True)
    fecha_nacimiento = models.DateField()
    sexo             = models.CharField(max_length=20, choices=SEXO_CHOICES, blank=True)
    telefono         = models.CharField(max_length=20, blank=True)
    correo_electronico = models.EmailField(max_length=150, blank=True)

    # Vínculo con el hogar
    parentesco      = models.CharField(max_length=30, choices=PARENTESCO_CHOICES)
    parentesco_otro = models.CharField(max_length=100, blank=True)
    es_cabeza_hogar = models.BooleanField(default=False)

    # Información socioeconómica
    nivel_educativo    = models.CharField(max_length=100, blank=True)
    situacion_laboral  = models.CharField(max_length=20, choices=SITUACION_LABORAL_CHOICES, blank=True)
    ingresos_mensuales = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fuente_ingresos    = models.CharField(max_length=200, blank=True)

    # SISBEN
    pertenece_sisben = models.BooleanField(null=True, blank=True)
    grupo_sisben     = models.CharField(max_length=10, blank=True)
    puntaje_sisben   = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    # Discapacidad
    tiene_discapacidad       = models.BooleanField(default=False)
    grado_discapacidad       = models.CharField(max_length=100, blank=True)
    certificado_discapacidad = models.BooleanField(null=True, blank=True)
    numero_certificado       = models.CharField(max_length=50, blank=True)

    # Víctima del conflicto
    es_victima_conflicto     = models.BooleanField(default=False)
    numero_ruv               = models.CharField(max_length=50, blank=True)
    hecho_victimizante       = models.CharField(max_length=200, blank=True)
    fecha_hecho_victimizante = models.DateField(null=True, blank=True)

    # Desplazamiento
    es_desplazado         = models.BooleanField(default=False)
    fecha_desplazamiento  = models.DateField(null=True, blank=True)
    municipio_origen      = models.CharField(max_length=150, blank=True)
    departamento_origen   = models.CharField(max_length=150, blank=True)
    motivo_desplazamiento = models.CharField(max_length=200, blank=True)

    # Firmante de paz
    es_firmante_paz                = models.BooleanField(default=False)
    codigo_reincorporacion         = models.CharField(max_length=50, blank=True)
    etcr                           = models.CharField(max_length=100, blank=True)
    estado_proceso_reincorporacion = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = 'miembros_hogar'
        verbose_name = 'Miembro del Hogar'
        verbose_name_plural = 'Miembros del Hogar'

    def __str__(self):
        return f'{self.primer_nombre} {self.primer_apellido} ({self.postulacion.numero_radicado})'


class DocumentoGestionHogar(models.Model):
    """Documento adjunto al registro del hogar (nivel postulación)."""

    TIPO_CHOICES = [
        ('RECIBO_PREDIAL',                 'Recibo predial'),
        ('CERTIFICADO_TRADICION_LIBERTAD', 'Certificado de tradición y libertad'),
        ('ESCRITURA_PUBLICA_PREDIO',       'Escritura pública del predio'),
        ('RECIBO_SERVICIOS_PUBLICOS',      'Recibo de servicios públicos'),
        ('DECLARACION_JURAMENTADA',        'Declaración juramentada'),
        ('CERTIFICADO_RESIDENCIA',         'Certificado de residencia'),
        ('OTRO',                           'Otro'),
    ]

    postulacion    = models.ForeignKey(
        GestionHogarEtapa1,
        on_delete=models.CASCADE,
        related_name='documentos',
    )
    tipo_documento = models.CharField(max_length=50, choices=TIPO_CHOICES)
    archivo        = models.FileField(upload_to='documentos/hogar/%Y/%m/')
    ruta_archivo   = models.CharField(max_length=500, blank=True, default='')
    observaciones  = models.TextField(blank=True)
    usuario_carga = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_gestion_hogar_cargados',
        db_column='usuario_carga',
    )
    fecha_carga    = models.DateTimeField(auto_now_add=True)
    usuario_eliminacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_gestion_hogar_eliminados',
        db_column='usuario_eliminacion',
    )
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)
    activo_logico = models.BooleanField(default=True)

    class Meta:
        db_table = 'documentos_gestion_hogar_etapa1'
        verbose_name = 'Documento de Gestión Hogar'
        verbose_name_plural = 'Documentos de Gestión Hogar'

    def __str__(self):
        return f'{self.tipo_documento} – {self.postulacion.numero_radicado}'

    def save(self, *args, **kwargs):
        if self.archivo:
            self.ruta_archivo = self.archivo.name
        super().save(*args, **kwargs)


class DocumentoMiembroHogar(models.Model):
    """Documento adjunto a un miembro del hogar."""

    TIPO_CHOICES = [
        ('FOTO_CEDULA_FRENTE',        'Foto cédula frente'),
        ('FOTO_CEDULA_REVERSO',       'Foto cédula reverso'),
        ('REGISTRO_CIVIL',            'Registro civil'),
        ('TARJETA_IDENTIDAD',         'Tarjeta de identidad'),
        ('CERTIFICADO_SISBEN',        'Certificado SISBEN'),
        ('CERTIFICADO_DISCAPACIDAD',  'Certificado de discapacidad'),
        ('CERTIFICADO_VICTIMA',       'Certificado de víctima'),
        ('OTRO',                      'Otro'),
    ]

    miembro        = models.ForeignKey(
        MiembroHogar,
        on_delete=models.CASCADE,
        related_name='documentos',
    )
    tipo_documento = models.CharField(max_length=30, choices=TIPO_CHOICES)
    archivo        = models.FileField(upload_to='documentos/miembros/%Y/%m/')
    ruta_archivo   = models.CharField(max_length=500, blank=True, default='')
    observaciones  = models.TextField(blank=True)
    usuario_carga = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_miembro_hogar_cargados',
        db_column='usuario_carga',
    )
    fecha_carga    = models.DateTimeField(auto_now_add=True)
    usuario_eliminacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_miembro_hogar_eliminados',
        db_column='usuario_eliminacion',
    )
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)
    activo_logico = models.BooleanField(default=True)

    class Meta:
        db_table = 'documentos_miembro_hogar'
        verbose_name = 'Documento de Miembro'
        verbose_name_plural = 'Documentos de Miembro'

    def __str__(self):
        return f'{self.tipo_documento} – {self.miembro}'

    def save(self, *args, **kwargs):
        if self.archivo:
            self.ruta_archivo = self.archivo.name
        super().save(*args, **kwargs)


class ConfigRegistroHogar(models.Model):
    """
    Configuración de campos del formulario de Registro del Hogar para una etapa.
    Almacena para cada campo_id si está habilitado y si es obligatorio.
    El diccionario `campos` tiene la forma:
        { "campo_id": { "requerido": bool, "habilitado": bool } }
    """

    etapa = models.OneToOneField(
        Etapa,
        on_delete=models.CASCADE,
        related_name='config_registro_hogar',
    )
    campos = models.JSONField(
        default=dict,
        help_text='Dict: { campo_id: { "requerido": bool, "habilitado": bool } }',
    )
    publicado = models.BooleanField(
        default=False,
        help_text='True cuando el gestor ha publicado el formulario de registro del hogar.',
    )
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'config_registro_hogar'
        verbose_name = 'Configuración Registro Hogar'
        verbose_name_plural = 'Configuraciones Registro Hogar'

    def __str__(self):
        return f'Config Registro Hogar – Etapa {self.etapa.numero_etapa}'


class ConfigVisitaTecnica(models.Model):
    """
    Configuración de campos del formulario de Visita Técnica para una etapa.
    Almacena para cada campo_id si está habilitado y si es obligatorio.
    El diccionario `campos` tiene la forma:
        { "campo_id": { "requerido": bool, "habilitado": bool } }
    """

    etapa = models.OneToOneField(
        Etapa,
        on_delete=models.CASCADE,
        related_name='config_visita_tecnica',
    )
    campos = models.JSONField(
        default=dict,
        help_text='Dict: { campo_id: { "requerido": bool, "habilitado": bool } }',
    )
    publicado = models.BooleanField(
        default=False,
        help_text='True cuando el gestor ha publicado el formulario de visita técnica.',
    )
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'config_visita_tecnica'
        verbose_name = 'Configuración Visita Técnica'
        verbose_name_plural = 'Configuraciones Visita Técnica'

    def __str__(self):
        return f'Config Visita Técnica – Etapa {self.etapa.numero_etapa}'


class ConfigGestionDocumental(models.Model):
    """
    Configuración de campos del formulario de Gestión Documental Interna para una etapa.
    Almacena para cada campo_id si está habilitado y si es obligatorio.
    El diccionario `campos` tiene la forma:
        { "campo_id": { "requerido": bool, "habilitado": bool } }
    """

    etapa = models.OneToOneField(
        Etapa,
        on_delete=models.CASCADE,
        related_name='config_gestion_documental',
    )
    campos = models.JSONField(
        default=dict,
        help_text='Dict: { campo_id: { "requerido": bool, "habilitado": bool } }',
    )
    publicado = models.BooleanField(
        default=False,
        help_text='True cuando el gestor ha publicado el formulario de gestión documental.',
    )
    fecha_modificacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'config_gestion_documental'
        verbose_name = 'Configuración Gestión Documental'
        verbose_name_plural = 'Configuraciones Gestión Documental'

    def __str__(self):
        return f'Config Gestión Documental – Etapa {self.etapa.numero_etapa}'


# ─────────────────────────────────────────────────────────────────────────── #
# Postulacion – registro de ciclo de vida de una solicitud                    #
# ─────────────────────────────────────────────────────────────────────────── #

class Postulacion(models.Model):
    """
    Registro de ciclo de vida de una postulación a un programa de subsidios.
    Agrupa todas las etapas, documentos y decisiones asociadas a una solicitud.
    """

    ESTADOS = [
        ('REGISTRADA',          'Registrada'),
        ('EN_REVISION',         'En revisión'),
        ('SUBSANACION',         'Subsanación'),
        ('VISITA_PENDIENTE',    'Visita pendiente'),
        ('VISITA_ASIGNADA',     'Visita asignada'),
        ('VISITA_PROGRAMADA',   'Visita programada'),
        ('VISITA_REALIZADA',       'Visita realizada'),
        ('DOCUMENTOS_INCOMPLETOS', 'Documentos incompletos'),
        ('DOCUMENTOS_CARGADOS',    'Documentos cargados'),
        ('BENEFICIADO',         'Beneficiado'),
        ('NO_BENEFICIARIO',     'No beneficiario'),
        ('APROBADA',            'Aprobada'),
        ('RECHAZADA',           'Rechazada'),
    ]

    programa = models.ForeignKey(
        Programa,
        on_delete=models.PROTECT,
        related_name='postulaciones',
    )
    etapa_actual = models.ForeignKey(
        Etapa,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='postulaciones',
    )
    estado = models.CharField(max_length=25, choices=ESTADOS, default='EN_REVISION')
    fecha_postulacion = models.DateTimeField(auto_now_add=True)

    usuario_creacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='postulaciones_creadas',
        db_column='usuario_creacion',
    )
    usuario_modificacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='postulaciones_modificadas',
        db_column='usuario_modificacion',
    )
    funcionario_asignado = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='postulaciones_asignadas',
        db_column='funcionario_asignado',
    )
    fecha_modificacion = models.DateTimeField(null=True, blank=True)
    activo_logico = models.BooleanField(default=True)

    class Meta:
        db_table = 'postulaciones'
        ordering = ['-fecha_postulacion']
        verbose_name = 'Postulación'
        verbose_name_plural = 'Postulaciones'
        indexes = [
            models.Index(fields=['programa'], name='idx_postulaciones_programa'),
            models.Index(fields=['programa', 'estado'], name='idx_postulaciones_prog_estado'),
            models.Index(fields=['funcionario_asignado'], name='idx_postulaciones_func_asig'),
            models.Index(fields=['estado'], name='idx_postulaciones_estado'),
        ]

    def __str__(self):
        return f'Postulación #{self.id} – {self.programa.nombre} ({self.estado})'


# ─────────────────────────────────────────────────────────────────────────── #
# Visitas – Etapa 2                                                           #
# ─────────────────────────────────────────────────────────────────────────── #

class Visita(models.Model):
    """Registro de una visita técnica a un hogar postulado."""

    MOTIVO_NO_EFECTIVA_CHOICES = [
        ('AUSENTE',                  'Ausente'),
        ('RECHAZO_VISITA',           'Rechazo de visita'),
        ('DIRECCION_NO_ENCONTRADA',  'Dirección no encontrada'),
        ('OTRO',                     'Otro'),
    ]

    TIPO_VISITA_CHOICES = [
        ('INICIAL',       'Inicial'),
        ('SEGUIMIENTO',   'Seguimiento'),
        ('VERIFICACION',  'Verificación'),
        ('FINAL',         'Final'),
    ]

    ESTADO_VISITA_CHOICES = [
        ('ASIGNADA',    'Asignada'),
        ('PROGRAMADA',  'Programada'),
        ('REALIZANDO',  'Realizando'),
        ('COMPLETADA',  'Completada'),
        ('CANCELADA',   'Cancelada'),
    ]

    postulacion = models.ForeignKey(
        Postulacion,
        on_delete=models.CASCADE,
        related_name='visitas',
    )
    etapa = models.ForeignKey(
        Etapa,
        on_delete=models.PROTECT,
        related_name='visitas',
        null=True,
        blank=True,
    )
    miembro = models.ForeignKey(
        MiembroHogar,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitas',
    )
    encuestador = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.RESTRICT,
        related_name='visitas_asignadas',
        db_column='id_encuestador',
        null=True,
        blank=True,
    )

    # ── Campos DDD (gestión panel) ─────────────────────────────────────── #
    tipo_visita = models.CharField(
        max_length=20,
        choices=TIPO_VISITA_CHOICES,
        null=True,
        blank=True,
    )
    estado_visita = models.CharField(
        max_length=20,
        choices=ESTADO_VISITA_CHOICES,
        default='PROGRAMADA',
    )
    direccion = models.CharField(max_length=500, blank=True, default='')
    fecha_programada = models.DateTimeField(null=True, blank=True)
    calificacion = models.IntegerField(null=True, blank=True)
    motivo_cancelacion = models.CharField(max_length=500, blank=True, default='')
    fecha_realizacion = models.DateTimeField(null=True, blank=True)
    fecha_cancelacion = models.DateTimeField(null=True, blank=True)

    fecha_visita = models.DateTimeField(null=True, blank=True)
    visita_efectiva = models.BooleanField(null=True, blank=True)

    motivo_no_efectiva = models.CharField(
        max_length=30,
        choices=MOTIVO_NO_EFECTIVA_CHOICES,
        null=True,
        blank=True,
    )
    motivo_no_efectiva_otro = models.CharField(max_length=200, blank=True, default='')

    nombre_encuestado = models.CharField(max_length=200, blank=True, default='')
    numero_documento_encuestado = models.CharField(max_length=30, blank=True, default='')
    telefono_contacto = models.CharField(max_length=30, blank=True, default='')

    acta_firmada = models.CharField(max_length=500, blank=True, default='')
    observaciones_generales = models.TextField(blank=True, default='')

    # Trazabilidad
    id_encuestador_creacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.PROTECT,
        related_name='visitas_creadas',
        db_column='id_encuestador_creacion',
        null=True,
        blank=True,
    )
    fecha_registro = models.DateTimeField(auto_now_add=True)

    usuario_modificacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitas_modificadas',
        db_column='usuario_modificacion_visita',
    )
    fecha_modificacion = models.DateTimeField(null=True, blank=True)

    usuario_validacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitas_validadas',
        db_column='usuario_validacion',
    )
    fecha_validacion = models.DateTimeField(null=True, blank=True)

    usuario_eliminacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visitas_eliminadas',
        db_column='usuario_eliminacion_visita',
    )
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)

    activo_logico = models.BooleanField(default=True)

    class Meta:
        db_table = 'visitas'
        ordering = ['-fecha_registro']
        verbose_name = 'Visita'
        verbose_name_plural = 'Visitas'
        indexes = [
            models.Index(fields=['postulacion'], name='idx_visita_postulacion'),
        ]

    def __str__(self):
        return f'Visita #{self.pk} – Postulación {self.postulacion_id}'


class DatosHogarEtapa2(models.Model):
    """Datos del hogar recopilados durante la visita técnica (Etapa 2)."""

    CALIDAD_TENENCIA_CHOICES = [
        ('PROPIETARIO',    'Propietario'),
        ('POSEEDOR',       'Poseedor'),
        ('ARRENDATARIO',   'Arrendatario'),
        ('USUFRUCTUARIO',  'Usufructuario'),
    ]
    USO_INMUEBLE_CHOICES = [
        ('RESIDENCIAL',    'Residencial'),
        ('COMERCIAL',      'Comercial'),
        ('MIXTO',          'Mixto'),
        ('INSTITUCIONAL',  'Institucional'),
    ]
    RANGO_INGRESOS_CHOICES = [
        ('MENOS_1_SMMLV', 'Menos de 1 SMMLV'),
        ('1_A_2_SMMLV',   '1 a 2 SMMLV'),
        ('2_A_4_SMMLV',   '2 a 4 SMMLV'),
        ('MAS_4_SMMLV',   'Más de 4 SMMLV'),
    ]
    MATERIAL_PISOS_CHOICES = [
        ('TIERRA',   'Tierra'),
        ('CEMENTO',  'Cemento'),
        ('BALDOSA',  'Baldosa'),
        ('MADERA',   'Madera'),
        ('OTRO',     'Otro'),
    ]
    MATERIAL_PAREDES_CHOICES = [
        ('BAHAREQUE',        'Bahareque'),
        ('MADERA',           'Madera'),
        ('BLOQUE_LADRILLO',  'Bloque/Ladrillo'),
        ('PREFABRICADO',     'Prefabricado'),
        ('OTRO',             'Otro'),
    ]
    PERCEPCION_SEGURIDAD_CHOICES = [
        ('ALTA',  'Alta'),
        ('MEDIA', 'Media'),
        ('BAJA',  'Baja'),
    ]

    visita = models.OneToOneField(
        Visita,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='datos_hogar',
    )

    foto_predio_url = models.CharField(max_length=500, blank=True, default='')

    # Tenencia
    calidad_tenencia = models.CharField(
        max_length=20, choices=CALIDAD_TENENCIA_CHOICES, blank=True, default='',
    )
    tiene_escrituras = models.BooleanField(null=True, blank=True)
    tiene_certificado_libertad = models.BooleanField(null=True, blank=True)
    tiene_contrato_arrendamiento = models.BooleanField(null=True, blank=True)

    # Uso e ingresos
    uso_inmueble = models.CharField(
        max_length=20, choices=USO_INMUEBLE_CHOICES, blank=True, default='',
    )
    rango_ingresos_hogar = models.CharField(
        max_length=20, choices=RANGO_INGRESOS_CHOICES, blank=True, default='',
    )

    # Vulnerabilidad
    hay_adultos_mayores = models.BooleanField(null=True, blank=True)
    hay_personas_discapacidad = models.BooleanField(null=True, blank=True)
    hay_madre_cabeza_hogar = models.BooleanField(null=True, blank=True)
    hay_victimas_conflicto = models.BooleanField(null=True, blank=True)

    # Condiciones físicas
    material_pisos = models.CharField(
        max_length=20, choices=MATERIAL_PISOS_CHOICES, blank=True, default='',
    )
    material_paredes = models.CharField(
        max_length=20, choices=MATERIAL_PAREDES_CHOICES, blank=True, default='',
    )
    numero_habitaciones = models.PositiveIntegerField(null=True, blank=True)

    # Servicios públicos
    tiene_agua = models.BooleanField(null=True, blank=True)
    tiene_energia = models.BooleanField(null=True, blank=True)
    tiene_gas = models.BooleanField(null=True, blank=True)
    tiene_alcantarillado = models.BooleanField(null=True, blank=True)

    # Entorno
    percepcion_seguridad = models.CharField(
        max_length=10, choices=PERCEPCION_SEGURIDAD_CHOICES, blank=True, default='',
    )
    riesgo_inundacion = models.BooleanField(null=True, blank=True)
    riesgo_deslizamiento = models.BooleanField(null=True, blank=True)
    riesgo_estructural = models.BooleanField(null=True, blank=True)

    # Trazabilidad
    usuario_creacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='datos_hogar_e2_creados',
        db_column='usuario_creacion_datos_e2',
    )
    fecha_creacion_reg = models.DateTimeField(auto_now_add=True)
    usuario_modificacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='datos_hogar_e2_modificados',
        db_column='usuario_modificacion_datos_e2',
    )
    fecha_modificacion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'datos_hogar_etapa2'
        verbose_name = 'Datos de Hogar Etapa 2'
        verbose_name_plural = 'Datos de Hogar Etapa 2'

    def __str__(self):
        return f'DatosHogar E2 – Visita #{self.visita_id}'


class DocumentoVisitaEtapa2(models.Model):
    """Documentos recopilados durante la visita técnica (Etapa 2)."""

    TIPO_DOCUMENTO_CHOICES = [
        ('RECIBO_PREDIAL',                    'Recibo predial'),
        ('CERTIFICADO_TRADICION_LIBERTAD',    'Certificado de tradición y libertad'),
        ('ESCRITURA_PUBLICA',                 'Escritura pública'),
        ('CONTRATO_ARRENDAMIENTO',            'Contrato de arrendamiento'),
        ('RECIBO_AGUA',                       'Recibo de agua'),
        ('RECIBO_ENERGIA',                    'Recibo de energía'),
        ('RECIBO_GAS',                        'Recibo de gas'),
        ('FOTO_VISITA',                       'Foto de la visita'),
        ('INFORME_TECNICO',                   'Informe técnico'),
        ('ACTA_VISITA',                       'Acta de visita'),
        ('OTRO',                              'Otro'),
    ]

    visita = models.ForeignKey(
        Visita,
        on_delete=models.CASCADE,
        related_name='documentos_etapa2',
    )
    tipo_documento = models.CharField(max_length=50, choices=TIPO_DOCUMENTO_CHOICES)
    nombre_archivo = models.CharField(max_length=300, blank=True, default='')
    archivo = models.FileField(upload_to='documentos/visitas_e2/%Y/%m/')
    ruta_archivo = models.CharField(max_length=500, blank=True, default='')
    observaciones = models.TextField(blank=True, default='')

    # Trazabilidad
    usuario_carga = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_visita_e2_cargados',
        db_column='usuario_carga_doc_e2',
    )
    fecha_creacion_reg = models.DateTimeField(auto_now_add=True)
    usuario_eliminacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='documentos_visita_e2_eliminados',
        db_column='usuario_eliminacion_doc_e2',
    )
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)
    activo_logico = models.BooleanField(default=True)

    class Meta:
        db_table = 'documentos_visita_etapa2'
        verbose_name = 'Documento de Visita Etapa 2'
        verbose_name_plural = 'Documentos de Visita Etapa 2'

    def __str__(self):
        return f'{self.tipo_documento} – Visita #{self.visita_id}'

    def save(self, *args, **kwargs):
        if self.archivo:
            self.ruta_archivo = self.archivo.name
        super().save(*args, **kwargs)


# ─────────────────────────────────────────────────────────────────────────── #
# Documentos Proceso Interno – Gestión Documental Etapa 3                     #
# ─────────────────────────────────────────────────────────────────────────── #

class DocumentoProcesoInterno(models.Model):
    """Documentos del proceso interno de gestión documental (Etapa 3)."""

    TIPO_DOCUMENTO_CHOICES = [
        ('ACTA_VISITA_TECNICA',              'Acta de visita técnica'),
        ('FORMULARIO_UNICO_NACIONAL',        'Formulario único nacional'),
        ('RADICADO_CURADURIA',               'Radicado de curaduría'),
        ('EXPENSA_RADICACION_INICIAL',       'Expensa de radicación inicial'),
        ('EXPENSA_LICENCIA_FINAL',           'Expensa de licencia final'),
        ('PODER_AUTENTICADO',                'Poder autenticado'),
        ('INFORME_TECNICO_VALIDACION',       'Informe técnico de validación'),
        ('APROBACION_MINVIVIENDA',           'Aprobación MinVivienda'),
        ('OFICIO_CONSTRUCTOR',               'Oficio del constructor'),
        ('TARJETA_PROFESIONAL_CONSTRUCTOR',  'Tarjeta profesional del constructor'),
        ('CERTIFICACION_EXPERIENCIA',        'Certificación de experiencia'),
        ('PLANOS_LEVANTAMIENTO_PDF',         'Planos de levantamiento (PDF)'),
        ('PLANOS_LEVANTAMIENTO_DWG',         'Planos de levantamiento (DWG)'),
        ('PLANOS_ARQUITECTONICOS_PDF',       'Planos arquitectónicos (PDF)'),
        ('PLANOS_ARQUITECTONICOS_DWG',       'Planos arquitectónicos (DWG)'),
        ('PLANOS_ESTRUCTURALES_PDF',         'Planos estructurales (PDF)'),
        ('PLANOS_ESTRUCTURALES_DWG',         'Planos estructurales (DWG)'),
        ('FOTO_VALLA_CURADURIA',             'Foto de valla de curaduría'),
        ('PRESUPUESTO_PDF',                  'Presupuesto de obra (PDF)'),
        ('PRESUPUESTO_XLSX',                 'Presupuesto de obra (Excel)'),
        ('OFICIO_USO_SUELOS',                'Oficio de uso de suelos'),
        ('CONCEPTO_GESTION_RIESGO',          'Concepto de gestión de riesgo'),
        ('RIESGO_INUNDACION_REMOCION',       'Riesgo de inundación / remoción masa'),
        ('CERTIFICACION_AGUA',               'Certificación de agua'),
        ('CERTIFICACION_ENERGIA',            'Certificación de energía'),
        ('ORFEO_SOLICITUD',                  'Orfeo solicitud'),
        ('ORFEO_RESPUESTA',                  'Orfeo respuesta'),
    ]

    postulacion = models.ForeignKey(
        Postulacion,
        on_delete=models.CASCADE,
        related_name='documentos_proceso_interno',
    )
    tipo_documento = models.CharField(max_length=50, choices=TIPO_DOCUMENTO_CHOICES)
    nombre_archivo = models.CharField(max_length=300, blank=True, default='')
    archivo = models.FileField(upload_to='documentos/proceso_interno/%Y/%m/')
    ruta_archivo = models.CharField(max_length=500, blank=True, default='')
    numero_radicado_orfeo_solicitud = models.CharField(max_length=50, blank=True, default='')
    numero_radicado_orfeo_respuesta = models.CharField(max_length=50, blank=True, default='')
    observaciones = models.TextField(blank=True, default='')

    # Trazabilidad
    usuario_creacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='docs_proceso_creados',
        db_column='usuario_creacion_doc_pi',
    )
    fecha_creacion_reg = models.DateTimeField(auto_now_add=True)
    usuario_modificacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='docs_proceso_modificados',
        db_column='usuario_modificacion_doc_pi',
    )
    fecha_modificacion = models.DateTimeField(null=True, blank=True)
    usuario_eliminacion = models.ForeignKey(
        'database.UsuarioSistema',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='docs_proceso_eliminados',
        db_column='usuario_eliminacion_doc_pi',
    )
    fecha_eliminacion = models.DateTimeField(null=True, blank=True)
    activo_logico = models.BooleanField(default=True)

    class Meta:
        db_table = 'documentos_proceso_interno'
        verbose_name = 'Documento de Proceso Interno'
        verbose_name_plural = 'Documentos de Proceso Interno'
        indexes = [
            models.Index(fields=['postulacion'], name='idx_doc_pi_postulacion'),
        ]

    def __str__(self):
        return f'{self.get_tipo_documento_display()} – Postulación #{self.postulacion_id}'

    def save(self, *args, **kwargs):
        if self.archivo:
            self.ruta_archivo = self.archivo.name
        super().save(*args, **kwargs)
