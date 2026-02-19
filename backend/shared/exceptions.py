"""
Excepciones personalizadas de dominio
"""


class DomainException(Exception):
    """Excepción base para excepciones de dominio"""
    pass


class EntityNotFoundException(DomainException):
    """Se lanza cuando una entidad no es encontrada"""
    pass


class InvalidEntityException(DomainException):
    """Se lanza cuando una entidad es inválida"""
    pass


class InvalidStateTransitionException(DomainException):
    """Se lanza cuando se intenta una transición de estado inválida"""
    pass
