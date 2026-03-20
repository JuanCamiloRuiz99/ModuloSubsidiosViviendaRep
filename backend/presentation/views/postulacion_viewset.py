"""
ViewSet para Postulaciones.

Endpoints disponibles:
  GET   /api/postulaciones/registro-hogar/           → lista todos los registros del hogar
  GET   /api/postulaciones/registro-hogar/{pk}/      → detalle completo con miembros
  PATCH /api/postulaciones/registro-hogar/{pk}/      → actualiza datos del hogar y estado
  POST  /api/postulaciones/{id}/documentos-hogar/    → sube un documento adjunto
"""
from django.conf import settings
from django.core.files.storage import default_storage
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from infrastructure.database.models import (
    Postulacion,
    DocumentoGestionHogar,
    GestionHogarEtapa1,
)


TIPO_DOCUMENTO_LABELS = {
    'CEDULA_CIUDADANIA':           'Cédula de ciudadanía',
    'CEDULA_EXTRANJERIA':          'Cédula de extranjería',
    'TARJETA_IDENTIDAD':           'Tarjeta de identidad',
    'PASAPORTE':                   'Pasaporte',
    'REGISTRO_CIVIL':              'Registro civil',
    'PERMISO_PROTECCION_TEMPORAL': 'Permiso protección temporal',
}

ESTADO_LABELS = {
    'REGISTRADA':       'Registrada',
    'EN_REVISION':      'En revisión',
    'SUBSANACION':      'Subsanación',
    'VISITA_PENDIENTE': 'Visita pendiente',
    'VISITA_REALIZADA': 'Visita realizada',
    'APROBADA':         'Aprobada',
    'RECHAZADA':        'Rechazada',
}

ZONA_LABELS = {
    'URBANA': 'Urbana',
    'RURAL':  'Rural',
}

TIPO_DOC_GESTION_LABELS = {
    'FOTO_CEDULA_FRENTE': 'Foto cédula frente',
    'FOTO_CEDULA_REVERSO': 'Foto cédula reverso',
    'RECIBO_PREDIAL': 'Recibo predial',
    'CERTIFICADO_TRADICION_LIBERTAD': 'Certificado de tradición y libertad',
    'ESCRITURA_PUBLICA_PREDIO': 'Escritura pública del predio',
    'RECIBO_SERVICIOS_PUBLICOS': 'Recibo de servicios públicos',
    'DECLARACION_JURAMENTADA': 'Declaración juramentada',
    'CERTIFICADO_RESIDENCIA': 'Certificado de residencia',
    'CERTIFICADO_SISBEN': 'Certificado SISBEN',
    'CERTIFICADO_DISCAPACIDAD': 'Certificado de discapacidad',
    'REGISTRO_VICTIMA': 'Registro de víctima',
    'OTRO': 'Otro',
}

TIPO_DOC_MIEMBRO_LABELS = {
    'CEDULA': 'Cédula',
    'REGISTRO_CIVIL': 'Registro civil',
    'TARJETA_IDENTIDAD': 'Tarjeta de identidad',
    'CERTIFICADO_DISCAPACIDAD': 'Certificado de discapacidad',
    'CERTIFICADO_VICTIMA': 'Certificado de víctima',
    'OTRO': 'Otro',
}


def _build_media_url(request, path_from_db: str | None):
    """Construye una URL absoluta verificando la existencia del archivo."""
    if not path_from_db:
        return ''

    candidate = path_from_db.lstrip('/')

    # Ruta tal cual está guardada
    if default_storage.exists(candidate):
        return request.build_absolute_uri(f"{settings.MEDIA_URL}{candidate}")

    # Alternativa: quitar/agregar prefijo 'documentos/' si está desalineado
    if candidate.startswith('documentos/'):
        alt = candidate.replace('documentos/', '', 1)
    else:
        alt = f"documentos/{candidate}"

    if default_storage.exists(alt):
        return request.build_absolute_uri(f"{settings.MEDIA_URL}{alt}")

    return ''


