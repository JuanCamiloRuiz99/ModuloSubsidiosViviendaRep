"""
Serializadores para el módulo de Registro del Hogar (Etapa 1).

Validan el payload enviado desde el formulario público del wizard:
  POST /api/etapas/{id}/registro-hogar/
  Body: { "info_hogar": {...}, "miembros": [...] }
"""
from rest_framework import serializers


class InfoHogarSubmitSerializer(serializers.Serializer):
    """Campos de gestion_hogar_etapa1 recibidos desde el wizard (Paso 1)."""

    # Ubicación — obligatorios
    departamento = serializers.CharField(max_length=150)
    municipio    = serializers.CharField(max_length=150)
    zona         = serializers.ChoiceField(choices=['URBANA', 'RURAL'])
    direccion    = serializers.CharField(max_length=300)
    acepta_terminos_condiciones = serializers.BooleanField()

    # Ubicación — opcionales
    tipo_predio             = serializers.CharField(max_length=50,  required=False, default='', allow_blank=True)
    comuna                  = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    barrio_vereda           = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    observaciones_direccion = serializers.CharField(required=False, default='', allow_blank=True)

    # Predio — opcionales
    estrato                = serializers.CharField(max_length=10, required=False, default='', allow_blank=True)
    es_propietario         = serializers.BooleanField(required=False, allow_null=True, default=None)
    numero_predial         = serializers.CharField(max_length=50,  required=False, default='', allow_blank=True)
    matricula_inmobiliaria = serializers.CharField(max_length=50,  required=False, default='', allow_blank=True)
    avaluo_catastral       = serializers.CharField(max_length=50,  required=False, default='', allow_blank=True)

    # Servicios públicos — opcionales
    numero_matricula_agua   = serializers.CharField(max_length=50, required=False, default='', allow_blank=True)
    numero_contrato_energia = serializers.CharField(max_length=50, required=False, default='', allow_blank=True)

    # Info adicional — opcionales
    tiempo_residencia               = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    tiene_dependientes              = serializers.BooleanField(required=False, allow_null=True, default=None)
    personas_con_discapacidad_hogar = serializers.BooleanField(required=False, allow_null=True, default=None)

    def validate_acepta_terminos_condiciones(self, value):
        if not value:
            raise serializers.ValidationError(
                'Debe aceptar los términos y condiciones para continuar.'
            )
        return value


class MiembroHogarSubmitSerializer(serializers.Serializer):
    """Campos de miembros_hogar recibidos desde el wizard (Paso 2)."""

    # Identificador UI — requerido para mapear el id del miembro creado
    _localId = serializers.CharField()

    # Datos personales — obligatorios
    tipo_documento   = serializers.CharField(max_length=30)
    numero_documento = serializers.CharField(max_length=30)
    primer_nombre    = serializers.CharField(max_length=100)
    primer_apellido  = serializers.CharField(max_length=100)
    fecha_nacimiento = serializers.DateField()
    parentesco       = serializers.CharField(max_length=30)

    # Datos personales — opcionales
    segundo_nombre   = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    segundo_apellido = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)

    # Vínculo
    parentesco_otro = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    es_cabeza_hogar = serializers.BooleanField(required=False, default=False)

    # Socioeconómica
    nivel_educativo    = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    situacion_laboral  = serializers.CharField(max_length=20,  required=False, default='', allow_blank=True)
    ingresos_mensuales = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True,
    )
    fuente_ingresos = serializers.CharField(max_length=200, required=False, default='', allow_blank=True)

    # SISBEN
    pertenece_sisben = serializers.BooleanField(required=False, allow_null=True, default=None)
    grupo_sisben     = serializers.CharField(max_length=10, required=False, default='', allow_blank=True)
    puntaje_sisben   = serializers.DecimalField(
        max_digits=6, decimal_places=2, required=False, allow_null=True,
    )

    # Discapacidad
    tiene_discapacidad       = serializers.BooleanField(required=False, default=False)
    grado_discapacidad       = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    certificado_discapacidad = serializers.BooleanField(required=False, allow_null=True, default=None)
    numero_certificado       = serializers.CharField(max_length=50, required=False, default='', allow_blank=True)

    # Víctima del conflicto
    es_victima_conflicto     = serializers.BooleanField(required=False, default=False)
    numero_ruv               = serializers.CharField(max_length=50,  required=False, default='', allow_blank=True)
    hecho_victimizante       = serializers.CharField(max_length=200, required=False, default='', allow_blank=True)
    fecha_hecho_victimizante = serializers.DateField(required=False, allow_null=True)

    # Desplazamiento
    es_desplazado         = serializers.BooleanField(required=False, default=False)
    fecha_desplazamiento  = serializers.DateField(required=False, allow_null=True)
    municipio_origen      = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    departamento_origen   = serializers.CharField(max_length=150, required=False, default='', allow_blank=True)
    motivo_desplazamiento = serializers.CharField(max_length=200, required=False, default='', allow_blank=True)

    # Firmante de paz
    es_firmante_paz                = serializers.BooleanField(required=False, default=False)
    codigo_reincorporacion         = serializers.CharField(max_length=50,  required=False, default='', allow_blank=True)
    etcr                           = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)
    estado_proceso_reincorporacion = serializers.CharField(max_length=100, required=False, default='', allow_blank=True)


class RegistroHogarSubmitSerializer(serializers.Serializer):
    """
    Payload completo enviado al endpoint POST /api/etapas/{id}/registro-hogar/
    """
    info_hogar = InfoHogarSubmitSerializer()
    miembros   = MiembroHogarSubmitSerializer(many=True)

    def validate_miembros(self, value):
        if len(value) == 0:
            raise serializers.ValidationError(
                'Debe registrar al menos un miembro del hogar.'
            )
        return value
