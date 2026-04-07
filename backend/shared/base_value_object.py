"""
Clase base para Value Objects del dominio.

Los Value Objects encapsulan validación y semántica de conceptos
del negocio (correo, estado, código, etc.).
"""

from abc import ABC, abstractmethod


class BaseValueObject(ABC):
    """
    Value Object base.

    Los Value Objects son inmutables, se comparan por valor
    y encapsulan validación de negocio.
    """

    @abstractmethod
    def valor(self):
        """Retorna el valor primitivo subyacente."""
        pass

    def __eq__(self, other) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return self.valor() == other.valor()

    def __hash__(self) -> int:
        return hash((self.__class__, self.valor()))

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}({self.valor()})"

    def __str__(self) -> str:
        return str(self.valor())