class PostulacionViewSet(viewsets.GenericViewSet):
    """ViewSet para gestionar Postulaciones."""

    queryset = Postulacion.objects.all()
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='registro-hogar')
    def lista_registro_hogar(self, request):
        """
        Lista todos los registros del hogar con datos del ciudadano y estado de postulación.
        GET /api/postulaciones/registro-hogar/
        Soporta filtros opcionales por query params:
          ?estado=REGISTRADA
          ?programa_id=6
        """
        qs = (
            GestionHogarEtapa1.objects
            .select_related('ciudadano', 'postulacion__programa', 'etapa__programa')
            .annotate(total_miembros=Count('miembros'))
            .order_by('-fecha_radicado')
        )

        estado = request.query_params.get('estado')
        if estado:
            qs = qs.filter(postulacion__estado=estado)

        programa_id = request.query_params.get('programa_id')
        if programa_id:
            qs = qs.filter(
                Q(postulacion__programa_id=programa_id) |
                Q(postulacion__isnull=True, etapa__programa_id=programa_id)
            )

        results = []
        for g in qs:
            c = g.ciudadano
            p = g.postulacion

            ciudadano_data = None
            if c:
                ciudadano_data = {
                    'tipo_documento':       c.tipo_documento,
                    'tipo_documento_label': TIPO_DOCUMENTO_LABELS.get(c.tipo_documento, c.tipo_documento),
                    'numero_documento':     c.numero_documento,
                    'primer_nombre':        c.primer_nombre,
                    'segundo_nombre':       c.segundo_nombre or '',
                    'primer_apellido':      c.primer_apellido,
                    'segundo_apellido':     c.segundo_apellido or '',
                }

            estado_val   = p.estado if p else 'EN_REVISION'
            programa_nom = ''
            if p and p.programa_id:
                programa_nom = p.programa.nombre
            elif g.etapa_id and g.etapa.programa_id:
                programa_nom = g.etapa.programa.nombre

            results.append({
                'id':              g.id,
                'numero_radicado': g.numero_radicado,
                'fecha_radicado':  g.fecha_radicado,
                'id_postulacion':  p.id if p else None,
                'programa_id':     p.programa_id if p else (g.etapa.programa_id if g.etapa_id else None),
                'estado':          estado_val,
                'estado_label':    ESTADO_LABELS.get(estado_val, estado_val),
                'programa_nombre': programa_nom,
                'ciudadano':       ciudadano_data,
                'departamento':    g.departamento,
                'municipio':       g.municipio,
                'zona':            g.zona,
                'zona_label':      ZONA_LABELS.get(g.zona, g.zona),
                'tipo_predio':     g.tipo_predio,
                'direccion':       g.direccion,
                'total_miembros':  g.total_miembros,
            })

        return Response(results)


    @action(detail=False, methods=['get'], url_path=r'registro-hogar/(?P<pk>\d+)')
    def detalle_registro_hogar(self, request, pk=None):
        """
        Devuelve el detalle completo de un registro del hogar, incluyendo
        todos los campos del predio, los datos del ciudadano y los miembros del hogar.
        GET /api/postulaciones/registro-hogar/{pk}/
        """
        try:
            g = (
                GestionHogarEtapa1.objects
                .select_related('ciudadano', 'postulacion__programa', 'etapa__programa')
                .prefetch_related('miembros__documentos', 'documentos')
                .get(pk=pk)
            )
        except GestionHogarEtapa1.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        c = g.ciudadano
        p = g.postulacion

        ciudadano_data = None
        if c:
            ciudadano_data = {
                'id_persona':            c.id_persona,
                'tipo_documento':        c.tipo_documento,
                'tipo_documento_label':  TIPO_DOCUMENTO_LABELS.get(c.tipo_documento, c.tipo_documento),
                'numero_documento':      c.numero_documento,
                'primer_nombre':         c.primer_nombre,
                'segundo_nombre':        c.segundo_nombre or '',
                'primer_apellido':       c.primer_apellido,
                'segundo_apellido':      c.segundo_apellido or '',
                'fecha_nacimiento':      c.fecha_nacimiento,
                'sexo':                  c.sexo,
                'nacionalidad':          c.nacionalidad,
                'telefono':              c.telefono or '',
                'correo_electronico':    c.correo_electronico or '',
                'departamento_nacimiento': c.departamento_nacimiento or '',
                'municipio_nacimiento':    c.municipio_nacimiento or '',
            }

        miembros_data = []
        for m in g.miembros.all():
            docs_miembro = []
            for d in m.documentos.filter(activo_logico=True).order_by('-fecha_carga'):
                url = _build_media_url(request, getattr(d.archivo, 'name', None) or d.ruta_archivo)
                docs_miembro.append({
                    'id': d.id,
                    'tipo_documento': d.tipo_documento,
                    'tipo_documento_label': TIPO_DOC_MIEMBRO_LABELS.get(d.tipo_documento, d.tipo_documento),
                    'ruta_archivo': d.ruta_archivo,
                    'archivo_url': url,
                    'observaciones': d.observaciones or '',
                    'fecha_carga': d.fecha_carga,
                })

            miembros_data.append({
                'id':                m.id,
                'tipo_documento':    m.tipo_documento,
                'tipo_documento_label': TIPO_DOCUMENTO_LABELS.get(m.tipo_documento, m.tipo_documento),
                'numero_documento':  m.numero_documento,
                'primer_nombre':     m.primer_nombre,
                'segundo_nombre':    m.segundo_nombre or '',
                'primer_apellido':   m.primer_apellido,
                'segundo_apellido':  m.segundo_apellido or '',
                'fecha_nacimiento':  m.fecha_nacimiento,
                'parentesco':        m.parentesco,
                'es_cabeza_hogar':   m.es_cabeza_hogar,
                'nivel_educativo':   m.nivel_educativo or '',
                'situacion_laboral': m.situacion_laboral or '',
                'ingresos_mensuales': str(m.ingresos_mensuales) if m.ingresos_mensuales is not None else None,
                'pertenece_sisben':  m.pertenece_sisben,
                'grupo_sisben':      m.grupo_sisben or '',
                'tiene_discapacidad': m.tiene_discapacidad,
                'es_victima_conflicto': m.es_victima_conflicto,
                'es_desplazado':     m.es_desplazado,
                'parentesco_otro': m.parentesco_otro or '',
                'fuente_ingresos': m.fuente_ingresos or '',
                'puntaje_sisben': str(m.puntaje_sisben) if m.puntaje_sisben is not None else None,
                'grado_discapacidad': m.grado_discapacidad or '',
                'certificado_discapacidad': m.certificado_discapacidad,
                'numero_certificado': m.numero_certificado or '',
                'numero_ruv': m.numero_ruv or '',
                'hecho_victimizante': m.hecho_victimizante or '',
                'fecha_hecho_victimizante': m.fecha_hecho_victimizante,
                'fecha_desplazamiento': m.fecha_desplazamiento,
                'municipio_origen': m.municipio_origen or '',
                'departamento_origen': m.departamento_origen or '',
                'motivo_desplazamiento': m.motivo_desplazamiento or '',
                'es_firmante_paz': m.es_firmante_paz,
                'codigo_reincorporacion': m.codigo_reincorporacion or '',
                'etcr': m.etcr or '',
                'estado_proceso_reincorporacion': m.estado_proceso_reincorporacion or '',
                'documentos': docs_miembro,
            })

        estado_val = p.estado if p else 'EN_REVISION'
        programa_nom = ''
        if p and p.programa_id:
            programa_nom = p.programa.nombre
        elif g.etapa_id and g.etapa.programa_id:
            programa_nom = g.etapa.programa.nombre

        documentos_hogar = []
        for d in g.documentos.filter(activo_logico=True).order_by('-fecha_carga'):
            url = _build_media_url(request, getattr(d.archivo, 'name', None) or d.ruta_archivo)
            documentos_hogar.append({
                'id': d.id,
                'tipo_documento': d.tipo_documento,
                'tipo_documento_label': TIPO_DOC_GESTION_LABELS.get(d.tipo_documento, d.tipo_documento),
                'ruta_archivo': d.ruta_archivo,
                'archivo_url': url,
                'observaciones': d.observaciones or '',
                'fecha_carga': d.fecha_carga,
            })

        data = {
            'id':              g.id,
            'numero_radicado': g.numero_radicado,
            'fecha_radicado':  g.fecha_radicado,
            'id_postulacion':  p.id if p else None,
            'programa_id':     p.programa_id if p else (g.etapa.programa_id if g.etapa_id else None),
            'estado':          estado_val,
            'estado_label':    ESTADO_LABELS.get(estado_val, estado_val),
            'programa_nombre': programa_nom,
            # Titular
            'ciudadano': ciudadano_data,
            # Ubicación
            'departamento':             g.departamento,
            'municipio':                g.municipio,
            'zona':                     g.zona,
            'zona_label':               ZONA_LABELS.get(g.zona, g.zona),
            'tipo_predio':              g.tipo_predio,
            'comuna':                   g.comuna,
            'barrio_vereda':            g.barrio_vereda,
            'direccion':                g.direccion,
            'observaciones_direccion':  g.observaciones_direccion,
            # Predio
            'estrato':                  g.estrato,
            'es_propietario':           g.es_propietario,
            'numero_predial':           g.numero_predial,
            'matricula_inmobiliaria':   g.matricula_inmobiliaria,
            'avaluo_catastral':         g.avaluo_catastral,
            # Servicios
            'numero_matricula_agua':    g.numero_matricula_agua,
            'numero_contrato_energia':  g.numero_contrato_energia,
            # Adicional
            'tiempo_residencia':                g.tiempo_residencia,
            'tiene_dependientes':               g.tiene_dependientes,
            'personas_con_discapacidad_hogar':  g.personas_con_discapacidad_hogar,
            'acepta_terminos_condiciones':      g.acepta_terminos_condiciones,
            # Revisión interna
            'campos_incorrectos':    g.campos_incorrectos,
            'observaciones_revision': g.observaciones_revision,
            # Miembros
            'miembros': miembros_data,
            'total_miembros': len(miembros_data),
            # Documentos
            'documentos_hogar': documentos_hogar,
        }
        return Response(data)


    @action(detail=False, methods=['patch'], url_path=r'registro-hogar/(?P<pk>\d+)/actualizar')
    def actualizar_registro_hogar(self, request, pk=None):
        """
                Actualiza solo la revisión interna (campos incorrectos y observaciones)
                y ajusta el estado automáticamente.
                Reglas de estado:
                - Si viene estado=RECHAZADA → se rechaza con la observación enviada.
                - Si hay campos_incorrectos → SUBSANACION.
                - Si no hay campos_incorrectos → APROBADA.
                PATCH /api/postulaciones/registro-hogar/{pk}/actualizar/
        """
        try:
            g = (
                GestionHogarEtapa1.objects
                .select_related('postulacion')
                .get(pk=pk)
            )
        except GestionHogarEtapa1.DoesNotExist:
            return Response({'detail': 'No encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data

        campos_incorrectos = data.get('campos_incorrectos', [])
        if campos_incorrectos is None:
            campos_incorrectos = []
        observaciones = data.get('observaciones_revision', '')

        # Solo persistimos revisión interna
        g.campos_incorrectos     = campos_incorrectos
        g.observaciones_revision = observaciones
        g.save(update_fields=['campos_incorrectos', 'observaciones_revision'])

        # Ajuste de estado automático
        if g.postulacion:
            nuevo_estado = data.get('estado')
            if nuevo_estado == 'RECHAZADA':
                estado_final = 'RECHAZADA'
            else:
                estado_final = 'SUBSANACION' if campos_incorrectos else 'APROBADA'

            if estado_final not in dict(Postulacion.ESTADOS):
                return Response(
                    {'detail': f'Estado inválido: {estado_final}'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            g.postulacion.estado = estado_final
            g.postulacion.save(update_fields=['estado'])

        return Response({'detail': 'Actualizado correctamente.'})


    @action(detail=True, methods=['post'], url_path='documentos-hogar')
    def documentos_hogar(self, request, pk=None):
        """
        Sube un documento adjunto al registro del hogar.
        POST /api/postulaciones/{id}/documentos-hogar/
        Body (multipart/form-data):
          - tipo_documento  (str, requerido)
          - archivo         (file, requerido)
          - observaciones   (str, opcional)
        """
        postulacion = self.get_object()

        try:
            gestion = postulacion.gestion_hogar
        except Exception:
            return Response(
                {'detail': 'Esta postulación no tiene registro de hogar asociado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        tipo_documento = request.data.get('tipo_documento', '').strip()
        archivo        = request.FILES.get('archivo')
        observaciones  = request.data.get('observaciones', '')

        if not tipo_documento:
            return Response(
                {'detail': 'tipo_documento es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not archivo:
            return Response(
                {'detail': 'archivo es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doc = DocumentoGestionHogar.objects.create(
            postulacion=gestion,
            tipo_documento=tipo_documento,
            archivo=archivo,
            observaciones=observaciones,
        )
        return Response({'id': doc.id}, status=status.HTTP_201_CREATED)
