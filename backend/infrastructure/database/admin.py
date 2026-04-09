"""
Configuración del admin de Django para visualizar modelos
"""
from django.contrib import admin
from .models import (
    Programa, Etapa,
    FormularioEtapa, CampoFormulario, Ciudadano,
)


@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_programa', 'estado', 'entidad_responsable', 'fecha_creacion')
    list_filter = ('estado', 'fecha_creacion', 'entidad_responsable')
    search_fields = ('nombre', 'codigo_programa', 'descripcion')
    readonly_fields = ('codigo_programa', 'fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información General', {
            'fields': ('nombre', 'descripcion', 'entidad_responsable')
        }),
        ('Sistema', {
            'fields': ('codigo_programa', 'estado')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ['nombre']
        return self.readonly_fields


@admin.register(Ciudadano)
class CiudadanoAdmin(admin.ModelAdmin):
    list_display = ('id_persona', 'primer_nombre', 'primer_apellido', 'tipo_documento', 'numero_documento', 'fecha_creacion')
    list_filter = ('tipo_documento', 'sexo', 'fecha_creacion', 'formulario__etapa__programa')
    search_fields = ('numero_documento', 'primer_nombre', 'primer_apellido', 'correo_electronico')
    readonly_fields = ('id_persona', 'fecha_creacion')


@admin.register(Etapa)
class EtapaAdmin(admin.ModelAdmin):
    list_display = ('programa', 'numero_etapa', 'modulo_principal', 'activo_logico', 'fecha_creacion')
    list_filter = ('modulo_principal', 'activo_logico', 'programa', 'fecha_creacion')
    search_fields = ('programa__nombre',)
    readonly_fields = ('fecha_creacion', 'fecha_modificacion')


@admin.register(FormularioEtapa)
class FormularioEtapaAdmin(admin.ModelAdmin):
    list_display = ('etapa', 'estado', 'fecha_creacion', 'fecha_publicacion')
    list_filter = ('estado',)
    readonly_fields = ('fecha_creacion',)


@admin.register(CampoFormulario)
class CampoFormularioAdmin(admin.ModelAdmin):
    list_display = ('formulario', 'campo_catalogo', 'orden', 'obligatorio')
    list_filter = ('obligatorio', 'formulario')
    search_fields = ('campo_catalogo',)
    ordering = ('formulario', 'orden')
