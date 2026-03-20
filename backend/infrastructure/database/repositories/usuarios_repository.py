"""
Infrastructure Layer - Repositorio de Usuarios

Implementación del patrón Repository usando Django ORM
para persistencia de usuarios en PostgreSQL.
"""

import logging
from typing import List, Optional, Dict, Any
from math import ceil
from datetime import datetime

from django.db.models import Q, QuerySet, Count
from django.utils.timezone import now

from domain.usuarios import Usuario, UsuarioRepository, UsuarioNoEncontradoException
from infrastructure.database.usuarios_models import UsuarioSistema

logger = logging.getLogger(__name__)


class DjangoUsuarioRepository(UsuarioRepository):
    """
    Implementación del repositorio de usuarios usando Django ORM
    
    Responsabilidades:
    - Persistencia de usuarios en PostgreSQL
    - Mapeo ORM ↔ Dominio
    - Construcción de queries optimizadas
    - Transacciones y manejo de errores
    """

    # ============ Operaciones de Creación ============

    async def crear(self, usuario: Usuario) -> Usuario:
        """
        Crea un nuevo usuario en la base de datos
        
        Args:
            usuario: Entidad Usuario del dominio
            
        Returns:
            Usuario con ID asignado
            
        Raises:
            ValueError: Si hay violación de restricciones
        """
        try:
            logger.debug(f"Creando usuario con correo: {usuario.correo}")
            
            modelo_usuario = UsuarioSistema.from_domain(usuario)
            modelo_usuario.save()
            
            logger.info(f"Usuario creado con ID: {modelo_usuario.id_usuario}")
            
            # Retornar usuario completo con ID asignado
            return modelo_usuario.to_domain()
            
        except Exception as e:
            logger.error(f"Error al crear usuario: {str(e)}")
            raise

    # ============ Operaciones de Lectura ============

    async def obtener_por_id(self, id_usuario: int) -> Optional[Usuario]:
        """
        Obtiene un usuario por su ID
        
        Args:
            id_usuario: ID del usuario
            
        Returns:
            Usuario si existe y está activo lógicamente, None si no existe
        """
        try:
            modelo_usuario = UsuarioSistema.obtener_no_eliminados().get(
                id_usuario=id_usuario
            )
            return modelo_usuario.to_domain()
        except UsuarioSistema.DoesNotExist:
            logger.debug(f"Usuario con ID {id_usuario} no encontrado")
            return None

    async def obtener_por_correo(self, correo: str) -> Optional[Usuario]:
        """
        Obtiene un usuario por su correo electrónico
        
        Args:
            correo: Correo electrónico del usuario
            
        Returns:
            Usuario si existe y está activo lógicamente
        """
        try:
            modelo_usuario = UsuarioSistema.obtener_no_eliminados().get(
                correo=correo.lower()
            )
            return modelo_usuario.to_domain()
        except UsuarioSistema.DoesNotExist:
            logger.debug(f"Usuario con correo {correo} no encontrado")
            return None

    async def obtener_todos(
        self,
        filtros: Optional[Dict[str, Any]] = None,
        pagina: int = 1,
        tamaño_pagina: int = 10,
    ) -> Dict[str, Any]:
        """
        Obtiene usuarios con filtros y paginación
        
        Args:
            filtros: Diccionario con filtros (rol, activo)
            pagina: Número de página
            tamaño_pagina: Cantidad de registros por página
            
        Returns:
            Diccionario con resultados paginados
        """
        try:
            # Comienza con usuarios no eliminados
            queryset = UsuarioSistema.obtener_no_eliminados()
            
            # Aplicar filtros
            if filtros:
                if "rol" in filtros and filtros["rol"]:
                    queryset = queryset.filter(rol=filtros["rol"].upper())
                
                if "activo" in filtros and filtros["activo"] is not None:
                    queryset = queryset.filter(activo=filtros["activo"])
            
            # Ordenar  más recientemente primero
            queryset = queryset.order_by("-fecha_creacion")
            
            # Contar total
            total = queryset.count()
            
            # Calcular paginación
            pagina = max(1, pagina)
            tamaño_pagina = max(1, min(100, tamaño_pagina))  # Máximo 100
            offset = (pagina - 1) * tamaño_pagina
            total_paginas = ceil(total / tamaño_pagina) if total > 0 else 1
            
            # Obtener página
            usuarios = [
                modelo.to_domain()
                for modelo in queryset[offset:offset + tamaño_pagina]
            ]
            
            logger.debug(
                f"Listado: {len(usuarios)} usuarios, "
                f"página {pagina} de {total_paginas}"
            )
            
            return {
                "items": usuarios,
                "total": total,
                "pagina": pagina,
                "tamaño_pagina": tamaño_pagina,
                "total_paginas": total_paginas,
            }
            
        except Exception as e:
            logger.error(f"Error al obtener usuarios: {str(e)}")
            raise

    async def obtener_por_rol(self, rol: str) -> List[Usuario]:
        """
        Obtiene todos los usuarios con un rol específico
        
        Args:
            rol: Rol a filtrar
            
        Returns:
            Lista de usuarios activos con el rol
        """
        usuarios_modelo = UsuarioSistema.obtener_no_eliminados().filter(
            rol=rol.upper()
        )
        return [modelo.to_domain() for modelo in usuarios_modelo]

    # ============ Operaciones de Actualización ============

    async def actualizar(self, usuario: Usuario) -> Usuario:
        """
        Actualiza un usuario existente
        
        Args:
            usuario: Entidad Usuario con cambios
            
        Returns:
            Usuario actualizado
            
        Raises:
            UsuarioNoEncontradoException: Si el usuario no existe
        """
        try:
            logger.debug(f"Actualizando usuario: {usuario.id_usuario}")
            
            modelo_usuario = UsuarioSistema.obtener_no_eliminados().get(
                id_usuario=usuario.id_usuario
            )
            
            # Actualizar campos
            modelo_usuario.nombre_completo = usuario.nombre_completo
            modelo_usuario.correo = usuario.correo
            modelo_usuario.password_hash = usuario.password_hash
            modelo_usuario.rol = (
                usuario.rol.value if hasattr(usuario.rol, "value")
                else usuario.rol
            )
            modelo_usuario.activo = usuario.activo
            modelo_usuario.usuario_modificacion_id = usuario.usuario_modificacion
            modelo_usuario.fecha_modificacion = now()
            modelo_usuario.activo_logico = usuario.activo_logico
            
            modelo_usuario.save(update_fields=[
                "nombre_completo",
                "correo",
                "password_hash",
                "rol",
                "activo",
                "usuario_modificacion_id",
                "fecha_modificacion",
                "activo_logico",
            ])
            
            logger.info(f"Usuario actualizado: {usuario.id_usuario}")
            return modelo_usuario.to_domain()
            
        except UsuarioSistema.DoesNotExist:
            logger.error(f"Usuario no encontrado: {usuario.id_usuario}")
            raise UsuarioNoEncontradoException(usuario.id_usuario)

    # ============ Operaciones de Eliminación ============

    async def eliminar(self, id_usuario: int) -> bool:
        """
        Elimina lógicamente un usuario
        
        Args:
            id_usuario: ID del usuario
            
        Returns:
            True si se eliminó, False si no existe
        """
        try:
            usuario = UsuarioSistema.obtener_no_eliminados().get(
                id_usuario=id_usuario
            )
            usuario.activo_logico = False
            usuario.fecha_modificacion = now()
            usuario.save(update_fields=["activo_logico", "fecha_modificacion"])
            
            logger.info(f"Usuario eliminado lógicamente: {id_usuario}")
            return True
            
        except UsuarioSistema.DoesNotExist:
            logger.debug(f"Usuario no encontrado para eliminar: {id_usuario}")
            return False

    # ============ Operaciones de Validación ============

    async def existe_correo(self, correo: str, exluir_id: Optional[int] = None) -> bool:
        """
        Verifica si existe un correo (para otro usuario)
        
        Args:
            correo: Correo a verificar
            exluir_id: ID de usuario a excluir (para actualizaciones)
            
        Returns:
            True si el correo existe para otro usuario
        """
        queryset = UsuarioSistema.obtener_no_eliminados().filter(
            correo=correo.lower()
        )
        
        if exluir_id:
            queryset = queryset.exclude(id_usuario=exluir_id)
        
        return queryset.exists()

    async def contar(self, filtro_activos: bool = True) -> int:
        """
        Cuenta usuarios
        
        Args:
            filtro_activos: Si True, cuenta solo usuarios activos
            
        Returns:
            Total de usuarios
        """
        queryset = UsuarioSistema.obtener_no_eliminados()
        
        if filtro_activos:
            queryset = queryset.filter(activo=True)
        
        return queryset.count()

    # ============ Operaciones Avanzadas ============

    async def obtener_estadisticas(self) -> Dict[str, Any]:
        """
        Obtiene estadísticas generales de usuarios
        
        Returns:
            Diccionario con estadísticas
        """
        queryset_base = UsuarioSistema.obtener_no_eliminados()
        
        total = queryset_base.count()
        activos = queryset_base.filter(activo=True).count()
        inactivos = total - activos
        
        # Contar por rol
        por_rol = {}
        for rol_code, rol_name in UsuarioSistema.ROLES:
            por_rol[rol_code] = queryset_base.filter(rol=rol_code).count()
        
        return {
            "total": total,
            "activos": activos,
            "inactivos": inactivos,
            "por_rol": por_rol,
        }

    async def buscar(
        self,
        termino: str,
        pagina: int = 1,
        tamaño_pagina: int = 10,
    ) -> Dict[str, Any]:
        """
        Busca usuarios por nombre o correo
        
        Args:
            termino: Término de búsqueda
            pagina: Número de página
            tamaño_pagina: Cantidad de registros
            
        Returns:
            Diccionario con resultados paginados
        """
        queryset = UsuarioSistema.obtener_no_eliminados().filter(
            Q(nombre_completo__icontains=termino) |
            Q(correo__icontains=termino)
        )
        
        total = queryset.count()
        offset = (pagina - 1) * tamaño_pagina
        total_paginas = ceil(total / tamaño_pagina) if total > 0 else 1
        
        usuarios = [
            modelo.to_domain()
            for modelo in queryset[offset:offset + tamaño_pagina]
        ]
        
        return {
            "items": usuarios,
            "total": total,
            "pagina": pagina,
            "tamaño_pagina": tamaño_pagina,
            "total_paginas": total_paginas,
        }

