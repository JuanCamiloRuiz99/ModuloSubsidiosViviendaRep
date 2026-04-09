"""
Interfaz del repositorio de Etapas.

Define el contrato que cualquier implementación de persistencia
de etapas debe cumplir (Puerto en Arquitectura Hexagonal).
"""

from abc import abstractmethod
from typing import List, Optional

from shared.base_repository import BaseRepository
from .etapa import Etapa


class EtapaRepositoryInterface(BaseRepository):
    """Repositorio abstracto para la entidad Etapa."""

    @abstractmethod
    def obtener_por_id(self, id: int) -> Optional[Etapa]:
        pass

    @abstractmethod
    def obtener_por_programa(self, programa_id: int) -> List[Etapa]:
        pass

    @abstractmethod
    def crear(self, etapa: Etapa) -> Etapa:
        pass

    @abstractmethod
    def actualizar(self, etapa: Etapa) -> Etapa:
        pass

    @abstractmethod
    def eliminar(self, id: int) -> bool:
        pass
