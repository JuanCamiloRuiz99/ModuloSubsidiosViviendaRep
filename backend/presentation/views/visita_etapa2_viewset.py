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
from shared.file_validators import validate_uploaded_file
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
        if estado_visita := params.get('estado_visita'):
            qs = qs.filter(estado_visita=estado_visita)

        return qs

    # ── Crear ──────────────────────────────────────────────────────────────── #

    def perform_create(self, serializer):
        visita = serializer.save(
            id_encuestador_creacion=serializer.validated_data['encuestador'],
        )
        self._actualizar_postulacion_si_efectiva(visita)

    def perform_update(self, serializer):
        visita = serializer.save()
        self._actualizar_postulacion_si_efectiva(visita)

    def _actualizar_postulacion_si_efectiva(self, visita):
        """
        Si la visita es efectiva, marca la postulación como VISITA_REALIZADA.
        Si la visita NO es efectiva, marca la postulación como VISITA_PENDIENTE.
        """
        postulacion = visita.postulacion
        if not postulacion:
            return

        if visita.visita_efectiva:
            if postulacion.estado not in ('VISITA_REALIZADA', 'APROBADA', 'RECHAZADA'):
                postulacion.estado = 'VISITA_REALIZADA'
                postulacion.save(update_fields=['estado'])
        else:
            # Visita no efectiva → volver a pendiente para reprogramar
            if postulacion.estado in ('VISITA_PROGRAMADA',):
                postulacion.estado = 'VISITA_PENDIENTE'
                postulacion.save(update_fields=['estado'])

    def _check_docs_y_actualizar_estado(self, visita):
        """
        Regla automática de estado:
          • Si la visita tiene al menos un documento activo  →  COMPLETADA / VISITA_REALIZADA.
          • Si todos los documentos se eliminaron            →  PROGRAMADA / VISITA_PENDIENTE.
        No toca visitas CANCELADAS ni postulaciones ya APROBADAS/RECHAZADAS.
        """
        if visita.estado_visita == 'CANCELADA':
            return

        tiene_docs = visita.documentos_etapa2.filter(activo_logico=True).exists()
        postulacion = visita.postulacion

        if tiene_docs:
            # Marcar como realizada
            if visita.estado_visita != 'COMPLETADA':
                visita.estado_visita = 'COMPLETADA'
                if not visita.fecha_realizacion:
                    visita.fecha_realizacion = now()
                visita.save(update_fields=['estado_visita', 'fecha_realizacion'])
            if postulacion and postulacion.estado not in ('VISITA_REALIZADA', 'APROBADA', 'RECHAZADA'):
                postulacion.estado = 'VISITA_REALIZADA'
                postulacion.save(update_fields=['estado'])
        else:
            # Sin documentos → volver a pendiente/programada
            if visita.estado_visita == 'COMPLETADA':
                visita.estado_visita = 'PROGRAMADA'
                visita.fecha_realizacion = None
                visita.save(update_fields=['estado_visita', 'fecha_realizacion'])
            if postulacion and postulacion.estado == 'VISITA_REALIZADA':
                postulacion.estado = 'VISITA_PROGRAMADA'
                postulacion.save(update_fields=['estado'])

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

        # ── Req 31: si la visita es efectiva y se guardan datos, marcar COMPLETADA ─ #
        if visita.visita_efectiva:
            if visita.estado_visita not in ('COMPLETADA', 'CANCELADA'):
                visita.estado_visita = 'COMPLETADA'
                visita.fecha_realizacion = now()
                visita.save(update_fields=['estado_visita', 'fecha_realizacion'])

            # Actualizar estado de la postulación a VISITA_REALIZADA
            postulacion = visita.postulacion
            if postulacion and postulacion.estado not in ('VISITA_REALIZADA', 'APROBADA', 'RECHAZADA'):
                postulacion.estado = 'VISITA_REALIZADA'
                postulacion.save(update_fields=['estado'])

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

        file_error = validate_uploaded_file(upload.validated_data['archivo'])
        if file_error:
            return Response({'detail': file_error}, status=status.HTTP_400_BAD_REQUEST)

        doc = DocumentoVisitaEtapa2.objects.create(
            visita=visita,
            tipo_documento=upload.validated_data['tipo_documento'],
            archivo=upload.validated_data['archivo'],
            nombre_archivo=upload.validated_data['archivo'].name,
            observaciones=upload.validated_data.get('observaciones', ''),
        )

        # Actualizar estado según documentos presentes
        self._check_docs_y_actualizar_estado(visita)

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

        # Revertir estado si ya no quedan documentos
        visita.refresh_from_db()
        self._check_docs_y_actualizar_estado(visita)

        return Response(status=status.HTTP_204_NO_CONTENT)
