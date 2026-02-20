"""
Serializador para la entidad Programa

Convierte objetos Python a JSON y valida datos de entrada.
Las validaciones principales se realizan en la capa de aplicación (casos de uso).
"""
from rest_framework import serializers
from infrastructure.database.models import Programa


class ProgramaSerializer(serializers.ModelSerializer):
    """Serializador para Programa"""

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

    def to_representation(self, instance):
        """Convertir la instancia a datos serializables"""
        data = super().to_representation(instance)
        return data

