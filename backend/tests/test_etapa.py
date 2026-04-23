import pytest
from datetime import datetime
from domain.etapas import Etapa, ModuloEtapa


class TestEtapa:
    """Pruebas unitarias para la entidad Etapa."""

    def test_etapa_creacion_con_datos_validos(self):
        """Prueba creación de etapa con datos válidos."""
        etapa = Etapa(
            programa_id=1,
            numero_etapa=1,
            modulo_principal=ModuloEtapa.VISITA_TECNICA,
            id=1,
            finalizada=False,
            activo_logico=True,
            usuario_creacion=1
        )

        assert etapa.id == 1
        assert etapa.programa_id == 1
        assert etapa.numero_etapa == 1
        assert etapa.modulo_principal == ModuloEtapa.VISITA_TECNICA
        assert etapa.finalizada is False
        assert etapa.activo_logico is True

    def test_finalizar_etapa_no_finalizada(self):
        """Prueba finalizar una etapa que no está finalizada."""
        etapa = Etapa(
            programa_id=1,
            numero_etapa=1,
            modulo_principal=ModuloEtapa.VISITA_TECNICA
        )

        etapa.finalizar()

        assert etapa.finalizada is True
        assert etapa.fecha_finalizacion is not None

    def test_finalizar_etapa_ya_finalizada_falla(self):
        """Prueba que finalizar una etapa ya finalizada lance excepción."""
        etapa = Etapa(
            programa_id=1,
            numero_etapa=1,
            modulo_principal=ModuloEtapa.VISITA_TECNICA,
            finalizada=True
        )

        with pytest.raises(ValueError) as exc_info:
            etapa.finalizar()

        assert "ya está finalizada" in str(exc_info.value)

    def test_eliminar_etapa(self):
        """Prueba eliminación lógica de etapa."""
        etapa = Etapa(
            programa_id=1,
            numero_etapa=1,
            modulo_principal=ModuloEtapa.VISITA_TECNICA,
            activo_logico=True
        )

        etapa.eliminar()

        assert etapa.activo_logico is False

    def test_modulo_principal_enum_conversion(self):
        """Prueba conversión automática de string a enum para modulo_principal."""
        etapa = Etapa(
            programa_id=1,
            numero_etapa=1,
            modulo_principal="VISITA_TECNICA"
        )

        assert etapa.modulo_principal == ModuloEtapa.VISITA_TECNICA
        assert isinstance(etapa.modulo_principal, ModuloEtapa)