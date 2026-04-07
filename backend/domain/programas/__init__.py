"""
Capa de Dominio - Módulo Programas

Contiene la entidad Programa, value objects, especificaciones,
eventos, excepciones y la interfaz del repositorio.
"""

from .programa import Programa, EstadoPrograma, TRANSICIONES_VALIDAS
from .programa_value_objects import NombrePrograma, CodigoPrograma, DescripcionPrograma
from .programas_repository import ProgramaRepositoryInterface
from .programa_exceptions import (
    ProgramaException,
    ProgramaNoEncontradoException,
    ProgramaCodigoDuplicadoException,
    ProgramaDatosInvalidosException,
)
from .programa_events import (
    ProgramaCreadoEvent,
    ProgramaEstadoCambiadoEvent,
    ProgramaActualizadoEvent,
    ProgramaEliminadoEvent,
)

__all__ = [
    # Entidad
    "Programa",
    "EstadoPrograma",
    "TRANSICIONES_VALIDAS",
    # Value Objects
    "NombrePrograma",
    "CodigoPrograma",
    "DescripcionPrograma",
    # Repositorio
    "ProgramaRepositoryInterface",
    # Excepciones
    "ProgramaException",
    "ProgramaNoEncontradoException",
    "ProgramaCodigoDuplicadoException",
    "ProgramaDatosInvalidosException",
    # Eventos
    "ProgramaCreadoEvent",
    "ProgramaEstadoCambiadoEvent",
    "ProgramaActualizadoEvent",
    "ProgramaEliminadoEvent",
]
