"""
Tests de dominio — entidades puras sin Django.

Cubre: Usuario, Programa, Etapa, Postulacion, Value Objects.
"""
import pytest
from datetime import datetime

# ──────────────────── Usuario ──────────────────────────────

from domain.usuarios.usuario import Usuario, RolUsuario


class TestUsuarioEntity:
    def _make(self, **overrides):
        defaults = dict(
            id_usuario=1,
            nombre_completo="Ana García",
            correo="ana@test.com",
            password_hash="pbkdf2_sha256$260000$hash_placeholder_xxx",
            rol=RolUsuario.ADMIN,
        )
        defaults.update(overrides)
        return Usuario(**defaults)

    def test_crear_usuario_valido(self):
        u = self._make()
        assert u.nombre_completo == "Ana García"
        assert u.rol == RolUsuario.ADMIN
        assert u.activo is True
        assert u.activo_logico is True

    def test_cambiar_estado(self):
        u = self._make()
        u.cambiar_estado(False)
        assert u.activo is False
        assert u.fecha_modificacion is not None

    def test_cambiar_rol(self):
        u = self._make(rol=RolUsuario.FUNCIONARIO)
        u.cambiar_rol(RolUsuario.ADMIN)
        assert u.rol == RolUsuario.ADMIN

    def test_actualizar_nombre(self):
        u = self._make()
        u.actualizar_nombre("Ana María García")
        assert u.nombre_completo == "Ana María García"

    def test_actualizar_correo(self):
        u = self._make()
        u.actualizar_correo("nuevo@test.com")
        assert u.correo == "nuevo@test.com"

    def test_actualizar_password(self):
        u = self._make()
        old_hash = u.password_hash
        u.actualizar_password("pbkdf2_sha256$260000$new_hash_xxx")
        assert u.password_hash != old_hash

    def test_es_admin(self):
        assert self._make(rol=RolUsuario.ADMIN).es_admin() is True
        assert self._make(rol=RolUsuario.FUNCIONARIO).es_admin() is False

    def test_es_funcionario(self):
        assert self._make(rol=RolUsuario.FUNCIONARIO).es_funcionario() is True

    def test_es_visitador(self):
        assert self._make(rol=RolUsuario.VISITADOR_TECNICO).es_visitador() is True

    def test_esta_activo(self):
        u = self._make(activo=True, activo_logico=True)
        assert u.esta_activo() is True
        u.activo_logico = False
        assert u.esta_activo() is False

    def test_to_primitives_roundtrip(self):
        u = self._make()
        data = u.to_primitives()
        assert data["nombre_completo"] == "Ana García"
        assert data["rol"] == "ADMIN"
        u2 = Usuario.from_primitives(data)
        assert u2.correo == u.correo

    def test_rol_from_string(self):
        u = Usuario(
            id_usuario=1,
            nombre_completo="Test",
            correo="t@t.com",
            password_hash="pbkdf2_sha256$260000$hash_placeholder_xxx",
            rol="FUNCIONARIO",
        )
        assert u.rol == RolUsuario.FUNCIONARIO


# ──────────────────── Programa ──────────────────────────────

from domain.programas.programa import Programa, EstadoPrograma, TRANSICIONES_VALIDAS
from shared.exceptions import InvalidStateTransitionException


