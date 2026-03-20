"""
Infrastructure Layer - Modelo de Roles del Sistema

Define la tabla de roles con descripción base.
"""

from django.db import models


class Rol(models.Model):
    """Modelo ORM para Roles del Sistema"""

    NOMBRES_ROLES = (
        ("ADMIN", "Administrador"),
        ("FUNCIONARIO", "Funcionario"),
        ("TECNICO_VISITANTE", "Técnico Visitante"),
    )

    id_rol = models.AutoField(primary_key=True)

    nombre_rol = models.CharField(
        max_length=30,
        choices=NOMBRES_ROLES,
        unique=True,
        blank=False,
        null=False,
        help_text="Nombre único del rol",
        db_index=True,
    )

    descripcion = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        help_text="Descripción del rol",
    )

    class Meta:
        """Configuración de meta modelo"""
        db_table = "roles"
        verbose_name = "Rol del Sistema"
        verbose_name_plural = "Roles del Sistema"

    def __str__(self):
        return f"{self.nombre_rol}"

    def __repr__(self):
        return f"Rol(id={self.id_rol}, nombre='{self.nombre_rol}')"
