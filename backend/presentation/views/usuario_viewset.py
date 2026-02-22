"""
ViewSet de Usuario - Capa de Presentación

Define los endpoints HTTP para la gestión de usuarios.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from infrastructure.database.models import Usuario
from infrastructure.database.repositories import UsuarioRepository
from presentation.serializers.usuario_serializer import UsuarioSerializer
from application.usuarios import (
    CrearUsuarioUseCase,
    ObtenerUsuariosUseCase,
    ObtenerUsuarioUseCase,
    ActualizarUsuarioUseCase,
    EliminarUsuarioUseCase,
    CambiarEstadoUsuarioUseCase,
    ObtenerEstadisticasUsuariosUseCase,
)
from shared.exceptions import ValidationError, NotFoundError


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar usuarios"""

    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        repo = UsuarioRepository()
        self.crear_usuario = CrearUsuarioUseCase(repo)
        self.obtener_usuarios = ObtenerUsuariosUseCase(repo)
        self.obtener_usuario = ObtenerUsuarioUseCase(repo)
        self.actualizar_usuario = ActualizarUsuarioUseCase(repo)
        self.eliminar_usuario = EliminarUsuarioUseCase(repo)
        self.cambiar_estado_usuario = CambiarEstadoUsuarioUseCase(repo)
        self.obtener_estadisticas = ObtenerEstadisticasUsuariosUseCase(repo)

    def list(self, request, *args, **kwargs):
        """Lista todos los usuarios con filtros opcionales"""
        try:
            filtro_rol = request.query_params.get('rol')
            filtro_estado = request.query_params.get('estado')
            buscar = request.query_params.get('buscar')

            usuarios_data = self.obtener_usuarios.execute(
                filtro_rol=filtro_rol,
                filtro_estado=filtro_estado,
                buscar=buscar,
            )

            return Response(usuarios_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create(self, request, *args, **kwargs):
        """Crea un nuevo usuario"""
        try:
            usuario_data = self.crear_usuario.execute(request.data)
            return Response(usuario_data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, pk=None, *args, **kwargs):
        """Obtiene un usuario específico"""
        try:
            usuario_data = self.obtener_usuario.execute(pk)
            return Response(usuario_data, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def update(self, request, pk=None, *args, **kwargs):
        """Actualiza un usuario completo"""
        try:
            usuario_data = self.actualizar_usuario.execute(pk, request.data)
            return Response(usuario_data, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def partial_update(self, request, pk=None, *args, **kwargs):
        """Actualiza parcialmente un usuario"""
        try:
            usuario_data = self.actualizar_usuario.execute(pk, request.data)
            return Response(usuario_data, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def destroy(self, request, pk=None, *args, **kwargs):
        """Elimina un usuario"""
        try:
            self.eliminar_usuario.execute(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=['patch'])
    def cambiar_estado(self, request, pk=None):
        """Cambia el estado de un usuario"""
        try:
            nuevo_estado = request.data.get('estado')
            if not nuevo_estado:
                raise ValidationError("El estado es requerido")

            usuario_data = self.cambiar_estado_usuario.execute(pk, nuevo_estado)
            return Response(usuario_data, status=status.HTTP_200_OK)
        except NotFoundError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """Obtiene estadísticas de usuarios"""
        try:
            estadisticas = self.obtener_estadisticas.execute()
            return Response(estadisticas, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
