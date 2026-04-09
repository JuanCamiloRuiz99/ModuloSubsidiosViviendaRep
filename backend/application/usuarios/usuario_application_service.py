"""
Servicio de Aplicación para Usuarios

Orquesta los use cases y proporciona una interfaz unificada
para la capa de presentación. Encapsula la lógica de negocio
y coordina el flujo de operaciones.
"""

from typing import Dict, Any, Optional
import logging

from domain.usuarios import (
    UsuarioRepository,
    UsuarioNoEncontradoException,
    CorreoYaRegistradoException,
)

from .usuario_dto import (
    CrearUsuarioDTO,
    ActualizarUsuarioDTO,
    CambiarContraseñaDTO,
    CambiarRolDTO,
    ObtenerUsuarioDTO,
    ListarUsuariosDTO,
    UsuarioDTO,
    ListaUsuariosDTO,
    EstadisticasUsuariosDTO,
)

from .usuario_use_cases import (
    CrearUsuarioUseCase,
    ObtenerUsuarioUseCase,
    ListarUsuariosUseCase,
    ActualizarUsuarioUseCase,
    CambiarRolUseCase,
    CambiarContraseñaUseCase,
    EliminarUsuarioUseCase,
    ObtenerEstadisticasUsuariosUseCase,
)

logger = logging.getLogger(__name__)


