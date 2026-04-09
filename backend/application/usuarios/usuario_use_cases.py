"""
Use Cases del Módulo Usuarios

Orquesta la lógica de negocio para operaciones de usuario.
"""

from typing import Dict, Any, Optional

from domain.usuarios import Usuario, UsuarioRepository, RolUsuario
from .usuario_dto import (
    CrearUsuarioDTO,
    ActualizarUsuarioDTO,
    CambiarContraseñaDTO,
    CambiarRolDTO,
    ObtenerUsuarioDTO,
    ListarUsuariosDTO,
    UsuarioDTO,
    ListaUsuariosDTO,
    EstadisticasUsuariosDTO,
)


class CrearUsuarioUseCase:
    """Use Case para crear un nuevo usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, input_dto: CrearUsuarioDTO) -> UsuarioDTO:
        """Ejecuta la creación de un usuario"""
        input_dto.validar()

        # Verificar que el correo no exista
        usuario_existente = self.repository.obtener_por_correo(input_dto.correo)
        if usuario_existente:
            raise ValueError(f"El correo {input_dto.correo} ya está registrado")

        # Crear la entidad Usuario
        usuario = Usuario(
            id_usuario=None,
            nombre_completo=input_dto.nombre_completo,
            correo=input_dto.correo,
            password_hash=input_dto.password_hash,
            rol=input_dto.rol,
            activo=True,
            usuario_creacion=input_dto.usuario_creacion,
        )

        # Persistir
        usuario_creado = self.repository.crear(usuario)
        return UsuarioDTO.from_domain(usuario_creado)


class ObtenerUsuarioUseCase:
    """Use Case para obtener un usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, input_dto: ObtenerUsuarioDTO) -> UsuarioDTO:
        """Ejecuta la obtención de un usuario"""
        input_dto.validar()

        usuario = self.repository.obtener_por_id(input_dto.id_usuario)
        if not usuario:
            raise ValueError(f"Usuario con ID {input_dto.id_usuario} no encontrado")

        return UsuarioDTO.from_domain(usuario)


class ListarUsuariosUseCase:
    """Use Case para listar usuarios"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, input_dto: ListarUsuariosDTO) -> ListaUsuariosDTO:
        """Ejecuta el listado de usuarios"""
        input_dto.validar()

        filtros = {}
        if input_dto.rol:
            filtros["rol"] = input_dto.rol
        if input_dto.activo is not None:
            filtros["activo"] = input_dto.activo

        resultado = self.repository.obtener_todos(
            filtros=filtros,
            pagina=input_dto.pagina,
            tamaño_pagina=input_dto.tamaño_pagina,
        )

        usuarios_dtos = [
            UsuarioDTO.from_domain(usuario)
            for usuario in resultado["items"]
        ]

        return ListaUsuariosDTO(
            items=usuarios_dtos,
            total=resultado["total"],
            pagina=resultado["pagina"],
            tamaño_pagina=resultado["tamaño_pagina"],
            total_paginas=resultado["total_paginas"],
        )


class ActualizarUsuarioUseCase:
    """Use Case para actualizar datos básicos de usuario
    
    Solo actualiza nombre y estado. Para cambiar rol, use CambiarRolUseCase.
    """

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, input_dto: ActualizarUsuarioDTO) -> UsuarioDTO:
        """Ejecuta la actualización de un usuario"""
        input_dto.validar()

        usuario = self.repository.obtener_por_id(input_dto.id_usuario)
        if not usuario:
            raise ValueError(f"Usuario con ID {input_dto.id_usuario} no encontrado")

        # Actualizar campos NO sensibles
        if input_dto.nombre_completo:
            usuario.actualizar_nombre(input_dto.nombre_completo)

        if input_dto.activo is not None:
            usuario.cambiar_estado(input_dto.activo)

        if input_dto.usuario_modificacion:
            usuario.usuario_modificacion = input_dto.usuario_modificacion

        # Persistir
        usuario_actualizado = self.repository.actualizar(usuario)
        return UsuarioDTO.from_domain(usuario_actualizado)


class CambiarRolUseCase:
    """Use Case para cambiar rol de usuario
    
    Operación sensible de seguridad separada de actualizaciones normales.
    Incluye auditoría y validaciones específicas de rol.
    """

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, input_dto: CambiarRolDTO) -> UsuarioDTO:
        """Ejecuta el cambio de rol"""
        input_dto.validar()

        usuario = self.repository.obtener_por_id(input_dto.id_usuario)
        if not usuario:
            raise ValueError(f"Usuario con ID {input_dto.id_usuario} no encontrado")

        # TODO: Validar autorización (solo ADMIN puede cambiar roles)
        # TODO: Auditoría: registrar quién cambió el rol
        # TODO: Notificación: alertar al usuario del cambio
        # TODO: Revocación: revocar permisos previos del rol anterior

        usuario.cambiar_rol(RolUsuario(input_dto.rol))
        if input_dto.usuario_modificacion:
            usuario.usuario_modificacion = input_dto.usuario_modificacion

        usuario_actualizado = self.repository.actualizar(usuario)
        return UsuarioDTO.from_domain(usuario_actualizado)


class CambiarContraseñaUseCase:
    """Use Case para cambiar contraseña de usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, input_dto: CambiarContraseñaDTO) -> UsuarioDTO:
        """Ejecuta el cambio de contraseña"""
        input_dto.validar()

        usuario = self.repository.obtener_por_id(input_dto.id_usuario)
        if not usuario:
            raise ValueError(f"Usuario con ID {input_dto.id_usuario} no encontrado")

        usuario.actualizar_password(input_dto.password_hash)
        if input_dto.usuario_modificacion:
            usuario.usuario_modificacion = input_dto.usuario_modificacion

        usuario_actualizado = self.repository.actualizar(usuario)
        return UsuarioDTO.from_domain(usuario_actualizado)


class EliminarUsuarioUseCase:
    """Use Case para eliminar un usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, id_usuario: int) -> bool:
        """Ejecuta la eliminación de un usuario"""
        if not id_usuario or id_usuario <= 0:
            raise ValueError("ID de usuario inválido")

        usuario = self.repository.obtener_por_id(id_usuario)
        if not usuario:
            raise ValueError(f"Usuario con ID {id_usuario} no encontrado")

        return self.repository.eliminar(id_usuario)


class ObtenerEstadisticasUsuariosUseCase:
    """Use Case para obtener estadísticas de usuarios"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self) -> EstadisticasUsuariosDTO:
        """Ejecuta la obtención de estadísticas"""
        total = self.repository.contar()

        usuarios_activos = self.repository.obtener_todos(
            filtros={"activo": True},
            pagina=1,
            tamaño_pagina=1000,
        )
        activos = len(usuarios_activos.get("items", []))

        inactivos = total - activos

        # Contar por rol
        por_rol = {}
        for rol in ["ADMIN", "FUNCIONARIO", "VISITADOR_TECNICO"]:
            usuarios_rol = self.repository.obtener_por_rol(rol)
            por_rol[rol] = len(usuarios_rol)

        return EstadisticasUsuariosDTO(
            total=total,
            activos=activos,
            inactivos=inactivos,
            por_rol=por_rol,
        )
