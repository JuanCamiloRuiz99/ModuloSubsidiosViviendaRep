"""
Serializer para la entidad Etapa
"""
from rest_framework import serializers
from infrastructure.database.models import (
    Etapa, FormularioEtapa,
    ConfigRegistroHogar, ConfigVisitaTecnica, ConfigGestionDocumental,
)


class EtapaSerializer(serializers.ModelSerializer):
    formulario_configurado = serializers.SerializerMethodField()
    formulario_estado = serializers.SerializerMethodField()
    registro_hogar_publicado = serializers.SerializerMethodField()
    visita_tecnica_publicado = serializers.SerializerMethodField()
    gestion_documental_publicado = serializers.SerializerMethodField()
    registro_hogar_guardado = serializers.SerializerMethodField()
    visita_tecnica_guardado = serializers.SerializerMethodField()
    gestion_documental_guardado = serializers.SerializerMethodField()

    class Meta:
        model = Etapa
        fields = [
            'id',
            'programa',
            'numero_etapa',
            'modulo_principal',
            'fecha_creacion',
            'usuario_creacion',
            'usuario_modificacion',
            'fecha_modificacion',
            'activo_logico',
            'formulario_configurado',
            'formulario_estado',
            'registro_hogar_publicado',
            'visita_tecnica_publicado',
            'gestion_documental_publicado',
            'registro_hogar_guardado',
            'visita_tecnica_guardado',
            'gestion_documental_guardado',
            'finalizada',
            'fecha_finalizacion',
        ]
        read_only_fields = ['fecha_creacion', 'fecha_modificacion', 'activo_logico', 'finalizada', 'fecha_finalizacion']

    def get_formulario_configurado(self, obj):
        try:
            return obj.formulario is not None
        except FormularioEtapa.DoesNotExist:
            return False

    def get_formulario_estado(self, obj):
        try:
            return obj.formulario.estado
        except FormularioEtapa.DoesNotExist:
            return None

    def get_registro_hogar_publicado(self, obj):
        try:
            return obj.config_registro_hogar.publicado
        except ConfigRegistroHogar.DoesNotExist:
            return False

    def get_visita_tecnica_publicado(self, obj):
        try:
            return obj.config_visita_tecnica.publicado
        except ConfigVisitaTecnica.DoesNotExist:
            return False

    def get_gestion_documental_publicado(self, obj):
        try:
            return obj.config_gestion_documental.publicado
        except ConfigGestionDocumental.DoesNotExist:
            return False

    def get_registro_hogar_guardado(self, obj):
        try:
            return bool(obj.config_registro_hogar.campos)
        except ConfigRegistroHogar.DoesNotExist:
            return False

    def get_visita_tecnica_guardado(self, obj):
        try:
            return bool(obj.config_visita_tecnica.campos)
        except ConfigVisitaTecnica.DoesNotExist:
            return False

    def get_gestion_documental_guardado(self, obj):
        try:
            return bool(obj.config_gestion_documental.campos)
        except ConfigGestionDocumental.DoesNotExist:
            return False
