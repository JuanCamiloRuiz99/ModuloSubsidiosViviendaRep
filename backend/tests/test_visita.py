import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch, Mock
from infrastructure.database.models import Visita, Postulacion, Etapa
from infrastructure.database.usuarios_models import UsuarioSistema


class TestVisitaViewSet(APITestCase):
    """Pruebas de integración para VisitaViewSet."""

    def setUp(self):
        """Configuración inicial para las pruebas."""
        self.programa = Mock()
        self.programa.id = 1

        self.postulacion = Postulacion.objects.create(
            programa=self.programa,
            estado='EN_REVISION'
        )

        self.encuestador = UsuarioSistema.objects.create(
            nombre_completo="Inspector Test",
            correo="inspector@test.com",
            rol="VISITADOR_TECNICO"
        )

    def test_crear_visita_exitosamente(self):
        """Prueba creación exitosa de visita."""
        url = reverse('visita-crear')
        data = {
            'postulacionId': self.postulacion.id,
            'inspectorId': self.encuestador.id,
            'tipoVisita': 'INICIAL',
            'direccion': 'Calle 123'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['tipoVisita'], 'INICIAL')

        # Verificar que se creó la visita
        visita = Visita.objects.filter(postulacion=self.postulacion).first()
        self.assertIsNotNone(visita)
        self.assertEqual(visita.estado_visita, 'ASIGNADA')

        # Verificar que cambió el estado de la postulación
        self.postulacion.refresh_from_db()
        self.assertEqual(self.postulacion.estado, 'VISITA_ASIGNADA')

    def test_crear_visita_con_postulacion_inexistente_falla(self):
        """Prueba que crear visita con postulación inexistente falle."""
        url = reverse('visita-crear')
        data = {
            'postulacionId': 99999,  # ID inexistente
            'inspectorId': self.encuestador.id,
            'tipoVisita': 'INICIAL'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_crear_visita_sin_postulacion_id_falla(self):
        """Prueba que crear visita sin postulacionId falle."""
        url = reverse('visita-crear')
        data = {
            'inspectorId': self.encuestador.id,
            'tipoVisita': 'INICIAL'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_programar_visita_exitosamente(self):
        """Prueba programación exitosa de visita."""
        # Crear visita primero
        visita = Visita.objects.create(
            postulacion=self.postulacion,
            encuestador=self.encuestador,
            estado_visita='ASIGNADA'
        )

        url = reverse('visita-programar')
        data = {
            'visitaId': visita.id,
            'fechaProgramada': '2024-12-25T10:00:00Z'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar cambios
        visita.refresh_from_db()
        self.assertEqual(visita.estado_visita, 'PROGRAMADA')
        self.assertIsNotNone(visita.fecha_programada)

        # Verificar estado de postulación
        self.postulacion.refresh_from_db()
        self.assertEqual(self.postulacion.estado, 'VISITA_PROGRAMADA')

    def test_programar_visita_estado_invalido_falla(self):
        """Prueba que programar visita en estado inválido falle."""
        # Crear visita ya programada
        visita = Visita.objects.create(
            postulacion=self.postulacion,
            encuestador=self.encuestador,
            estado_visita='PROGRAMADA'
        )

        url = reverse('visita-programar')
        data = {
            'visitaId': visita.id,
            'fechaProgramada': '2024-12-25T10:00:00Z'
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_realizar_visita_exitosamente(self):
        """Prueba realización exitosa de visita."""
        # Crear visita programada
        visita = Visita.objects.create(
            postulacion=self.postulacion,
            encuestador=self.encuestador,
            estado_visita='PROGRAMADA'
        )

        url = reverse('visita-realizar')
        data = {
            'visitaId': visita.id
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar cambios
        visita.refresh_from_db()
        self.assertEqual(visita.estado_visita, 'REALIZADA')
        self.assertIsNotNone(visita.fecha_realizacion)

        # Verificar estado de postulación
        self.postulacion.refresh_from_db()
        self.assertEqual(self.postulacion.estado, 'VISITA_REALIZADA')

    def test_realizar_visita_estado_invalido_falla(self):
        """Prueba que realizar visita en estado inválido falle."""
        # Crear visita ya realizada
        visita = Visita.objects.create(
            postulacion=self.postulacion,
            encuestador=self.encuestador,
            estado_visita='REALIZADA'
        )

        url = reverse('visita-realizar')
        data = {
            'visitaId': visita.id
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)