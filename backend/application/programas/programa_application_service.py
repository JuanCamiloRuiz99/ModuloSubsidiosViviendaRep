"""
Servicio de Aplicación para Programas.

Punto de entrada único para la capa de presentación.
Orquesta los use cases y maneja errores transversales.
"""

import logging
from typing import Any, Dict, Optional

from domain.programas import ProgramaRepositoryInterface

from .programa_dto import (
    CrearProgramaDTO,
    ActualizarProgramaDTO,
    CambiarEstadoProgramaDTO,
    ObtenerProgramaDTO,
    ListarProgramasDTO,
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

logger = logging.getLogger(__name__)


class ProgramaApplicationService:
    """
    Servicio de aplicación para el módulo Programas.

    Orquesta use cases y proporciona una interfaz
    unificada para la capa de presentación.
    """

    def __init__(
        self,
        programa_repository: ProgramaRepositoryInterface,
        on_programa_inhabilitado=None,
    ):
        self.repository = programa_repository

        # Inicializar use cases
        self._crear_uc = CrearProgramaUseCase(programa_repository)
        self._obtener_uc = ObtenerProgramaUseCase(programa_repository)
        self._listar_uc = ListarProgramasUseCase(programa_repository)
        self._actualizar_uc = ActualizarProgramaUseCase(programa_repository)
        self._cambiar_estado_uc = CambiarEstadoProgramaUseCase(
            programa_repository, on_inhabilitado=on_programa_inhabilitado
        )
        self._eliminar_uc = EliminarProgramaUseCase(programa_repository)
        self._estadisticas_uc = ObtenerEstadisticasProgramasUseCase(programa_repository)

    # ---------- Creación ----------

    def crear_programa(
        self,
        nombre: str,
        descripcion: str,
        entidad_responsable: str,
    ) -> Dict[str, Any]:
        """Crea un nuevo programa en estado BORRADOR."""
        try:
            logger.info(f"Creando programa: {nombre}")
            dto = CrearProgramaDTO(nombre, descripcion, entidad_responsable)
            resultado = self._crear_uc.execute(dto)
            logger.info(f"Programa creado: ID {resultado.id}")
            return resultado.to_dict()
        except Exception as e:
            logger.error(f"Error al crear programa: {e}")
            raise

    # ---------- Lectura ----------

    def obtener_programa(self, id_programa: int) -> Dict[str, Any]:
        """Obtiene un programa por su ID."""
        try:
            dto = ObtenerProgramaDTO(id_programa)
            resultado = self._obtener_uc.execute(dto)
            return resultado.to_dict()
        except Exception as e:
            logger.error(f"Error al obtener programa {id_programa}: {e}")
            raise

    def listar_programas(
        self,
        pagina: int = 1,
        tamaño_pagina: int = 10,
        estado: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Lista programas con filtros y paginación."""
        try:
            dto = ListarProgramasDTO(pagina, tamaño_pagina, estado)
            resultado = self._listar_uc.execute(dto)
            return resultado.to_dict()
        except Exception as e:
            logger.error(f"Error al listar programas: {e}")
            raise

    def obtener_estadisticas(self) -> Dict[str, Any]:
        """Obtiene estadísticas de programas por estado."""
        try:
            resultado = self._estadisticas_uc.execute()
            return resultado.to_dict()
        except Exception as e:
            logger.error(f"Error al obtener estadísticas: {e}")
            raise

    # ---------- Actualización ----------

    def actualizar_programa(
        self,
        id_programa: int,
        nombre: Optional[str] = None,
        descripcion: Optional[str] = None,
        entidad_responsable: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Actualiza datos básicos de un programa."""
        try:
            logger.info(f"Actualizando programa: {id_programa}")
            dto = ActualizarProgramaDTO(
                id_programa, nombre, descripcion, entidad_responsable
            )
            resultado = self._actualizar_uc.execute(dto)
            logger.info(f"Programa actualizado: {id_programa}")
            return resultado.to_dict()
        except Exception as e:
            logger.error(f"Error al actualizar programa {id_programa}: {e}")
            raise

    def cambiar_estado(
        self, id_programa: int, nuevo_estado: str
    ) -> Dict[str, Any]:
        """Cambia el estado de un programa validando transiciones."""
        try:
            logger.info(f"Cambiando estado de programa {id_programa} → {nuevo_estado}")
            dto = CambiarEstadoProgramaDTO(id_programa, nuevo_estado)
            resultado = self._cambiar_estado_uc.execute(dto)
            logger.info(f"Estado cambiado: programa {id_programa} → {nuevo_estado}")
            return resultado.to_dict()
        except Exception as e:
            logger.error(f"Error al cambiar estado de programa {id_programa}: {e}")
            raise

    # ---------- Eliminación ----------

    def eliminar_programa(self, id_programa: int) -> bool:
        """Elimina (soft delete) un programa."""
        try:
            logger.info(f"Eliminando programa: {id_programa}")
            resultado = self._eliminar_uc.execute(id_programa)
            if resultado:
                logger.info(f"Programa eliminado: {id_programa}")
            return resultado
        except Exception as e:
            logger.error(f"Error al eliminar programa {id_programa}: {e}")
            raise
