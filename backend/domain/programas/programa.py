"""
Entidad de dominio: Programa

Define el modelo de negocio para los programas de subsidios de vivienda.
Entidad pura sin dependencias de frameworks.
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from shared.exceptions import InvalidStateTransitionException


class EstadoPrograma(str, Enum):
    """Estados posibles de un programa"""
    BORRADOR = 'BORRADOR'
    ACTIVO = 'ACTIVO'
    INHABILITADO = 'INHABILITADO'
    CULMINADO = 'CULMINADO'


# Transiciones de estado válidas
TRANSICIONES_VALIDAS: dict[EstadoPrograma, list[EstadoPrograma]] = {
    EstadoPrograma.BORRADOR: [EstadoPrograma.ACTIVO],
    EstadoPrograma.ACTIVO: [EstadoPrograma.INHABILITADO, EstadoPrograma.CULMINADO],
    EstadoPrograma.INHABILITADO: [EstadoPrograma.ACTIVO],
    EstadoPrograma.CULMINADO: [EstadoPrograma.ACTIVO],
}


class Programa:
    """
    Entidad de dominio: Programa

    Representa un programa de subsidios de vivienda con toda su información
    relevante para el negocio.
    """

    def __init__(
        self,
        nombre: str,
        descripcion: str,
        entidad_responsable: str,
        estado: EstadoPrograma = EstadoPrograma.BORRADOR,
        id: Optional[int] = None,
        codigo_programa: Optional[str] = None,
        fecha_creacion: Optional[datetime] = None,
        fecha_actualizacion: Optional[datetime] = None,
    ):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion
        self.entidad_responsable = entidad_responsable
        self.estado = estado if isinstance(estado, EstadoPrograma) else EstadoPrograma(estado)
        self.codigo_programa = codigo_programa
        self.fecha_creacion = fecha_creacion or datetime.now()
        self.fecha_actualizacion = fecha_actualizacion

    # ---------- Comportamientos de dominio ----------

    def cambiar_estado(self, nuevo_estado: EstadoPrograma) -> None:
        """
        Cambia el estado del programa validando la transición.

        Raises:
            InvalidStateTransitionException: si la transición no está permitida.
        """
        if not isinstance(nuevo_estado, EstadoPrograma):
            nuevo_estado = EstadoPrograma(nuevo_estado)

        permitidos = TRANSICIONES_VALIDAS.get(self.estado, [])
        if nuevo_estado not in permitidos:
            raise InvalidStateTransitionException(
                f"No se puede pasar de {self.estado.value} a {nuevo_estado.value}. "
                f"Transiciones permitidas: {[e.value for e in permitidos]}"
            )
        self.estado = nuevo_estado
        self.fecha_actualizacion = datetime.now()

    def publicar(self) -> None:
        """Publica un programa en estado BORRADOR → ACTIVO."""
        self.cambiar_estado(EstadoPrograma.ACTIVO)

    def inhabilitar(self) -> None:
        """Inhabilita un programa ACTIVO → INHABILITADO."""
        self.cambiar_estado(EstadoPrograma.INHABILITADO)

    def reactivar(self) -> None:
        """Reactiva un programa INHABILITADO → ACTIVO."""
        self.cambiar_estado(EstadoPrograma.ACTIVO)

    def actualizar_datos(
        self,
        nombre: Optional[str] = None,
        descripcion: Optional[str] = None,
        entidad_responsable: Optional[str] = None,
    ) -> None:
        """Actualiza los datos básicos del programa."""
        if nombre is not None:
            self.nombre = nombre
        if descripcion is not None:
            self.descripcion = descripcion
        if entidad_responsable is not None:
            self.entidad_responsable = entidad_responsable
        self.fecha_actualizacion = datetime.now()

    # ---------- Consultas ----------

    def es_activo(self) -> bool:
        return self.estado == EstadoPrograma.ACTIVO

    def es_borrador(self) -> bool:
        return self.estado == EstadoPrograma.BORRADOR

    def es_inhabilitado(self) -> bool:
        return self.estado == EstadoPrograma.INHABILITADO

    # ---------- Validación ----------

    def validar(self) -> list[str]:
        """Valida la entidad y retorna lista de errores."""
        errores = []
        if not self.nombre or len(self.nombre) < 3:
            errores.append("El nombre debe tener al menos 3 caracteres")
        if not self.descripcion or len(self.descripcion) < 10:
            errores.append("La descripción debe tener al menos 10 caracteres")
        if not self.entidad_responsable or not self.entidad_responsable.strip():
            errores.append("Debe proporcionar una entidad responsable")
        return errores

    # ---------- Serialización ----------

    def to_primitives(self) -> dict:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "entidad_responsable": self.entidad_responsable,
            "codigo_programa": self.codigo_programa,
            "estado": self.estado.value,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_actualizacion": self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
        }

    @staticmethod
    def from_primitives(data: dict) -> "Programa":
        return Programa(
            id=data.get("id"),
            nombre=data.get("nombre", ""),
            descripcion=data.get("descripcion", ""),
            entidad_responsable=data.get("entidad_responsable", ""),
            estado=data.get("estado", "BORRADOR"),
            codigo_programa=data.get("codigo_programa"),
            fecha_creacion=data.get("fecha_creacion"),
            fecha_actualizacion=data.get("fecha_actualizacion"),
        )

    def __repr__(self) -> str:
        return f"Programa(id={self.id}, nombre='{self.nombre}', estado={self.estado.value})"
