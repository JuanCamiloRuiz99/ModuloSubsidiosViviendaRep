"""
Value Objects del Módulo Usuarios

Encapsulan la validación de conceptos del dominio como
correo, contraseña, nombre, etc.
"""

import re
from typing import Optional


class CorreoUsuario:
    """
    Value Object para validar y encapsular correos electrónicos
    """

    def __init__(self, correo: str):
        self._validar(correo)
        self._correo = correo.lower().strip()

    def _validar(self, correo: str) -> None:
        """Valida el formato del correo"""
        if not correo or len(correo) < 5:
            raise ValueError("El correo debe tener al menos 5 caracteres")
        
        if len(correo) > 200:
            raise ValueError("El correo no puede exceder 200 caracteres")
        
        # Patrón simple para validar email
        patron_email = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(patron_email, correo):
            raise ValueError("El formato del correo no es válido")

    def valor(self) -> str:
        """Obtiene el valor del correo"""
        return self._correo

    def __eq__(self, otro) -> bool:
        if not isinstance(otro, CorreoUsuario):
            return False
        return self._correo == otro._correo

    def __repr__(self) -> str:
        return f"CorreoUsuario({self._correo})"


class PasswordHash:
    """
    Value Object para encapsular y validar hashes de contraseña
    """

    def __init__(self, password_hash: str):
        self._validar(password_hash)
        self._hash = password_hash

    def _validar(self, password_hash: str) -> None:
        """Valida el hash de contraseña"""
        if not password_hash or len(password_hash) < 20:
            raise ValueError("El hash de contraseña inválido")
        
        if len(password_hash) > 255:
            raise ValueError("El hash de contraseña es demasiado largo")

    def valor(self) -> str:
        """Obtiene el hash de la contraseña"""
        return self._hash

    def __eq__(self, otro) -> bool:
        if not isinstance(otro, PasswordHash):
            return False
        return self._hash == otro._hash

    def __repr__(self) -> str:
        return "PasswordHash(***)"


class NombreUsuario:
    """
    Value Object para validar nombres de usuarios
    """

    def __init__(self, nombre_completo: str):
        self._validar(nombre_completo)
        self._nombre = nombre_completo.strip()

    def _validar(self, nombre: str) -> None:
        """Valida el nombre completo"""
        if not nombre or len(nombre.strip()) < 3:
            raise ValueError("El nombre debe tener al menos 3 caracteres")
        
        if len(nombre) > 200:
            raise ValueError("El nombre no puede exceder 200 caracteres")

    def valor(self) -> str:
        """Obtiene el valor del nombre"""
        return self._nombre

    def __eq__(self, otro) -> bool:
        if not isinstance(otro, NombreUsuario):
            return False
        return self._nombre == otro._nombre

    def __repr__(self) -> str:
        return f"NombreUsuario({self._nombre})"


class RolUsuarioVO:
    """
    Value Object para encapsular y validar roles de usuarios
    """

    ROLES_VALIDOS = ["ADMIN", "FUNCIONARIO", "VISITADOR_TECNICO"]

    def __init__(self, rol: str):
        self._validar(rol)
        self._rol = rol.upper()

    def _validar(self, rol: str) -> None:
        """Valida que el rol sea válido"""
        if not rol or rol.upper() not in self.ROLES_VALIDOS:
            raise ValueError(
                f"Rol inválido. Roles permitidos: {', '.join(self.ROLES_VALIDOS)}"
            )

    def valor(self) -> str:
        """Obtiene el valor del rol"""
        return self._rol

    def es_admin(self) -> bool:
        """Verifica si es administrador"""
        return self._rol == "ADMIN"

    def es_funcionario(self) -> bool:
        """Verifica si es funcionario"""
        return self._rol == "FUNCIONARIO"

    def es_visitador(self) -> bool:
        """Verifica si es visitador técnico"""
        return self._rol == "VISITADOR_TECNICO"

    def __eq__(self, otro) -> bool:
        if not isinstance(otro, RolUsuarioVO):
            return False
        return self._rol == otro._rol

    def __repr__(self) -> str:
        return f"RolUsuarioVO({self._rol})"
