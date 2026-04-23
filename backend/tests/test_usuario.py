import pytest
from datetime import datetime
from unittest.mock import Mock
from domain.usuarios import Usuario, RolUsuario, UsuarioRepository
from application.usuarios.usuario_use_cases import CrearUsuarioUseCase, ObtenerUsuarioUseCase
from application.usuarios.usuario_dto import CrearUsuarioDTO, ObtenerUsuarioDTO


class TestUsuario:
    """Pruebas unitarias para la entidad Usuario."""

    def test_usuario_creacion_con_datos_validos(self):
        """Prueba creación de usuario con datos válidos."""
        usuario = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password",
            rol=RolUsuario.FUNCIONARIO,
            activo=True,
            numero_documento="12345678",
            usuario_creacion=1
        )

        assert usuario.id_usuario == 1
        assert usuario.nombre_completo == "Juan Pérez"
        assert usuario.correo == "juan@example.com"
        assert usuario.rol == RolUsuario.FUNCIONARIO
        assert usuario.activo is True
        assert usuario.numero_documento == "12345678"

    def test_cambiar_estado(self):
        """Prueba cambio de estado del usuario."""
        usuario = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password",
            rol=RolUsuario.FUNCIONARIO
        )

        # Cambiar a inactivo
        usuario.cambiar_estado(False)

        assert usuario.activo is False
        assert usuario.fecha_modificacion is not None

    def test_cambiar_rol(self):
        """Prueba cambio de rol del usuario."""
        usuario = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password",
            rol=RolUsuario.FUNCIONARIO
        )

        # Cambiar rol
        usuario.cambiar_rol(RolUsuario.ADMIN)

        assert usuario.rol == RolUsuario.ADMIN
        assert usuario.fecha_modificacion is not None

    def test_actualizar_nombre(self):
        """Prueba actualización del nombre."""
        usuario = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password",
            rol=RolUsuario.FUNCIONARIO
        )

        # Actualizar nombre
        usuario.actualizar_nombre("Juan Carlos Pérez")

        assert usuario.nombre_completo == "Juan Carlos Pérez"
        assert usuario.fecha_modificacion is not None

    def test_to_primitives(self):
        """Prueba conversión a diccionario primitivo."""
        usuario = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password",
            rol=RolUsuario.FUNCIONARIO,
            activo=True,
            numero_documento="12345678"
        )

        primitives = usuario.to_primitives()

        assert primitives["id_usuario"] == 1
        assert primitives["nombre_completo"] == "Juan Pérez"
        assert primitives["correo"] == "juan@example.com"
        assert primitives["rol"] == "FUNCIONARIO"
        assert primitives["activo"] is True
        # numero_documento no está incluido en to_primitives

    def test_from_primitives(self):
        """Prueba creación desde diccionario primitivo."""
        data = {
            "id_usuario": 1,
            "nombre_completo": "Juan Pérez",
            "correo": "juan@example.com",
            "password_hash": "hashed_password",
            "rol": "FUNCIONARIO",
            "activo": True,
            "numero_documento": "12345678"
        }

        usuario = Usuario.from_primitives(data)

        assert usuario.id_usuario == 1
        assert usuario.nombre_completo == "Juan Pérez"
        assert usuario.correo == "juan@example.com"
        assert usuario.rol == RolUsuario.FUNCIONARIO
        assert usuario.activo is True
        # numero_documento se asigna en el constructor pero no se usa en from_primitives


class TestCrearUsuarioUseCase:
    """Pruebas unitarias para CrearUsuarioUseCase."""

    def test_execute_crea_usuario_exitosamente(self):
        """Prueba que execute cree un usuario válido."""
        # Arrange
        mock_repo = Mock(spec=UsuarioRepository)
        mock_repo.obtener_por_correo.return_value = None
        mock_usuario_creado = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password_12345678901234567890",
            rol=RolUsuario.FUNCIONARIO,
            activo=True
        )
        mock_repo.crear.return_value = mock_usuario_creado

        use_case = CrearUsuarioUseCase(mock_repo)
        dto = CrearUsuarioDTO(
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password_12345678901234567890",  # Hash válido (más de 20 chars)
            rol=RolUsuario.FUNCIONARIO,
            usuario_creacion=1
        )

        # Act
        result = use_case.execute(dto)

        # Assert
        assert result.id_usuario == 1
        assert result.nombre_completo == "Juan Pérez"
        assert result.rol == RolUsuario.FUNCIONARIO.value
        mock_repo.crear.assert_called_once()

    def test_execute_falla_con_correo_duplicado(self):
        """Prueba que execute lance excepción con correo duplicado."""
        # Arrange
        mock_repo = Mock()
        mock_repo.obtener_por_correo.return_value = Mock()  # Usuario existente

        use_case = CrearUsuarioUseCase(mock_repo)
        dto = CrearUsuarioDTO(
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password_12345678901234567890",  # Hash válido
            rol=RolUsuario.FUNCIONARIO,
            usuario_creacion=1
        )

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            use_case.execute(dto)

        assert "ya está registrado" in str(exc_info.value)
        mock_repo.crear.assert_not_called()


class TestObtenerUsuarioUseCase:
    """Pruebas unitarias para ObtenerUsuarioUseCase."""

    def test_execute_obtiene_usuario_existente(self):
        """Prueba que execute obtenga un usuario existente."""
        # Arrange
        mock_repo = Mock(spec=UsuarioRepository)
        mock_usuario = Usuario(
            id_usuario=1,
            nombre_completo="Juan Pérez",
            correo="juan@example.com",
            password_hash="hashed_password",
            rol=RolUsuario.FUNCIONARIO
        )
        mock_repo.obtener_por_id.return_value = mock_usuario

        use_case = ObtenerUsuarioUseCase(mock_repo)
        dto = ObtenerUsuarioDTO(id_usuario=1)

        # Act
        result = use_case.execute(dto)

        # Assert
        assert result.id_usuario == 1
        assert result.nombre_completo == "Juan Pérez"
        mock_repo.obtener_por_id.assert_called_once_with(1)

    def test_execute_falla_con_usuario_inexistente(self):
        """Prueba que execute lance excepción con usuario inexistente."""
        # Arrange
        mock_repo = Mock(spec=UsuarioRepository)
        mock_repo.obtener_por_id.return_value = None

        use_case = ObtenerUsuarioUseCase(mock_repo)
        dto = ObtenerUsuarioDTO(id_usuario=999)

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            use_case.execute(dto)

        assert "no encontrado" in str(exc_info.value)