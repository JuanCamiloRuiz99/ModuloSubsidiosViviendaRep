"""
Tests de autenticación — SignedTokenAuthentication + login endpoint.

Requiere Django y la BD de pruebas.
"""
import pytest
from unittest.mock import MagicMock, patch
from django.core import signing
from django.test import RequestFactory

from infrastructure.authentication import SignedTokenAuthentication, TOKEN_MAX_AGE


pytestmark = pytest.mark.django_db


@pytest.fixture
def auth_backend():
    return SignedTokenAuthentication()


@pytest.fixture
def rf():
    return RequestFactory()


@pytest.fixture
def usuario_activo(db):
    """Crea un UsuarioSistema activo en la BD de pruebas."""
    from infrastructure.database.usuarios_models import UsuarioSistema
    from infrastructure.database.roles_models import Rol

    rol, _ = Rol.objects.get_or_create(
        id_rol=1, defaults={"nombre_rol": "ADMIN", "descripcion": "Administrador"}
    )
    return UsuarioSistema.objects.create(
        nombre_completo="Test Admin",
        correo="testadmin@test.com",
        numero_documento="1234567890",
        password_hash="pbkdf2_sha256$260000$test_hash_placeholder_xxx",
        id_rol=rol,
        activo=True,
    )


class TestSignedTokenAuthentication:
    def test_no_auth_header_returns_none(self, auth_backend, rf):
        request = rf.get("/api/test/")
        result = auth_backend.authenticate(request)
        assert result is None

    def test_invalid_prefix_returns_none(self, auth_backend, rf):
        request = rf.get("/api/test/", HTTP_AUTHORIZATION="Token abc123")
        result = auth_backend.authenticate(request)
        assert result is None

    def test_malformed_header_returns_none(self, auth_backend, rf):
        request = rf.get("/api/test/", HTTP_AUTHORIZATION="Bearer")
        result = auth_backend.authenticate(request)
        assert result is None

    def test_invalid_token_raises(self, auth_backend, rf):
        from rest_framework.exceptions import AuthenticationFailed

        request = rf.get("/api/test/", HTTP_AUTHORIZATION="Bearer invalid_token_xxx")
        with pytest.raises(AuthenticationFailed, match="inválido"):
            auth_backend.authenticate(request)

    def test_valid_token_returns_user(self, auth_backend, rf, usuario_activo):
        token = signing.dumps(
            {"uid": usuario_activo.id_usuario, "rol": usuario_activo.id_rol_id},
            salt="auth-token",
        )
        request = rf.get("/api/test/", HTTP_AUTHORIZATION=f"Bearer {token}")
        user, returned_token = auth_backend.authenticate(request)
        assert user.pk == usuario_activo.pk
        assert returned_token == token

    def test_expired_token_raises(self, auth_backend, rf, usuario_activo):
        from rest_framework.exceptions import AuthenticationFailed

        token = signing.dumps(
            {"uid": usuario_activo.id_usuario},
            salt="auth-token",
        )
        with patch("infrastructure.authentication.TOKEN_MAX_AGE", 0):
            # Force max_age=0 to simulate expired token
            backend = SignedTokenAuthentication()
            request = rf.get("/api/test/", HTTP_AUTHORIZATION=f"Bearer {token}")
            # signing.loads with max_age=0 should raise SignatureExpired
            # but only if some time has passed; we monkeypatch instead
            with patch.object(signing, "loads", side_effect=signing.SignatureExpired("expired")):
                with pytest.raises(AuthenticationFailed, match="expirado"):
                    backend.authenticate(request)

    def test_inactive_user_raises(self, auth_backend, rf, usuario_activo):
        from rest_framework.exceptions import AuthenticationFailed

        usuario_activo.activo = False
        usuario_activo.save()

        token = signing.dumps(
            {"uid": usuario_activo.id_usuario, "rol": usuario_activo.id_rol_id},
            salt="auth-token",
        )
        request = rf.get("/api/test/", HTTP_AUTHORIZATION=f"Bearer {token}")
        with pytest.raises(AuthenticationFailed, match="inactivo"):
            auth_backend.authenticate(request)

    def test_nonexistent_user_raises(self, auth_backend, rf, db):
        from rest_framework.exceptions import AuthenticationFailed

        token = signing.dumps({"uid": 99999, "rol": 1}, salt="auth-token")
        request = rf.get("/api/test/", HTTP_AUTHORIZATION=f"Bearer {token}")
        with pytest.raises(AuthenticationFailed):
            auth_backend.authenticate(request)

    def test_token_without_uid_raises(self, auth_backend, rf, db):
        from rest_framework.exceptions import AuthenticationFailed

        token = signing.dumps({"rol": 1}, salt="auth-token")
        request = rf.get("/api/test/", HTTP_AUTHORIZATION=f"Bearer {token}")
        with pytest.raises(AuthenticationFailed, match="inválido"):
            auth_backend.authenticate(request)

    def test_authenticate_header(self, auth_backend, rf):
        request = rf.get("/api/test/")
        assert auth_backend.authenticate_header(request) == "Bearer"

    def test_usuario_is_authenticated_property(self, usuario_activo):
        assert usuario_activo.is_authenticated is True
        assert usuario_activo.is_anonymous is False
