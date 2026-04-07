"""
Capa Compartida (Shared Kernel)

Clases base reutilizables para el patrón DDD en todos los módulos.
"""

from .exceptions import (
    DomainException,
    EntityNotFoundException,
    InvalidEntityException,
    InvalidStateTransitionException,
)
from .base_entity import BaseEntity
from .base_value_object import BaseValueObject
from .base_specification import BaseSpecification, AndSpecification, OrSpecification, NotSpecification
from .base_event import BaseDomainEvent
from .base_repository import BaseRepository
from .base_use_case import BaseUseCase
from .base_dto import BaseInputDTO, BaseOutputDTO

__all__ = [
    # Excepciones
    "DomainException",
    "EntityNotFoundException",
    "InvalidEntityException",
    "InvalidStateTransitionException",
    # Base classes
    "BaseEntity",
    "BaseValueObject",
    "BaseSpecification",
    "AndSpecification",
    "OrSpecification",
    "NotSpecification",
    "BaseDomainEvent",
    "BaseRepository",
    "BaseUseCase",
    "BaseInputDTO",
    "BaseOutputDTO",
]
