"""
Use Case: Obtener Estadísticas Usuarios

Implementa la lógica de negocio para obtener estadísticas de usuarios.
"""
from typing import Dict, Any
from infrastructure.database.repositories import UsuarioRepository


class ObtenerEstadisticasUsuariosUseCase:
    """Use Case para obtener estadísticas de usuarios"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self) -> Dict[str, Any]:
        """
        Ejecuta el caso de uso de obtener estadísticas
        
        Returns:
            Diccionario con estadísticas de usuarios
        """
        return self.repository.obtener_estadisticas()
