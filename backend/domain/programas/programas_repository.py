"""
Interfaz del repositorio de Programas.

Define el contrato que cualquier implementación de persistencia
de programas debe cumplir.
"""

from abc import abstractmethod
from typing import Any, Dict, List, Optional

from shared.base_repository import BaseRepository
from .programa import Programa


class ProgramaRepositoryInterface(BaseRepository):
    """Repositorio abstracto para la entidad Programa."""

    @abstractmethod
    def crear(self, programa: Programa) -> Programa:
        pass

    @abstractmethod
    def actualizar(self, programa: Programa) -> Programa:
        pass

    @abstractmethod
    def obtener_por_id(self, id: int) -> Optional[Programa]:
        pass

    @abstractmethod
    def obtener_por_codigo(self, codigo: str) -> Optional[Programa]:
        pass

    @abstractmethod
    def listar(
        self,
        filtros: Optional[Dict[str, Any]] = None,
        pagina: int = 1,
        tamaño_pagina: int = 10,
    ) -> Dict[str, Any]:
        pass

    @abstractmethod
    def eliminar(self, id: int) -> bool:
        pass

    @abstractmethod
    def contar(self, filtros: Optional[Dict[str, Any]] = None) -> int:
        pass

    @abstractmethod
    def obtener_estadisticas(self) -> Dict[str, Any]:
        pass
