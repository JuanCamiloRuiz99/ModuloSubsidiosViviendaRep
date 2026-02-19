"""
Django app configuration for infrastructure layer
"""
from django.apps import AppConfig


class Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'infrastructure.database'

    def ready(self):
        # Importar señales aquí si es necesario
        pass
