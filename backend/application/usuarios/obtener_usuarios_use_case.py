"""
Use Case: Obtener Usuarios

Implementa la lógica de negocio para obtener la lista de usuarios.
"""
from typing import Dict, Any, List, Optional
from infrastructure.database.repositories import UsuarioRepository


class ObtenerUsuariosUseCase:
    """Use Case para obtener usuarios"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(
        self,
        filtro_rol: Optional[str] = None,
        filtro_estado: Optional[str] = None,
        buscar: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Ejecuta el caso de uso de obtener usuarios
        
        Args:
            filtro_rol: Rol para filtrar (opcional)
            filtro_estado: Estado para filtrar (opcional)
            buscar: Término de búsqueda (opcional)
        
        Returns:
            Lista de diccionarios con datos de usuarios
        """
        if buscar:
            usuarios = self.repository.buscar(buscar)
        else:
            usuarios = self.repository.obtener_todos()
        
        # Aplicar filtros adicionales después de la búsqueda
        if filtro_rol:
            usuarios = [u for u in usuarios if u.rol == filtro_rol]
        
        if filtro_estado:
            usuarios = [u for u in usuarios if u.estado == filtro_estado]

        return [usuario.to_dict() for usuario in usuarios]
