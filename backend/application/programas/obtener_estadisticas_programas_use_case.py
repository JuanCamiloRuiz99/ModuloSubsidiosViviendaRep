"""
Caso de uso: Obtener Estadísticas de Programas

Encapsula la lógica de negocio para obtener estadísticas de los programas.
"""
from infrastructure.database.repositories.programa_repository import ProgramaRepository


class ObtenerEstadisticasProgramasUseCase:
    """Caso de uso para obtener estadísticas de programas"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(self) -> dict:
        """
        Ejecutar el caso de uso de obtener estadísticas
        
        Returns:
            Diccionario con estadísticas de programas
        """
        stats = self.programa_repository.obtener_estadisticas()
        
        return {
            'total': stats['total'],
            'por_estado': {
                'BORRADOR': stats['BORRADOR'],
                'ACTIVO': stats['ACTIVO'],
                'INHABILITADO': stats['INHABILITADO'],
            }
        }
