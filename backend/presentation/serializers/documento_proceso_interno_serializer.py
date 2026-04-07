"""
Serializers para Documentos de Proceso Interno (Etapa 3 - Gestión Documental).
"""

from rest_framework import serializers
from infrastructure.database.models import DocumentoProcesoInterno


class DocumentoProcesoInternoSerializer(serializers.ModelSerializer):
    tipo_documento_label = serializers.CharField(
        source='get_tipo_documento_display', read_only=True,
    )

    class Meta:
        model = DocumentoProcesoInterno
        fields = [
            'id', 'postulacion', 'tipo_documento', 'tipo_documento_label',
            'nombre_archivo', 'ruta_archivo',
            'numero_radicado_orfeo_solicitud', 'numero_radicado_orfeo_respuesta',
            'observaciones', 'fecha_creacion_reg', 'activo_logico',
        ]
        read_only_fields = ['id', 'fecha_creacion_reg', 'ruta_archivo']


class DocumentoProcesoInternoUploadSerializer(serializers.Serializer):
    postulacion = serializers.IntegerField()
    tipo_documento = serializers.ChoiceField(
        choices=DocumentoProcesoInterno.TIPO_DOCUMENTO_CHOICES,
    )
    archivo = serializers.FileField()
    numero_radicado_orfeo_solicitud = serializers.CharField(required=False, default='')
    numero_radicado_orfeo_respuesta = serializers.CharField(required=False, default='')
    observaciones = serializers.CharField(required=False, default='')
