"""
Clase base para interfaces de repositorio.

Define el contrato genérico CRUD que toda implementación
de repositorio (Django ORM, en memoria, etc.) debe cumplir.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class BaseRepository(ABC):
    """Interfaz genérica de repositorio."""

    @abstractmethod
    def crear(self, entidad) -> Any:
        pass

    @abstractmethod
    def actualizar(self, entidad) -> Any:
        pass

    @abstractmethod
    def obtener_por_id(self, id: int) -> Optional[Any]:
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
