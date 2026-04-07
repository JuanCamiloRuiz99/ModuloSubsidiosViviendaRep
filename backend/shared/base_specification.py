"""
Clase base para el patrón Specification.

Las Specifications encapsulan reglas de negocio reutilizables
para filtrado y validación de entidades.
"""

from abc import ABC, abstractmethod


class BaseSpecification(ABC):
    """Especificación base con soporte para composición AND / OR / NOT."""

    @abstractmethod
    def esta_satisfecha_por(self, entidad) -> bool:
        """Evalúa si la entidad satisface esta especificación."""
        pass

    def __and__(self, other: "BaseSpecification") -> "AndSpecification":
        return AndSpecification(self, other)

    def __or__(self, other: "BaseSpecification") -> "OrSpecification":
        return OrSpecification(self, other)

    def __invert__(self) -> "NotSpecification":
        return NotSpecification(self)


class AndSpecification(BaseSpecification):
    def __init__(self, *specs: BaseSpecification):
        self._specs = specs

    def esta_satisfecha_por(self, entidad) -> bool:
        return all(s.esta_satisfecha_por(entidad) for s in self._specs)


class OrSpecification(BaseSpecification):
    def __init__(self, *specs: BaseSpecification):
        self._specs = specs

    def esta_satisfecha_por(self, entidad) -> bool:
        return any(s.esta_satisfecha_por(entidad) for s in self._specs)


class NotSpecification(BaseSpecification):
    def __init__(self, spec: BaseSpecification):
        self._spec = spec

    def esta_satisfecha_por(self, entidad) -> bool:
        return not self._spec.esta_satisfecha_por(entidad)
