"""
Use Case: Actualizar Usuario

Implementa la lógica de negocio para actualizar un usuario existente.
"""
from typing import Dict, Any
from infrastructure.database.repositories import UsuarioRepository
from shared.exceptions import ValidationError, NotFoundError


class ActualizarUsuarioUseCase:
    """Use Case para actualizar un usuario"""

    def __init__(self, repository: UsuarioRepository):
        self.repository = repository

    def execute(self, usuario_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ejecuta el caso de uso de actualizar un usuario
        
        Args:
            usuario_id: ID del usuario
            data: Diccionario con datos a actualizar
        
        Returns:
            Diccionario con datos del usuario actualizado
            
        Raises:
            NotFoundError: Si el usuario no existe
            ValidationError: Si los datos no son válidos
        """
        # Verificar que el usuario existe
        usuario = self.repository.obtener_por_id(usuario_id)
        if not usuario:
            raise NotFoundError(f"El usuario con ID {usuario_id} no existe")

        # Validar nuevos datos si se proporcionan
        self._validar_datos_actualizacion(data)

        # Verificar documento único si se actualiza
        if 'numero_documento' in data and data['numero_documento'] != usuario.numero_documento:
            usuario_existente = self.repository.obtener_por_documento(data['numero_documento'])
            if usuario_existente:
                raise ValidationError(f"Ya existe un usuario con el documento {data['numero_documento']}")

        # Verificar correo único si se actualiza
        if 'correo' in data and data['correo'] != usuario.correo:
            usuario_por_correo = self.repository.obtener_por_correo(data['correo'])
            if usuario_por_correo:
                raise ValidationError(f"Ya existe un usuario con el correo {data['correo']}")

        # Actualizar usuario
        usuario_actualizado = self.repository.actualizar(usuario_id, data)

        return usuario_actualizado.to_dict()

    def _validar_datos_actualizacion(self, data: Dict[str, Any]) -> None:
        """Valida los datos de actualización"""
        if 'nombre' in data and len(data.get('nombre', '').strip()) < 2:
            raise ValidationError("El nombre debe tener al menos 2 caracteres")

        if 'apellidos' in data and len(data.get('apellidos', '').strip()) < 2:
            raise ValidationError("Los apellidos deben tener al menos 2 caracteres")

        if 'numero_documento' in data and len(data.get('numero_documento', '').strip()) < 5:
            raise ValidationError("El número de documento debe tener al menos 5 caracteres")

        if 'correo' in data:
            correo = data.get('correo', '')
            if '@' not in correo:
                raise ValidationError("El correo debe ser válido")

        if 'rol' in data:
            roles_validos = ['ADMINISTRADOR', 'FUNCIONARIO', 'TECNICO']
            if data['rol'] not in roles_validos:
                raise ValidationError(f"El rol debe ser uno de: {', '.join(roles_validos)}")

        if 'estado' in data:
            estados_validos = ['ACTIVO', 'INACTIVO']
            if data['estado'] not in estados_validos:
                raise ValidationError(f"El estado debe ser uno de: {', '.join(estados_validos)}")
