"""
Validadores y utilidades compartidas
"""
from typing import List


def validar_nombre(nombre: str) -> List[str]:
    """Validar nombre de programa"""
    errores = []
    if not nombre or len(nombre) < 3:
        errores.append("El nombre debe tener al menos 3 caracteres")
    if len(nombre) > 255:
        errores.append("El nombre no puede exceder 255 caracteres")
    return errores


def validar_descripcion(descripcion: str) -> List[str]:
    """Validar descripción de programa"""
    errores = []
    if not descripcion or len(descripcion) < 10:
        errores.append("La descripción debe tener al menos 10 caracteres")
    return errores


def validar_entidad_responsable(entidad: str) -> List[str]:
    """Validar entidad responsable"""
    errores = []
    if not entidad or not entidad.strip():
        errores.append("Debe proporcionar una entidad responsable")
    return errores
