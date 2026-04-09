"""
ViewSet para la entidad Programa.

Delega la lógica de negocio al Application Service (DDD).
Mantiene sólo la responsabilidad de serialización HTTP.
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated

from infrastructure.database.models import Programa, FormularioEtapa, ConfigRegistroHogar
from infrastructure.database.repositories.programa_repository import DjangoProgramaRepository
from application.programas import ProgramaApplicationService
from presentation.serializers.programa_serializer import ProgramaSerializer
from domain.programas import ProgramaNoEncontradoException, ProgramaDatosInvalidosException
from shared.exceptions import InvalidStateTransitionException


def _despublicar_etapas_programa(id_programa: int):
    """Callback: despublica formularios y config al inhabilitar un programa."""
    try:
        programa_orm = Programa.objects.get(id=id_programa)
    except Programa.DoesNotExist:
        return
    etapa_ids = programa_orm.etapas.values_list('id', flat=True)
    FormularioEtapa.objects.filter(
        etapa_id__in=etapa_ids, estado='PUBLICADO'
    ).update(estado='BORRADOR', fecha_publicacion=None)
    ConfigRegistroHogar.objects.filter(
        etapa_id__in=etapa_ids, publicado=True
    ).update(publicado=False)


class ProgramaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Programas."""

    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer

    # list y retrieve son públicos (HomePage ciudadano).
    # Mutaciones requieren autenticación (default settings).
    PUBLIC_ACTIONS = {'list', 'retrieve'}

    def get_permissions(self):
        if self.action in self.PUBLIC_ACTIONS:
            return [AllowAny()]
        return [IsAuthenticated()]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        repo = DjangoProgramaRepository()
        self.app_service = ProgramaApplicationService(
            programa_repository=repo,
            on_programa_inhabilitado=_despublicar_etapas_programa,
        )

    def get_queryset(self):
        """Filtrar programas por estado si se proporciona como parámetro."""
        queryset = Programa.objects.all()
        estado = self.request.query_params.get('estado', None)
        if estado:
            queryset = queryset.filter(estado__iexact=estado)
        return queryset

    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        Cambiar el estado de un programa.
        Endpoint: POST /api/programas/{id}/cambiar_estado/
        Body: {"nuevo_estado": "ACTIVO"} (BORRADOR, ACTIVO, INHABILITADO)
        """
        nuevo_estado = request.data.get('nuevo_estado')
        if not nuevo_estado:
            return Response(
                {'error': 'Debe proporcionar un nuevo_estado'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            resultado = self.app_service.cambiar_estado(int(pk), nuevo_estado)
        except ProgramaNoEncontradoException:
            return Response(
                {'error': f'Programa con ID {pk} no encontrado'},
                status=status.HTTP_404_NOT_FOUND,
            )
        except (InvalidStateTransitionException, ValueError) as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'mensaje': f'El programa fue actualizado a estado {nuevo_estado}',
                'programa': resultado,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Obtener estadísticas de programas.
        Endpoint: GET /api/programas/estadisticas/
        """
        resultado = self.app_service.obtener_estadisticas()
        return Response(resultado)
