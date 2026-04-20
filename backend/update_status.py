from infrastructure.database.postulaciones_models import Postulacion as PostulacionModel
postulaciones = PostulacionModel.objects.filter(estado='APROBADA')[:3]
for p in postulaciones:
    p.estado = 'BENEFICIADO'
    p.save()
    print(f'Postulación {p.numero_radicado} cambiada a BENEFICIADO')
print(f'Total postulaciones BENEFICIADO: {PostulacionModel.objects.filter(estado="BENEFICIADO").count()}')