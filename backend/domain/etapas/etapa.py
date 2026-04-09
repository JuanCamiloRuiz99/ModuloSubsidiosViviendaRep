"""
Entidad de dominio: Etapa

Representa una etapa dentro de un programa de subsidios.
Entidad pura sin dependencias de frameworks.
"""

from datetime import datetime
from typing import Optional
from enum import Enum


class ModuloEtapa(str, Enum):
    """Módulos principales que puede tener una etapa"""
    REGISTRO_HOGAR = 'REGISTRO_HOGAR'
    VISITA_TECNICA = 'VISITA_TECNICA'
    GESTION_DOCUMENTAL_INTERNA = 'GESTION_DOCUMENTAL_INTERNA'


class Etapa:
    """
    Entidad de dominio: Etapa

    Representa una etapa de proceso dentro de un programa de subsidios
    de vivienda. Cada etapa tiene un módulo principal que define su
    comportamiento (registro de hogar, visita técnica, etc.).
    """

    def __init__(
        self,
        programa_id: int,
        numero_etapa: int,
        modulo_principal: ModuloEtapa,
        id: Optional[int] = None,
        finalizada: bool = False,
        activo_logico: bool = True,
        fecha_creacion: Optional[datetime] = None,
        fecha_finalizacion: Optional[datetime] = None,
        usuario_creacion: Optional[int] = None,
        usuario_modificacion: Optional[int] = None,
    ):
        self.id = id
        self.programa_id = programa_id
        self.numero_etapa = numero_etapa
        self.modulo_principal = (
            modulo_principal
            if isinstance(modulo_principal, ModuloEtapa)
            else ModuloEtapa(modulo_principal)
        )
        self.finalizada = finalizada
        self.activo_logico = activo_logico
        self.fecha_creacion = fecha_creacion or datetime.now()
        self.fecha_finalizacion = fecha_finalizacion
        self.usuario_creacion = usuario_creacion
        self.usuario_modificacion = usuario_modificacion

    def finalizar(self) -> None:
        """Marca la etapa como finalizada."""
        if self.finalizada:
            raise ValueError("La etapa ya está finalizada.")
        self.finalizada = True
        self.fecha_finalizacion = datetime.now()

    def eliminar(self) -> None:
        """Eliminación lógica de la etapa."""
        self.activo_logico = False
