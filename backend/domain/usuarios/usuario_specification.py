"""
Especificación de Usuarios - Patrón Specification para DDD

Implementa el patrón Specification para encapsular lógica de filtrado
y búsqueda de usuarios de forma reutilizable.
"""

from abc import ABC, abstractmethod
from typing import Optional, List
from datetime import datetime


class UsuarioSpecification(ABC):
    """
    Clase base para especificaciones de Usuario
    
    El patrón Specification encapsula la lógica de búsqueda
    en objetos reutilizables.
    """
    
    @abstractmethod
    def esta_satisfecha_por(self, usuario) -> bool:
        """Verifica si un usuario satisface esta especificación"""
        pass


class UsuarioPorIdSpecification(UsuarioSpecification):
    """Especificación para buscar un usuario por ID"""
    
    def __init__(self, id_usuario: int):
        self.id_usuario = id_usuario
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.id_usuario == self.id_usuario


class UsuarioPorCorreoSpecification(UsuarioSpecification):
    """Especificación para buscar un usuario por correo"""
    
    def __init__(self, correo: str):
        self.correo = correo.lower().strip()
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.correo.lower() == self.correo


class UsuarioPorRolSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios por rol"""
    
    def __init__(self, rol: str):
        self.rol = rol.upper()
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.rol.value.upper() == self.rol


class UsuarioActivoSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios activos"""
    
    def __init__(self, activo: bool = True):
        self.activo = activo
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.esta_activo() == self.activo


class UsuarioAdminSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios administradores"""
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.es_admin()


class UsuarioFuncionarioSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios funcionarios"""
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.es_funcionario()


class UsuarioVisitadorSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios visitadores técnicos"""
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.es_visitador()


class UsuarioCreadoDesdeSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios creados desde una fecha"""
    
    def __init__(self, fecha_desde: datetime):
        self.fecha_desde = fecha_desde
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.fecha_creacion >= self.fecha_desde


class UsuarioCreadoHastaSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios creados hasta una fecha"""
    
    def __init__(self, fecha_hasta: datetime):
        self.fecha_hasta = fecha_hasta
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return usuario.fecha_creacion <= self.fecha_hasta


class UsuarioModificadoDesdeSpecification(UsuarioSpecification):
    """Especificación para buscar usuarios modificados desde una fecha"""
    
    def __init__(self, fecha_desde: datetime):
        self.fecha_desde = fecha_desde
    
    def esta_satisfecha_por(self, usuario) -> bool:
        if usuario.fecha_modificacion is None:
            return False
        return usuario.fecha_modificacion >= self.fecha_desde


# Composiciones de especificaciones

class EspecificacionCompuesta(UsuarioSpecification):
    """Base para especificaciones compuestas"""
    
    def __init__(self, *especificaciones: UsuarioSpecification):
        self.especificaciones = especificaciones


class EspecificacionAnd(EspecificacionCompuesta):
    """Composición AND de especificaciones"""
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return all(esp.esta_satisfecha_por(usuario) for esp in self.especificaciones)


class EspecificacionOr(EspecificacionCompuesta):
    """Composición OR de especificaciones"""
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return any(esp.esta_satisfecha_por(usuario) for esp in self.especificaciones)


class EspecificacionNot(UsuarioSpecification):
    """Negación de una especificación"""
    
    def __init__(self, especificacion: UsuarioSpecification):
        self.especificacion = especificacion
    
    def esta_satisfecha_por(self, usuario) -> bool:
        return not self.especificacion.esta_satisfecha_por(usuario)


# Criterios de búsqueda complejos

class CriteriosListadoUsuarios:
    """
    Criterios para listar usuarios de forma flexible
    
    Encapsula los parámetros de búsqueda de usuarios.
    """
    
    def __init__(
        self,
        pagina: int = 1,
        tamaño_pagina: int = 10,
        rol: Optional[str] = None,
        activo: Optional[bool] = None,
        fecha_creacion_desde: Optional[datetime] = None,
        fecha_creacion_hasta: Optional[datetime] = None,
        busqueda: Optional[str] = None,  # Búsqueda en nombre o correo
        orden_por: str = "fecha_creacion",
        orden_descendente: bool = True,
    ):
        self.pagina = max(1, pagina)
        self.tamaño_pagina = max(1, min(100, tamaño_pagina))  # Máximo 100
        self.rol = rol.upper() if rol else None
        self.activo = activo
        self.fecha_creacion_desde = fecha_creacion_desde
        self.fecha_creacion_hasta = fecha_creacion_hasta
        self.busqueda = busqueda.lower().strip() if busqueda else None
        self.orden_por = orden_por
        self.orden_descendente = orden_descendente
    
    @property
    def offset(self) -> int:
        """Calcula el offset para paginación"""
        return (self.pagina - 1) * self.tamaño_pagina
    
    @property
    def limit(self) -> int:
        """Obtiene el límite de resultados"""
        return self.tamaño_pagina
    
    def validar(self) -> None:
        """Valida los criterios"""
        roles_validos = ["ADMIN", "FUNCIONARIO", "VISITADOR_TECNICO"]
        if self.rol and self.rol not in roles_validos:
            raise ValueError(f"Rol inválido: {self.rol}")
        
        if self.fecha_creacion_desde and self.fecha_creacion_hasta:
            if self.fecha_creacion_desde > self.fecha_creacion_hasta:
                raise ValueError("La fecha de inicio no puede ser mayor a la fecha de fin")
