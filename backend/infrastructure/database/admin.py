"""
Configuración del admin de Django para visualizar modelos
"""
from django.contrib import admin
from .models import Programa, Etapa, Postulante, TipoDocumento


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


@admin.register(Etapa)
class EtapaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'programa', 'estado', 'orden', 'fecha_creacion')
    list_filter = ('estado', 'programa', 'fecha_creacion')
    search_fields = ('nombre', 'descripcion', 'programa__nombre')
    readonly_fields = ('fecha_creacion', 'fecha_actualizacion')
    list_editable = ('orden',)


@admin.register(TipoDocumento)
class TipoDocumentoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)


@admin.register(Postulante)
class PostulanteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'apellido', 'numero_documento', 'programa', 'estado', 'fecha_postulacion')
    list_filter = ('estado', 'programa', 'fecha_postulacion')
    search_fields = ('nombre', 'apellido', 'numero_documento', 'email')
    readonly_fields = ('fecha_postulacion', 'fecha_actualizacion')
