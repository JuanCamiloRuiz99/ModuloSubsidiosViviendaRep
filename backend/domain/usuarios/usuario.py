"""
Entidad Usuario del Dominio

Representa un usuario del sistema con sus características,
estado y comportamiento de negocio.
"""

from datetime import datetime
from enum import Enum
from typing import Optional


class RolUsuario(str, Enum):
    """Roles disponibles en el sistema"""
    ADMIN = "ADMIN"
    FUNCIONARIO = "FUNCIONARIO"
    VISITADOR_TECNICO = "VISITADOR_TECNICO"


class Usuario:
    """
    Entidad Usuario del Dominio
    
    Representa un usuario del sistema con:
    - Información de autenticación (correo, contraseña)
    - Información de perfil (nombre, rol)
    - Estado del usuario (activo)
    - Trazabilidad (creación, modificación)
    """

    def __init__(
        self,
        id_usuario: int,
        nombre_completo: str,
        correo: str,
        password_hash: str,
        rol: RolUsuario,
        activo: bool = True,
        numero_documento: Optional[str] = None,
        usuario_creacion: Optional[int] = None,
        usuario_modificacion: Optional[int] = None,
        fecha_creacion: Optional[datetime] = None,
        fecha_modificacion: Optional[datetime] = None,
        activo_logico: bool = True,
    ):
        self.id_usuario = id_usuario
        self.nombre_completo = nombre_completo
        self.correo = correo
        self.numero_documento = numero_documento
        self.password_hash = password_hash
        self.rol = rol if isinstance(rol, RolUsuario) else RolUsuario(rol)
        self.activo = activo
        self.usuario_creacion = usuario_creacion
        self.usuario_modificacion = usuario_modificacion
        self.fecha_creacion = fecha_creacion or datetime.now()
        self.fecha_modificacion = fecha_modificacion
        self.activo_logico = activo_logico

    def cambiar_estado(self, activo: bool) -> None:
        """Cambia el estado del usuario (activo/inactivo)"""
        self.activo = activo
        self.fecha_modificacion = datetime.now()

    def cambiar_rol(self, nuevo_rol: RolUsuario) -> None:
        """Cambia el rol del usuario"""
        self.rol = nuevo_rol
        self.fecha_modificacion = datetime.now()

    def actualizar_nombre(self, nombre_completo: str) -> None:
        """Actualiza el nombre del usuario"""
        self.nombre_completo = nombre_completo
        self.fecha_modificacion = datetime.now()

    def actualizar_correo(self, correo: str) -> None:
        """Actualiza el correo del usuario"""
        self.correo = correo
        self.fecha_modificacion = datetime.now()

    def actualizar_password(self, password_hash: str) -> None:
        """Actualiza la contraseña del usuario"""
        self.password_hash = password_hash
        self.fecha_modificacion = datetime.now()

    def es_admin(self) -> bool:
        """Verifica si el usuario es administrador"""
        return self.rol == RolUsuario.ADMIN

    def es_funcionario(self) -> bool:
        """Verifica si el usuario es funcionario"""
        return self.rol == RolUsuario.FUNCIONARIO

    def es_visitador(self) -> bool:
        """Verifica si el usuario es visitador técnico"""
        return self.rol == RolUsuario.VISITADOR_TECNICO

    def esta_activo(self) -> bool:
        """Verifica si el usuario está activo"""
        return self.activo and self.activo_logico

    def to_primitives(self) -> dict:
        """Convierte la entidad a un diccionario primitivo"""
        return {
            "id_usuario": self.id_usuario,
            "nombre_completo": self.nombre_completo,
            "correo": self.correo,
            "password_hash": self.password_hash,
            "rol": self.rol.value,
            "activo": self.activo,
            "usuario_creacion": self.usuario_creacion,
            "usuario_modificacion": self.usuario_modificacion,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_modificacion": self.fecha_modificacion.isoformat() if self.fecha_modificacion else None,
            "activo_logico": self.activo_logico,
        }

    @staticmethod
    def from_primitives(data: dict) -> "Usuario":
        """Crea una instancia desde un diccionario primitivo"""
        return Usuario(
            id_usuario=data.get("id_usuario"),
            nombre_completo=data.get("nombre_completo"),
            correo=data.get("correo"),
            password_hash=data.get("password_hash"),
            rol=data.get("rol"),
            activo=data.get("activo", True),
            usuario_creacion=data.get("usuario_creacion"),
            usuario_modificacion=data.get("usuario_modificacion"),
            fecha_creacion=data.get("fecha_creacion"),
            fecha_modificacion=data.get("fecha_modificacion"),
            activo_logico=data.get("activo_logico", True),
        )
