"""
ViewSet para Visitas Etapa 2.

Endpoints:
  GET    /api/visitas-etapa2/                          → listar
  POST   /api/visitas-etapa2/                          → crear visita
  GET    /api/visitas-etapa2/{id}/                     → detalle
  PUT    /api/visitas-etapa2/{id}/                     → actualizar
  POST   /api/visitas-etapa2/{id}/datos-hogar/         → guardar datos hogar
  GET    /api/visitas-etapa2/{id}/datos-hogar/         → obtener datos hogar
  POST   /api/visitas-etapa2/{id}/documentos/          → subir documento
  GET    /api/visitas-etapa2/{id}/documentos/          → listar documentos
  DELETE /api/visitas-etapa2/{id}/documentos/{doc_id}/ → eliminar documento
"""

import logging
from django.utils.timezone import now
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from infrastructure.database.models import (
    Visita,
    DatosHogarEtapa2,
    DocumentoVisitaEtapa2,
)
from presentation.serializers.visita_etapa2_serializer import (
    VisitaListSerializer,
    VisitaDetailSerializer,
    VisitaCreateSerializer,
    DatosHogarEtapa2Serializer,
    DatosHogarEtapa2InputSerializer,
    DocumentoVisitaEtapa2Serializer,
    DocumentoVisitaUploadSerializer,
)

logger = logging.getLogger(__name__)


class VisitaEtapa2ViewSet(viewsets.ModelViewSet):
    """CRUD de Visitas Etapa 2 + sub-recursos datos_hogar y documentos."""

    queryset = (
        Visita.objects
        .filter(activo_logico=True)
        .select_related('encuestador', 'postulacion', 'etapa')
        .order_by('-fecha_registro')
    )

    def get_serializer_class(self):
        if self.action == 'list':
            return VisitaListSerializer
        if self.action == 'create':
            return VisitaCreateSerializer
        return VisitaDetailSerializer

    # ── Filtros ────────────────────────────────────────────────────────────── #

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        if programa := params.get('programa'):
            qs = qs.filter(postulacion__programa_id=programa)
        if etapa := params.get('etapa'):
            qs = qs.filter(etapa_id=etapa)
        if encuestador := params.get('encuestador'):
            qs = qs.filter(encuestador_id=encuestador)
        if efectiva := params.get('efectiva'):
            qs = qs.filter(visita_efectiva=efectiva.lower() == 'true')
        if postulacion := params.get('postulacion'):
            qs = qs.filter(postulacion_id=postulacion)

        return qs

    # ── Crear ──────────────────────────────────────────────────────────────── #

    def perform_create(self, serializer):
        serializer.save(
            id_encuestador_creacion=serializer.validated_data['encuestador'],
        )

    # ── Datos Hogar Etapa 2 ────────────────────────────────────────────────── #

    @action(detail=True, methods=['get', 'post', 'put'], url_path='datos-hogar')
    def datos_hogar(self, request, pk=None):
        visita = self.get_object()

        if request.method == 'GET':
            try:
                datos = visita.datos_hogar
                return Response(DatosHogarEtapa2Serializer(datos).data)
            except DatosHogarEtapa2.DoesNotExist:
                return Response(
                    {'detail': 'Aún no hay datos de hogar para esta visita.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        # POST / PUT → crear o actualizar
        try:
            datos = visita.datos_hogar
            serializer = DatosHogarEtapa2InputSerializer(datos, data=request.data, partial=True)
        except DatosHogarEtapa2.DoesNotExist:
            data = {**request.data, 'visita': visita.pk}
            serializer = DatosHogarEtapa2InputSerializer(data=data)

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            DatosHogarEtapa2Serializer(serializer.instance).data,
            status=status.HTTP_200_OK,
        )

    # ── Documentos ─────────────────────────────────────────────────────────── #

    @action(
        detail=True,
        methods=['get', 'post'],
        url_path='documentos',
        parser_classes=[MultiPartParser, FormParser],
    )
    def documentos(self, request, pk=None):
        visita = self.get_object()

        if request.method == 'GET':
            docs = visita.documentos_etapa2.filter(activo_logico=True)
            return Response(DocumentoVisitaEtapa2Serializer(docs, many=True).data)

        # POST → subir documento
        upload = DocumentoVisitaUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)

        doc = DocumentoVisitaEtapa2.objects.create(
            visita=visita,
            tipo_documento=upload.validated_data['tipo_documento'],
            archivo=upload.validated_data['archivo'],
            nombre_archivo=upload.validated_data['archivo'].name,
            observaciones=upload.validated_data.get('observaciones', ''),
        )
        return Response(
            DocumentoVisitaEtapa2Serializer(doc).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'documentos/(?P<doc_id>\d+)',
    )
    def eliminar_documento(self, request, pk=None, doc_id=None):
        visita = self.get_object()
        try:
            doc = visita.documentos_etapa2.get(pk=doc_id, activo_logico=True)
        except DocumentoVisitaEtapa2.DoesNotExist:
            return Response(
                {'detail': 'Documento no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        doc.activo_logico = False
        doc.fecha_eliminacion = now()
        doc.save(update_fields=['activo_logico', 'fecha_eliminacion'])
        return Response(status=status.HTTP_204_NO_CONTENT)
