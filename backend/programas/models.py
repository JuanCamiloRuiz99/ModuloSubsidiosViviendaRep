from django.db import models

from django.db import models


class Programa(models.Model):

    ESTADOS = [
        ('BORRADOR', 'Borrador'),
        ('ACTIVO', 'Activo'),
        ('INHABILITADO', 'Inhabilitado'),
    ]

    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    entidad_responsable = models.CharField(max_length=255)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='BORRADOR')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

