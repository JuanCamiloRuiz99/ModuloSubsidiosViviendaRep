"""
Repository para Usuario - Capa de Infraestructura.

Implementa la interface de persistencia para la entidad Usuario.
"""
from django.db.models import Q, Count
from typing import List, Optional, Dict, Any
from infrastructure.database.models import Usuario as UsuarioModel
from domain.usuarios import Usuario


class UsuarioRepository:
    """Repository para gestionar la persistencia de Usuarios"""

    @staticmethod
    def crear(usuario_data: Dict[str, Any]) -> Usuario:
        """
        Crea un nuevo usuario en la base de datos
        
        Args:
            usuario_data: Diccionario con datos del usuario
            
        Returns:
            Usuario: Entidad Usuario creada
        """
        db_usuario = UsuarioModel.objects.create(**usuario_data)
        return UsuarioRepository._mapear_a_entidad(db_usuario)

    @staticmethod
    def obtener_por_id(usuario_id: int) -> Optional[Usuario]:
        """
        Obtiene un usuario por su ID
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            Usuario o None si no existe
        """
        try:
            db_usuario = UsuarioModel.objects.get(id=usuario_id)
            return UsuarioRepository._mapear_a_entidad(db_usuario)
        except UsuarioModel.DoesNotExist:
            return None

    @staticmethod
    def obtener_por_correo(correo: str) -> Optional[Usuario]:
        """
        Obtiene un usuario por correo
        
        Args:
            correo: Correo del usuario
            
        Returns:
            Usuario o None si no existe
        """
        try:
            db_usuario = UsuarioModel.objects.get(correo=correo)
            return UsuarioRepository._mapear_a_entidad(db_usuario)
        except UsuarioModel.DoesNotExist:
            return None

    @staticmethod
    def obtener_por_documento(numero_documento: str) -> Optional[Usuario]:
        """
        Obtiene un usuario por número de documento
        
        Args:
            numero_documento: Número de documento
            
        Returns:
            Usuario o None si no existe
        """
        try:
            db_usuario = UsuarioModel.objects.get(numero_documento=numero_documento)
            return UsuarioRepository._mapear_a_entidad(db_usuario)
        except UsuarioModel.DoesNotExist:
            return None

    @staticmethod
    def obtener_todos() -> List[Usuario]:
        """
        Obtiene todos los usuarios
        
        Returns:
            Lista de usuarios
        """
        db_usuarios = UsuarioModel.objects.all()
        return [UsuarioRepository._mapear_a_entidad(u) for u in db_usuarios]

    @staticmethod
    def obtener_por_rol(rol: str) -> List[Usuario]:
        """
        Obtiene usuarios por rol
        
        Args:
            rol: Rol del usuario (ADMINISTRADOR, FUNCIONARIO, TECNICO)
            
        Returns:
            Lista de usuarios con ese rol
        """
        db_usuarios = UsuarioModel.objects.filter(rol=rol)
        return [UsuarioRepository._mapear_a_entidad(u) for u in db_usuarios]

    @staticmethod
    def obtener_por_estado(estado: str) -> List[Usuario]:
        """
        Obtiene usuarios por estado
        
        Args:
            estado: Estado del usuario (ACTIVO, INACTIVO)
            
        Returns:
            Lista de usuarios en ese estado
        """
        db_usuarios = UsuarioModel.objects.filter(estado=estado)
        return [UsuarioRepository._mapear_a_entidad(u) for u in db_usuarios]

    @staticmethod
    def actualizar(usuario_id: int, usuario_data: Dict[str, Any]) -> Optional[Usuario]:
        """
        Actualiza un usuario
        
        Args:
            usuario_id: ID del usuario
            usuario_data: Datos a actualizar
            
        Returns:
            Usuario actualizado o None si no existe
        """
        try:
            db_usuario = UsuarioModel.objects.get(id=usuario_id)
            for key, value in usuario_data.items():
                if key != 'id':
                    setattr(db_usuario, key, value)
            db_usuario.save()
            return UsuarioRepository._mapear_a_entidad(db_usuario)
        except UsuarioModel.DoesNotExist:
            return None

    @staticmethod
    def eliminar(usuario_id: int) -> bool:
        """
        Elimina un usuario
        
        Args:
            usuario_id: ID del usuario
            
        Returns:
            True si se eliminó, False si no existía
        """
        try:
            UsuarioModel.objects.get(id=usuario_id).delete()
            return True
        except UsuarioModel.DoesNotExist:
            return False

    @staticmethod
    def cambiar_estado(usuario_id: int, nuevo_estado: str) -> Optional[Usuario]:
        """
        Cambia el estado de un usuario
        
        Args:
            usuario_id: ID del usuario
            nuevo_estado: Nuevo estado (ACTIVO, INACTIVO)
            
        Returns:
            Usuario actualizado o None si no existe
        """
        try:
            db_usuario = UsuarioModel.objects.get(id=usuario_id)
            db_usuario.estado = nuevo_estado
            db_usuario.save()
            return UsuarioRepository._mapear_a_entidad(db_usuario)
        except UsuarioModel.DoesNotExist:
            return None

    @staticmethod
    def obtener_estadisticas() -> Dict[str, Any]:
        """
        Obtiene estadísticas de usuarios
        
        Returns:
            Diccionario con estadísticas
        """
        total = UsuarioModel.objects.count()
        activos = UsuarioModel.objects.filter(estado='ACTIVO').count()
        
        roles_count = UsuarioModel.objects.values('rol').annotate(count=Count('rol'))
        estadisticas_roles = {item['rol']: item['count'] for item in roles_count}

        return {
            'total': total,
            'activos': activos,
            'inactivos': total - activos,
            'por_rol': estadisticas_roles,
        }

    @staticmethod
    def buscar(termino: str) -> List[Usuario]:
        """
        Busca usuarios por nombre, apellidos, correo o documento
        
        Args:
            termino: Término de búsqueda
            
        Returns:
            Lista de usuarios encontrados
        """
        db_usuarios = UsuarioModel.objects.filter(
            Q(nombre__icontains=termino) |
            Q(apellidos__icontains=termino) |
            Q(correo__icontains=termino) |
            Q(numero_documento__icontains=termino)
        )
        return [UsuarioRepository._mapear_a_entidad(u) for u in db_usuarios]

    @staticmethod
    def _mapear_a_entidad(db_usuario: UsuarioModel) -> Usuario:
        """
        Mapea un modelo Django a entidad de dominio
        
        Args:
            db_usuario: Instancia de UsuarioModel
            
        Returns:
            Instancia de Usuario
        """
        return Usuario(
            id=db_usuario.id,
            nombre=db_usuario.nombre,
            apellidos=db_usuario.apellidos,
            numero_documento=db_usuario.numero_documento,
            correo=db_usuario.correo,
            rol=db_usuario.rol,
            estado=db_usuario.estado,
            fecha_creacion=db_usuario.fecha_creacion,
            fecha_actualizacion=db_usuario.fecha_actualizacion,
        )
