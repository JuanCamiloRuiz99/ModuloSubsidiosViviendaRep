"""
ViewSet para Visitas (panel de gestión / GestionVisitasPanel).

Endpoints:
  POST   /api/visitas/crear/              → crear visita desde el panel
  GET    /api/visitas/listar/             → listar visitas (filtros: inspectorId, programaId, postulacionId)
  GET    /api/visitas/{id}/obtener/       → detalle de visita
  POST   /api/visitas/programar/          → programar fecha de visita
  POST   /api/visitas/realizar/           → marcar visita como realizada
  DELETE /api/visitas/{id}/               → borrado lógico
"""

import logging
from django.utils.timezone import now
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from infrastructure.database.models import (
    Visita,
    Etapa,
    Postulacion,
)
from infrastructure.database.usuarios_models import UsuarioSistema

logger = logging.getLogger(__name__)


def _to_iso(val):
    """Convierte a ISO string si es datetime, o devuelve el string tal cual."""
    if val is None:
        return None
    return val.isoformat() if hasattr(val, 'isoformat') else str(val)


def _visita_to_ddd(v):
    """Serializa una Visita al formato que espera el frontend DDD."""
    return {
        'id': str(v.pk),
        'postulacionId': str(v.postulacion_id),
        'postulanteId': str(
            getattr(v.postulacion, 'gestion_hogar', None)
            and v.postulacion.gestion_hogar.ciudadano_id
            or v.postulacion_id
        ),
        'programaId': str(v.postulacion.programa_id),
        'tipoVisita': v.tipo_visita or 'INICIAL',
        'estado': v.estado_visita or 'PROGRAMADA',
        'direccion': v.direccion or '',
        'fechaProgramada': _to_iso(v.fecha_programada),
        'inspectorId': str(v.encuestador_id) if v.encuestador_id else None,
        'observaciones': v.observaciones_generales or None,
        'fotosUrl': None,
        'calificacion': v.calificacion,
        'motivoCancelacion': v.motivo_cancelacion or None,
        'fechaRealizacion': _to_iso(v.fecha_realizacion),
        'fechaCancelacion': _to_iso(v.fecha_cancelacion),
        'createdAt': _to_iso(v.fecha_registro),
        'updatedAt': _to_iso(v.fecha_modificacion) or _to_iso(v.fecha_registro),
    }


