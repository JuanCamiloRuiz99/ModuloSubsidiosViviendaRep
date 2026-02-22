"""
Use Case: Cambiar Estado Usuario

Implementa la lógica de negocio para cambiar el estado de un usuario.
"""
from typing import Dict, Any
from infrastructure.database.repositories import UsuarioRepository
from shared.exceptions import ValidationError, NotFoundError


class CambiarEstadoUsuarioUseCase:
    """Use Case para cambiar el estado de un usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, usuario_id: int, nuevo_estado: str) -> Dict[str, Any]:
        """
        Ejecuta el caso de uso de cambiar estado
        
        Args:
            usuario_id: ID del usuario
            nuevo_estado: Nuevo estado (ACTIVO, INACTIVO)
        
        Returns:
            Diccionario con datos del usuario actualizado
            
        Raises:
            NotFoundError: Si el usuario no existe
            ValidationError: Si el estado no es válido
        """
        # Validar estado
        estados_validos = ['ACTIVO', 'INACTIVO']
        if nuevo_estado not in estados_validos:
            raise ValidationError(f"El estado debe ser uno de: {', '.join(estados_validos)}")

        # Verificar que el usuario existe
        usuario = self.repository.obtener_por_id(usuario_id)
        if not usuario:
            raise NotFoundError(f"El usuario con ID {usuario_id} no existe")

        # Cambiar estado
        usuario_actualizado = self.repository.cambiar_estado(usuario_id, nuevo_estado)

        return usuario_actualizado.to_dict()
