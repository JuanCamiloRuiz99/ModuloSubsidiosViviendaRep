"""
Caso de uso: Eliminar Programa

Encapsula la lógica de negocio para eliminar un programa.
"""
from infrastructure.database.repositories.programa_repository import ProgramaRepository
from shared.exceptions import NotFoundError


class EliminarProgramaUseCase:
    """Caso de uso para eliminar un programa"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(self, id: int) -> bool:
        """
        Ejecutar el caso de uso de eliminar programa
        
        Args:
            id: ID del programa a eliminar
            
        Returns:
            True si se eliminó correctamente
            
        Raises:
            NotFoundError: Si el programa no existe
        """
        # Verificar que el programa existe
        programa = self.programa_repository.obtener(id)
        if not programa:
            raise NotFoundError(f"El programa con ID {id} no existe")
        
        # Eliminar
        return self.programa_repository.eliminar(id)
