"""
Capa de Dominio - Módulo Usuarios

Contiene las entidades, value objects, especificaciones y la interfaz del repositorio
para la gestión de usuarios del sistema.
"""

from .usuario import Usuario, RolUsuario
from .usuarios_value_objects import (
    CorreoUsuario,
    PasswordHash,
    NombreUsuario,
    RolUsuarioVO,
)
from .usuarios_repository import UsuarioRepository
from .usuario_exceptions import (
    UsuarioException,
    UsuarioNoEncontradoException,
    CorreoYaRegistradoException,
    CorreoInvalidoException,
    NombreInvalidoException,
    ContraseñaInvalidaException,
    RolInvalidoException,
    UsuarioInactiveException,
    AccesoNoAutorizadoException,
    OperacionNoPermitidaException,
)
from .usuario_specification import (
    UsuarioSpecification,
    UsuarioPorIdSpecification,
    UsuarioPorCorreoSpecification,
    UsuarioPorRolSpecification,
    UsuarioActivoSpecification,
    UsuarioAdminSpecification,
    UsuarioFuncionarioSpecification,
    UsuarioVisitadorSpecification,
    CriteriosListadoUsuarios,
)
from .usuario_events import (
    DomainEvent,
    UsuarioCreadoEvent,
    UsuarioActualizadoEvent,
    UsuarioDesactivadoEvent,
    RolUsuarioCambiadoEvent,
    ContraseñaUsuarioCambiadaEvent,
    UsuarioEliminadoEvent,
)

__all__ = [
    # Entidades
    "Usuario",
    "RolUsuario",
    # Value Objects
    "CorreoUsuario",
    "PasswordHash",
    "NombreUsuario",
    "RolUsuarioVO",
    # Repositorio
    "UsuarioRepository",
    # Excepciones
    "UsuarioException",
    "UsuarioNoEncontradoException",
    "CorreoYaRegistradoException",
    "CorreoInvalidoException",
    "NombreInvalidoException",
    "ContraseñaInvalidaException",
    "RolInvalidoException",
    "UsuarioInactiveException",
    "AccesoNoAutorizadoException",
    "OperacionNoPermitidaException",
    # Especificaciones
    "UsuarioSpecification",
    "UsuarioPorIdSpecification",
    "UsuarioPorCorreoSpecification",
    "UsuarioPorRolSpecification",
    "UsuarioActivoSpecification",
    "UsuarioAdminSpecification",
    "UsuarioFuncionarioSpecification",
    "UsuarioVisitadorSpecification",
    "CriteriosListadoUsuarios",
    # Eventos de Dominio
    "DomainEvent",
    "UsuarioCreadoEvent",
    "UsuarioActualizadoEvent",
    "UsuarioDesactivadoEvent",
    "RolUsuarioCambiadoEvent",
    "ContraseñaUsuarioCambiadaEvent",
    "UsuarioEliminadoEvent",
]
