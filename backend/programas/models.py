from django.db import models
import uuid


class Programa(models.Model):

    ESTADOS = [
        ('BORRADOR', 'Borrador'),
        ('ACTIVO', 'Activo'),
        ('INHABILITADO', 'Inhabilitado'),
    ]

    nombre = models.CharField(max_length=255)
    descripcion = models.TextField()
    entidad_responsable = models.CharField(max_length=255)
    codigo_programa = models.CharField(max_length=20, unique=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='BORRADOR')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Programa'
        verbose_name_plural = 'Programas'

    def __str__(self):
        return f"{self.nombre} ({self.codigo_programa})"

    def save(self, *args, **kwargs):
        # Generar código automático si no existe
        if not self.codigo_programa:
            from datetime import datetime
            year = datetime.now().year
            random_suffix = str(uuid.uuid4().hex[:4]).upper()
            self.codigo_programa = f"{year}BS{random_suffix}"
        super().save(*args, **kwargs)

