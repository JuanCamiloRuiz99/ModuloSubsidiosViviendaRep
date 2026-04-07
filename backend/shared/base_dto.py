"""
Clase base para DTOs (Data Transfer Objects).

Los DTOs transportan datos entre capas sin lógica de negocio,
con validación de entrada obligatoria.
"""

from abc import ABC, abstractmethod


class BaseInputDTO(ABC):
    """DTO de entrada con validación obligatoria."""

    @abstractmethod
    def validar(self) -> None:
        """Valida los datos. Lanza ValueError si algo es inválido."""
        pass


class BaseOutputDTO:
    """DTO de salida con serialización a diccionario."""

    def to_dict(self) -> dict:
        """Convierte el DTO a diccionario primitivo."""
        result = {}
        for key, value in self.__dict__.items():
            if hasattr(value, "to_dict"):
                result[key] = value.to_dict()
            elif hasattr(value, "isoformat"):
                result[key] = value.isoformat()
            elif hasattr(value, "value"):  # Enums
                result[key] = value.value
            elif isinstance(value, list):
                result[key] = [
                    item.to_dict() if hasattr(item, "to_dict") else item
                    for item in value
                ]
            else:
                result[key] = value
        return result
