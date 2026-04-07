"""
Value Objects del módulo Programas.

Encapsulan validación de conceptos de negocio del programa.
"""

from shared.base_value_object import BaseValueObject


class NombrePrograma(BaseValueObject):
    """Value Object para el nombre de un programa."""

    def __init__(self, nombre: str):
        if not nombre or len(nombre.strip()) < 3:
            raise ValueError("El nombre del programa debe tener al menos 3 caracteres")
        if len(nombre) > 255:
            raise ValueError("El nombre del programa no puede exceder 255 caracteres")
        self._nombre = nombre.strip()

    def valor(self) -> str:
        return self._nombre


class CodigoPrograma(BaseValueObject):
    """Value Object para el código único de un programa."""

    def __init__(self, codigo: str):
        if not codigo or len(codigo.strip()) < 4:
            raise ValueError("El código del programa debe tener al menos 4 caracteres")
        if len(codigo) > 20:
            raise ValueError("El código del programa no puede exceder 20 caracteres")
        self._codigo = codigo.strip().upper()

    def valor(self) -> str:
        return self._codigo


class DescripcionPrograma(BaseValueObject):
    """Value Object para la descripción de un programa."""

    def __init__(self, descripcion: str):
        if not descripcion or len(descripcion.strip()) < 10:
            raise ValueError("La descripción debe tener al menos 10 caracteres")
        self._descripcion = descripcion.strip()

    def valor(self) -> str:
        return self._descripcion
