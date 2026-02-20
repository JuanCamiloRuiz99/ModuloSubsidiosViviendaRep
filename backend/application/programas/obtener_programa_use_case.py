"""
Caso de uso: Obtener Programa por ID

Encapsula la lógica de negocio para obtener un programa específico.
"""
from typing import Optional
from infrastructure.database.repositories.programa_repository import ProgramaRepository
from shared.exceptions import NotFoundError


class ObtenerProgramaUseCase:
    """Caso de uso para obtener un programa por ID"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(self, id: int) -> dict:
        """
        Ejecutar el caso de uso de obtener programa
        
        Args:
            id: ID del programa
            
        Returns:
            Datos del programa
            
        Raises:
            NotFoundError: Si el programa no existe
        """
        programa = self.programa_repository.obtener(id)
        
        if not programa:
            raise NotFoundError(f"El programa con ID {id} no existe")
        
        return {
            'id': programa.id,
            'nombre': programa.nombre,
            'descripcion': programa.descripcion,
            'entidad_responsable': programa.entidad_responsable,
            'codigo_programa': programa.codigo_programa,
            'estado': programa.estado,
            'fecha_creacion': programa.fecha_creacion,
            'fecha_actualizacion': programa.fecha_actualizacion,
        }
