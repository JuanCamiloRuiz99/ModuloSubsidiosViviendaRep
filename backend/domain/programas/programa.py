"""
Entidad de dominio: Programa

Define el modelo de negocio para los programas de subsidios de vivienda.
Esta es una entidad pura sin dependencias de frameworks.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from enum import Enum


class EstadoPrograma(str, Enum):
    """Estados posibles de un programa"""
    BORRADOR = 'BORRADOR'
    ACTIVO = 'ACTIVO'
    INHABILITADO = 'INHABILITADO'


@dataclass
class Programa:
    """
    Entidad de dominio: Programa
    
    Representa un programa de subsidios de vivienda con toda su información
    relevante para el negocio.
    """
    nombre: str
    descripcion: str
    entidad_responsable: str
    estado: EstadoPrograma
    id: Optional[int] = None
    codigo_programa: Optional[str] = None
    fecha_creacion: Optional[datetime] = None
    fecha_actualizacion: Optional[datetime] = None
    
    def cambiar_estado(self, nuevo_estado: EstadoPrograma) -> None:
        """Cambiar el estado del programa"""
        self.estado = nuevo_estado
        self.fecha_actualizacion = datetime.now()
    
    def validar(self) -> list[str]:
        """Validar la entidad y retornar lista de errores"""
        errores = []
        
        if not self.nombre or len(self.nombre) < 3:
            errores.append("El nombre debe tener al menos 3 caracteres")
        
        if not self.descripcion or len(self.descripcion) < 10:
            errores.append("La descripción debe tener al menos 10 caracteres")
        
        if not self.entidad_responsable or not self.entidad_responsable.strip():
            errores.append("Debe proporcionar una entidad responsable")
        
        return errores
