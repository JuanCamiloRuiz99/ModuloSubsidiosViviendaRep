"""
Application Layer - DTOs para Usuarios

Define los objetos de transferencia de datos (DTOs)
para operaciones de usuario.
"""

from typing import Optional
from datetime import datetime


# ============ INPUT DTOs ============

class CrearUsuarioDTO:
    """DTO para crear un nuevo usuario"""

    def __init__(
        self,
        nombre_completo: str,
        correo: str,
        password_hash: str,
        rol: str,
        usuario_creacion: Optional[int] = None,
    ):
        self.nombre_completo = nombre_completo
        self.correo = correo
        self.password_hash = password_hash
        self.rol = rol
        self.usuario_creacion = usuario_creacion

    def validar(self) -> None:
        """Valida los datos de entrada"""
        if not self.nombre_completo or len(self.nombre_completo) < 3:
            raise ValueError("El nombre debe tener al menos 3 caracteres")
        
        if not self.correo or "@" not in self.correo:
            raise ValueError("El correo no es válido")
        
        if not self.password_hash or len(self.password_hash) < 20:
            raise ValueError("El hash de contraseña no es válido")
        
        if self.rol not in ["ADMIN", "FUNCIONARIO", "VISITADOR_TECNICO"]:
            raise ValueError("El rol no es válido")


class ActualizarUsuarioDTO:
    """DTO para actualizar un usuario"""

    def __init__(
        self,
        id_usuario: int,
        nombre_completo: Optional[str] = None,
        rol: Optional[str] = None,
        activo: Optional[bool] = None,
        usuario_modificacion: Optional[int] = None,
    ):
        self.id_usuario = id_usuario
        self.nombre_completo = nombre_completo
        self.rol = rol
        self.activo = activo
        self.usuario_modificacion = usuario_modificacion

    def validar(self) -> None:
        """Valida los datos de actualización"""
        if not self.id_usuario:
            raise ValueError("El ID del usuario es requerido")


class CambiarContraseñaDTO:
    """DTO para cambiar contraseña de usuario"""

    def __init__(
        self,
        id_usuario: int,
        password_hash: str,
        usuario_modificacion: Optional[int] = None,
    ):
        self.id_usuario = id_usuario
        self.password_hash = password_hash
        self.usuario_modificacion = usuario_modificacion

    def validar(self) -> None:
        """Valida los datos"""
        if not self.id_usuario:
            raise ValueError("El ID del usuario es requerido")
        
        if not self.password_hash or len(self.password_hash) < 20:
            raise ValueError("El hash de contraseña no es válido")


class CambiarRolDTO:
    """DTO para cambiar rol de usuario"""

    def __init__(
        self,
        id_usuario: int,
        rol: str,
        usuario_modificacion: Optional[int] = None,
    ):
        self.id_usuario = id_usuario
        self.rol = rol
        self.usuario_modificacion = usuario_modificacion

    def validar(self) -> None:
        """Valida los datos"""
        if not self.id_usuario or self.id_usuario <= 0:
            raise ValueError("El ID del usuario es requerido")
        
        if self.rol not in ["ADMIN", "FUNCIONARIO", "VISITADOR_TECNICO"]:
            raise ValueError("El rol no es válido")


class ObtenerUsuarioDTO:
    """DTO para obtener un usuario"""

    def __init__(self, id_usuario: int):
        self.id_usuario = id_usuario

    def validar(self) -> None:
        """Valida los datos"""
        if not self.id_usuario or self.id_usuario <= 0:
            raise ValueError("El ID del usuario debe ser válido")


class ListarUsuariosDTO:
    """DTO para listar usuarios"""

    def __init__(
        self,
        pagina: int = 1,
        tamaño_pagina: int = 10,
        rol: Optional[str] = None,
        activo: Optional[bool] = None,
    ):
        self.pagina = pagina
        self.tamaño_pagina = tamaño_pagina
        self.rol = rol
        self.activo = activo

    def validar(self) -> None:
        """Valida los datos"""
        if self.pagina < 1:
            raise ValueError("La página debe ser mayor a 0")
        
        if self.tamaño_pagina < 1 or self.tamaño_pagina > 100:
            raise ValueError("El tamaño de página debe estar entre 1 y 100")


# ============ OUTPUT DTOs ============

class UsuarioDTO:
    """DTO de salida para un usuario"""

    def __init__(
        self,
        id_usuario: int,
        nombre_completo: str,
        correo: str,
        rol: str,
        activo: bool,
        fecha_creacion: Optional[datetime] = None,
        fecha_modificacion: Optional[datetime] = None,
    ):
        self.id_usuario = id_usuario
        self.nombre_completo = nombre_completo
        self.correo = correo
        self.rol = rol
        self.activo = activo
        self.fecha_creacion = fecha_creacion
        self.fecha_modificacion = fecha_modificacion

    @staticmethod
    def from_domain(usuario) -> "UsuarioDTO":
        """Convierte una entidad de dominio a DTO"""
        return UsuarioDTO(
            id_usuario=usuario.id_usuario,
            nombre_completo=usuario.nombre_completo,
            correo=usuario.correo,
            rol=usuario.rol.value if hasattr(usuario.rol, 'value') else usuario.rol,
            activo=usuario.activo,
            fecha_creacion=usuario.fecha_creacion,
            fecha_modificacion=usuario.fecha_modificacion,
        )

    def to_dict(self) -> dict:
        """Convierte a diccionario"""
        return {
            "id_usuario": self.id_usuario,
            "nombre_completo": self.nombre_completo,
            "correo": self.correo,
            "rol": self.rol,
            "activo": self.activo,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "fecha_modificacion": self.fecha_modificacion.isoformat() if self.fecha_modificacion else None,
        }


class ListaUsuariosDTO:
    """DTO de salida para lista paginada de usuarios"""

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

    def to_dict(self) -> dict:
        """Convierte a diccionario"""
        return {
            "items": [item.to_dict() if hasattr(item, 'to_dict') else item for item in self.items],
            "total": self.total,
            "pagina": self.pagina,
            "tamaño_pagina": self.tamaño_pagina,
            "total_paginas": self.total_paginas,
        }


class EstadisticasUsuariosDTO:
    """DTO para estadísticas de usuarios"""

    def __init__(
        self,
        total: int,
        activos: int,
        inactivos: int,
        por_rol: dict,
    ):
        self.total = total
        self.activos = activos
        self.inactivos = inactivos
        self.por_rol = por_rol

    def to_dict(self) -> dict:
        """Convierte a diccionario"""
        return {
            "total": self.total,
            "activos": self.activos,
            "inactivos": self.inactivos,
            "por_rol": self.por_rol,
        }
