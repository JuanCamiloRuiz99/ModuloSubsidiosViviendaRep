import pytest
from domain.postulantes.postulacion import Postulacion, EstadoPostulacion
from shared.exceptions import InvalidStateTransitionException


class TestPostulacion:
    """Pruebas unitarias para la entidad Postulacion."""

    def test_cambiar_estado_transicion_valida(self):
        """Prueba que cambiar_estado funcione con transiciones válidas."""
        postulacion = Postulacion(programa_id=1, estado=EstadoPostulacion.REGISTRADA)

        # Transición válida: REGISTRADA -> EN_REVISION
        postulacion.cambiar_estado(EstadoPostulacion.EN_REVISION)

        assert postulacion.estado == EstadoPostulacion.EN_REVISION

    def test_cambiar_estado_transicion_invalida(self):
        """Prueba que cambiar_estado lance excepción con transiciones inválidas."""
        postulacion = Postulacion(programa_id=1, estado=EstadoPostulacion.REGISTRADA)

        # Transición inválida: REGISTRADA -> APROBADA
        with pytest.raises(InvalidStateTransitionException) as exc_info:
            postulacion.cambiar_estado(EstadoPostulacion.APROBADA)

        assert "No se puede pasar de REGISTRADA a APROBADA" in str(exc_info.value)

    def test_cambiar_estado_con_string(self):
        """Prueba que cambiar_estado acepte strings y los convierta a Enum."""
        postulacion = Postulacion(programa_id=1, estado=EstadoPostulacion.EN_REVISION)

        # Usar string en lugar de Enum
        postulacion.cambiar_estado('SUBSANACION')

        assert postulacion.estado == EstadoPostulacion.SUBSANACION

    def test_cambiar_estado_desde_visita_programada_a_realizada(self):
        """Prueba transición específica: VISITA_PROGRAMADA -> VISITA_REALIZADA."""
        postulacion = Postulacion(programa_id=1, estado=EstadoPostulacion.VISITA_PROGRAMADA)

        postulacion.cambiar_estado(EstadoPostulacion.VISITA_REALIZADA)

        assert postulacion.estado == EstadoPostulacion.VISITA_REALIZADA

    def test_cambiar_estado_desde_visita_realizada_a_documentos_cargados(self):
        """Prueba transición: VISITA_REALIZADA -> DOCUMENTOS_CARGADOS."""
        postulacion = Postulacion(programa_id=1, estado=EstadoPostulacion.VISITA_REALIZADA)

        postulacion.cambiar_estado(EstadoPostulacion.DOCUMENTOS_CARGADOS)

        assert postulacion.estado == EstadoPostulacion.DOCUMENTOS_CARGADOS

    def test_cambiar_estado_a_estado_final_no_permite_mas_cambios(self):
        """Prueba que estados finales no permitan más transiciones."""
        postulacion = Postulacion(programa_id=1, estado=EstadoPostulacion.DOCUMENTOS_CARGADOS)

        # APROBADA es estado final
        postulacion.cambiar_estado(EstadoPostulacion.APROBADA)

        assert postulacion.estado == EstadoPostulacion.APROBADA

        # Intentar cambiar desde estado final debería fallar si no hay transiciones
        with pytest.raises(InvalidStateTransitionException):
            postulacion.cambiar_estado(EstadoPostulacion.RECHAZADA)

    def test_asignar_funcionario(self):
        """Prueba asignación de funcionario."""
        postulacion = Postulacion(programa_id=1)

        postulacion.asignar_funcionario(123)

        assert postulacion.funcionario_asignado_id == 123

    def test_eliminar(self):
        """Prueba eliminación lógica."""
        postulacion = Postulacion(programa_id=1, activo_logico=True)

        postulacion.eliminar()

        assert postulacion.activo_logico is False