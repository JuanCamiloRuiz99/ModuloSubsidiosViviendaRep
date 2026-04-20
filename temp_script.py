import os
import sys
import django

# Agregar el directorio backend al path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from infrastructure.database.postulaciones_models import Postulacion as PostulacionModel

# Cambiar algunas postulaciones a BENEFICIADO
postulaciones = PostulacionModel.objects.filter(estado='APROBADA')[:3]
for p in postulaciones:
    p.estado = 'BENEFICIADO'
    p.save()
    print(f'Postulación {p.numero_radicado} cambiada a BENEFICIADO')

print(f'Total postulaciones BENEFICIADO: {PostulacionModel.objects.filter(estado="BENEFICIADO").count()}')