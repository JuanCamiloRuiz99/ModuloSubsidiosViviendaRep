"""
Infrastructure Layer - Modelos de Base de Datos para Usuarios

Define los modelos de Django para la tabla usuarios_sistema.
Implementa el mapeo entre la capa de base de datos y la capa de dominio.
"""

from django.db import models
from django.core.validators import EmailValidator
from django.utils.timezone import now
from .roles_models import Rol


class UsuarioSistema(models.Model):
    """
    Modelo ORM de Usuario del Sistema
    
    Representa la persistencia de usuarios en la base de datos.
    Implementa métodos para mapeo bidireccional con la entidad de dominio.
    """

    # Identificador
    id_usuario = models.AutoField(primary_key=True)

    # Información de autenticación
    nombre_completo = models.CharField(
        max_length=200,
        blank=False,
        null=False,
        help_text="Nombre completo del usuario",
        db_index=False,
    )
    correo = models.EmailField(
        max_length=200,
        unique=True,
        blank=False,
        null=False,
        validators=[EmailValidator()],
        help_text="Correo electrónico único del usuario",
        db_index=True,  # Índice para búsquedas rápidas
    )
    numero_documento = models.CharField(
        max_length=20,
        blank=False,
        null=False,
        unique=True,
        help_text="Número de documento/cédula del usuario",
        db_index=False,
    )
    password_hash = models.CharField(
        max_length=255,
        blank=False,
        null=False,
        help_text="Hash PBKDF2 o similar de la contraseña",
    )

    # Rol en el sistema (Foreign Key)
    id_rol = models.ForeignKey(
        Rol,
        on_delete=models.RESTRICT,
        blank=False,
        null=False,
        default=2,  # FUNCIONARIO
        help_text="Rol del usuario en el sistema",
        db_column="id_rol",
    )

    # Trazabilidad
    creado_por = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios_creados",
        help_text="Usuario que creó este registro",
        db_column="creado_por",
    )
    usuario_modificacion = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios_modificados",
        help_text="Usuario que modificó este registro",
        db_column="usuario_modificacion",
    )
    usuario_eliminacion = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios_eliminados",
        help_text="Usuario que eliminó este registro (soft delete)",
        db_column="usuario_eliminacion",
    )
    
    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de creación del registro",
    )
    fecha_modificacion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de última modificación",
    )
    fecha_eliminacion = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Fecha de eliminación (soft delete)",
    )
    
    # Estado
    activo = models.BooleanField(
        default=True,
        help_text="Indica si la cuenta está activa",
        db_index=True,
    )
    activo_logico = models.BooleanField(
        default=True,
        help_text="Indica si el registro está activo lógicamente (soft delete)",
    )

    class Meta:
        """Configuración de meta modelo"""
        db_table = "usuarios_sistema"
        verbose_name = "Usuario del Sistema"
        verbose_name_plural = "Usuarios del Sistema"
        ordering = ["-fecha_creacion"]
        constraints = [
            models.UniqueConstraint(
                fields=["correo"],
                name="uk_usuarios_correo",
                condition=models.Q(activo_logico=True),
            ),
        ]
        indexes = [
            models.Index(fields=["correo"], name="idx_usuarios_correo"),
            models.Index(fields=["id_rol"], name="idx_usuarios_id_rol"),
            models.Index(fields=["activo"], name="idx_usuarios_activo"),
            models.Index(
                fields=["id_rol", "activo"],
                name="idx_usuarios_id_rol_activo"
            ),
        ]

    def __str__(self):
        """Representación en texto"""
        return f"{self.nombre_completo} ({self.correo})"

    def __repr__(self):
        """Representación para debugging"""
        return (
            f"UsuarioSistema(id={self.id_usuario}, "
            f"correo='{self.correo}', rol='{self.id_rol.nombre_rol}')"
        )

    # ============ Conversión a Dominio ============

    def to_domain(self):
        """
        Convierte el modelo ORM a entidad de dominio
        
        Returns:
            Entidad Usuario del dominio
        """
        from domain.usuarios import Usuario, RolUsuario

        return Usuario(
            id_usuario=self.id_usuario,
            nombre_completo=self.nombre_completo,
            correo=self.correo,
            numero_documento=self.numero_documento,
            password_hash=self.password_hash,
            rol=RolUsuario(self.id_rol.nombre_rol),
            activo=self.activo,
            usuario_creacion=self.creado_por_id,
            usuario_modificacion=self.usuario_modificacion_id,
            fecha_creacion=self.fecha_creacion,
            fecha_modificacion=self.fecha_modificacion,
            activo_logico=self.activo_logico,
        )

    @staticmethod
    def from_domain(usuario):
        """
        Crea un modelo ORM desde una entidad de dominio
        
        Args:
            usuario: Entidad Usuario del dominio
            
        Returns:
            Instancia de UsuarioSistema para persistencia
        """
        rol_str = usuario.rol.value if hasattr(usuario.rol, "value") else usuario.rol
        rol_obj = Rol.objects.get(nombre_rol=rol_str)
        
        return UsuarioSistema(
            id_usuario=usuario.id_usuario if usuario.id_usuario else None,
            nombre_completo=usuario.nombre_completo,
            correo=usuario.correo,
            numero_documento=usuario.numero_documento,
            password_hash=usuario.password_hash,
            id_rol=rol_obj,
            activo=usuario.activo,
            creado_por_id=usuario.usuario_creacion,
            usuario_modificacion_id=usuario.usuario_modificacion,
            fecha_creacion=usuario.fecha_creacion,
            fecha_modificacion=usuario.fecha_modificacion,
            activo_logico=usuario.activo_logico,
        )

    # ============ Métodos de Negocio ============

    def cambiar_estado(self, activo: bool):
        """Cambia el estado del usuario"""
        self.activo = activo
        self.fecha_modificacion = now()

    def cambiar_rol(self, rol: Rol):
        """
        Cambia el rol del usuario
        
        Args:
            rol: Objeto Rol o ID del rol
        """
        if isinstance(rol, int):
            self.id_rol_id = rol
        else:
            self.id_rol = rol
        self.fecha_modificacion = now()

    def puede_ser_actualizado(self) -> bool:
        """Verifica si el usuario puede ser actualizado"""
        return self.activo_logico

    @classmethod
    def obtener_no_eliminados(cls):
        """Retorna querySet de usuarios no eliminados lógicamente"""
        return cls.objects.filter(activo_logico=True)

    @classmethod
    def obtener_activos(cls):
        """Retorna querySet de usuarios activos y no eliminados"""
        return cls.obtener_no_eliminados().filter(activo=True)
