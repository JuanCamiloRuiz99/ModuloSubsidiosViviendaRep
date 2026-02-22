"""
Use Case: Crear Usuario

Implementa la lógica de negocio para crear un nuevo usuario.
"""
from typing import Dict, Any
from infrastructure.database.repositories import UsuarioRepository
from shared.exceptions import ValidationError


class CrearUsuarioUseCase:
    """Use Case para crear un nuevo usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta el caso de uso de crear usuario
        
        Args:
            data: Diccionario con datos del usuario
                - nombre: str (requerido)
                - apellidos: str (requerido)
                - numero_documento: str (requerido, único)
                - correo: str (requerido, único)
                - rol: str (requerido: ADMINISTRADOR, FUNCIONARIO, TECNICO)
                - estado: str (opcional, default: ACTIVO)
        
        Returns:
            Diccionario con datos del usuario creado
            
        Raises:
            ValidationError: Si los datos no son válidos
        """
        # Validaciones
        self._validar_datos(data)

        # Verificar que no exista usuario con ese documento
        usuario_existente = self.repository.obtener_por_documento(data['numero_documento'])
        if usuario_existente:
            raise ValidationError(f"Ya existe un usuario con el documento {data['numero_documento']}")

        # Verificar que no exista usuario con ese correo
        usuario_por_correo = self.repository.obtener_por_correo(data['correo'])
        if usuario_por_correo:
            raise ValidationError(f"Ya existe un usuario con el correo {data['correo']}")

        # Crear usuario
        usuario = self.repository.crear(data)

        return usuario.to_dict()

    def _validar_datos(self, data: Dict[str, Any]) -> None:
        """Valida los datos de entrada"""
        if not data.get('nombre') or len(data.get('nombre', '').strip()) < 2:
            raise ValidationError("El nombre es requerido y debe tener al menos 2 caracteres")

        if not data.get('apellidos') or len(data.get('apellidos', '').strip()) < 2:
            raise ValidationError("Los apellidos son requeridos y deben tener al menos 2 caracteres")

        if not data.get('numero_documento') or len(data.get('numero_documento', '').strip()) < 5:
            raise ValidationError("El número de documento es requerido y debe tener al menos 5 caracteres")

        if not data.get('correo'):
            raise ValidationError("El correo es requerido")

        if '@' not in data.get('correo', ''):
            raise ValidationError("El correo debe ser válido")

        if not data.get('rol'):
            raise ValidationError("El rol es requerido")

        roles_validos = ['ADMINISTRADOR', 'FUNCIONARIO', 'TECNICO']
        if data.get('rol') not in roles_validos:
            raise ValidationError(f"El rol debe ser uno de: {', '.join(roles_validos)}")

        estado = data.get('estado', 'ACTIVO')
        estados_validos = ['ACTIVO', 'INACTIVO']
        if estado not in estados_validos:
            raise ValidationError(f"El estado debe ser uno de: {', '.join(estados_validos)}")