class TestProgramaEntity:
    def _make(self, **overrides):
        defaults = dict(
            nombre="Mi Casa Ya 2026",
            descripcion="Subsidio de vivienda para familias vulnerables",
            entidad_responsable="Alcaldía de Popayán",
        )
        defaults.update(overrides)
        return Programa(**defaults)

    def test_crear_borrador(self):
        p = self._make()
        assert p.estado == EstadoPrograma.BORRADOR
        assert p.es_borrador() is True

    def test_publicar(self):
        p = self._make()
        p.publicar()
        assert p.estado == EstadoPrograma.ACTIVO
        assert p.es_activo() is True

    def test_inhabilitar(self):
        p = self._make()
        p.publicar()
        p.inhabilitar()
        assert p.estado == EstadoPrograma.INHABILITADO
        assert p.es_inhabilitado() is True

    def test_reactivar(self):
        p = self._make()
        p.publicar()
        p.inhabilitar()
        p.reactivar()
        assert p.estado == EstadoPrograma.ACTIVO

    def test_culminar(self):
        p = self._make()
        p.publicar()
        p.cambiar_estado(EstadoPrograma.CULMINADO)
        assert p.estado == EstadoPrograma.CULMINADO

    def test_transicion_invalida_borrador_a_inhabilitado(self):
        p = self._make()
        with pytest.raises(InvalidStateTransitionException):
            p.cambiar_estado(EstadoPrograma.INHABILITADO)

    def test_transicion_invalida_culminado_a_activo(self):
        p = self._make()
        p.publicar()
        p.cambiar_estado(EstadoPrograma.CULMINADO)
        with pytest.raises(InvalidStateTransitionException):
            p.cambiar_estado(EstadoPrograma.ACTIVO)

    def test_actualizar_datos(self):
        p = self._make()
        p.actualizar_datos(nombre="Nuevo nombre", descripcion="Desc actualizada con mas chars")
        assert p.nombre == "Nuevo nombre"
        assert p.descripcion == "Desc actualizada con mas chars"
        assert p.fecha_actualizacion is not None

    def test_validar_ok(self):
        p = self._make()
        assert p.validar() == []

    def test_validar_nombre_corto(self):
        p = self._make(nombre="AB")
        errores = p.validar()
        assert any("nombre" in e.lower() for e in errores)

    def test_validar_descripcion_corta(self):
        p = self._make(descripcion="Corta")
        errores = p.validar()
        assert any("descripción" in e.lower() for e in errores)

    def test_validar_sin_entidad(self):
        p = self._make(entidad_responsable="")
        errores = p.validar()
        assert any("entidad" in e.lower() for e in errores)

    def test_to_primitives_roundtrip(self):
        p = self._make(id=42, codigo_programa="2026ABCD12")
        data = p.to_primitives()
        assert data["estado"] == "BORRADOR"
        p2 = Programa.from_primitives(data)
        assert p2.nombre == p.nombre
        assert p2.codigo_programa == "2026ABCD12"

    def test_todas_transiciones_validas(self):
        """Verifica que cada transición declarada funciona."""
        for origen, destinos in TRANSICIONES_VALIDAS.items():
            for destino in destinos:
                p = Programa(
                    nombre="Test",
                    descripcion="Descripción de prueba larga",
                    entidad_responsable="Ent",
                    estado=origen,
                )
                p.cambiar_estado(destino)
                assert p.estado == destino


# ──────────────────── Etapa ────────────────────────────────

from domain.etapas.etapa import Etapa, ModuloEtapa


class TestEtapaEntity:
    def _make(self, **overrides):
        defaults = dict(
            programa_id=1,
            numero_etapa=1,
            modulo_principal=ModuloEtapa.REGISTRO_HOGAR,
        )
        defaults.update(overrides)
        return Etapa(**defaults)

    def test_crear_etapa(self):
        e = self._make()
        assert e.finalizada is False
        assert e.activo_logico is True

    def test_finalizar(self):
        e = self._make()
        e.finalizar()
        assert e.finalizada is True
        assert e.fecha_finalizacion is not None

    def test_finalizar_ya_finalizada(self):
        e = self._make()
        e.finalizar()
        with pytest.raises(ValueError, match="ya está finalizada"):
            e.finalizar()

    def test_eliminar_logico(self):
        e = self._make()
        e.eliminar()
        assert e.activo_logico is False

    def test_modulo_desde_string(self):
        e = Etapa(programa_id=1, numero_etapa=1, modulo_principal="VISITA_TECNICA")
        assert e.modulo_principal == ModuloEtapa.VISITA_TECNICA


# ──────────────────── Postulación ────────────────────────────

from domain.postulantes.postulacion import (
    Postulacion,
    EstadoPostulacion,
    TRANSICIONES_VALIDAS as TRANS_POSTULACION,
)


