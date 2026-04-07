"""
Clase base para Domain Events.

Los eventos de dominio capturan hechos relevantes que ocurren
en el sistema y permiten reaccionar a ellos de forma desacoplada.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict


class BaseDomainEvent(ABC):
    """Evento de dominio base."""

    def __init__(self, id_agregado: int, timestamp: datetime = None):
        self.id_agregado = id_agregado
        self.timestamp = timestamp or datetime.now()
        self.evento_id = (
            f"{self.__class__.__name__}_{id_agregado}_{self.timestamp.timestamp()}"
        )

    @abstractmethod
    def to_dict(self) -> Dict[str, Any]:
        pass
