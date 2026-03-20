"""
API Serializers para Usuario

Valida y serializa datos de usuarios para endpoints REST.
Implementa validación de entrada/salida y transformación de datos.
"""

from datetime import timezone as dt_timezone
from rest_framework import serializers
from infrastructure.database.usuarios_models import UsuarioSistema
from infrastructure.database.roles_models import Rol


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer completo para Usuario (lectura)"""
    
    id_rol_display = serializers.CharField(
        source="id_rol.nombre_rol",
        read_only=True,
    )

    # Forzar salida UTC (con offset +00:00) para que el frontend
    # parsee correctamente sin depender del timezone del sistema
    fecha_creacion = serializers.DateTimeField(
        default_timezone=dt_timezone.utc,
        read_only=True,
        required=False,
        allow_null=True,
    )
    fecha_modificacion = serializers.DateTimeField(
        default_timezone=dt_timezone.utc,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = UsuarioSistema
        fields = [
            "id_usuario",
            "nombre_completo",
            "correo",
            "numero_documento",
            "id_rol",
            "id_rol_display",
            "activo",
            "fecha_creacion",
            "fecha_modificacion",
        ]
        read_only_fields = [
            "id_usuario",
            "id_rol_display",
            "fecha_creacion",
        ]


class CrearUsuarioSerializer(serializers.Serializer):
    """Serializer para crear nuevo usuario"""

    nombre_completo = serializers.CharField(
        max_length=200,
        min_length=3,
        required=True,
        error_messages={
            "max_length": "Máximo 200 caracteres",
            "min_length": "Mínimo 3 caracteres",
            "required": "Campo requerido",
        }
    )
    correo = serializers.EmailField(
        max_length=200,
        required=True,
        error_messages={
            "invalid": "Correo inválido",
            "required": "Campo requerido",
        }
    )
    numero_documento = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    password_hash = serializers.CharField(
        max_length=255,
        min_length=20,
        required=True,
        write_only=True,
        error_messages={
            "min_length": "Hash debe tener mínimo 20 caracteres",
            "required": "Campo requerido",
        }
    )
    id_rol = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        required=False,
    )

    def validate_nombre_completo(self, value):
        """Valida nombre"""
        if not value.strip():
            raise serializers.ValidationError("Nombre no puede estar vacío")
        return value.strip()

    def validate_correo(self, value):
        """Valida correo único"""
        value = value.lower().strip()
        if UsuarioSistema.obtener_no_eliminados().filter(correo=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado")
        return value
    
    def validate_id_rol(self, value):
        """Si no se proporciona rol, usa FUNCIONARIO por defecto"""
        if not value:
            return Rol.objects.get(nombre_rol="FUNCIONARIO")
        return value


class ActualizarUsuarioSerializer(serializers.Serializer):
    """Serializer para actualizar usuario parcialmente
    
    Solo permite actualizar nombre_completo, numero_documento y activo.
    Para cambiar rol, use CambiarRolSerializer.
    """

    nombre_completo = serializers.CharField(
        max_length=200,
        min_length=3,
        required=False,
    )
    numero_documento = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    activo = serializers.BooleanField(required=False)

    def validate_nombre_completo(self, value):
        """Valida nombre"""
        if value and not value.strip():
            raise serializers.ValidationError("Nombre no puede estar vacío")
        return value.strip() if value else value


class CambiarContraseñaSerializer(serializers.Serializer):
    """Serializer para cambiar contraseña"""

    password_hash = serializers.CharField(
        max_length=255,
        min_length=20,
        required=True,
        write_only=True,
    )

    def validate_password_hash(self, value):
        """Valida hash"""
        if not value or len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Hash debe tener mínimo 20 caracteres"
            )
        return value


class CambiarRolSerializer(serializers.Serializer):
    """Serializer para cambiar rol de usuario
    
    Operación sensible de seguridad separada de actualizaciones normales.
    """

    rol = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        required=True,
        error_messages={
            "required": "id_rol requerido",
            "does_not_exist": "El rol especificado no existe",
        },
    )

    def validate_rol(self, value):
        """Valida rol"""
        if not value:
            raise serializers.ValidationError("Rol requerido")
        return value


class ListarUsuariosSerializer(serializers.Serializer):
    """Serializer para parámetros de listado"""

    page = serializers.IntegerField(
        required=False,
        default=1,
        min_value=1,
    )
    page_size = serializers.IntegerField(
        required=False,
        default=10,
        min_value=1,
        max_value=100,
    )
    id_rol = serializers.PrimaryKeyRelatedField(
        queryset=Rol.objects.all(),
        required=False,
        allow_null=True,
    )
    activo = serializers.BooleanField(required=False, allow_null=True)
    buscar = serializers.CharField(
        required=False,
        max_length=100,
    )

