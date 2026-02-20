"""
Caso de uso: Cambiar Estado del Programa

Encapsula la lógica de negocio para cambiar el estado de un programa.
"""
from infrastructure.database.repositories.programa_repository import ProgramaRepository
from shared.exceptions import NotFoundError, ValidationError


class CambiarEstadoProgramaUseCase:
    """Caso de uso para cambiar el estado de un programa"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(self, id: int, nuevo_estado: str) -> dict:
        """
        Ejecutar el caso de uso de cambiar estado
        
        Args:
            id: ID del programa
            nuevo_estado: Nuevo estado (BORRADOR, ACTIVO, INHABILITADO)
            
        Returns:
            Datos del programa con nuevo estado
            
        Raises:
            NotFoundError: Si el programa no existe
            ValidationError: Si el estado es inválido
        """
        # Verificar que el programa existe
        programa = self.programa_repository.obtener(id)
        if not programa:
            raise NotFoundError(f"El programa con ID {id} no existe")
        
        # Validar estado
        estados_validos = ['BORRADOR', 'ACTIVO', 'INHABILITADO']
        if nuevo_estado not in estados_validos:
            raise ValidationError([
                f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"
            ])
        
        # Actualizar estado
        programa_actualizado = self.programa_repository.actualizar(
            id,
            {'estado': nuevo_estado}
        )
        
        return {
            'id': programa_actualizado.id,
            'nombre': programa_actualizado.nombre,
            'descripcion': programa_actualizado.descripcion,
            'entidad_responsable': programa_actualizado.entidad_responsable,
            'codigo_programa': programa_actualizado.codigo_programa,
            'estado': programa_actualizado.estado,
            'fecha_creacion': programa_actualizado.fecha_creacion,
            'fecha_actualizacion': programa_actualizado.fecha_actualizacion,
        }
