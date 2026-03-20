"""
ViewSet REST para Usuario - Versión Simplificada

Endpoints CRUD+Extra para gestión de usuarios.
Implementación síncrona compatible con Django sync context.
"""

import logging
from django.utils.timezone import now
from django.contrib.auth.hashers import check_password
from django.core import signing
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from infrastructure.database.usuarios_models import UsuarioSistema
from infrastructure.database.roles_models import Rol
from presentation.serializers.usuario_serializers import (
    UsuarioSerializer,
    CrearUsuarioSerializer,
    ActualizarUsuarioSerializer,
    CambiarContraseñaSerializer,
    CambiarRolSerializer,
    ListarUsuariosSerializer,
)

logger = logging.getLogger(__name__)


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para Usuarios - Gestión completa
    
    Endpoints:
    - GET    /api/usuarios/ - Listar
    - POST   /api/usuarios/ - Crear
    - GET    /api/usuarios/{id}/ - Obtener
    - PUT    /api/usuarios/{id}/ - Actualizar
    - PATCH  /api/usuarios/{id}/ - Actualizar parcial
    - DELETE /api/usuarios/{id}/ - Eliminar
    - POST   /api/usuarios/{id}/cambiar_contraseña/
    - POST   /api/usuarios/{id}/cambiar_rol/
    - POST   /api/usuarios/{id}/activar/
    - POST   /api/usuarios/{id}/desactivar/
    - GET    /api/usuarios/estadisticas/
    """

    queryset = UsuarioSistema.obtener_no_eliminados()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

    def _get_usuario(self, pk):
        """Helper para obtener usuario por ID"""
        try:
            return UsuarioSistema.obtener_no_eliminados().get(id_usuario=pk)
        except UsuarioSistema.DoesNotExist:
            return None

    def list(self, request) -> Response:
        """Listar usuarios con filtros y paginación"""
        try:
            page = int(request.query_params.get("page", 1))
            page_size = int(request.query_params.get("page_size", 10))
            search = request.query_params.get("search", "").strip()
            id_rol = request.query_params.get("id_rol")
            activo = request.query_params.get("activo")

            queryset = UsuarioSistema.obtener_no_eliminados().order_by("-fecha_creacion")
            
            # Búsqueda solo por número de documento (cédula)
            if search:
                queryset = queryset.filter(numero_documento__icontains=search)
            
            # Filtros
            if id_rol:
                queryset = queryset.filter(id_rol_id=id_rol)
            if activo is not None:
                activo_bool = activo.lower() in ["true", "1", "yes"]
                queryset = queryset.filter(activo=activo_bool)
            
            total = queryset.count()
            start = (page - 1) * page_size
            usuarios = queryset[start:start + page_size]
            
            user_serializer = UsuarioSerializer(usuarios, many=True)
            total_pages = (total + page_size - 1) // page_size

            # Stats siempre desde TODOS los usuarios (no filtrados)
            all_qs = UsuarioSistema.obtener_no_eliminados()
            stats = {
                "total": all_qs.count(),
                "activos": all_qs.filter(activo=True).count(),
                "inactivos": all_qs.filter(activo=False).count(),
                "admins": all_qs.filter(id_rol__nombre_rol="ADMIN").count(),
                "funcionarios": all_qs.filter(id_rol__nombre_rol="FUNCIONARIO").count(),
                "tecnicos": all_qs.filter(id_rol__nombre_rol="TECNICO_VISITANTE").count(),
            }
            
            return Response(
                {
                    "results": user_serializer.data,
                    "count": total,
                    "page": page,
                    "pageSize": page_size,
                    "totalPages": total_pages,
                    "stats": stats,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error listado: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def create(self, request) -> Response:
        """Crear nuevo usuario
        
        Acepta datos del frontend:
        {
            "nombre": "Juan",
            "apellido": "García", 
            "email": "juan@example.com",
            "numeroDocumento": "123456789",
            "idRol": "2",
            "estado": "activo",
            "password": "password123"
        }
        """
        try:
            from django.contrib.auth.hashers import make_password
            
            data = request.data
            
            # Mapear campos del frontend al backend
            nombre_completo = f"{data.get('nombre', '')} {data.get('apellido', '')}".strip()
            email = data.get('email', '').lower().strip()
            password = data.get('password', '')
            id_rol = data.get('idRol') or data.get('id_rol') or 2
            estado = data.get('estado', 'activo').lower()
            numero_documento = (data.get('numeroDocumento') or data.get('numero_documento', '')).strip()
            
            # Validaciones básicas
            if not nombre_completo or len(nombre_completo) < 3:
                return Response(
                    {"error": "Nombre y apellido son requeridos (mínimo 3 caracteres)"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            if not email or "@" not in email:
                return Response(
                    {"error": "Email inválido"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            if not password or len(password) < 8:
                return Response(
                    {"error": "Contraseña debe tener mínimo 8 caracteres"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            if not numero_documento:
                return Response(
                    {"error": "Número de documento es requerido"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Verificar unicidad de email
            if UsuarioSistema.obtener_no_eliminados().filter(correo=email).exists():
                return Response(
                    {"error": "Este email ya está registrado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Verificar unicidad de numero_documento
            if UsuarioSistema.obtener_no_eliminados().filter(numero_documento=numero_documento).exists():
                return Response(
                    {"error": "Este número de documento ya está registrado"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            # Obtener rol
            try:
                rol_obj = Rol.objects.get(id_rol=id_rol)
            except Rol.DoesNotExist:
                rol_obj = Rol.objects.get(nombre_rol="FUNCIONARIO")
            
            # Hash de la contraseña
            password_hash = make_password(password)
            
            # Crear usuario
            usuario = UsuarioSistema(
                nombre_completo=nombre_completo,
                correo=email,
                password_hash=password_hash,
                id_rol=rol_obj,
                numero_documento=numero_documento,
                activo=estado == 'activo',
                activo_logico=True,
                fecha_modificacion=now(),
            )
            usuario.save()

            logger.info(f"Usuario creado: {usuario.id_usuario} - {email}")
            
            user_serializer = UsuarioSerializer(usuario)
            return Response(
                user_serializer.data,
                status=status.HTTP_201_CREATED,
            )

        except Exception as e:
            logger.error(f"Error crear usuario: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def retrieve(self, request, pk=None) -> Response:
        """Obtener usuario por ID"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            serializer = UsuarioSerializer(usuario)
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error retrieve: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def update(self, request, pk=None) -> Response:
        """Actualizar usuario"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            data = request.data

            # Reconstruir nombre_completo desde nombre + apellido o directamente
            nombre = data.get('nombre', '').strip()
            apellido = data.get('apellido', '').strip()
            if nombre or apellido:
                usuario.nombre_completo = f"{nombre} {apellido}".strip()
            elif data.get('nombre_completo'):
                usuario.nombre_completo = data.get('nombre_completo').strip()

            # Actualizar numero_documento
            numero_doc = data.get('numero_documento') or data.get('numeroDocumento')
            if numero_doc is not None:
                usuario.numero_documento = str(numero_doc).strip()

            # Actualizar id_rol
            id_rol = data.get('id_rol') or data.get('idRol')
            if id_rol:
                try:
                    rol_obj = Rol.objects.get(id_rol=int(id_rol))
                    usuario.id_rol = rol_obj
                except Rol.DoesNotExist:
                    pass

            # Actualizar estado/activo
            activo = data.get('activo')
            estado = data.get('estado')
            if activo is not None:
                usuario.activo = activo if isinstance(activo, bool) else str(activo).lower() in ['true', '1']
            elif estado is not None:
                usuario.activo = str(estado).lower() == 'activo'

            usuario.fecha_modificacion = now()
            usuario.save()
            logger.info(f"Usuario actualizado: {pk} - {usuario.nombre_completo}")

            user_serializer = UsuarioSerializer(usuario)
            return Response(
                {"success": True, "data": user_serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error update: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def partial_update(self, request, pk=None) -> Response:
        """Actualización parcial"""
        return self.update(request, pk)

    def destroy(self, request, pk=None) -> Response:
        """Eliminar usuario (soft delete)"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            usuario.activo_logico = False
            usuario.save()
            logger.info(f"Usuario eliminado: {pk}")
            
            return Response(
                {"success": True, "message": "Usuario eliminado"},
                status=status.HTTP_204_NO_CONTENT,
            )

        except Exception as e:
            logger.error(f"Error destroy: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def cambiar_contraseña(self, request, pk=None) -> Response:
        """Cambiar contraseña"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            serializer = CambiarContraseñaSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            usuario.password_hash = serializer.validated_data["password_hash"]
            usuario.save()
            logger.info(f"Contraseña cambiada: {pk}")

            user_serializer = UsuarioSerializer(usuario)
            return Response(
                {"success": True, "data": user_serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error cambiar_contraseña: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def cambiar_rol(self, request, pk=None) -> Response:
        """Cambiar rol de usuario"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            serializer = CambiarRolSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            rol_obj = serializer.validated_data["rol"]
            usuario.id_rol = rol_obj
            usuario.save()
            logger.info(f"Rol cambiado: {pk} -> {rol_obj.nombre_rol}")

            user_serializer = UsuarioSerializer(usuario)
            return Response(
                {"success": True, "data": user_serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error cambiar_rol: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def activar(self, request, pk=None) -> Response:
        """Activar usuario"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            usuario.activo = True
            usuario.fecha_modificacion = now()
            usuario.save()
            logger.info(f"Usuario activado: {pk}")

            user_serializer = UsuarioSerializer(usuario)
            return Response(
                {"success": True, "data": user_serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error activar: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["post"])
    def desactivar(self, request, pk=None) -> Response:
        """Desactivar usuario"""
        try:
            usuario = self._get_usuario(pk)
            if not usuario:
                return Response(
                    {"success": False, "error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND,
                )
            
            usuario.activo = False
            usuario.fecha_modificacion = now()
            usuario.save()
            logger.info(f"Usuario desactivado: {pk}")

            user_serializer = UsuarioSerializer(usuario)
            return Response(
                {"success": True, "data": user_serializer.data},
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error desactivar: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["post"])
    def login(self, request) -> Response:
        """Autenticar usuario con correo y contraseña.

        Retorna token firmado + datos del usuario si las credenciales son válidas.
        """
        try:
            correo = (request.data.get("correo") or "").lower().strip()
            password = request.data.get("password") or ""

            if not correo or not password:
                return Response(
                    {"error": "Correo y contraseña son requeridos"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                usuario = UsuarioSistema.obtener_no_eliminados().get(correo=correo)
            except UsuarioSistema.DoesNotExist:
                return Response(
                    {"error": "Credenciales inválidas"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            if not check_password(password, usuario.password_hash):
                return Response(
                    {"error": "Credenciales inválidas"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            if not usuario.activo:
                return Response(
                    {"error": "La cuenta está desactivada. Contacte al administrador."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            # Generar token firmado (válido 24 h)
            token = signing.dumps(
                {"uid": usuario.id_usuario, "rol": usuario.id_rol_id},
                salt="auth-token",
            )

            # Determinar nombre del rol
            rol_map = {1: "ADMIN", 2: "FUNCIONARIO", 3: "TECNICO_VISITANTE"}
            nombre_rol = getattr(usuario.id_rol, "nombre_rol", rol_map.get(usuario.id_rol_id, ""))

            logger.info(f"Login exitoso: {usuario.id_usuario} - {correo}")

            return Response(
                {
                    "access_token": token,
                    "user": {
                        "id": str(usuario.id_usuario),
                        "nombre": usuario.nombre_completo,
                        "email": usuario.correo,
                        "rol": usuario.id_rol_id,
                        "rolNombre": nombre_rol,
                        "estado": "activo" if usuario.activo else "inactivo",
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error login: {str(e)}")
            return Response(
                {"error": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"])
    def estadisticas(self, request) -> Response:
        """Obtener estadísticas de usuarios"""
        try:
            queryset = UsuarioSistema.obtener_no_eliminados()
            
            total = queryset.count()
            activos = queryset.filter(activo=True).count()
            inactivos = total - activos

            por_rol = {}
            for rol_code, rol_name in UsuarioSistema.ROLES:
                count = queryset.filter(rol=rol_code).count()
                por_rol[rol_code] = count

            logger.info("Estadísticas generadas")

            return Response(
                {
                    "success": True,
                    "data": {
                        "total": total,
                        "activos": activos,
                        "inactivos": inactivos,
                        "por_rol": por_rol,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Error estadísticas: {str(e)}")
            return Response(
                {"success": False, "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
