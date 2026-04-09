"""
Interfaz del repositorio de Postulaciones.

Define el contrato que cualquier implementación de persistencia
de postulaciones debe cumplir (Puerto en Arquitectura Hexagonal).
"""

from abc import abstractmethod
from typing import Dict, Any, List, Optional

from shared.base_repository import BaseRepository
from .postulacion import Postulacion


class PostulacionRepositoryInterface(BaseRepository):
    """Repositorio abstracto para la entidad Postulación."""

    @abstractmethod
    def obtener_por_id(self, id: int) -> Optional[Postulacion]:
        pass

    @abstractmethod
    def obtener_por_programa(self, programa_id: int) -> List[Postulacion]:
        pass

    @abstractmethod
    def crear(self, postulacion: Postulacion) -> Postulacion:
        pass

    @abstractmethod
    def actualizar(self, postulacion: Postulacion) -> Postulacion:
        pass

    @abstractmethod
    def eliminar(self, id: int) -> bool:
        pass

    @abstractmethod
    def contar_por_programa(self, programa_id: int) -> int:
        pass
