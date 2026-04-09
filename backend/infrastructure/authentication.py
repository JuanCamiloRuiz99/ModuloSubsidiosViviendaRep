"""
Custom DRF authentication backend.

Validates Bearer tokens created with django.core.signing.dumps()
in the login endpoint (UsuarioViewSet.login).
"""
import logging

from django.core import signing
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from infrastructure.database.usuarios_models import UsuarioSistema

logger = logging.getLogger(__name__)

# Tokens are valid for 24 hours.
TOKEN_MAX_AGE = 86400


class SignedTokenAuthentication(BaseAuthentication):
    """Authenticate requests via ``Authorization: Bearer <signed-token>``."""

    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        token = parts[1]

        try:
            payload = signing.loads(token, salt='auth-token', max_age=TOKEN_MAX_AGE)
        except signing.SignatureExpired:
            raise AuthenticationFailed('Token expirado.')
        except signing.BadSignature:
            raise AuthenticationFailed('Token inválido.')

        uid = payload.get('uid')
        if uid is None:
            raise AuthenticationFailed('Token inválido.')

        try:
            usuario = UsuarioSistema.objects.get(pk=uid, activo=True)
        except UsuarioSistema.DoesNotExist:
            raise AuthenticationFailed('Usuario no encontrado o inactivo.')

        return (usuario, token)

    def authenticate_header(self, request):
        return self.keyword
