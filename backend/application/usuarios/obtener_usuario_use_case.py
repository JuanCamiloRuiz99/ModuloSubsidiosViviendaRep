"""
Use Case: Obtener Usuario

Implementa la lógica de negocio para obtener un usuario específico.
"""
from typing import Dict, Any
from infrastructure.database.repositories import UsuarioRepository
from shared.exceptions import NotFoundError


class ObtenerUsuarioUseCase:
    """Use Case para obtener un usuario específico"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, usuario_id: int) -> Dict[str, Any]:
        """
        Ejecuta el caso de uso de obtener un usuario
        
        Args:
            usuario_id: ID del usuario
        
        Returns:
            Diccionario con datos del usuario
            
        Raises:
            NotFoundError: Si el usuario no existe
        """
        usuario = self.repository.obtener_por_id(usuario_id)

        if not usuario:
            raise NotFoundError(f"El usuario con ID {usuario_id} no existe")

        return usuario.to_dict()
