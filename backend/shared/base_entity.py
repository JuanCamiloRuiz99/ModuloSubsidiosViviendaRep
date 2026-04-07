"""
Clase base para entidades de dominio.

Todas las entidades del sistema deben heredar de esta clase.
"""

from datetime import datetime
from typing import Optional


class BaseEntity:
    """
    Entidad base del dominio.

    Proporciona campos comunes de identidad y trazabilidad
    que todas las entidades comparten.
    """

    def __init__(
        self,
        id: Optional[int] = None,
        fecha_creacion: Optional[datetime] = None,
        fecha_actualizacion: Optional[datetime] = None,
    ):
        self.id = id
        self.fecha_creacion = fecha_creacion or datetime.now()
        self.fecha_actualizacion = fecha_actualizacion

    def _marcar_modificado(self) -> None:
        """Actualiza la fecha de modificación."""
        self.fecha_actualizacion = datetime.now()

    def es_nuevo(self) -> bool:
        """Indica si la entidad aún no ha sido persistida."""
        return self.id is None

    def __eq__(self, other) -> bool:
        if not isinstance(other, self.__class__):
            return False
        if self.id is None or other.id is None:
            return self is other
        return self.id == other.id

    def __hash__(self) -> int:
        if self.id is None:
            return id(self)
        return hash((self.__class__, self.id))
