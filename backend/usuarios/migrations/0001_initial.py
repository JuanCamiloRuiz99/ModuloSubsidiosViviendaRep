"""
Generated migration for UsuarioSistema

Manual inicial para crear la tabla usuarios_sistema.
"""

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='UsuarioSistema',
            fields=[
                ('id_usuario', models.AutoField(primary_key=True, serialize=False)),
                ('nombre_completo', models.CharField(max_length=200)),
                ('correo', models.EmailField(max_length=200, unique=True)),
                ('password_hash', models.CharField(max_length=255)),
                ('rol', models.CharField(
                    choices=[
                        ('ADMIN', 'Administrador'),
                        ('FUNCIONARIO', 'Funcionario'),
                        ('VISITADOR_TECNICO', 'Visitador Técnico')
                    ],
                    default='FUNCIONARIO',
                    max_length=20
                )),
                ('activo', models.BooleanField(default=True)),
                ('activo_logico', models.BooleanField(default=True, db_index=True, help_text='Soft delete: False cuando se elimina lógicamente')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_modificacion', models.DateTimeField(auto_now=True)),
                ('usuario_creacion', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='usuarios_creados',
                    to='usuarios.usuariosistema'
                )),
                ('usuario_modificacion', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='usuarios_modificados',
                    to='usuarios.usuariosistema'
                )),
            ],
            options={
                'db_table': 'usuarios_sistema',
                'verbose_name': 'Usuario del Sistema',
                'verbose_name_plural': 'Usuarios del Sistema',
            },
        ),
    ]
