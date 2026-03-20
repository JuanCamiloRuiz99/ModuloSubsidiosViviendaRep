"""
Migración inicial de Usuarios Sistema

Crea la tabla usuarios_sistema con todos los campos requeridos.
"""

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("database", "0001_initial"),  # Ajusta según migraciones existentes
    ]

    operations = [
        migrations.CreateModel(
            name="UsuarioSistema",
            fields=[
                (
                    "id_usuario",
                    models.AutoField(
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID Usuario"
                    ),
                ),
                (
                    "nombre_completo",
                    models.CharField(
                        max_length=200,
                        verbose_name="Nombre Completo"
                    ),
                ),
                (
                    "correo",
                    models.EmailField(
                        max_length=200,
                        unique=True,
                        verbose_name="Correo"
                    ),
                ),
                (
                    "password_hash",
                    models.CharField(
                        max_length=255,
                        verbose_name="Hash Contraseña"
                    ),
                ),
                (
                    "rol",
                    models.CharField(
                        choices=[
                            ("ADMIN", "Administrador"),
                            ("FUNCIONARIO", "Funcionario"),
                            ("VISITADOR_TECNICO", "Visitador Técnico"),
                        ],
                        default="FUNCIONARIO",
                        max_length=20,
                        verbose_name="Rol"
                    ),
                ),
                (
                    "activo",
                    models.BooleanField(
                        default=True,
                        verbose_name="Activo"
                    ),
                ),
                (
                    "activo_logico",
                    models.BooleanField(
                        default=True,
                        verbose_name="Activo Lógico"
                    ),
                ),
                (
                    "fecha_creacion",
                    models.DateTimeField(
                        auto_now_add=True,
                        verbose_name="Fecha Creación"
                    ),
                ),
                (
                    "fecha_modificacion",
                    models.DateTimeField(
                        blank=True,
                        null=True,
                        verbose_name="Fecha Modificación"
                    ),
                ),
                (
                    "usuario_creacion",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="usuarios_creados",
                        to="database.usuariosistema",
                        verbose_name="Usuario Creación"
                    ),
                ),
                (
                    "usuario_modificacion",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="usuarios_modificados",
                        to="database.usuariosistema",
                        verbose_name="Usuario Modificación"
                    ),
                ),
            ],
            options={
                "verbose_name": "Usuario Sistema",
                "verbose_name_plural": "Usuarios Sistema",
                "db_table": "usuarios_sistema",
                "ordering": ["-fecha_creacion"],
            },
        ),
        migrations.AddIndex(
            model_name="usuariosistema",
            index=models.Index(
                fields=["correo"],
                name="usuario_correo_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="usuariosistema",
            index=models.Index(
                fields=["rol"],
                name="usuario_rol_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="usuariosistema",
            index=models.Index(
                fields=["activo"],
                name="usuario_activo_idx",
            ),
        ),
    ]
