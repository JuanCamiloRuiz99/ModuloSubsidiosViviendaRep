from rest_framework import serializers
from .models import Programa


class ProgramaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programa
        fields = [
            'id',
            'nombre',
            'descripcion',
            'entidad_responsable',
            'codigo_programa',
            'estado',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['codigo_programa', 'fecha_creacion', 'fecha_actualizacion']

    def validate_nombre(self, value):
        """Validar que el nombre tenga al menos 3 caracteres"""
        if len(value) < 3:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 3 caracteres."
            )
        return value

    def validate_descripcion(self, value):
        """Validar que la descripción tenga al menos 10 caracteres"""
        if len(value) < 10:
            raise serializers.ValidationError(
                "La descripción debe tener al menos 10 caracteres."
            )
        return value

    def validate_entidad_responsable(self, value):
        """Validar que se proporcione una entidad responsable"""
        if not value or value.strip() == '':
            raise serializers.ValidationError(
                "Debe proporcionar una entidad responsable."
            )
        return value
