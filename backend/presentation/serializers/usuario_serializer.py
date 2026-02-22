"""
Serializer de Usuario - Capa de Presentación

Define la estructura de datos que se envía/recibe en las APIs.
"""
from rest_framework import serializers
from infrastructure.database.models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para Usuario"""

    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'nombre',
            'apellidos',
            'nombre_completo',
            'numero_documento',
            'correo',
            'rol',
            'estado',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['id', 'fecha_creacion', 'fecha_actualizacion', 'nombre_completo']

    def get_nombre_completo(self, obj) -> str:
        """Retorna el nombre completo"""
        return f"{obj.nombre} {obj.apellidos}"

    def validate_nombre(self, value):
        """Valida el nombre"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre debe tener al menos 2 caracteres")
        return value

    def validate_apellidos(self, value):
        """Valida los apellidos"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Los apellidos deben tener al menos 2 caracteres")
        return value

    def validate_numero_documento(self, value):
        """Valida el número de documento"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("El número de documento debe tener al menos 5 caracteres")
        return value

    def validate_correo(self, value):
        """Valida el correo"""
        if not value or '@' not in value:
            raise serializers.ValidationError("El correo debe ser válido")
        return value

    def validate_rol(self, value):
        """Valida el rol"""
        roles_validos = ['ADMINISTRADOR', 'FUNCIONARIO', 'TECNICO']
        if value not in roles_validos:
            raise serializers.ValidationError(f"El rol debe ser uno de: {', '.join(roles_validos)}")
        return value

    def validate_estado(self, value):
        """Valida el estado"""
        estados_validos = ['ACTIVO', 'INACTIVO']
        if value not in estados_validos:
            raise serializers.ValidationError(f"El estado debe ser uno de: {', '.join(estados_validos)}")
        return value

    def create(self, validated_data):
        """Crea un nuevo usuario"""
        return Usuario.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """Actualiza un usuario existente"""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
