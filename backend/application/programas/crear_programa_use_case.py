"""
Caso de uso: Crear Programa

Encapsula la lógica de negocio para crear un nuevo programa.
"""
from typing import Optional
from domain.programas.programa import Programa, EstadoPrograma
from infrastructure.database.repositories.programa_repository import ProgramaRepository
from shared.exceptions import ValidationError
from shared.validators import validar_nombre, validar_descripcion


class CrearProgramaUseCase:
    """Caso de uso para crear un nuevo programa"""

    def __init__(self, programa_repository: ProgramaRepository):
        """
        Inicializar el caso de uso
        
        Args:
            programa_repository: Repositorio de programas
        """
        self.programa_repository = programa_repository

    def execute(
        self,
        nombre: str,
        descripcion: str,
        entidad_responsable: str,
    ) -> dict:
        """
        Ejecutar el caso de uso de crear programa
        
        Args:
            nombre: Nombre del programa
            descripcion: Descripción del programa
            entidad_responsable: Entidad responsable
            
        Returns:
            Diccionario con los datos del programa creado
            
        Raises:
            ValidationError: Si la validación falla
        """
        # Validar entrada
        errores = []
        
        # Validar nombre
        if not nombre or len(nombre.strip()) < 3:
            errores.append("El nombre debe tener al menos 3 caracteres")
        if len(nombre) > 100:
            errores.append("El nombre no puede exceder 100 caracteres")
            
        # Validar descripción
        if not descripcion or len(descripcion.strip()) < 10:
            errores.append("La descripción debe tener al menos 10 caracteres")
        if len(descripcion) > 500:
            errores.append("La descripción no puede exceder 500 caracteres")
            
        # Validar entidad responsable
        if not entidad_responsable or entidad_responsable.strip() == '':
            errores.append("Debe proporcionar una entidad responsable")
            
        if errores:
            raise ValidationError(errores)
        
        # Crear entidad de dominio
        programa = Programa(
            nombre=nombre.strip(),
            descripcion=descripcion.strip(),
            entidad_responsable=entidad_responsable.strip(),
            estado=EstadoPrograma.BORRADOR,
        )
        
        # Guardar en la base de datos
        programa_data = {
            'nombre': programa.nombre,
            'descripcion': programa.descripcion,
            'entidad_responsable': programa.entidad_responsable,
            'estado': programa.estado.value,
        }
        
        programa_orm = self.programa_repository.crear(programa_data)
        
        return {
            'id': programa_orm.id,
            'nombre': programa_orm.nombre,
            'descripcion': programa_orm.descripcion,
            'entidad_responsable': programa_orm.entidad_responsable,
            'codigo_programa': programa_orm.codigo_programa,
            'estado': programa_orm.estado,
            'fecha_creacion': programa_orm.fecha_creacion,
            'fecha_actualizacion': programa_orm.fecha_actualizacion,
        }
