"""
ViewSet para la entidad Programa

Proporciona endpoints REST para CRUD operations
"""
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from infrastructure.database.models import Programa
from infrastructure.database.repositories.programa_repository import ProgramaRepository
from presentation.serializers.programa_serializer import ProgramaSerializer
from application.programas import (
    CrearProgramaUseCase,
    ObtenerProgramasUseCase,
    ObtenerProgramaUseCase,
    ActualizarProgramaUseCase,
    EliminarProgramaUseCase,
    CambiarEstadoProgramaUseCase,
    ObtenerEstadisticasProgramasUseCase,
)
from shared.exceptions import ValidationError, NotFoundError


class ProgramaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Programas"""
    
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Inicializar repositorio
        self.programa_repository = ProgramaRepository()
        # Inicializar casos de uso
        self.crear_caso_de_uso = CrearProgramaUseCase(self.programa_repository)
        self.obtener_casos_de_uso = ObtenerProgramasUseCase(self.programa_repository)
        self.obtener_caso_de_uso = ObtenerProgramaUseCase(self.programa_repository)
        self.actualizar_caso_de_uso = ActualizarProgramaUseCase(self.programa_repository)
        self.eliminar_caso_de_uso = EliminarProgramaUseCase(self.programa_repository)
        self.cambiar_estado_caso_de_uso = CambiarEstadoProgramaUseCase(self.programa_repository)
        self.estadisticas_caso_de_uso = ObtenerEstadisticasProgramasUseCase(self.programa_repository)

    def list(self, request, *args, **kwargs):
        """
        GET /api/programas/
        Listar todos los programas con filtro opcional por estado
        """
        try:
            estado = request.query_params.get('estado', None)
            programas_data = self.obtener_casos_de_uso.execute(estado=estado)
            
            return Response({
                'count': len(programas_data),
                'results': programas_data
            })
        except ValidationError as e:
            return Response(
                {'error': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    def create(self, request, *args, **kwargs):
        """
        POST /api/programas/
        Crear un nuevo programa
        """
        try:
            programa_data = self.crear_caso_de_uso.execute(
                nombre=request.data.get('nombre'),
                descripcion=request.data.get('descripcion'),
                entidad_responsable=request.data.get('entidad_responsable'),
            )
            return Response(
                programa_data,
                status=status.HTTP_201_CREATED
            )
        except ValidationError as e:
            return Response(
                {'error': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    def retrieve(self, request, pk=None, *args, **kwargs):
        """
        GET /api/programas/{id}/
        Obtener detalle de un programa
        """
        try:
            programa_data = self.obtener_caso_de_uso.execute(id=int(pk))
            return Response(programa_data)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    def update(self, request, pk=None, *args, **kwargs):
        """
        PUT /api/programas/{id}/
        Actualizar un programa
        """
        try:
            programa_data = self.actualizar_caso_de_uso.execute(
                id=int(pk),
                nombre=request.data.get('nombre'),
                descripcion=request.data.get('descripcion'),
                entidad_responsable=request.data.get('entidad_responsable'),
                estado=request.data.get('estado'),
            )
            return Response(programa_data)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    def partial_update(self, request, pk=None, *args, **kwargs):
        """
        PATCH /api/programas/{id}/
        Actualización parcial de un programa
        """
        return self.update(request, pk, *args, **kwargs)

    def destroy(self, request, pk=None, *args, **kwargs):
        """
        DELETE /api/programas/{id}/
        Eliminar un programa
        """
        try:
            self.eliminar_caso_de_uso.execute(id=int(pk))
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def cambiar_estado(self, request, pk=None):
        """
        POST /api/programas/{id}/cambiar_estado/
        Cambiar el estado de un programa
        Body: {"nuevo_estado": "ACTIVO"}
        """
        try:
            nuevo_estado = request.data.get('nuevo_estado')
            
            if not nuevo_estado:
                return Response(
                    {'error': 'Debe proporcionar un nuevo_estado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            programa_data = self.cambiar_estado_caso_de_uso.execute(
                id=int(pk),
                nuevo_estado=nuevo_estado
            )
            
            return Response(
                {
                    'mensaje': f'El programa fue actualizado a estado {nuevo_estado}',
                    'programa': programa_data
                },
                status=status.HTTP_200_OK
            )
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            return Response(
                {'error': e.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        GET /api/programas/estadisticas/
        Obtener estadísticas de programas
        """
        stats_data = self.estadisticas_caso_de_uso.execute()
        
        return Response(stats_data)
