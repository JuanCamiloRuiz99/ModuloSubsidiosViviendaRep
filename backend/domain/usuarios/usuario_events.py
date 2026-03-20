"""
Eventos de Dominio - Módulo Usuarios

Implementa el patrón Domain Events para capturar cambios importantes
en el dominio y propagarlos hacia la capa de aplicación.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict
from dataclasses import dataclass, asdict


class DomainEvent(ABC):
    """
    Clase base para eventos de dominio
    
    Los eventos de dominio representan cosas importantes que sucedieron
    en el dominio y que deben ser procesadas.
    """
    
    def __init__(self, id_agregado: int, timestamp: datetime = None):
        self.id_agregado = id_agregado
        self.timestamp = timestamp or datetime.now()
        self.evento_id = f"{self.__class__.__name__}_{id_agregado}_{self.timestamp.timestamp()}"
    
    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        """Convierte el evento a diccionario"""
        pass


@dataclass
class UsuarioCreadoEvent(DomainEvent):
    """Evento disparado cuando se crea un nuevo usuario"""
    
    id_usuario: int
    nombre_completo: str
    correo: str
    rol: str
    usuario_creacion_id: int = None
    
    def __init__(
        self,
        id_usuario: int,
        nombre_completo: str,
        correo: str,
        rol: str,
        usuario_creacion_id: int = None,
        timestamp: datetime = None
    ):
        super().__init__(id_usuario, timestamp)
        self.id_usuario = id_usuario
        self.nombre_completo = nombre_completo
        self.correo = correo
        self.rol = rol
        self.usuario_creacion_id = usuario_creacion_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "UsuarioCreadoEvent",
            "id_usuario": self.id_usuario,
            "nombre_completo": self.nombre_completo,
            "correo": self.correo,
            "rol": self.rol,
            "usuario_creacion_id": self.usuario_creacion_id,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class UsuarioActualizadoEvent(DomainEvent):
    """Evento disparado cuando se actualiza un usuario"""
    
    id_usuario: int
    campos_actualizados: Dict[str, Any]
    usuario_modificacion_id: int = None
    
    def __init__(
        self,
        id_usuario: int,
        campos_actualizados: Dict[str, Any],
        usuario_modificacion_id: int = None,
        timestamp: datetime = None
    ):
        super().__init__(id_usuario, timestamp)
        self.id_usuario = id_usuario
        self.campos_actualizados = campos_actualizados
        self.usuario_modificacion_id = usuario_modificacion_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "UsuarioActualizadoEvent",
            "id_usuario": self.id_usuario,
            "campos_actualizados": self.campos_actualizados,
            "usuario_modificacion_id": self.usuario_modificacion_id,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class UsuarioDesactivadoEvent(DomainEvent):
    """Evento disparado cuando se desactiva un usuario"""
    
    id_usuario: int
    razon: str = None
    usuario_modificacion_id: int = None
    
    def __init__(
        self,
        id_usuario: int,
        razon: str = None,
        usuario_modificacion_id: int = None,
        timestamp: datetime = None
    ):
        super().__init__(id_usuario, timestamp)
        self.id_usuario = id_usuario
        self.razon = razon
        self.usuario_modificacion_id = usuario_modificacion_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "UsuarioDesactivadoEvent",
            "id_usuario": self.id_usuario,
            "razon": self.razon,
            "usuario_modificacion_id": self.usuario_modificacion_id,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class RolUsuarioCambiadoEvent(DomainEvent):
    """Evento disparado cuando se cambia el rol de un usuario"""
    
    id_usuario: int
    rol_anterior: str
    rol_nuevo: str
    usuario_modificacion_id: int = None
    
    def __init__(
        self,
        id_usuario: int,
        rol_anterior: str,
        rol_nuevo: str,
        usuario_modificacion_id: int = None,
        timestamp: datetime = None
    ):
        super().__init__(id_usuario, timestamp)
        self.id_usuario = id_usuario
        self.rol_anterior = rol_anterior
        self.rol_nuevo = rol_nuevo
        self.usuario_modificacion_id = usuario_modificacion_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "RolUsuarioCambiadoEvent",
            "id_usuario": self.id_usuario,
            "rol_anterior": self.rol_anterior,
            "rol_nuevo": self.rol_nuevo,
            "usuario_modificacion_id": self.usuario_modificacion_id,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class ContraseñaUsuarioCambiadaEvent(DomainEvent):
    """Evento disparado cuando se cambia la contraseña de un usuario"""
    
    id_usuario: int
    usuario_modificacion_id: int = None
    
    def __init__(
        self,
        id_usuario: int,
        usuario_modificacion_id: int = None,
        timestamp: datetime = None
    ):
        super().__init__(id_usuario, timestamp)
        self.id_usuario = id_usuario
        self.usuario_modificacion_id = usuario_modificacion_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "ContraseñaUsuarioCambiadaEvent",
            "id_usuario": self.id_usuario,
            "usuario_modificacion_id": self.usuario_modificacion_id,
            "timestamp": self.timestamp.isoformat(),
        }


@dataclass
class UsuarioEliminadoEvent(DomainEvent):
    """Evento disparado cuando se elimina un usuario"""
    
    id_usuario: int
    razon: str = None
    usuario_modificacion_id: int = None
    
    def __init__(
        self,
        id_usuario: int,
        razon: str = None,
        usuario_modificacion_id: int = None,
        timestamp: datetime = None
    ):
        super().__init__(id_usuario, timestamp)
        self.id_usuario = id_usuario
        self.razon = razon
        self.usuario_modificacion_id = usuario_modificacion_id
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "UsuarioEliminadoEvent",
            "id_usuario": self.id_usuario,
            "razon": self.razon,
            "usuario_modificacion_id": self.usuario_modificacion_id,
            "timestamp": self.timestamp.isoformat(),
        }
