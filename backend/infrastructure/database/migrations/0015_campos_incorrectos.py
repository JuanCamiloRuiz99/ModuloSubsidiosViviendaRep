# Migration 0015 – Revisión interna en GestionHogarEtapa1
#
# Agrega dos campos al modelo GestionHogarEtapa1 para que los revisores
# puedan indicar qué campos tienen datos incorrectos y dejar observaciones:
#   - campos_incorrectos    : JSONField  (lista de nombres de campo marcados)
#   - observaciones_revision: TextField  (notas libres del revisor)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0014_config_registro_hogar_publicado'),
    ]

    operations = [
        migrations.AddField(
            model_name='gestionhogaretapa1',
            name='campos_incorrectos',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name='gestionhogaretapa1',
            name='observaciones_revision',
            field=models.TextField(blank=True, default=''),
        ),
    ]
