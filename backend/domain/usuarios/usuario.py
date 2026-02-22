"""
Entidad de dominio Usuario.

Representa un usuario del sistema (empleado).
"""
from datetime import datetime


class Usuario:
    """Entidad de dominio para Usuario"""

    ROLES = {
        'ADMINISTRADOR': 'Administrador',
        'FUNCIONARIO': 'Funcionario',
        'TECNICO': 'Técnico',
    }

    ESTADOS = {
        'ACTIVO': 'Activo',
        'INACTIVO': 'Inactivo',
    }

    def __init__(
        self,
        id: str = None,
        nombre: str = None,
        apellidos: str = None,
        numero_documento: str = None,
        correo: str = None,
        rol: str = 'FUNCIONARIO',
        estado: str = 'ACTIVO',
        fecha_creacion: datetime = None,
        fecha_actualizacion: datetime = None,
    ):
        self.id = id
        self.nombre = nombre
        self.apellidos = apellidos
        self.numero_documento = numero_documento
        self.correo = correo
        self.rol = rol
        self.estado = estado
        self.fecha_creacion = fecha_creacion
        self.fecha_actualizacion = fecha_actualizacion

    def nombre_completo(self) -> str:
        """Retorna nombre y apellidos completos"""
        return f"{self.nombre} {self.apellidos}"

    def es_activo(self) -> bool:
        """Verifica si el usuario está activo"""
        return self.estado == 'ACTIVO'

    def es_administrador(self) -> bool:
        """Verifica si es administrador"""
        return self.rol == 'ADMINISTRADOR'

    def to_dict(self) -> dict:
        """Convierte la entidad a diccionario"""
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellidos': self.apellidos,
            'nombre_completo': self.nombre_completo(),
            'numero_documento': self.numero_documento,
            'correo': self.correo,
            'rol': self.rol,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            'fecha_actualizacion': self.fecha_actualizacion.isoformat() if self.fecha_actualizacion else None,
        }
