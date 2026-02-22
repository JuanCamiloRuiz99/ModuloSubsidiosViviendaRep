"""
Use Case: Eliminar Usuario

Implementa la lógica de negocio para eliminar un usuario.
"""
from infrastructure.database.repositories import UsuarioRepository
from shared.exceptions import NotFoundError


class EliminarUsuarioUseCase:
    """Use Case para eliminar un usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, usuario_id: int) -> bool:
        """
        Ejecuta el caso de uso de eliminar un usuario
        
        Args:
            usuario_id: ID del usuario
        
        Returns:
            True si se eliminó correctamente
            
        Raises:
            NotFoundError: Si el usuario no existe
        """
        # Verificar que el usuario existe
        usuario = self.repository.obtener_por_id(usuario_id)
        if not usuario:
            raise NotFoundError(f"El usuario con ID {usuario_id} no existe")

        # Eliminar usuario
        self.repository.eliminar(usuario_id)

        return True
