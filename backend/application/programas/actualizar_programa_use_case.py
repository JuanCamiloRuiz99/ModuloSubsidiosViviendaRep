"""
Caso de uso: Actualizar Programa

Encapsula la lógica de negocio para actualizar un programa.
"""
from typing import Optional
from infrastructure.database.repositories.programa_repository import ProgramaRepository
from shared.exceptions import NotFoundError, ValidationError


class ActualizarProgramaUseCase:
    """Caso de uso para actualizar un programa"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(
        self,
        id: int,
        nombre: Optional[str] = None,
        descripcion: Optional[str] = None,
        entidad_responsable: Optional[str] = None,
        estado: Optional[str] = None,
    ) -> dict:
        """
        Ejecutar el caso de uso de actualizar programa
        
        Args:
            id: ID del programa
            nombre: Nuevo nombre (opcional)
            descripcion: Nueva descripción (opcional)
            entidad_responsable: Nueva entidad responsable (opcional)
            estado: Nuevo estado (opcional)
            
        Returns:
            Datos del programa actualizado
            
        Raises:
            NotFoundError: Si el programa no existe
            ValidationError: Si la validación falla
        """
        # Verificar que el programa existe
        programa = self.programa_repository.obtener(id)
        if not programa:
            raise NotFoundError(f"El programa con ID {id} no existe")
        
        # Preparar datos para actualizar
        datos_actualizar = {}
        errores = []
        
        # Validar y preparar nombre
        if nombre is not None:
            if not nombre or len(nombre.strip()) < 3:
                errores.append("El nombre debe tener al menos 3 caracteres")
            elif len(nombre) > 100:
                errores.append("El nombre no puede exceder 100 caracteres")
            else:
                datos_actualizar['nombre'] = nombre.strip()
        
        # Validar y preparar descripción
        if descripcion is not None:
            if not descripcion or len(descripcion.strip()) < 10:
                errores.append("La descripción debe tener al menos 10 caracteres")
            elif len(descripcion) > 500:
                errores.append("La descripción no puede exceder 500 caracteres")
            else:
                datos_actualizar['descripcion'] = descripcion.strip()
        
        # Validar y preparar entidad responsable
        if entidad_responsable is not None:
            if not entidad_responsable or entidad_responsable.strip() == '':
                errores.append("Debe proporcionar una entidad responsable")
            else:
                datos_actualizar['entidad_responsable'] = entidad_responsable.strip()
        
        # Validar estado
        if estado is not None:
            estados_validos = ['BORRADOR', 'ACTIVO', 'INHABILITADO']
            if estado not in estados_validos:
                errores.append(f"Estado inválido. Estados válidos: {', '.join(estados_validos)}")
            else:
                datos_actualizar['estado'] = estado
        
        if errores:
            raise ValidationError(errores)
        
        # Si no hay nada que actualizar, retornar el programa actual
        if not datos_actualizar:
            return {
                'id': programa.id,
                'nombre': programa.nombre,
                'descripcion': programa.descripcion,
                'entidad_responsable': programa.entidad_responsable,
                'codigo_programa': programa.codigo_programa,
                'estado': programa.estado,
                'fecha_creacion': programa.fecha_creacion,
                'fecha_actualizacion': programa.fecha_actualizacion,
            }
        
        # Actualizar en la base de datos
        programa_actualizado = self.programa_repository.actualizar(id, datos_actualizar)
        
        return {
            'id': programa_actualizado.id,
            'nombre': programa_actualizado.nombre,
            'descripcion': programa_actualizado.descripcion,
            'entidad_responsable': programa_actualizado.entidad_responsable,
            'codigo_programa': programa_actualizado.codigo_programa,
            'estado': programa_actualizado.estado,
            'fecha_creacion': programa_actualizado.fecha_creacion,
            'fecha_actualizacion': programa_actualizado.fecha_actualizacion,
        }
