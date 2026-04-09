"""
ViewSet para Documentos de Proceso Interno (Etapa 3 - Gestión Documental).
"""

from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from infrastructure.database.models import DocumentoProcesoInterno, Postulacion
from shared.file_validators import validate_uploaded_file
from presentation.serializers.documento_proceso_interno_serializer import (
    DocumentoProcesoInternoSerializer,
    DocumentoProcesoInternoUploadSerializer,
)

# Todos los tipos de documento son obligatorios para completar la Etapa 3.
TIPOS_REQUERIDOS = {choice[0] for choice in DocumentoProcesoInterno.TIPO_DOCUMENTO_CHOICES}


class DocumentoProcesoInternoViewSet(viewsets.ModelViewSet):
    """
    CRUD de documentos del proceso interno (Etapa 3).

    Endpoints principales:
        GET  /api/documentos-proceso-interno/?postulacion={id}  → lista docs activos de una postulación
        POST /api/documentos-proceso-interno/subir/              → sube un documento (multipart)
        POST /api/documentos-proceso-interno/{pk}/eliminar/      → soft-delete
    """
    queryset = DocumentoProcesoInterno.objects.filter(activo_logico=True)
    serializer_class = DocumentoProcesoInternoSerializer
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        postulacion_id = self.request.query_params.get('postulacion')
        if postulacion_id:
            qs = qs.filter(postulacion_id=postulacion_id)
        return qs.order_by('tipo_documento', '-fecha_creacion_reg')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser], url_path='subir')
    def subir_documento(self, request):
        """Sube un archivo asociado a una postulación."""
        upload_ser = DocumentoProcesoInternoUploadSerializer(data=request.data)
        upload_ser.is_valid(raise_exception=True)
        d = upload_ser.validated_data

        archivo = d['archivo']
        file_error = validate_uploaded_file(archivo)
        if file_error:
            return Response({'detail': file_error}, status=status.HTTP_400_BAD_REQUEST)
        doc = DocumentoProcesoInterno.objects.create(
            postulacion_id=d['postulacion'],
            tipo_documento=d['tipo_documento'],
            archivo=archivo,
            nombre_archivo=archivo.name,
            numero_radicado_orfeo_solicitud=d.get('numero_radicado_orfeo_solicitud', ''),
            numero_radicado_orfeo_respuesta=d.get('numero_radicado_orfeo_respuesta', ''),
            observaciones=d.get('observaciones', ''),
        )

        # ── Auto-transición de estado según documentos cargados ─────── #
        postulacion = Postulacion.objects.get(pk=d['postulacion'])
        if postulacion.estado in ('VISITA_REALIZADA', 'DOCUMENTOS_INCOMPLETOS'):
            tipos_cargados = set(
                DocumentoProcesoInterno.objects
                .filter(postulacion_id=d['postulacion'], activo_logico=True)
                .values_list('tipo_documento', flat=True)
            )
            if TIPOS_REQUERIDOS.issubset(tipos_cargados):
                postulacion.estado = 'DOCUMENTOS_CARGADOS'
                postulacion.save(update_fields=['estado'])
            elif tipos_cargados and postulacion.estado != 'DOCUMENTOS_INCOMPLETOS':
                postulacion.estado = 'DOCUMENTOS_INCOMPLETOS'
                postulacion.save(update_fields=['estado'])

        return Response(
            DocumentoProcesoInternoSerializer(doc).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='eliminar')
    def eliminar_documento(self, request, pk=None):
        """Soft-delete: marca como inactivo."""
        try:
            doc = DocumentoProcesoInterno.objects.get(pk=pk, activo_logico=True)
        except DocumentoProcesoInterno.DoesNotExist:
            return Response({'detail': 'Documento no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        with transaction.atomic():
            doc.activo_logico = False
            doc.fecha_eliminacion = timezone.now()
            doc.save(update_fields=['activo_logico', 'fecha_eliminacion'])

            # ── Revertir estado si ya no tiene todos los documentos ── #
            postulacion = doc.postulacion
            if postulacion.estado in ('DOCUMENTOS_CARGADOS', 'DOCUMENTOS_INCOMPLETOS'):
                tipos_cargados = set(
                    DocumentoProcesoInterno.objects
                    .filter(postulacion_id=postulacion.pk, activo_logico=True)
                    .values_list('tipo_documento', flat=True)
                )
                if not tipos_cargados:
                    postulacion.estado = 'VISITA_REALIZADA'
                    postulacion.save(update_fields=['estado'])
                elif not TIPOS_REQUERIDOS.issubset(tipos_cargados):
                    postulacion.estado = 'DOCUMENTOS_INCOMPLETOS'
                    postulacion.save(update_fields=['estado'])

        return Response({'detail': 'Documento eliminado correctamente.'})
