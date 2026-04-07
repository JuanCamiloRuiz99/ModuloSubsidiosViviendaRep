"""
DTOs (Data Transfer Objects) del módulo Programas.

Objetos para transportar datos entre capas, con validación de entrada.
"""

from typing import Optional
from datetime import datetime

from shared.base_dto import BaseInputDTO, BaseOutputDTO


# ============ INPUT DTOs ============


class CrearProgramaDTO(BaseInputDTO):
    """DTO para crear un nuevo programa."""

    def __init__(
        self,
        nombre: str,
        descripcion: str,
        entidad_responsable: str,
    ):
        self.nombre = nombre
        self.descripcion = descripcion
        self.entidad_responsable = entidad_responsable

    def validar(self) -> None:
        if not self.nombre or len(self.nombre.strip()) < 3:
            raise ValueError("El nombre debe tener al menos 3 caracteres")
        if not self.descripcion or len(self.descripcion.strip()) < 10:
            raise ValueError("La descripción debe tener al menos 10 caracteres")
        if not self.entidad_responsable or not self.entidad_responsable.strip():
            raise ValueError("Debe proporcionar una entidad responsable")


class ActualizarProgramaDTO(BaseInputDTO):
    """DTO para actualizar datos básicos de un programa."""

    def __init__(
        self,
        id_programa: int,
        nombre: Optional[str] = None,
        descripcion: Optional[str] = None,
        entidad_responsable: Optional[str] = None,
    ):
        self.id_programa = id_programa
        self.nombre = nombre
        self.descripcion = descripcion
        self.entidad_responsable = entidad_responsable

    def validar(self) -> None:
        if not self.id_programa or self.id_programa <= 0:
            raise ValueError("El ID del programa es requerido")
        if self.nombre is not None and len(self.nombre.strip()) < 3:
            raise ValueError("El nombre debe tener al menos 3 caracteres")
        if self.descripcion is not None and len(self.descripcion.strip()) < 10:
            raise ValueError("La descripción debe tener al menos 10 caracteres")


class CambiarEstadoProgramaDTO(BaseInputDTO):
    """DTO para cambiar el estado de un programa."""

    def __init__(self, id_programa: int, nuevo_estado: str):
        self.id_programa = id_programa
        self.nuevo_estado = nuevo_estado

    def validar(self) -> None:
        if not self.id_programa or self.id_programa <= 0:
            raise ValueError("El ID del programa es requerido")
        estados_validos = ["BORRADOR", "ACTIVO", "INHABILITADO"]
        if self.nuevo_estado not in estados_validos:
            raise ValueError(
                f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"
            )


class ObtenerProgramaDTO(BaseInputDTO):
    """DTO para obtener un programa por ID."""

    def __init__(self, id_programa: int):
        self.id_programa = id_programa

    def validar(self) -> None:
        if not self.id_programa or self.id_programa <= 0:
            raise ValueError("El ID del programa debe ser válido")


class ListarProgramasDTO(BaseInputDTO):
    """DTO para listar programas con filtros."""

    def __init__(
        self,
        pagina: int = 1,
        tamaño_pagina: int = 10,
        estado: Optional[str] = None,
    ):
        self.pagina = pagina
        self.tamaño_pagina = tamaño_pagina
        self.estado = estado

    def validar(self) -> None:
        if self.pagina < 1:
            raise ValueError("La página debe ser mayor a 0")
        if self.tamaño_pagina < 1 or self.tamaño_pagina > 100:
            raise ValueError("El tamaño de página debe estar entre 1 y 100")
        estados_validos = ["BORRADOR", "ACTIVO", "INHABILITADO"]
        if self.estado and self.estado not in estados_validos:
            raise ValueError(
                f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"
            )


# ============ OUTPUT DTOs ============


class ProgramaOutDTO(BaseOutputDTO):
    """DTO de salida para un programa."""

    def __init__(
        self,
        id: int,
        nombre: str,
        descripcion: str,
        entidad_responsable: str,
        codigo_programa: str,
        estado: str,
        fecha_creacion: Optional[datetime] = None,
        fecha_actualizacion: Optional[datetime] = None,
    ):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion
        self.entidad_responsable = entidad_responsable
        self.codigo_programa = codigo_programa
        self.estado = estado
        self.fecha_creacion = fecha_creacion
        self.fecha_actualizacion = fecha_actualizacion

    @staticmethod
    def from_domain(programa) -> "ProgramaOutDTO":
        """Convierte una entidad de dominio a DTO de salida."""
        return ProgramaOutDTO(
            id=programa.id,
            nombre=programa.nombre,
            descripcion=programa.descripcion,
            entidad_responsable=programa.entidad_responsable,
            codigo_programa=programa.codigo_programa or "",
            estado=programa.estado.value if hasattr(programa.estado, "value") else programa.estado,
            fecha_creacion=programa.fecha_creacion,
            fecha_actualizacion=programa.fecha_actualizacion,
        )


class ListaProgramasDTO(BaseOutputDTO):
    """DTO de salida para lista paginada de programas."""

    def __init__(
        self,
        items: list,
        total: int,
        pagina: int,
        tamaño_pagina: int,
        total_paginas: int,
    ):
        self.items = items
        self.total = total
        self.pagina = pagina
        self.tamaño_pagina = tamaño_pagina
        self.total_paginas = total_paginas


class EstadisticasProgramasDTO(BaseOutputDTO):
    """DTO de salida para estadísticas de programas."""

    def __init__(
        self,
        total: int,
        por_estado: dict,
    ):
        self.total = total
        self.por_estado = por_estado
