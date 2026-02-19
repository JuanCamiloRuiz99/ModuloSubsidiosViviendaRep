from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Programa
from .serializers import ProgramaSerializer


class ProgramaViewSet(viewsets.ModelViewSet):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer

    def get_queryset(self):
        """Filtrar programas por estado si se proporciona como parámetro"""
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
        programa = self.get_object()
        nuevo_estado = request.data.get('nuevo_estado')

        # Validar que se proporcione un estado
        if not nuevo_estado:
            return Response(
                {'error': 'Debe proporcionar un nuevo_estado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar que sea un estado válido
        estados_validos = [choice[0] for choice in Programa.ESTADOS]
        if nuevo_estado not in estados_validos:
            return Response(
                {'error': f'Estado inválido. Estados válidos: {", ".join(estados_validos)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        programa.estado = nuevo_estado
        programa.save()

        serializer = self.get_serializer(programa)
        return Response(
            {
                'mensaje': f'El programa fue actualizado a estado {nuevo_estado}',
                'programa': serializer.data
            },
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Obtener estadísticas de programas.
        Endpoint: GET /api/programas/estadisticas/
        """
        total = Programa.objects.count()
        borradores = Programa.objects.filter(estado='BORRADOR').count()
        activos = Programa.objects.filter(estado='ACTIVO').count()
        inhabilitados = Programa.objects.filter(estado='INHABILITADO').count()

        return Response({
            'total': total,
            'por_estado': {
                'BORRADOR': borradores,
                'ACTIVO': activos,
                'INHABILITADO': inhabilitados,
            }
        })
