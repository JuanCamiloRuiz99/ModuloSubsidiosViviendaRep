"""
Modelos de base de datos para la capa de infraestructura.

Estos modelos Django mapean directamente a las entidades de dominio.
"""
from django.db import models
import uuid


class Programa(models.Model):
    """Modelo ORM para el programa de subsidios de vivienda"""

    ESTADOS = [
        ('BORRADOR', 'Borrador'),
        ('ACTIVO', 'Activo'),
        ('INHABILITADO', 'Inhabilitado'),
    ]

    nombre = models.CharField(max_length=255, blank=False)
    descripcion = models.TextField(blank=False)
    entidad_responsable = models.CharField(max_length=255, blank=False)
    codigo_programa = models.CharField(max_length=20, unique=True, blank=False)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='BORRADOR')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Programa'
        verbose_name_plural = 'Programas'
        db_table = 'programas_programa'

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


class Etapa(models.Model):
    """Modelo ORM para las etapas de un programa"""

    ESTADOS = [
        ('CONFIGURADA', 'Configurada'),
        ('ACTIVA', 'Activa'),
        ('CERRADA', 'Cerrada'),
    ]

    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='etapas')
    nombre = models.CharField(max_length=255, blank=False)
    descripcion = models.TextField()
    estado = models.CharField(max_length=20, choices=ESTADOS, default='CONFIGURADA')
    orden = models.PositiveIntegerField(default=1)
    fecha_inicio = models.DateTimeField(null=True, blank=True)
    fecha_fin = models.DateTimeField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['programa', 'orden']
        verbose_name = 'Etapa'
        verbose_name_plural = 'Etapas'
        db_table = 'programas_etapa'
        unique_together = ['programa', 'nombre']

    def __str__(self):
        return f"{self.programa.nombre} - {self.nombre}"


class TipoDocumento(models.Model):
    """Tipos de documentos permitidos para postulantes"""
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Tipo de Documento'
        verbose_name_plural = 'Tipos de Documento'
        db_table = 'programas_tipo_documento'

    def __str__(self):
        return self.nombre


class Postulante(models.Model):
    """Modelo ORM para los postulantes a un programa"""

    ESTADOS = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
        ('RECHAZADO', 'Rechazado'),
        ('APROBADO', 'Aprobado'),
        ('SUSPENDIDO', 'Suspendido'),
    ]

    programa = models.ForeignKey(Programa, on_delete=models.CASCADE, related_name='postulantes')
    nombre = models.CharField(max_length=255, blank=False)
    apellido = models.CharField(max_length=255, blank=False)
    tipo_documento = models.ForeignKey(TipoDocumento, on_delete=models.SET_NULL, null=True)
    numero_documento = models.CharField(max_length=20, unique=True, blank=False)
    email = models.EmailField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ACTIVO')
    fecha_postulacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_postulacion']
        verbose_name = 'Postulante'
        verbose_name_plural = 'Postulantes'
        db_table = 'programas_postulante'

    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.numero_documento})"

class Usuario(models.Model):
    """Modelo ORM para usuarios del sistema (empleados)"""

    ROLES = [
        ('ADMINISTRADOR', 'Administrador'),
        ('FUNCIONARIO', 'Funcionario'),
        ('TECNICO', 'Técnico'),
    ]

    ESTADOS = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    ]

    nombre = models.CharField(max_length=255, blank=False)
    apellidos = models.CharField(max_length=255, blank=False)
    numero_documento = models.CharField(max_length=20, unique=True, blank=False)
    correo = models.EmailField(unique=True, blank=False)
    rol = models.CharField(max_length=20, choices=ROLES, default='FUNCIONARIO')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='ACTIVO')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        db_table = 'usuarios_usuario'

    def __str__(self):
        return f"{self.nombre} {self.apellidos} ({self.numero_documento})"