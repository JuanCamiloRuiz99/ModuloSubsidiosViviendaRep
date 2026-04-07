"""
Clase base para Use Cases.

Cada caso de uso encapsula una operación de negocio concreta
con un único método execute().
"""

from abc import ABC, abstractmethod
from typing import Any


class BaseUseCase(ABC):
    """Use case base con método execute()."""

    @abstractmethod
    def execute(self, *args, **kwargs) -> Any:
        pass
