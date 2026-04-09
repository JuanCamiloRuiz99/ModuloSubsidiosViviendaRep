"""
Tests de integración API — endpoints principales vía DRF APIClient.

Requiere Django y la BD de pruebas.
"""
import pytest
from django.core import signing
from rest_framework.test import APIClient
from django.contrib.auth.hashers import make_password

from infrastructure.database.usuarios_models import UsuarioSistema
from infrastructure.database.roles_models import Rol


pytestmark = pytest.mark.django_db


@pytest.fixture
def roles(db):
    """Crea los 3 roles base."""
    r1, _ = Rol.objects.get_or_create(id_rol=1, defaults={"nombre_rol": "ADMIN", "descripcion": "Admin"})
    r2, _ = Rol.objects.get_or_create(id_rol=2, defaults={"nombre_rol": "FUNCIONARIO", "descripcion": "Func"})
    r3, _ = Rol.objects.get_or_create(id_rol=3, defaults={"nombre_rol": "TECNICO_VISITANTE", "descripcion": "Tec"})
    return r1, r2, r3


@pytest.fixture
def admin_user(roles):
    """Crea un admin con contraseña hasheada."""
    return UsuarioSistema.objects.create(
        nombre_completo="Admin Test",
        correo="admin_test@test.com",
        numero_documento="9999999901",
        password_hash=make_password("Admin123*"),
        id_rol=roles[0],
        activo=True,
    )


@pytest.fixture
def admin_token(admin_user):
    """Genera un token válido para el admin."""
    return signing.dumps(
        {"uid": admin_user.id_usuario, "rol": admin_user.id_rol_id},
        salt="auth-token",
    )


@pytest.fixture
def auth_client(admin_token):
    """APIClient pre-autenticado."""
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {admin_token}")
    return client


@pytest.fixture
def anon_client():
    """APIClient sin autenticación."""
    return APIClient()


# ──────── Login ────────


class TestLoginEndpoint:
    def test_login_exitoso(self, anon_client, admin_user):
        resp = anon_client.post(
            "/api/usuarios/login/",
            {"correo": "admin_test@test.com", "password": "Admin123*"},
            format="json",
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin_test@test.com"
        assert data["user"]["rolNombre"] == "ADMIN"

    def test_login_password_incorrecto(self, anon_client, admin_user):
        resp = anon_client.post(
            "/api/usuarios/login/",
            {"correo": "admin_test@test.com", "password": "WrongPass"},
            format="json",
        )
        assert resp.status_code == 401
        assert "error" in resp.json()

    def test_login_correo_inexistente(self, anon_client, roles):
        resp = anon_client.post(
            "/api/usuarios/login/",
            {"correo": "noexiste@test.com", "password": "x"},
            format="json",
        )
        assert resp.status_code == 401

    def test_login_campos_vacios(self, anon_client, roles):
        resp = anon_client.post(
            "/api/usuarios/login/",
            {"correo": "", "password": ""},
            format="json",
        )
        assert resp.status_code == 400

    def test_login_usuario_inactivo(self, anon_client, roles):
        inactive = UsuarioSistema.objects.create(
            nombre_completo="Inactivo",
            correo="inactivo@test.com",
            numero_documento="8888888801",
            password_hash=make_password("Pass123*"),
            id_rol=roles[0],
            activo=False,
        )
        resp = anon_client.post(
            "/api/usuarios/login/",
            {"correo": "inactivo@test.com", "password": "Pass123*"},
            format="json",
        )
        assert resp.status_code == 403


# ──────── Usuarios CRUD ────────


class TestUsuariosEndpoint:
    def test_listar_requiere_auth(self, anon_client, roles):
        resp = anon_client.get("/api/usuarios/")
        assert resp.status_code == 401

    def test_listar_con_auth(self, auth_client, admin_user):
        resp = auth_client.get("/api/usuarios/")
        assert resp.status_code == 200
        # DRF puede usar pagination o lista directa
        data = resp.json()
        assert "results" in data or isinstance(data, list)


# ──────── Programas ────────


class TestProgramasEndpoint:
    def test_listar_publico(self, anon_client, roles):
        resp = anon_client.get("/api/programas/")
        assert resp.status_code == 200

    def test_crear_programa_requiere_auth(self, anon_client, roles):
        resp = anon_client.post(
            "/api/programas/",
            {"nombre": "Test", "descripcion": "Desc larga desc", "entidad_responsable": "Ent"},
            format="json",
        )
        assert resp.status_code == 401

    def test_crear_programa_con_auth(self, auth_client):
        resp = auth_client.post(
            "/api/programas/",
            {
                "nombre": "Programa Test",
                "descripcion": "Descripción del programa de prueba con suficientes caracteres",
                "entidad_responsable": "Alcaldía Test",
            },
            format="json",
        )
        assert resp.status_code == 201
        data = resp.json()
        assert data["nombre"] == "Programa Test"
        assert data["estado"] == "BORRADOR"

    def test_estadisticas_requiere_auth(self, anon_client, roles):
        resp = anon_client.get("/api/programas/estadisticas/")
        assert resp.status_code == 401

    def test_estadisticas_con_auth(self, auth_client):
        resp = auth_client.get("/api/programas/estadisticas/")
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "por_estado" in data


# ──────── Etapas ────────


class TestEtapasEndpoint:
    def test_listar_publico(self, anon_client, roles):
        resp = anon_client.get("/api/etapas/")
        assert resp.status_code == 200

    def test_listar_con_auth(self, auth_client):
        resp = auth_client.get("/api/etapas/")
        assert resp.status_code == 200


# ──────── Dashboard ────────


class TestDashboardEndpoint:
    def test_dashboard_requiere_auth(self, anon_client, roles):
        resp = anon_client.get("/api/dashboard/estadisticas/")
        assert resp.status_code == 401

    def test_dashboard_con_auth(self, auth_client):
        resp = auth_client.get("/api/dashboard/estadisticas/")
        assert resp.status_code == 200
        data = resp.json()
        assert "programas" in data
        assert "etapas" in data


# ──────── Token expirado / malformado ────────


class TestAuthEdgeCases:
    def test_token_malformado(self, roles):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Bearer este_no_es_un_token_valido")
        resp = client.get("/api/usuarios/")
        assert resp.status_code == 401

    def test_token_con_wrong_salt(self, admin_user):
        bad_token = signing.dumps(
            {"uid": admin_user.id_usuario},
            salt="wrong-salt",
        )
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {bad_token}")
        resp = client.get("/api/usuarios/")
        assert resp.status_code == 401
