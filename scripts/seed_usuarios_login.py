"""
Seed de usuarios de prueba para login con diferentes roles.

Ejecutar:
    python seed_usuarios_login.py
"""
import os
import sys
import django
from seed_setup import setup_django_path

# Configurar Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
setup_django_path()
django.setup()

from django.contrib.auth.hashers import make_password
from infrastructure.database.roles_models import Rol
from infrastructure.database.usuarios_models import UsuarioSistema


USUARIOS = [
    {
        "nombre_completo": "Carlos Admin",
        "correo": "admin@alcaldia.gov.co",
        "numero_documento": "1000000001",
        "password": "Admin123*",
        "rol_id": 1,  # ADMIN
    },
    {
        "nombre_completo": "María Funcionaria",
        "correo": "funcionario@alcaldia.gov.co",
        "numero_documento": "1000000002",
        "password": "Func123*",
        "rol_id": 2,  # FUNCIONARIO
    },
    {
        "nombre_completo": "Juan Técnico",
        "correo": "tecnico@alcaldia.gov.co",
        "numero_documento": "1000000003",
        "password": "Tec123*",
        "rol_id": 3,  # TECNICO_VISITANTE
    },
]


def seed():
    # Asegurar que los roles existen
    roles_data = [
        (1, "ADMIN", "Administrador del sistema"),
        (2, "FUNCIONARIO", "Funcionario de la alcaldía"),
        (3, "TECNICO_VISITANTE", "Técnico visitante de campo"),
    ]
    for rid, nombre, desc in roles_data:
        Rol.objects.get_or_create(
            id_rol=rid,
            defaults={"nombre_rol": nombre, "descripcion": desc},
        )
    print("Roles verificados OK")

    for u in USUARIOS:
        usuario, created = UsuarioSistema.objects.get_or_create(
            correo=u["correo"],
            defaults={
                "nombre_completo": u["nombre_completo"],
                "numero_documento": u["numero_documento"],
                "password_hash": make_password(u["password"]),
                "id_rol_id": u["rol_id"],
                "activo": True,
                "activo_logico": True,
            },
        )
        if created:
            print(f"  [+] Creado: {u['correo']}  (rol={u['rol_id']})")
        else:
            # Actualizar password por si cambió
            usuario.password_hash = make_password(u["password"])
            usuario.activo = True
            usuario.activo_logico = True
            usuario.save(update_fields=["password_hash", "activo", "activo_logico"])
            print(f"  [=] Ya existía, password actualizado: {u['correo']}")

    print("\n--- Seed completado ---")


if __name__ == "__main__":
    seed()
