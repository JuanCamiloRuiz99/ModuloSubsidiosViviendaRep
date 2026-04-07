"""
ViewSet para Llamadas a Postulantes.

Endpoints:
  GET    /api/llamadas/                → listar (filtros: postulacion, usuario)
  POST   /api/llamadas/                → crear llamada
  GET    /api/llamadas/{id}/           → detalle
  DELETE /api/llamadas/{id}/           → eliminar (lógico)
"""

import logging
from django.utils.timezone import now
from rest_framework import viewsets, status, serializers as drf_serializers
from rest_framework.response import Response
from infrastructure.database.models import LlamadaPostulacion

logger = logging.getLogger(__name__)


# ── Serializers inline ─────────────────────────────────────────────────────── #

class LlamadaSerializer(drf_serializers.ModelSerializer):
    usuario_nombre = drf_serializers.CharField(
        source='usuario_llamada.nombre_completo', read_only=True,
    )

    class Meta:
        model = LlamadaPostulacion
        fields = [
            'id', 'postulacion', 'usuario_llamada', 'usuario_nombre',
            'fecha_llamada', 'hora_llamada', 'resultado',
            'observaciones', 'fecha_registro', 'activo_logico',
        ]
        read_only_fields = ['id', 'fecha_registro']


class LlamadaCreateSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = LlamadaPostulacion
        fields = [
            'postulacion', 'usuario_llamada',
            'fecha_llamada', 'hora_llamada', 'resultado', 'observaciones',
        ]


# ── ViewSet ────────────────────────────────────────────────────────────────── #

class LlamadaViewSet(viewsets.ModelViewSet):
    """CRUD de llamadas a postulantes."""

    queryset = (
        LlamadaPostulacion.objects
        .filter(activo_logico=True)
        .select_related('usuario_llamada', 'postulacion')
        .order_by('-fecha_llamada', '-hora_llamada')
    )

    def get_serializer_class(self):
        if self.action == 'create':
            return LlamadaCreateSerializer
        return LlamadaSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        if postulacion := params.get('postulacion'):
            qs = qs.filter(postulacion_id=postulacion)
        if usuario := params.get('usuario'):
            qs = qs.filter(usuario_llamada_id=usuario)

        return qs

    def perform_destroy(self, instance):
        """Eliminación lógica."""
        instance.activo_logico = False
        instance.save(update_fields=['activo_logico'])
