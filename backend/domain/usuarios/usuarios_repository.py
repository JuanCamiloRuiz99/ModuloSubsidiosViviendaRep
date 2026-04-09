"""
Interfaz del Repositorio de Usuarios

Define los contratos para acceso a datos de usuarios
siguiendo el patrón Repository del Domain-Driven Design.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any

from .usuario import Usuario


class UsuarioRepository(ABC):
    """
    Interfaz del repositorio para la entidad Usuario
    
    Define los métodos que cualquier implementación de repositorio
    debe proporcionar para persistencia de usuarios.
    """

    @abstractmethod
    def crear(self, usuario: Usuario) -> Usuario:
        """
        Crea un nuevo usuario
        
        Args:
            usuario: Entidad Usuario a persistir
            
        Returns:
            Usuario creado con ID asignado
        """
        pass

    @abstractmethod
    def actualizar(self, usuario: Usuario) -> Usuario:
        """
        Actualiza un usuario existente
        
        Args:
            usuario: Entidad Usuario con datos actualizados
            
        Returns:
            Usuario actualizado
        """
        pass

    @abstractmethod
    def obtener_por_id(self, id_usuario: int) -> Optional[Usuario]:
        """
        Obtiene un usuario por su ID
        
        Args:
            id_usuario: ID del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        pass

    @abstractmethod
    def obtener_por_correo(self, correo: str) -> Optional[Usuario]:
        """
        Obtiene un usuario por su correo
        
        Args:
            correo: Correo electrónico del usuario
            
        Returns:
            Usuario si existe, None en caso contrario
        """
        pass

    @abstractmethod
    def obtener_todos(
        self,
        filtros: Optional[Dict[str, Any]] = None,
        pagina: int = 1,
        tamaño_pagina: int = 10,
    ) -> Dict[str, Any]:
        """
        Obtiene todos los usuarios con filtros opcionales
        
        Args:
            filtros: Filtros a aplicar (rol, activo, etc.)
            pagina: Número de página (default: 1)
            tamaño_pagina: Cantidad de registros por página (default: 10)
            
        Returns:
            Diccionario con:
            - items: Lista de usuarios
            - total: Total de registros
            - pagina: Número de página actual
            - tamaño_pagina: Tamaño de página
            - total_paginas: Total de páginas
        """
        pass

    @abstractmethod
    def obtener_por_rol(self, rol: str) -> List[Usuario]:
        """
        Obtiene todos los usuarios con un rol específico
        
        Args:
            rol: Rol a filtrar
            
        Returns:
            Lista de usuarios con el rol especificado
        """
        pass

    @abstractmethod
    def eliminar(self, id_usuario: int) -> bool:
        """
        Elimina un usuario (lógicamente)
        
        Args:
            id_usuario: ID del usuario a eliminar
            
        Returns:
            True si se eliminó, False si no existe
        """
        pass

    @abstractmethod
    def contar(self) -> int:
        """
        Cuenta el total de usuarios activos
        
        Returns:
            Total de usuarios
        """
        pass

    @abstractmethod
    def existe_correo(self, correo: str) -> bool:
        """
        Verifica si existe un usuario con un correo específico
        
        Args:
            correo: Correo a verificar
            
        Returns:
            True si existe, False en caso contrario
        """
        pass
