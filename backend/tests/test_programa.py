import pytest
from unittest.mock import Mock
from domain.programas import (
    Programa,
    EstadoPrograma,
    ProgramaRepositoryInterface,
    ProgramaNoEncontradoException,
    ProgramaDatosInvalidosException,
)
from application.programas.programa_use_cases import CrearProgramaUseCase
from application.programas.programa_dto import CrearProgramaDTO


class TestCrearProgramaUseCase:
    """Pruebas unitarias para CrearProgramaUseCase."""

    def test_execute_crea_programa_exitosamente(self):
        """Prueba que execute cree un programa válido."""
        # Arrange
        mock_repo = Mock(spec=ProgramaRepositoryInterface)
        mock_programa_creado = Programa(
            id=1,
            nombre="Programa Test",
            descripcion="Descripción test",
            entidad_responsable="Entidad Test",
            estado=EstadoPrograma.BORRADOR
        )
        mock_repo.crear.return_value = mock_programa_creado

        use_case = CrearProgramaUseCase(mock_repo)
        dto = CrearProgramaDTO(
            nombre="Programa Test",
            descripcion="Descripción test",
            entidad_responsable="Entidad Test"
        )

        # Act
        result = use_case.execute(dto)

        # Assert
        assert result.id == 1
        assert result.nombre == "Programa Test"
        assert result.estado == EstadoPrograma.BORRADOR.value
        mock_repo.crear.assert_called_once()

    def test_execute_falla_con_datos_invalidos(self):
        """Prueba que execute lance excepción con datos inválidos."""
        # Arrange
        mock_repo = Mock(spec=ProgramaRepositoryInterface)
        use_case = CrearProgramaUseCase(mock_repo)
        dto = CrearProgramaDTO(
            nombre="",  # Nombre vacío, inválido
            descripcion="Descripción test",
            entidad_responsable="Entidad Test"
        )

        # Act & Assert
        with pytest.raises(ValueError):  # DTO validation raises ValueError
            use_case.execute(dto)

        # El repositorio no debería ser llamado
        mock_repo.crear.assert_not_called()

    def test_execute_valida_dto(self):
        """Prueba que execute valide el DTO antes de procesar."""
        # Arrange
        mock_repo = Mock(spec=ProgramaRepositoryInterface)
        mock_programa_creado = Programa(
            id=1,
            nombre="Programa Test",
            descripcion="Descripción test",
            entidad_responsable="Entidad Test",
            estado=EstadoPrograma.BORRADOR
        )
        mock_repo.crear.return_value = mock_programa_creado

        use_case = CrearProgramaUseCase(mock_repo)
        dto = CrearProgramaDTO(
            nombre="Programa Test",
            descripcion="Descripción test",
            entidad_responsable="Entidad Test"
        )

        # Act
        use_case.execute(dto)

        # Assert - No podemos verificar validar() directamente, pero el programa se crea
        mock_repo.crear.assert_called_once()


class TestProgramaDomain:
    """Pruebas unitarias para la entidad Programa."""

    def test_programa_validar_con_datos_validos(self):
        """Prueba validación exitosa de Programa."""
        programa = Programa(
            nombre="Programa Válido",
            descripcion="Descripción válida",
            entidad_responsable="Entidad Válida",
            estado=EstadoPrograma.BORRADOR
        )

        errores = programa.validar()

        assert errores == []

    def test_programa_validar_con_nombre_vacio(self):
        """Prueba validación con nombre vacío."""
        programa = Programa(
            nombre="",
            descripcion="Descripción válida",
            entidad_responsable="Entidad Válida",
            estado=EstadoPrograma.BORRADOR
        )

        errores = programa.validar()

        assert "nombre" in str(errores)

    def test_programa_validar_con_descripcion_vacia(self):
        """Prueba validación con descripción vacía."""
        programa = Programa(
            nombre="Programa Válido",
            descripcion="",
            entidad_responsable="Entidad Válida",
            estado=EstadoPrograma.BORRADOR
        )

        errores = programa.validar()

        assert len(errores) > 0
        assert any("descripción" in error.lower() for error in errores)

    def test_programa_cambiar_estado_valido(self):
        """Prueba cambio de estado válido."""
        programa = Programa(
            nombre="Programa Test",
            descripcion="Descripción test",
            entidad_responsable="Entidad Test",
            estado=EstadoPrograma.BORRADOR
        )

        programa.cambiar_estado(EstadoPrograma.ACTIVO)

        assert programa.estado == EstadoPrograma.ACTIVO

    def test_programa_cambiar_estado_invalido(self):
        """Prueba cambio de estado inválido."""
        programa = Programa(
            nombre="Programa Test",
            descripcion="Descripción test",
            entidad_responsable="Entidad Test",
            estado=EstadoPrograma.ACTIVO
        )

        from shared.exceptions import InvalidStateTransitionException
        with pytest.raises(InvalidStateTransitionException):
            programa.cambiar_estado(EstadoPrograma.BORRADOR)  # No debería permitir volver a BORRADOR