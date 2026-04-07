"""
Application Layer - Módulo Programas

DTOs, Use Cases y Application Service para gestión de programas.
"""

from .programa_dto import (
    CrearProgramaDTO,
    ActualizarProgramaDTO,
    CambiarEstadoProgramaDTO,
    ObtenerProgramaDTO,
    ListarProgramasDTO,
    ProgramaOutDTO,
    ListaProgramasDTO,
    EstadisticasProgramasDTO,
)
from .programa_use_cases import (
    CrearProgramaUseCase,
    ObtenerProgramaUseCase,
    ListarProgramasUseCase,
    ActualizarProgramaUseCase,
    CambiarEstadoProgramaUseCase,
    EliminarProgramaUseCase,
    ObtenerEstadisticasProgramasUseCase,
)
from .programa_application_service import ProgramaApplicationService

__all__ = [
    # DTOs Input
    "CrearProgramaDTO",
    "ActualizarProgramaDTO",
    "CambiarEstadoProgramaDTO",
    "ObtenerProgramaDTO",
    "ListarProgramasDTO",
    # DTOs Output
    "ProgramaOutDTO",
    "ListaProgramasDTO",
    "EstadisticasProgramasDTO",
    # Use Cases
    "CrearProgramaUseCase",
    "ObtenerProgramaUseCase",
    "ListarProgramasUseCase",
    "ActualizarProgramaUseCase",
    "CambiarEstadoProgramaUseCase",
    "EliminarProgramaUseCase",
    "ObtenerEstadisticasProgramasUseCase",
    # Application Service
    "ProgramaApplicationService",
]