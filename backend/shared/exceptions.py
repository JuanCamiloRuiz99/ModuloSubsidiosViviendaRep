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


class ValidationError(DomainException):
    """Se lanza cuando la validación falla"""
    def __init__(self, errors):
        if isinstance(errors, list):
            self.errors = errors
        else:
            self.errors = [errors]
        super().__init__('; '.join(self.errors))


class NotFoundError(DomainException):
    """Se lanza cuando un recurso no es encontrado"""
    pass
