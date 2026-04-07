"""
Excepciones de dominio del módulo Programas.
"""

from shared.exceptions import (
    DomainException,
    EntityNotFoundException,
    InvalidEntityException,
)


class ProgramaException(DomainException):
    """Excepción base del módulo Programas."""
    pass


class ProgramaNoEncontradoException(EntityNotFoundException, ProgramaException):
    """El programa solicitado no existe."""

    def __init__(self, id_programa: int):
        self.id_programa = id_programa
        super().__init__(f"Programa con ID {id_programa} no encontrado")


class ProgramaCodigoDuplicadoException(InvalidEntityException, ProgramaException):
    """Ya existe un programa con ese código."""

    def __init__(self, codigo: str):
        self.codigo = codigo
        super().__init__(f"Ya existe un programa con el código {codigo}")


class ProgramaDatosInvalidosException(InvalidEntityException, ProgramaException):
    """Los datos del programa no son válidos."""

    def __init__(self, errores: list[str]):
        self.errores = errores
        super().__init__(f"Datos inválidos: {'; '.join(errores)}")
