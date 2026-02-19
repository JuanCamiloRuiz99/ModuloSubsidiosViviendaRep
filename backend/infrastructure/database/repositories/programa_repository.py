"""
Repositorio para la entidad Programa

Patrón Repository: abstrae el acceso a la base de datos
"""
from typing import List, Optional
from ..models import Programa as ProgramaORM


class ProgramaRepository:
    """
    Repositorio para acceder a los Programas en la base de datos.
    
    Actúa como intermediario entre la lógica de aplicación y el ORM de Django.
    """

    @staticmethod
    def crear(programa_data: dict) -> ProgramaORM:
        """Crear un nuevo programa"""
        programa = ProgramaORM(**programa_data)
        programa.save()
        return programa

    @staticmethod
    def obtener(id: int) -> Optional[ProgramaORM]:
        """Obtener un programa por ID"""
        try:
            return ProgramaORM.objects.get(id=id)
        except ProgramaORM.DoesNotExist:
            return None

    @staticmethod
    def obtener_por_codigo(codigo: str) -> Optional[ProgramaORM]:
        """Obtener un programa por su código"""
        try:
            return ProgramaORM.objects.get(codigo_programa=codigo)
        except ProgramaORM.DoesNotExist:
            return None

    @staticmethod
    def listar() -> List[ProgramaORM]:
        """Listar todos los programas"""
        return ProgramaORM.objects.all()

    @staticmethod
    def listar_por_estado(estado: str) -> List[ProgramaORM]:
        """Listar programas filtrados por estado"""
        return ProgramaORM.objects.filter(estado=estado)

    @staticmethod
    def actualizar(id: int, datos: dict) -> Optional[ProgramaORM]:
        """Actualizar un programa"""
        programa = ProgramaRepository.obtener(id)
        if programa:
            for clave, valor in datos.items():
                setattr(programa, clave, valor)
            programa.save()
        return programa

    @staticmethod
    def eliminar(id: int) -> bool:
        """Eliminar un programa"""
        programa = ProgramaRepository.obtener(id)
        if programa:
            programa.delete()
            return True
        return False

    @staticmethod
    def contar() -> int:
        """Contar total de programas"""
        return ProgramaORM.objects.count()

    @staticmethod
    def contar_por_estado(estado: str) -> int:
        """Contar programas por estado"""
        return ProgramaORM.objects.filter(estado=estado).count()

    @staticmethod
    def obtener_estadisticas() -> dict:
        """Obtener estadísticas de programas"""
        return {
            'total': ProgramaRepository.contar(),
            'BORRADOR': ProgramaRepository.contar_por_estado('BORRADOR'),
            'ACTIVO': ProgramaRepository.contar_por_estado('ACTIVO'),
            'INHABILITADO': ProgramaRepository.contar_por_estado('INHABILITADO'),
        }
