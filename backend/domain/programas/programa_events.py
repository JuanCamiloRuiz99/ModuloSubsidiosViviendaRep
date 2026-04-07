"""
Eventos de dominio del módulo Programas.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from shared.base_event import BaseDomainEvent


class ProgramaCreadoEvent(BaseDomainEvent):
    """Se disparó al crear un programa."""

    def __init__(
        self,
        id_programa: int,
        nombre: str,
        codigo_programa: str,
        timestamp: Optional[datetime] = None,
    ):
        super().__init__(id_programa, timestamp)
        self.id_programa = id_programa
        self.nombre = nombre
        self.codigo_programa = codigo_programa

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "ProgramaCreadoEvent",
            "id_programa": self.id_programa,
            "nombre": self.nombre,
            "codigo_programa": self.codigo_programa,
            "timestamp": self.timestamp.isoformat(),
        }


class ProgramaEstadoCambiadoEvent(BaseDomainEvent):
    """Se dispara al cambiar el estado de un programa."""

    def __init__(
        self,
        id_programa: int,
        estado_anterior: str,
        estado_nuevo: str,
        timestamp: Optional[datetime] = None,
    ):
        super().__init__(id_programa, timestamp)
        self.id_programa = id_programa
        self.estado_anterior = estado_anterior
        self.estado_nuevo = estado_nuevo

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "ProgramaEstadoCambiadoEvent",
            "id_programa": self.id_programa,
            "estado_anterior": self.estado_anterior,
            "estado_nuevo": self.estado_nuevo,
            "timestamp": self.timestamp.isoformat(),
        }


class ProgramaActualizadoEvent(BaseDomainEvent):
    """Se dispara al actualizar datos básicos de un programa."""

    def __init__(
        self,
        id_programa: int,
        campos_actualizados: Dict[str, Any],
        timestamp: Optional[datetime] = None,
    ):
        super().__init__(id_programa, timestamp)
        self.id_programa = id_programa
        self.campos_actualizados = campos_actualizados

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "ProgramaActualizadoEvent",
            "id_programa": self.id_programa,
            "campos_actualizados": self.campos_actualizados,
            "timestamp": self.timestamp.isoformat(),
        }


class ProgramaEliminadoEvent(BaseDomainEvent):
    """Se dispara al eliminar (soft delete) un programa."""

    def __init__(
        self,
        id_programa: int,
        timestamp: Optional[datetime] = None,
    ):
        super().__init__(id_programa, timestamp)
        self.id_programa = id_programa

    def to_dict(self) -> Dict[str, Any]:
        return {
            "tipo_evento": "ProgramaEliminadoEvent",
            "id_programa": self.id_programa,
            "timestamp": self.timestamp.isoformat(),
        }
