"""
Serializers para Visitas y datos de Etapa 2.
"""

from rest_framework import serializers
from infrastructure.database.models import Visita, DatosHogarEtapa2, DocumentoVisitaEtapa2


# ── Documentos ─────────────────────────────────────────────────────────────── #

class DocumentoVisitaEtapa2Serializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoVisitaEtapa2
        fields = [
            'id', 'visita', 'tipo_documento', 'nombre_archivo',
            'ruta_archivo', 'observaciones', 'fecha_creacion_reg', 'activo_logico',
        ]
        read_only_fields = ['id', 'fecha_creacion_reg', 'ruta_archivo']


class DocumentoVisitaUploadSerializer(serializers.Serializer):
    tipo_documento = serializers.ChoiceField(
        choices=DocumentoVisitaEtapa2.TIPO_DOCUMENTO_CHOICES,
    )
    archivo = serializers.FileField()
    observaciones = serializers.CharField(required=False, default='')


# ── Datos Hogar Etapa 2 ───────────────────────────────────────────────────── #

class DatosHogarEtapa2Serializer(serializers.ModelSerializer):
    class Meta:
        model = DatosHogarEtapa2
        fields = '__all__'
        read_only_fields = ['fecha_creacion_reg']


class DatosHogarEtapa2InputSerializer(serializers.ModelSerializer):
    """Para crear / actualizar datos_hogar_etapa2 desde el formulario."""

    class Meta:
        model = DatosHogarEtapa2
        exclude = [
            'usuario_creacion', 'fecha_creacion_reg',
            'usuario_modificacion', 'fecha_modificacion',
        ]


# ── Visita ─────────────────────────────────────────────────────────────────── #

class VisitaListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados."""
    encuestador_nombre = serializers.CharField(
        source='encuestador.nombre_completo', read_only=True,
    )
    postulacion_radicado = serializers.SerializerMethodField()
    tiene_datos_hogar = serializers.SerializerMethodField()

    class Meta:
        model = Visita
        fields = [
            'id', 'postulacion', 'etapa', 'encuestador', 'encuestador_nombre',
            'estado_visita', 'fecha_programada',
            'fecha_visita', 'visita_efectiva', 'motivo_no_efectiva',
            'nombre_encuestado', 'telefono_contacto',
            'fecha_registro', 'activo_logico',
            'postulacion_radicado', 'tiene_datos_hogar',
        ]

    def get_postulacion_radicado(self, obj):
        gh = getattr(obj.postulacion, 'gestion_hogar', None)
        return gh.numero_radicado if gh else None

    def get_tiene_datos_hogar(self, obj):
        return hasattr(obj, 'datos_hogar')


class VisitaDetailSerializer(serializers.ModelSerializer):
    """Serializer completo con datos de hogar y documentos anidados."""
    encuestador_nombre = serializers.CharField(
        source='encuestador.nombre_completo', read_only=True,
    )
    datos_hogar = DatosHogarEtapa2Serializer(read_only=True)
    documentos = DocumentoVisitaEtapa2Serializer(
        source='documentos_etapa2', many=True, read_only=True,
    )

    class Meta:
        model = Visita
        fields = '__all__'


class VisitaCreateSerializer(serializers.ModelSerializer):
    """Para crear una visita."""

    class Meta:
        model = Visita
        fields = [
            'postulacion', 'etapa', 'miembro', 'encuestador',
            'fecha_visita', 'visita_efectiva',
            'motivo_no_efectiva', 'motivo_no_efectiva_otro',
            'nombre_encuestado', 'numero_documento_encuestado',
            'telefono_contacto', 'acta_firmada', 'observaciones_generales',
        ]
        extra_kwargs = {
            'etapa': {'required': True, 'allow_null': False},
            'encuestador': {'required': True, 'allow_null': False},
            'fecha_visita': {'required': True, 'allow_null': False},
            'visita_efectiva': {'required': True, 'allow_null': False},
        }

    def validate(self, data):
        if not data.get('visita_efectiva') and not data.get('motivo_no_efectiva'):
            raise serializers.ValidationError(
                {'motivo_no_efectiva': 'Obligatorio cuando la visita no es efectiva.'},
            )
        if data.get('motivo_no_efectiva') == 'OTRO' and not data.get('motivo_no_efectiva_otro'):
            raise serializers.ValidationError(
                {'motivo_no_efectiva_otro': 'Especifique el motivo.'},
            )
        return data
