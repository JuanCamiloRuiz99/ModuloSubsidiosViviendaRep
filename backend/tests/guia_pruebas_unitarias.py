"""
Guía para escribir pruebas unitarias específicas por módulo.

Esta guía explica cómo crear pruebas unitarias enfocadas en funciones
específicas de cada módulo del proyecto.
"""

# 1. ESTRUCTURA RECOMENDADA POR MÓDULO
"""
tests/
├── test_domain/
│   ├── test_postulacion.py      # Entidad Postulacion
│   ├── test_programa.py         # Entidad Programa
│   ├── test_usuario.py          # Entidad Usuario
│   └── test_etapa.py           # Entidad Etapa
├── test_application/
│   ├── test_programa_use_cases.py    # Casos de uso de programas
│   ├── test_usuario_use_cases.py     # Casos de uso de usuarios
│   └── test_postulacion_use_cases.py # Casos de uso de postulaciones
├── test_infrastructure/
│   ├── test_repositories.py     # Repositorios
│   └── test_database_models.py  # Modelos de BD
├── test_presentation/
│   ├── test_views.py           # ViewSets
│   ├── test_serializers.py     # Serializers
│   └── test_validators.py      # Validadores
├── test_shared/
│   ├── test_exceptions.py      # Excepciones personalizadas
│   ├── test_validators.py      # Validadores compartidos
│   └── test_utilities.py       # Utilidades
└── test_integration/
    ├── test_api_endpoints.py   # Pruebas de API completas
    └── test_workflows.py       # Flujos de negocio completos
"""

# 2. PRINCIPIOS PARA PRUEBAS UNITARIAS ESPECÍFICAS

"""
A. AISLAMIENTO: Cada prueba debe ser independiente
   - No depender de estado de otras pruebas
   - Usar mocks/stubs para dependencias externas
   - Limpiar estado después de cada prueba

B. ESPECIFICIDAD: Probar UNA función/caso específico
   - Un método por prueba
   - Un escenario por prueba
   - Nombres descriptivos: test_[metodo]_[escenario]

C. COBERTURA: Cubrir casos normales y edge cases
   - Happy path
   - Casos de error
   - Validaciones
   - Transiciones de estado

D. LEGIBILIDAD: Código claro y mantenible
   - Arrange-Act-Assert pattern
   - Nombres descriptivos
   - Comentarios cuando sea necesario
"""

# 3. EJEMPLOS PRÁCTICOS POR TIPO DE FUNCIÓN

"""
A. ENTIDADES DE DOMINIO:
   - Validaciones de negocio
   - Transiciones de estado
   - Reglas de negocio puras

B. CASOS DE USO:
   - Lógica de aplicación
   - Coordinación entre repositorios
   - Validaciones de entrada/salida

C. REPOSITORIOS:
   - Consultas a base de datos
   - Mapeo de datos
   - Manejo de errores de BD

D. VISTAS/SERIALIZERS:
   - Parsing de requests
   - Formateo de responses
   - Validaciones de API

E. VALIDADORES:
   - Reglas de validación específicas
   - Manejo de errores de validación
"""

# 4. HERRAMIENTAS RECOMENDADAS

"""
FRAMEWORK: pytest (ya configurado)
- pytest-django para integración con Django
- pytest-mock para mocking
- pytest-cov para cobertura

BIBLIOTECAS ADICIONALES:
- factory-boy: Para crear objetos de prueba
- model-mommy: Alternativa para modelos Django
- freezegun: Para testing con fechas
"""

# 5. COMANDOS ÚTILES

"""
# Ejecutar todas las pruebas
pytest

# Ejecutar pruebas de un módulo específico
pytest tests/test_domain/

# Ejecutar una clase específica
pytest tests/test_postulacion.py::TestPostulacion

# Ejecutar una prueba específica
pytest tests/test_postulacion.py::TestPostulacion::test_cambiar_estado_valido

# Con cobertura
pytest --cov=.

# Con reportes HTML
pytest --html=report.html

# Modo verbose
pytest -v

# Ejecutar solo pruebas que fallaron anteriormente
pytest --lf
"""

# 6. MEJORES PRÁCTICAS

"""
A. NOMENCLATURA:
   - test_[funcion]_[escenario]
   - Test[Clase] para clases de prueba
   - setUp/tearDown para configuración

B. ASSERTIONS:
   - Usar assertions específicas de pytest
   - Mensajes descriptivos en assertions
   - Verificar tipos y valores

C. FIXTURES:
   - Usar fixtures de pytest para datos comunes
   - Crear factories para objetos complejos

D. MOCKING:
   - Mock dependencias externas
   - Verificar llamadas a métodos
   - No mockear lógica de negocio

E. PERFORMANCE:
   - Pruebas rápidas (< 0.1s cada una)
   - Paralelizar cuando sea posible
   - Evitar sleeps en pruebas unitarias
"""

# 7. EJEMPLO COMPLETO DE PRUEBA

"""
import pytest
from unittest.mock import Mock
from domain.postulantes.postulacion import Postulacion, EstadoPostulacion
from application.postulantes.postulaciones_use_cases import CambiarEstadoPostulacionUseCase


class TestCambiarEstadoPostulacionUseCase:
    '''Pruebas para el caso de uso de cambiar estado de postulación.'''

    @pytest.fixture
    def mock_repository(self):
        '''Fixture para mock del repositorio.'''
        return Mock()

    @pytest.fixture
    def postulacion_activa(self):
        '''Fixture para postulación en estado activo.'''
        return Postulacion(
            programa_id=1,
            estado=EstadoPostulacion.EN_REVISION
        )

    def test_cambiar_estado_exitosamente(self, mock_repository, postulacion_activa):
        '''Prueba cambio exitoso de estado.'''
        # Arrange
        use_case = CambiarEstadoPostulacionUseCase(mock_repository)
        mock_repository.obtener_por_id.return_value = postulacion_activa
        mock_repository.guardar.return_value = postulacion_activa

        # Act
        resultado = use_case.execute(postulacion_id=1, nuevo_estado='APROBADA')

        # Assert
        assert resultado.estado == EstadoPostulacion.APROBADA
        mock_repository.obtener_por_id.assert_called_once_with(1)
        mock_repository.guardar.assert_called_once()

    def test_cambiar_estado_postulacion_no_encontrada(self, mock_repository):
        '''Prueba error cuando postulación no existe.'''
        # Arrange
        use_case = CambiarEstadoPostulacionUseCase(mock_repository)
        mock_repository.obtener_por_id.return_value = None

        # Act & Assert
        with pytest.raises(PostulacionNoEncontradaException):
            use_case.execute(postulacion_id=999, nuevo_estado='APROBADA')
"""