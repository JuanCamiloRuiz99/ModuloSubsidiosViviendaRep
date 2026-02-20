"""
Caso de uso: Obtener Programas

Encapsula la lógica de negocio para obtener todos los programas.
"""
from typing import List, Optional
from infrastructure.database.repositories.programa_repository import ProgramaRepository


class ObtenerProgramasUseCase:
    """Caso de uso para obtener todos los programas"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(self, estado: Optional[str] = None) -> List[dict]:
        """
        Ejecutar el caso de uso de obtener programas
        
        Args:
            estado: Filtrar por estado (opcional)
            
        Returns:
            Lista de programas
        """
        if estado:
            programas = self.programa_repository.listar_por_estado(estado)
        else:
            programas = self.programa_repository.listar()
        
        return [
            {
                'id': programa.id,
                'nombre': programa.nombre,
                'descripcion': programa.descripcion,
                'entidad_responsable': programa.entidad_responsable,
                'codigo_programa': programa.codigo_programa,
                'estado': programa.estado,
                'fecha_creacion': programa.fecha_creacion,
                'fecha_actualizacion': programa.fecha_actualizacion,
            }
            for programa in programas
        ]