class UsuarioApplicationService:
    """
    Servicio de Aplicación para Usuarios
    
    Orquesta los use cases y proporciona una interfaz unificada
    para la capa de presentación.
    
    Responsabilidades:
    - Validar entrada de datos
    - Coordinar use cases
    - Manejar errores de aplicación
    - Registrar eventos importantes
    - Transformar y serializar datos
    """

    def __init__(self, usuario_repository: UsuarioRepository):
        """
        Inicializa el servicio con sus dependencias
        
        Args:
            usuario_repository: Implementación del repositorio de usuarios
        """
        self.usuario_repository = usuario_repository
        
        # Inicializar use cases
        self._crear_usuario_uc = CrearUsuarioUseCase(usuario_repository)
        self._obtener_usuario_uc = ObtenerUsuarioUseCase(usuario_repository)
        self._listar_usuarios_uc = ListarUsuariosUseCase(usuario_repository)
        self._actualizar_usuario_uc = ActualizarUsuarioUseCase(usuario_repository)
        self._cambiar_rol_uc = CambiarRolUseCase(usuario_repository)
        self._cambiar_contraseña_uc = CambiarContraseñaUseCase(usuario_repository)
        self._eliminar_usuario_uc = EliminarUsuarioUseCase(usuario_repository)
        self._estadisticas_uc = ObtenerEstadisticasUsuariosUseCase(usuario_repository)

    # ============ Operaciones de Creación ============

    def crear_usuario(
        self, input_dto: CrearUsuarioDTO
    ) -> Dict[str, Any]:
        """
        Crea un nuevo usuario en el sistema
        
        Args:
            input_dto: DTO con datos del usuario a crear
            
        Returns:
            Diccionario con datos del usuario creado
            
        Raises:
            ValueError: Si los datos no son válidos
            CorreoYaRegistradoException: Si el correo ya está registrado
        """
        try:
            logger.info(f"Creando usuario con correo: {input_dto.correo}")
            
            # Validar entrada
            input_dto.validar()
            
            # Verificar correo único
            usuario_existente = self.usuario_repository.obtener_por_correo(
                input_dto.correo
            )
            if usuario_existente:
                raise CorreoYaRegistradoException(input_dto.correo)
            
            # Ejecutar use case
            usuario_dto = self._crear_usuario_uc.execute(input_dto)
            
            logger.info(f"Usuario creado exitosamente: {usuario_dto.id_usuario}")
            return usuario_dto.to_dict()
            
        except Exception as e:
            logger.error(f"Error al crear usuario: {str(e)}")
            raise

    # ============ Operaciones de Lectura ============

    def obtener_usuario(
        self, id_usuario: int
    ) -> Dict[str, Any]:
        """
        Obtiene un usuario por su ID
        
        Args:
            id_usuario: ID del usuario a obtener
            
        Returns:
            Diccionario con datos del usuario
            
        Raises:
            UsuarioNoEncontradoException: Si el usuario no existe
        """
        try:
            logger.debug(f"Obteniendo usuario con ID: {id_usuario}")
            
            input_dto = ObtenerUsuarioDTO(id_usuario)
            usuario_dto = self._obtener_usuario_uc.execute(input_dto)
            
            return usuario_dto.to_dict()
            
        except Exception as e:
            logger.error(f"Error al obtener usuario {id_usuario}: {str(e)}")
            raise

    def listar_usuarios(
        self,
        pagina: int = 1,
        tamaño_pagina: int = 10,
        rol: Optional[str] = None,
        activo: Optional[bool] = None,
    ) -> Dict[str, Any]:
        """
        Lista usuarios con filtros y paginación
        
        Args:
            pagina: Número de página (default: 1)
            tamaño_pagina: Cantidad de registros por página (default: 10)
            rol: Filtro por rol (opcional)
            activo: Filtro por estado activo (opcional)
            
        Returns:
            Diccionario con lista paginada de usuarios
        """
        try:
            logger.debug(
                f"Listando usuarios - Página: {pagina}, Tamaño: {tamaño_pagina}, "
                f"Rol: {rol}, Activo: {activo}"
            )
            
            input_dto = ListarUsuariosDTO(
                pagina=pagina,
                tamaño_pagina=tamaño_pagina,
                rol=rol,
                activo=activo,
            )
            
            lista_usuarios = self._listar_usuarios_uc.execute(input_dto)
            
            return lista_usuarios.to_dict()
            
        except Exception as e:
            logger.error(f"Error al listar usuarios: {str(e)}")
            raise

    def obtener_estadisticas(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas generales de usuarios
        
        Returns:
            Diccionario con estadísticas de usuarios
        """
        try:
            logger.debug("Obteniendo estadísticas de usuarios")
            
            estadisticas = self._estadisticas_uc.execute()
            
            return estadisticas.to_dict()
            
        except Exception as e:
            logger.error(f"Error al obtener estadísticas: {str(e)}")
            raise

    # ============ Operaciones de Actualización ============

    def actualizar_usuario(
        self,
        id_usuario: int,
        nombre_completo: Optional[str] = None,
        activo: Optional[bool] = None,
        usuario_modificacion: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Actualiza datos básicos de un usuario (nombre y estado)
        
        Para cambiar rol, use cambiar_rol_usuario().
        
        Args:
            id_usuario: ID del usuario
            nombre_completo: Nuevo nombre (opcional)
            activo: Nuevo estado (opcional)
            usuario_modificacion: ID del usuario que realiza la operación
            
        Returns:
            Diccionario con usuario actualizado
            
        Raises:
            UsuarioNoEncontradoException: Si el usuario no existe
        """
        try:
            logger.info(f"Actualizando usuario: {id_usuario}")
            
            input_dto = ActualizarUsuarioDTO(
                id_usuario=id_usuario,
                nombre_completo=nombre_completo,
                activo=activo,
                usuario_modificacion=usuario_modificacion,
            )
            
            usuario_dto = self._actualizar_usuario_uc.execute(input_dto)
            
            logger.info(f"Usuario actualizado: {id_usuario}")
            return usuario_dto.to_dict()
            
        except Exception as e:
            logger.error(f"Error al actualizar usuario {id_usuario}: {str(e)}")
            raise

    def cambiar_contraseña(
        self,
        id_usuario: int,
        password_hash: str,
        usuario_modificacion: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Cambia la contraseña de un usuario
        
        Args:
            id_usuario: ID del usuario
            password_hash: Nuevo hash de contraseña
            usuario_modificacion: ID del usuario que realiza la operación
            
        Returns:
            Diccionario con usuario actualizado
            
        Raises:
            UsuarioNoEncontradoException: Si el usuario no existe
        """
        try:
            logger.info(f"Cambiando contraseña del usuario: {id_usuario}")
            
            input_dto = CambiarContraseñaDTO(
                id_usuario=id_usuario,
                password_hash=password_hash,
                usuario_modificacion=usuario_modificacion,
            )
            
            usuario_dto = self._cambiar_contraseña_uc.execute(input_dto)
            
            logger.info(f"Contraseña cambiada para usuario: {id_usuario}")
            return usuario_dto.to_dict()
            
        except Exception as e:
            logger.error(f"Error al cambiar contraseña: {str(e)}")
            raise

    # ============ Operaciones de Eliminación ============

    def eliminar_usuario(
        self, id_usuario: int
    ) -> bool:
        """
        Elimina (lógicamente) un usuario
        
        Args:
            id_usuario: ID del usuario a eliminar
            
        Returns:
            True si se eliminó exitosamente
            
        Raises:
            UsuarioNoEncontradoException: Si el usuario no existe
        """
        try:
            logger.info(f"Eliminando usuario: {id_usuario}")
            
            resultado = self._eliminar_usuario_uc.execute(id_usuario)
            
            if resultado:
                logger.info(f"Usuario eliminado: {id_usuario}")
            else:
                logger.warning(f"No se pudo eliminar el usuario: {id_usuario}")
            
            return resultado
            
        except Exception as e:
            logger.error(f"Error al eliminar usuario {id_usuario}: {str(e)}")
            raise

    # ============ Hiperoperaciones ============

    def activar_usuario(self, id_usuario: int) -> Dict[str, Any]:
        """Activa un usuario inactivo"""
        return self.actualizar_usuario(
            id_usuario=id_usuario, activo=True
        )

    def desactivar_usuario(self, id_usuario: int) -> Dict[str, Any]:
        """Desactiva un usuario activo"""
        return self.actualizar_usuario(
            id_usuario=id_usuario, activo=False
        )

    def cambiar_rol_usuario(
        self,
        id_usuario: int,
        nuevo_rol: str,
        usuario_modificacion: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Cambia el rol de un usuario
        
        Operación sensible de seguridad separada de actualizaciones normales.
        
        Args:
            id_usuario: ID del usuario
            nuevo_rol: Nuevo rol (ADMIN, FUNCIONARIO, VISITADOR_TECNICO)
            usuario_modificacion: ID del usuario que realiza el cambio
            
        Returns:
            Diccionario con usuario actualizado
            
        Raises:
            UsuarioNoEncontradoException: Si el usuario no existe
        """
        try:
            logger.info(f"Cambiando rol del usuario {id_usuario} a {nuevo_rol}")
            
            input_dto = CambiarRolDTO(
                id_usuario=id_usuario,
                rol=nuevo_rol,
                usuario_modificacion=usuario_modificacion,
            )
            
            usuario_dto = self._cambiar_rol_uc.execute(input_dto)
            
            logger.info(f"Rol cambiado para usuario {id_usuario}")
            return usuario_dto.to_dict()
            
        except Exception as e:
            logger.error(f"Error al cambiar rol del usuario {id_usuario}: {str(e)}")
            raise
