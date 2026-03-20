"""
Excepciones especializadas del módulo Usuarios

Excepciones de dominio específicas para la entidad Usuario
y operaciones relacionadas.
"""

from shared.exceptions import DomainException, EntityNotFoundException, InvalidEntityException


class UsuarioException(DomainException):
    """Excepción base para excepciones del módulo de Usuarios"""
    pass


class UsuarioNoEncontradoException(EntityNotFoundException, UsuarioException):
    """Se lanza cuando no se encuentra un usuario con el ID especificado"""
    
    def __init__(self, id_usuario: int):
        self.id_usuario = id_usuario
        super().__init__(f"Usuario con ID {id_usuario} no encontrado")


class CorreoYaRegistradoException(InvalidEntityException, UsuarioException):
    """Se lanza cuando se intenta registrar un correo que ya existe"""
    
    def __init__(self, correo: str):
        self.correo = correo
        super().__init__(f"El correo {correo} ya está registrado en el sistema")


class CorreoInvalidoException(InvalidEntityException, UsuarioException):
    """Se lanza cuando el formato del correo no es válido"""
    
    def __init__(self, correo: str):
        self.correo = correo
        super().__init__(f"El formato del correo {correo} no es válido")


class NombreInvalidoException(InvalidEntityException, UsuarioException):
    """Se lanza cuando el nombre del usuario no cumple con los requisitos"""
    
    def __init__(self, nombre: str, razon: str = ""):
        self.nombre = nombre
        self.razon = razon
        mensaje = f"Nombre de usuario inválido: {nombre}"
        if razon:
            mensaje += f". {razon}"
        super().__init__(mensaje)


class ContraseñaInvalidaException(InvalidEntityException, UsuarioException):
    """Se lanza cuando la contraseña no cumple con los requisitos de seguridad"""
    
    def __init__(self, razon: str = ""):
        self.razon = razon
        mensaje = "La contraseña no es válida"
        if razon:
            mensaje += f": {razon}"
        super().__init__(mensaje)


class RolInvalidoException(InvalidEntityException, UsuarioException):
    """Se lanza cuando se asigna un rol que no existe o es inválido"""
    
    def __init__(self, rol: str):
        self.rol = rol
        super().__init__(
            f"Rol inválido: {rol}. Roles permitidos: ADMIN, FUNCIONARIO, VISITADOR_TECNICO"
        )


class UsuarioInactiveException(UsuarioException):
    """Se lanza cuando se intenta operar con un usuario inactivo"""
    
    def __init__(self, id_usuario: int):
        self.id_usuario = id_usuario
        super().__init__(f"El usuario {id_usuario} está inactivo")


class AccesoNoAutorizadoException(UsuarioException):
    """Se lanza cuando un usuario intenta una acción no autorizada"""
    
    def __init__(self, usuario_id: int, accion: str):
        self.usuario_id = usuario_id
        self.accion = accion
        super().__init__(
            f"Usuario {usuario_id} no tiene permiso para: {accion}"
        )


class OperacionNoPermitidaException(UsuarioException):
    """Se lanza cuando se intenta una operación no permitida en el estado actual"""
    
    def __init__(self, mensaje: str):
        super().__init__(mensaje)
