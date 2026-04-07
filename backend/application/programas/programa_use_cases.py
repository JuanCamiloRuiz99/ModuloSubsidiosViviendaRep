"""
Use Cases del módulo Programas.

Cada clase encapsula una operación de negocio concreta.
"""

import math
from typing import Dict, Any

from domain.programas import (
    Programa,
    EstadoPrograma,
    ProgramaRepositoryInterface,
    ProgramaNoEncontradoException,
    ProgramaDatosInvalidosException,
)
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


class CrearProgramaUseCase:
    """Crea un nuevo programa en estado BORRADOR."""

    def __init__(self, repository: ProgramaRepositoryInterface):
        self.repository = repository

    def execute(self, dto: CrearProgramaDTO) -> ProgramaOutDTO:
        dto.validar()

        programa = Programa(
            nombre=dto.nombre,
            descripcion=dto.descripcion,
            entidad_responsable=dto.entidad_responsable,
            estado=EstadoPrograma.BORRADOR,
        )

        errores = programa.validar()
        if errores:
            raise ProgramaDatosInvalidosException(errores)

        programa_creado = self.repository.crear(programa)
        return ProgramaOutDTO.from_domain(programa_creado)


class ObtenerProgramaUseCase:
    """Obtiene un programa por su ID."""

    def __init__(self, repository: ProgramaRepositoryInterface):
        self.repository = repository

    def execute(self, dto: ObtenerProgramaDTO) -> ProgramaOutDTO:
        dto.validar()

        programa = self.repository.obtener_por_id(dto.id_programa)
        if not programa:
            raise ProgramaNoEncontradoException(dto.id_programa)

        return ProgramaOutDTO.from_domain(programa)


class ListarProgramasUseCase:
    """Lista programas con filtros y paginación."""

    def __init__(self, repository: ProgramaRepositoryInterface):
        self.repository = repository

    def execute(self, dto: ListarProgramasDTO) -> ListaProgramasDTO:
        dto.validar()

        filtros = {}
        if dto.estado:
            filtros["estado"] = dto.estado

        resultado = self.repository.listar(
            filtros=filtros,
            pagina=dto.pagina,
            tamaño_pagina=dto.tamaño_pagina,
        )

        items_dto = [
            ProgramaOutDTO.from_domain(p) for p in resultado["items"]
        ]

        return ListaProgramasDTO(
            items=items_dto,
            total=resultado["total"],
            pagina=resultado["pagina"],
            tamaño_pagina=resultado["tamaño_pagina"],
            total_paginas=resultado["total_paginas"],
        )


class ActualizarProgramaUseCase:
    """Actualiza los datos básicos de un programa."""

    def __init__(self, repository: ProgramaRepositoryInterface):
        self.repository = repository

    def execute(self, dto: ActualizarProgramaDTO) -> ProgramaOutDTO:
        dto.validar()

        programa = self.repository.obtener_por_id(dto.id_programa)
        if not programa:
            raise ProgramaNoEncontradoException(dto.id_programa)

        programa.actualizar_datos(
            nombre=dto.nombre,
            descripcion=dto.descripcion,
            entidad_responsable=dto.entidad_responsable,
        )

        errores = programa.validar()
        if errores:
            raise ProgramaDatosInvalidosException(errores)

        programa_actualizado = self.repository.actualizar(programa)
        return ProgramaOutDTO.from_domain(programa_actualizado)


class CambiarEstadoProgramaUseCase:
    """
    Cambia el estado de un programa validando transiciones.

    Si se inhabilita, también despublica los formularios asociados.
    El efecto secundario sobre formularios se delega al repositorio
    a través del callback on_inhabilitado.
    """

    def __init__(
        self,
        repository: ProgramaRepositoryInterface,
        on_inhabilitado=None,
    ):
        self.repository = repository
        self.on_inhabilitado = on_inhabilitado

    def execute(self, dto: CambiarEstadoProgramaDTO) -> ProgramaOutDTO:
        dto.validar()

        programa = self.repository.obtener_por_id(dto.id_programa)
        if not programa:
            raise ProgramaNoEncontradoException(dto.id_programa)

        estado_anterior = programa.estado.value
        programa.cambiar_estado(EstadoPrograma(dto.nuevo_estado))

        programa_actualizado = self.repository.actualizar(programa)

        # Efecto secundario: despublicar formularios al inhabilitar
        if dto.nuevo_estado == "INHABILITADO" and self.on_inhabilitado:
            self.on_inhabilitado(dto.id_programa)

        return ProgramaOutDTO.from_domain(programa_actualizado)


class EliminarProgramaUseCase:
    """Elimina (soft delete) un programa."""

    def __init__(self, repository: ProgramaRepositoryInterface):
        self.repository = repository

    def execute(self, id_programa: int) -> bool:
        if not id_programa or id_programa <= 0:
            raise ValueError("ID de programa inválido")

        programa = self.repository.obtener_por_id(id_programa)
        if not programa:
            raise ProgramaNoEncontradoException(id_programa)

        return self.repository.eliminar(id_programa)


class ObtenerEstadisticasProgramasUseCase:
    """Obtiene estadísticas de programas agrupadas por estado."""

    def __init__(self, repository: ProgramaRepositoryInterface):
        self.repository = repository

    def execute(self) -> EstadisticasProgramasDTO:
        stats = self.repository.obtener_estadisticas()
        return EstadisticasProgramasDTO(
            total=stats.get("total", 0),
            por_estado={
                "BORRADOR": stats.get("BORRADOR", 0),
                "ACTIVO": stats.get("ACTIVO", 0),
                "INHABILITADO": stats.get("INHABILITADO", 0),
            },
        )
