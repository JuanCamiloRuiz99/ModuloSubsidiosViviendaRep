"""
Implementación Django ORM del repositorio de Programas.

Implementa ProgramaRepositoryInterface mapeando entre
la entidad de dominio y el modelo ORM.
"""

import math
from typing import Any, Dict, List, Optional

from django.db.models import Count

from domain.programas import Programa, EstadoPrograma, ProgramaRepositoryInterface
from ..models import Programa as ProgramaORM


class DjangoProgramaRepository(ProgramaRepositoryInterface):
    """
    Repositorio de Programas usando Django ORM.

    Convierte entre el modelo ORM y la entidad de dominio,
    manteniendo la capa de dominio libre de dependencias Django.
    """

    # ---------- Mappers ----------

    @staticmethod
    def _to_domain(orm_obj: ProgramaORM) -> Programa:
        """Convierte un modelo ORM a entidad de dominio."""
        return Programa(
            id=orm_obj.id,
            nombre=orm_obj.nombre,
            descripcion=orm_obj.descripcion,
            entidad_responsable=orm_obj.entidad_responsable,
            estado=orm_obj.estado,
            codigo_programa=orm_obj.codigo_programa,
            fecha_creacion=orm_obj.fecha_creacion,
            fecha_actualizacion=orm_obj.fecha_actualizacion,
        )

    @staticmethod
    def _to_orm_data(programa: Programa) -> dict:
        """Extrae datos de la entidad de dominio para el ORM."""
        data = {
            "nombre": programa.nombre,
            "descripcion": programa.descripcion,
            "entidad_responsable": programa.entidad_responsable,
            "estado": programa.estado.value if isinstance(programa.estado, EstadoPrograma) else programa.estado,
        }
        if programa.codigo_programa:
            data["codigo_programa"] = programa.codigo_programa
        return data

    # ---------- CRUD ----------

    def crear(self, programa: Programa) -> Programa:
        orm_data = self._to_orm_data(programa)
        orm_obj = ProgramaORM(**orm_data)
        orm_obj.save()
        return self._to_domain(orm_obj)

    def actualizar(self, programa: Programa) -> Programa:
        try:
            orm_obj = ProgramaORM.objects.get(id=programa.id)
        except ProgramaORM.DoesNotExist:
            return None

        orm_obj.nombre = programa.nombre
        orm_obj.descripcion = programa.descripcion
        orm_obj.entidad_responsable = programa.entidad_responsable
        orm_obj.estado = programa.estado.value if isinstance(programa.estado, EstadoPrograma) else programa.estado
        orm_obj.save()
        return self._to_domain(orm_obj)

    def obtener_por_id(self, id: int) -> Optional[Programa]:
        try:
            orm_obj = ProgramaORM.objects.get(id=id)
            return self._to_domain(orm_obj)
        except ProgramaORM.DoesNotExist:
            return None

    def obtener_por_codigo(self, codigo: str) -> Optional[Programa]:
        try:
            orm_obj = ProgramaORM.objects.get(codigo_programa=codigo)
            return self._to_domain(orm_obj)
        except ProgramaORM.DoesNotExist:
            return None

    def listar(
        self,
        filtros: Optional[Dict[str, Any]] = None,
        pagina: int = 1,
        tamaño_pagina: int = 10,
    ) -> Dict[str, Any]:
        qs = ProgramaORM.objects.all()

        if filtros:
            if "estado" in filtros:
                qs = qs.filter(estado__iexact=filtros["estado"])

        total = qs.count()
        total_paginas = max(1, math.ceil(total / tamaño_pagina))
        offset = (pagina - 1) * tamaño_pagina

        orm_items = qs[offset : offset + tamaño_pagina]
        items = [self._to_domain(obj) for obj in orm_items]

        return {
            "items": items,
            "total": total,
            "pagina": pagina,
            "tamaño_pagina": tamaño_pagina,
            "total_paginas": total_paginas,
        }

    def eliminar(self, id: int) -> bool:
        try:
            orm_obj = ProgramaORM.objects.get(id=id)
            orm_obj.delete()
            return True
        except ProgramaORM.DoesNotExist:
            return False

    def contar(self, filtros: Optional[Dict[str, Any]] = None) -> int:
        qs = ProgramaORM.objects.all()
        if filtros and "estado" in filtros:
            qs = qs.filter(estado__iexact=filtros["estado"])
        return qs.count()

    def obtener_estadisticas(self) -> Dict[str, Any]:
        por_estado = dict(
            ProgramaORM.objects.values_list('estado')
            .annotate(c=Count('id'))
            .values_list('estado', 'c')
        )
        return {
            "total": sum(por_estado.values()),
            "BORRADOR": por_estado.get("BORRADOR", 0),
            "ACTIVO": por_estado.get("ACTIVO", 0),
            "INHABILITADO": por_estado.get("INHABILITADO", 0),
            "CULMINADO": por_estado.get("CULMINADO", 0),
        }


# Alias de compatibilidad para código existente que importe ProgramaRepository
ProgramaRepository = DjangoProgramaRepository
