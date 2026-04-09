"""
Entidad de dominio: Postulacion

Representa el ciclo de vida de una postulación a un
programa de subsidios de vivienda.
Entidad pura sin dependencias de frameworks.
"""

from datetime import datetime
from typing import Optional
from enum import Enum

from shared.exceptions import InvalidStateTransitionException


class EstadoPostulacion(str, Enum):
    """Estados posibles de una postulación"""
    REGISTRADA = 'REGISTRADA'
    EN_REVISION = 'EN_REVISION'
    SUBSANACION = 'SUBSANACION'
    VISITA_PENDIENTE = 'VISITA_PENDIENTE'
    VISITA_PROGRAMADA = 'VISITA_PROGRAMADA'
    VISITA_REALIZADA = 'VISITA_REALIZADA'
    DOCUMENTOS_INCOMPLETOS = 'DOCUMENTOS_INCOMPLETOS'
    DOCUMENTOS_CARGADOS = 'DOCUMENTOS_CARGADOS'
    BENEFICIADO = 'BENEFICIADO'
    NO_BENEFICIARIO = 'NO_BENEFICIARIO'
    APROBADA = 'APROBADA'
    RECHAZADA = 'RECHAZADA'


# Transiciones permitidas entre estados
TRANSICIONES_VALIDAS: dict[EstadoPostulacion, list[EstadoPostulacion]] = {
    EstadoPostulacion.REGISTRADA: [EstadoPostulacion.EN_REVISION],
    EstadoPostulacion.EN_REVISION: [
        EstadoPostulacion.SUBSANACION,
        EstadoPostulacion.VISITA_PENDIENTE,
        EstadoPostulacion.RECHAZADA,
    ],
    EstadoPostulacion.SUBSANACION: [EstadoPostulacion.EN_REVISION],
    EstadoPostulacion.VISITA_PENDIENTE: [
        EstadoPostulacion.VISITA_PROGRAMADA,
        EstadoPostulacion.VISITA_REALIZADA,
    ],
    EstadoPostulacion.VISITA_PROGRAMADA: [
        EstadoPostulacion.VISITA_PENDIENTE,
        EstadoPostulacion.VISITA_REALIZADA,
    ],
    EstadoPostulacion.VISITA_REALIZADA: [
        EstadoPostulacion.DOCUMENTOS_INCOMPLETOS,
        EstadoPostulacion.DOCUMENTOS_CARGADOS,
    ],
    EstadoPostulacion.DOCUMENTOS_INCOMPLETOS: [EstadoPostulacion.DOCUMENTOS_CARGADOS],
    EstadoPostulacion.DOCUMENTOS_CARGADOS: [
        EstadoPostulacion.BENEFICIADO,
        EstadoPostulacion.NO_BENEFICIARIO,
        EstadoPostulacion.APROBADA,
        EstadoPostulacion.RECHAZADA,
    ],
    EstadoPostulacion.BENEFICIADO: [],
    EstadoPostulacion.NO_BENEFICIARIO: [],
    EstadoPostulacion.APROBADA: [],
    EstadoPostulacion.RECHAZADA: [],
}


class Postulacion:
    """
    Entidad de dominio: Postulación

    Representa una solicitud de subsidio de vivienda vinculada
    a un programa. Gestiona su ciclo de vida a través de estados.
    """

    def __init__(
        self,
        programa_id: int,
        estado: EstadoPostulacion = EstadoPostulacion.EN_REVISION,
        id: Optional[int] = None,
        etapa_actual_id: Optional[int] = None,
        funcionario_asignado_id: Optional[int] = None,
        activo_logico: bool = True,
        fecha_postulacion: Optional[datetime] = None,
        usuario_creacion: Optional[int] = None,
        usuario_modificacion: Optional[int] = None,
    ):
        self.id = id
        self.programa_id = programa_id
        self.etapa_actual_id = etapa_actual_id
        self.estado = (
            estado
            if isinstance(estado, EstadoPostulacion)
            else EstadoPostulacion(estado)
        )
        self.funcionario_asignado_id = funcionario_asignado_id
        self.activo_logico = activo_logico
        self.fecha_postulacion = fecha_postulacion or datetime.now()
        self.usuario_creacion = usuario_creacion
        self.usuario_modificacion = usuario_modificacion

    def cambiar_estado(self, nuevo_estado: EstadoPostulacion) -> None:
        """
        Cambia el estado validando la transición.

        Raises:
            InvalidStateTransitionException: si la transición no es válida.
        """
        if not isinstance(nuevo_estado, EstadoPostulacion):
            nuevo_estado = EstadoPostulacion(nuevo_estado)

        permitidos = TRANSICIONES_VALIDAS.get(self.estado, [])
        if nuevo_estado not in permitidos:
            raise InvalidStateTransitionException(
                f"No se puede pasar de {self.estado.value} a {nuevo_estado.value}. "
                f"Transiciones permitidas: {[e.value for e in permitidos]}"
            )
        self.estado = nuevo_estado

    def asignar_funcionario(self, funcionario_id: int) -> None:
        """Asigna un funcionario a esta postulación."""
        self.funcionario_asignado_id = funcionario_id

    def eliminar(self) -> None:
        """Eliminación lógica."""
        self.activo_logico = False
