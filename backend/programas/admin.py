from django.contrib import admin
from .models import Programa


@admin.register(Programa)
class ProgramaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'codigo_programa', 'estado', 'entidad_responsable', 'fecha_creacion')
    list_filter = ('estado', 'fecha_creacion', 'entidad_responsable')
    search_fields = ('nombre', 'codigo_programa', 'descripcion')
    readonly_fields = ('codigo_programa', 'fecha_creacion', 'fecha_actualizacion')
    
    fieldsets = (
        ('Información del Programa', {
            'fields': ('nombre', 'descripcion', 'codigo_programa')
        }),
        ('Administración', {
            'fields': ('estado', 'entidad_responsable')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editando
            return self.readonly_fields + ('nombre',)  # Nombre no se puede cambiar al editar
        return self.readonly_fields
