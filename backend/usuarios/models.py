"""
Models para la app usuarios

Re-exporta los modelos desde infrastructure para que Django pueda detectarlos.
"""

from infrastructure.database.usuarios_models import UsuarioSistema

__all__ = ['UsuarioSistema']