class VisitaViewSet(viewsets.ViewSet):
    """Endpoints para el panel de gestión de visitas (GestionVisitasPanel)."""

    # ── Crear ──────────────────────────────────────────────────────────────── #

    @action(detail=False, methods=['post'], url_path='crear')
    def crear(self, request):
        data = request.data
        postulacion_id = data.get('postulacionId')
        programa_id = data.get('programaId')
        inspector_id = data.get('inspectorId')
        tipo_visita = data.get('tipoVisita', 'INICIAL')
        direccion = data.get('direccion', '')
        fecha_programada = data.get('fechaProgramada')

        if not postulacion_id:
            return Response(
                {'detail': 'postulacionId es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar postulación
        try:
            postulacion = Postulacion.objects.get(pk=postulacion_id)
        except Postulacion.DoesNotExist:
            return Response(
                {'detail': f'Postulación {postulacion_id} no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Evitar duplicados: solo una visita activa (no cancelada) por postulación
        ya_existe = Visita.objects.filter(
            postulacion_id=postulacion_id,
            activo_logico=True,
        ).exclude(estado_visita='CANCELADA').exists()

        if ya_existe:
            return Response(
                {'detail': 'Esta postulación ya tiene una visita asignada.'},
                status=status.HTTP_409_CONFLICT,
            )

        # Buscar la etapa VISITA_TECNICA del programa (opcional)
        etapa = None
        pid = programa_id or postulacion.programa_id
        try:
            etapa = Etapa.objects.filter(
                programa_id=pid,
                modulo_principal='VISITA_TECNICA',
            ).first()
        except Exception:
            pass

        # Validar encuestador
        encuestador = None
        if inspector_id:
            try:
                encuestador = UsuarioSistema.objects.get(pk=inspector_id)
            except UsuarioSistema.DoesNotExist:
                return Response(
                    {'detail': f'Inspector {inspector_id} no encontrado.'},
                    status=status.HTTP_404_NOT_FOUND,
                )

        visita = Visita.objects.create(
            postulacion=postulacion,
            etapa=etapa,
            encuestador=encuestador,
            tipo_visita=tipo_visita,
            estado_visita='ASIGNADA',
            direccion=direccion,
            fecha_programada=None,
            fecha_visita=None,
            id_encuestador_creacion=encuestador,
        )

        # Actualizar estado de la postulación a VISITA_ASIGNADA
        if postulacion.estado in ('VISITA_PENDIENTE', 'EN_REVISION', 'APROBADA'):
            postulacion.estado = 'VISITA_ASIGNADA'
            postulacion.fecha_modificacion = now()
            postulacion.save(update_fields=['estado', 'fecha_modificacion'])

        # Re-fetch to get auto-populated fields (fecha_registro)
        visita.refresh_from_db()
        visita.postulacion = postulacion  # keep select_related data

        return Response(_visita_to_ddd(visita), status=status.HTTP_201_CREATED)

    # ── Reasignar visitante ──────────────────────────────────────────────── #

    @action(detail=False, methods=['post'], url_path='reasignar')
    def reasignar(self, request):
        """Reasigna el visitante (encuestador) de la visita activa de una postulación."""
        postulacion_id = request.data.get('postulacionId')
        nuevo_inspector_id = request.data.get('inspectorId')

        if not postulacion_id or not nuevo_inspector_id:
            return Response(
                {'detail': 'postulacionId e inspectorId son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visita = Visita.objects.filter(
            postulacion_id=postulacion_id,
            activo_logico=True,
        ).exclude(estado_visita='CANCELADA').order_by('-fecha_registro').first()

        if not visita:
            return Response(
                {'detail': 'No hay visita activa para esta postulación.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            nuevo_encuestador = UsuarioSistema.objects.get(pk=nuevo_inspector_id)
        except UsuarioSistema.DoesNotExist:
            return Response(
                {'detail': f'Inspector {nuevo_inspector_id} no encontrado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        visita.encuestador = nuevo_encuestador
        visita.fecha_modificacion = now()
        visita.save(update_fields=['encuestador', 'fecha_modificacion'])

        visita.refresh_from_db()
        return Response(_visita_to_ddd(visita))

    # ── Programar visita (técnico asigna fecha) ──────────────────────────── #

    @action(detail=False, methods=['post'], url_path='programar')
    def programar(self, request):
        """El técnico programa la fecha de una visita asignada."""
        visita_id = request.data.get('visitaId')
        fecha_programada = request.data.get('fechaProgramada')

        if not visita_id or not fecha_programada:
            return Response(
                {'detail': 'visitaId y fechaProgramada son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            visita = Visita.objects.select_related(
                'postulacion', 'postulacion__programa', 'encuestador',
            ).get(pk=visita_id, activo_logico=True)
        except Visita.DoesNotExist:
            return Response(
                {'detail': 'Visita no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if visita.estado_visita not in ('ASIGNADA', 'PROGRAMADA'):
            return Response(
                {'detail': f'No se puede programar una visita en estado {visita.estado_visita}.'},
                status=status.HTTP_409_CONFLICT,
            )

        visita.fecha_programada = fecha_programada
        visita.fecha_visita = fecha_programada
        visita.estado_visita = 'PROGRAMADA'
        visita.fecha_modificacion = now()
        visita.save(update_fields=[
            'fecha_programada', 'fecha_visita', 'estado_visita', 'fecha_modificacion',
        ])

        # Actualizar estado de la postulación a VISITA_PROGRAMADA
        postulacion = visita.postulacion
        if postulacion.estado not in ('VISITA_PROGRAMADA', 'VISITA_REALIZADA', 'RECHAZADA'):
            postulacion.estado = 'VISITA_PROGRAMADA'
            postulacion.fecha_modificacion = now()
            postulacion.save(update_fields=['estado', 'fecha_modificacion'])

        visita.refresh_from_db()
        return Response(_visita_to_ddd(visita))

    # ── Realizar visita (visitante marca como realizada) ─────────────────── #

    @action(detail=False, methods=['post'], url_path='realizar')
    def realizar(self, request):
        """El visitante marca la visita como realizada."""
        visita_id = request.data.get('visitaId')

        if not visita_id:
            return Response(
                {'detail': 'visitaId es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            visita = Visita.objects.select_related(
                'postulacion', 'postulacion__programa', 'encuestador',
            ).get(pk=visita_id, activo_logico=True)
        except Visita.DoesNotExist:
            return Response(
                {'detail': 'Visita no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if visita.estado_visita != 'PROGRAMADA':
            return Response(
                {'detail': f'No se puede realizar una visita en estado {visita.estado_visita}.'},
                status=status.HTTP_409_CONFLICT,
            )

        visita.estado_visita = 'REALIZADA'
        visita.fecha_realizacion = now()
        visita.fecha_modificacion = now()
        visita.save(update_fields=[
            'estado_visita', 'fecha_realizacion', 'fecha_modificacion',
        ])

        # Actualizar estado de la postulación a VISITA_REALIZADA
        postulacion = visita.postulacion
        if postulacion.estado not in ('VISITA_REALIZADA', 'APROBADA', 'RECHAZADA'):
            postulacion.estado = 'VISITA_REALIZADA'
            postulacion.fecha_modificacion = now()
            postulacion.save(update_fields=['estado', 'fecha_modificacion'])

        visita.refresh_from_db()
        return Response(_visita_to_ddd(visita))

    # ── Listar ─────────────────────────────────────────────────────────────── #

    @action(detail=False, methods=['get'], url_path='listar')
    def listar(self, request):
        qs = Visita.objects.filter(activo_logico=True).select_related(
            'postulacion', 'postulacion__programa', 'encuestador',
        ).order_by('-fecha_registro')

        params = request.query_params
        if inspector_id := params.get('inspectorId'):
            qs = qs.filter(encuestador_id=inspector_id)
        if programa_id := params.get('programaId'):
            qs = qs.filter(postulacion__programa_id=programa_id)
        if postulacion_id := params.get('postulacionId'):
            qs = qs.filter(postulacion_id=postulacion_id)

        page = int(params.get('page', 1))
        page_size = int(params.get('pageSize', 50))
        total = qs.count()
        offset = (page - 1) * page_size
        visitas = qs[offset:offset + page_size]

        return Response({
            'items': [_visita_to_ddd(v) for v in visitas],
            'total': total,
        })

    # ── Detalle ────────────────────────────────────────────────────────────── #

    @action(detail=True, methods=['get'], url_path='obtener')
    def obtener(self, request, pk=None):
        try:
            visita = Visita.objects.select_related(
                'postulacion', 'postulacion__programa', 'encuestador',
            ).get(pk=pk, activo_logico=True)
        except Visita.DoesNotExist:
            return Response(
                {'detail': 'Visita no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(_visita_to_ddd(visita))

    # ── Borrado lógico ─────────────────────────────────────────────────────── #

    def destroy(self, request, pk=None):
        try:
            visita = Visita.objects.get(pk=pk, activo_logico=True)
        except Visita.DoesNotExist:
            return Response(
                {'detail': 'Visita no encontrada.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        visita.activo_logico = False
        visita.fecha_eliminacion = now()
        visita.save(update_fields=['activo_logico', 'fecha_eliminacion'])
        return Response(status=status.HTTP_204_NO_CONTENT)
