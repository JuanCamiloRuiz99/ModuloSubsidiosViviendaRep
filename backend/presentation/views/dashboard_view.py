"""
Vista de estadísticas globales para el Dashboard.
GET /api/dashboard/estadisticas/
"""
import logging

from django.db.models import Count, Q, Case, When, IntegerField
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from infrastructure.database.models import (
    Programa,
    Etapa,
    Postulacion,
    GestionHogarEtapa1,
    MiembroHogar,
    Visita,
    DocumentoProcesoInterno,
)
from infrastructure.database.usuarios_models import UsuarioSistema

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_estadisticas(request):
    """Retorna estadísticas globales del sistema."""
    try:
        # ── Programas (1 query) ──
        programas_por_estado = dict(
            Programa.objects.values_list('estado')
            .annotate(c=Count('id'))
            .values_list('estado', 'c')
        )
        programas_total = sum(programas_por_estado.values())

        # ── Etapas (1 query) ──
        etapas_qs = Etapa.objects.filter(activo_logico=True)
        etapas_agg = etapas_qs.aggregate(
            total=Count('id'),
            activas=Count(Case(When(finalizada=False, then=1), output_field=IntegerField())),
            finalizadas=Count(Case(When(finalizada=True, then=1), output_field=IntegerField())),
        )

        # ── Postulaciones (1 query) ──
        postulaciones_por_estado = dict(
            Postulacion.objects.filter(activo_logico=True)
            .values_list('estado')
            .annotate(c=Count('id'))
            .values_list('estado', 'c')
        )
        postulaciones_total = sum(postulaciones_por_estado.values())

        # ── Visitas (1 query) ──
        visitas_qs = Visita.objects.filter(activo_logico=True)
        visitas_agg = visitas_qs.aggregate(
            total=Count('id'),
            efectivas=Count(Case(When(visita_efectiva=True, then=1), output_field=IntegerField())),
            no_efectivas=Count(Case(When(visita_efectiva=False, then=1), output_field=IntegerField())),
        )
        visitas_por_estado = dict(
            visitas_qs.values_list('estado_visita')
            .annotate(c=Count('id'))
            .values_list('estado_visita', 'c')
        )

        # ── Usuarios (1 query) ──
        usuarios_agg = UsuarioSistema.objects.aggregate(
            total=Count('id_usuario'),
            activos=Count(Case(When(activo=True, then=1), output_field=IntegerField())),
        )
        usuarios_por_rol = dict(
            UsuarioSistema.objects.values_list('id_rol')
            .annotate(c=Count('id_usuario'))
            .values_list('id_rol', 'c')
        )

        # ── Hogares (3 queries) ──
        hogares_total = GestionHogarEtapa1.objects.count()
        hogares_por_estrato = dict(
            GestionHogarEtapa1.objects
            .exclude(estrato__isnull=True)
            .values_list('estrato')
            .annotate(c=Count('id'))
            .values_list('estrato', 'c')
        )
        hogares_por_zona = dict(
            GestionHogarEtapa1.objects
            .exclude(zona='')
            .values_list('zona')
            .annotate(c=Count('id'))
            .values_list('zona', 'c')
        )

        # ── Miembros vulnerables (1 query) ──
        miembros_agg = MiembroHogar.objects.aggregate(
            total=Count('id'),
            discapacidad=Count(Case(When(tiene_discapacidad=True, then=1), output_field=IntegerField())),
            victima=Count(Case(When(es_victima_conflicto=True, then=1), output_field=IntegerField())),
            desplazado=Count(Case(When(es_desplazado=True, then=1), output_field=IntegerField())),
            firmante_paz=Count(Case(When(es_firmante_paz=True, then=1), output_field=IntegerField())),
        )

        # ── Documentos internos (1 query) ──
        documentos_internos = DocumentoProcesoInterno.objects.filter(activo_logico=True).count()

        return Response({
            'programas': {
                'total': programas_total,
                'por_estado': programas_por_estado,
            },
            'etapas': {
                'total': etapas_agg['total'],
                'activas': etapas_agg['activas'],
                'finalizadas': etapas_agg['finalizadas'],
            },
            'postulaciones': {
                'total': postulaciones_total,
                'por_estado': postulaciones_por_estado,
            },
            'visitas': {
                'total': visitas_agg['total'],
                'por_estado': visitas_por_estado,
                'efectivas': visitas_agg['efectivas'],
                'no_efectivas': visitas_agg['no_efectivas'],
            },
            'usuarios': {
                'total': usuarios_agg['total'],
                'activos': usuarios_agg['activos'],
                'por_rol': usuarios_por_rol,
            },
            'hogares': {
                'total': hogares_total,
                'por_estrato': hogares_por_estrato,
                'por_zona': hogares_por_zona,
            },
            'miembros': {
                'total': miembros_agg['total'],
                'vulnerabilidad': {
                    'discapacidad': miembros_agg['discapacidad'],
                    'victima': miembros_agg['victima'],
                    'desplazado': miembros_agg['desplazado'],
                    'firmante_paz': miembros_agg['firmante_paz'],
                },
            },
            'documentos_internos': documentos_internos,
        })
    except Exception:
        logger.exception("Error al obtener estadísticas del dashboard")
        return Response(
            {'error': 'Error al obtener estadísticas'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