class TestPostulacionEntity:
    def _make(self, **overrides):
        defaults = dict(programa_id=1, estado=EstadoPostulacion.REGISTRADA)
        defaults.update(overrides)
        return Postulacion(**defaults)

    def test_crear_postulacion(self):
        p = self._make()
        assert p.estado == EstadoPostulacion.REGISTRADA
        assert p.activo_logico is True

    def test_transicion_valida_registrada_a_revision(self):
        p = self._make()
        p.cambiar_estado(EstadoPostulacion.EN_REVISION)
        assert p.estado == EstadoPostulacion.EN_REVISION

    def test_transicion_invalida_registrada_a_aprobada(self):
        p = self._make()
        with pytest.raises(InvalidStateTransitionException):
            p.cambiar_estado(EstadoPostulacion.APROBADA)

    def test_ciclo_completo_beneficiado(self):
        p = self._make()
        p.cambiar_estado(EstadoPostulacion.EN_REVISION)
        p.cambiar_estado(EstadoPostulacion.VISITA_PENDIENTE)
        p.cambiar_estado(EstadoPostulacion.VISITA_REALIZADA)
        p.cambiar_estado(EstadoPostulacion.DOCUMENTOS_CARGADOS)
        p.cambiar_estado(EstadoPostulacion.BENEFICIADO)
        assert p.estado == EstadoPostulacion.BENEFICIADO

    def test_estados_terminales_no_transicionan(self):
        for terminal in [
            EstadoPostulacion.BENEFICIADO,
            EstadoPostulacion.NO_BENEFICIARIO,
            EstadoPostulacion.APROBADA,
            EstadoPostulacion.RECHAZADA,
        ]:
            p = Postulacion(programa_id=1, estado=terminal)
            with pytest.raises(InvalidStateTransitionException):
                p.cambiar_estado(EstadoPostulacion.REGISTRADA)

    def test_asignar_funcionario(self):
        p = self._make()
        p.asignar_funcionario(42)
        assert p.funcionario_asignado_id == 42

    def test_eliminar_logico(self):
        p = self._make()
        p.eliminar()
        assert p.activo_logico is False

    def test_todas_transiciones_validas(self):
        for origen, destinos in TRANS_POSTULACION.items():
            for destino in destinos:
                p = Postulacion(programa_id=1, estado=origen)
                p.cambiar_estado(destino)
                assert p.estado == destino


# ──────────────────── Value Objects ──────────────────────────

from domain.usuarios.usuarios_value_objects import (
    CorreoUsuario,
    PasswordHash,
    NombreUsuario,
    RolUsuarioVO,
)


class TestCorreoUsuario:
    def test_correo_valido(self):
        c = CorreoUsuario("Ana@Test.COM")
        assert c.valor() == "ana@test.com"

    def test_correo_muy_corto(self):
        with pytest.raises(ValueError):
            CorreoUsuario("a@b")

    def test_correo_formato_invalido(self):
        with pytest.raises(ValueError):
            CorreoUsuario("esto-no-es-email")

    def test_correo_igualdad(self):
        assert CorreoUsuario("a@b.com") == CorreoUsuario("A@B.COM")


class TestPasswordHash:
    def test_hash_valido(self):
        ph = PasswordHash("pbkdf2_sha256$260000$xxxxxxxxxxxxxxxxxxxx")
        assert ph.valor().startswith("pbkdf2")

    def test_hash_muy_corto(self):
        with pytest.raises(ValueError):
            PasswordHash("short")


class TestNombreUsuario:
    def test_nombre_valido(self):
        n = NombreUsuario("  Carlos Admin  ")
        assert n.valor() == "Carlos Admin"

    def test_nombre_muy_corto(self):
        with pytest.raises(ValueError):
            NombreUsuario("AB")


class TestRolUsuarioVO:
    def test_rol_valido(self):
        r = RolUsuarioVO("admin")
        assert r.valor() == "ADMIN"
        assert r.es_admin() is True

    def test_rol_invalido(self):
        with pytest.raises(ValueError):
            RolUsuarioVO("SUPERADMIN")

    def test_igualdad(self):
        assert RolUsuarioVO("admin") == RolUsuarioVO("ADMIN")


# ──────────────────── Programa Value Objects ──────────────────

from domain.programas.programa_value_objects import (
    NombrePrograma,
    CodigoPrograma,
    DescripcionPrograma,
)


class TestNombrePrograma:
    def test_nombre_valido(self):
        n = NombrePrograma("Mi Casa Ya")
        assert n.valor() == "Mi Casa Ya"

    def test_nombre_corto(self):
        with pytest.raises(ValueError):
            NombrePrograma("AB")


class TestCodigoPrograma:
    def test_codigo_valido(self):
        c = CodigoPrograma("2026abcd")
        assert c.valor() == "2026ABCD"

    def test_codigo_corto(self):
        with pytest.raises(ValueError):
            CodigoPrograma("AB")


class TestDescripcionPrograma:
    def test_desc_valida(self):
        d = DescripcionPrograma("Descripción suficientemente larga")
        assert "Descripción" in d.valor()

    def test_desc_corta(self):
        with pytest.raises(ValueError):
            DescripcionPrograma("Corta")
