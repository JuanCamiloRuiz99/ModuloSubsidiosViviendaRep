import pytest
from unittest.mock import Mock
from shared.exceptions import (
    DomainException,
    EntityNotFoundException,
    InvalidEntityException,
    InvalidStateTransitionException,
)
from shared.file_validators import validate_uploaded_file, ALLOWED_EXTENSIONS, MAX_FILE_SIZE


class TestExceptions:
    """Pruebas unitarias para excepciones personalizadas."""

    def test_domain_exception_es_exception_base(self):
        """Prueba que DomainException herede de Exception."""
        exc = DomainException("Mensaje de error")

        assert isinstance(exc, Exception)
        assert str(exc) == "Mensaje de error"

    def test_entity_not_found_exception(self):
        """Prueba EntityNotFoundException."""
        exc = EntityNotFoundException("Entidad no encontrada")

        assert isinstance(exc, DomainException)
        assert str(exc) == "Entidad no encontrada"

    def test_invalid_entity_exception(self):
        """Prueba InvalidEntityException."""
        exc = InvalidEntityException("Entidad inválida")

        assert isinstance(exc, DomainException)
        assert str(exc) == "Entidad inválida"

    def test_invalid_state_transition_exception(self):
        """Prueba InvalidStateTransitionException."""
        exc = InvalidStateTransitionException("Transición inválida")

        assert isinstance(exc, DomainException)
        assert str(exc) == "Transición inválida"


class TestFileValidators:
    """Pruebas unitarias para validadores de archivos."""

    def test_validate_uploaded_file_valido(self):
        """Prueba validación exitosa de archivo válido."""
        mock_file = Mock()
        mock_file.name = "documento.pdf"
        mock_file.size = 1024 * 1024  # 1 MB

        result = validate_uploaded_file(mock_file)

        assert result is None

    def test_validate_uploaded_file_sin_archivo(self):
        """Prueba validación con archivo None."""
        result = validate_uploaded_file(None)

        assert result == "archivo es requerido."

    def test_validate_uploaded_file_extension_invalida(self):
        """Prueba validación con extensión no permitida."""
        mock_file = Mock()
        mock_file.name = "documento.exe"
        mock_file.size = 1024

        result = validate_uploaded_file(mock_file)

        assert "Tipo de archivo no permitido" in result
        assert ".exe" in result

    def test_validate_uploaded_file_tamaño_excedido(self):
        """Prueba validación con archivo demasiado grande."""
        mock_file = Mock()
        mock_file.name = "documento.pdf"
        mock_file.size = MAX_FILE_SIZE + 1

        result = validate_uploaded_file(mock_file)

        assert "excede el tamaño máximo" in result
        assert "5 MB" in result

    @pytest.mark.parametrize("extension", [".pdf", ".jpg", ".jpeg", ".png"])
    def test_validate_uploaded_file_extension_permitida(self, extension):
        """Prueba validación con todas las extensiones permitidas."""
        mock_file = Mock()
        mock_file.name = f"archivo{extension}"
        mock_file.size = 1024

        result = validate_uploaded_file(mock_file)

        assert result is None

    def test_validate_uploaded_file_extension_case_insensitive(self):
        """Prueba que la validación de extensión sea case insensitive."""
        mock_file = Mock()
        mock_file.name = "documento.PDF"
        mock_file.size = 1024

        result = validate_uploaded_file(mock_file)

        assert result is None

    def test_constants(self):
        """Prueba que las constantes estén definidas correctamente."""
        assert ".pdf" in ALLOWED_EXTENSIONS
        assert ".jpg" in ALLOWED_EXTENSIONS
        assert ".jpeg" in ALLOWED_EXTENSIONS
        assert ".png" in ALLOWED_EXTENSIONS
        assert len(ALLOWED_EXTENSIONS) == 4

        assert MAX_FILE_SIZE == 5 * 1024 * 1024  # 5 MB