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
from django.db import transaction

from shared.file_validators import validate_uploaded_file
from django.db.models import Count, Q
from django.http import FileResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from infrastructure.database.models import (
    Programa,
    Etapa,
    Postulacion,
    DocumentoGestionHogar,
    DocumentoMiembroHogar,
    DocumentoVisitaEtapa2,
    DocumentoProcesoInterno,
    GestionHogarEtapa1,
    MiembroHogar,
    Visita,
)
from infrastructure.database.usuarios_models import UsuarioSistema


class ConsultaPublicaThrottle(AnonRateThrottle):
    rate = '5/minute'


TIPO_DOCUMENTO_LABELS = {
    'CEDULA_CIUDADANIA':           'Cédula de ciudadanía',
    'CEDULA_EXTRANJERIA':          'Cédula de extranjería',
    'TARJETA_IDENTIDAD':           'Tarjeta de identidad',
    'PASAPORTE':                   'Pasaporte',
    'REGISTRO_CIVIL':              'Registro civil',
    'PERMISO_PROTECCION_TEMPORAL': 'Permiso protección temporal',
}

ESTADO_LABELS = {
    'REGISTRADA':             'Registrada',
    'EN_REVISION':            'En revisión',
    'SUBSANACION':            'Subsanación',
    'VISITA_PENDIENTE':       'Visita pendiente',
    'VISITA_ASIGNADA':        'Visita asignada',
    'VISITA_PROGRAMADA':      'Visita programada',
    'VISITA_REALIZADA':       'Visita realizada',
    'DOCUMENTOS_INCOMPLETOS': 'Documentos incompletos',
    'DOCUMENTOS_CARGADOS':    'Documentos cargados',
    'BENEFICIADO':            'Beneficiado',
    'NO_BENEFICIARIO':        'No beneficiario',
    'APROBADA':               'Aprobada',
    'RECHAZADA':              'Rechazada',
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
            .select_related('ciudadano', 'postulacion__programa', 'postulacion__funcionario_asignado', 'etapa__programa')
            .prefetch_related('miembros')
            .annotate(total_miembros=Count('miembros'))
            .order_by('-fecha_radicado')
        )

        estado = request.query_params.get('estado')
        if estado:
            estados = [e.strip() for e in estado.split(',') if e.strip()]
            if len(estados) == 1:
                qs = qs.filter(postulacion__estado=estados[0])
            else:
                qs = qs.filter(postulacion__estado__in=estados)

        funcionario_id = request.query_params.get('funcionario_id')
        if funcionario_id:
            qs = qs.filter(postulacion__funcionario_asignado_id=funcionario_id)

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
            else:
                # Fallback: usar el miembro cabeza de hogar
                cabeza = next((m for m in g.miembros.all() if m.es_cabeza_hogar), None)
                if cabeza:
                    ciudadano_data = {
                        'tipo_documento':       cabeza.tipo_documento,
                        'tipo_documento_label': TIPO_DOCUMENTO_LABELS.get(cabeza.tipo_documento, cabeza.tipo_documento),
                        'numero_documento':     cabeza.numero_documento,
                        'primer_nombre':        cabeza.primer_nombre,
                        'segundo_nombre':       cabeza.segundo_nombre or '',
                        'primer_apellido':      cabeza.primer_apellido,
                        'segundo_apellido':     cabeza.segundo_apellido or '',
                    }

            estado_val   = p.estado if p else 'EN_REVISION'
            programa_nom = ''
            if p and p.programa_id:
                programa_nom = p.programa.nombre
            elif g.etapa_id and g.etapa.programa_id:
                programa_nom = g.etapa.programa.nombre

            # Buscar visita asociada a la postulación
            visita_obj = None
            visita_id = None
            if p:
                visita_obj = Visita.objects.filter(
                    postulacion_id=p.id, activo_logico=True,
                ).exclude(estado_visita='CANCELADA').select_related('encuestador').order_by('-fecha_registro').first()
                if visita_obj:
                    visita_id = visita_obj.id

            # Visitante asignado (encuestador de la visita)
            visitante_data = None
            if visita_obj and visita_obj.encuestador_id:
                enc = visita_obj.encuestador
                visitante_data = {
                    'id': enc.id_usuario,
                    'nombre': enc.nombre_completo,
                }

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
                'visita_id':       visita_id,
                'visitante_asignado': visitante_data,
                'funcionario_asignado': {
                    'id': p.funcionario_asignado.id_usuario,
                    'nombre': p.funcionario_asignado.nombre_completo,
                } if (p and p.funcionario_asignado_id) else None,
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
        else:
            # Fallback: usar el miembro marcado como cabeza de hogar
            cabeza = next((m for m in g.miembros.all() if m.es_cabeza_hogar), None)
            if cabeza:
                ciudadano_data = {
                    'id_persona':            None,
                    'tipo_documento':        cabeza.tipo_documento,
                    'tipo_documento_label':  TIPO_DOCUMENTO_LABELS.get(cabeza.tipo_documento, cabeza.tipo_documento),
                    'numero_documento':      cabeza.numero_documento,
                    'primer_nombre':         cabeza.primer_nombre,
                    'segundo_nombre':        cabeza.segundo_nombre or '',
                    'primer_apellido':       cabeza.primer_apellido,
                    'segundo_apellido':      cabeza.segundo_apellido or '',
                    'fecha_nacimiento':      cabeza.fecha_nacimiento,
                    'sexo':                  '',
                    'nacionalidad':          '',
                    'telefono':              '',
                    'correo_electronico':    '',
                    'departamento_nacimiento': '',
                    'municipio_nacimiento':    '',
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
                'sexo':              m.sexo if hasattr(m, 'sexo') else '',
                'telefono':          m.telefono if hasattr(m, 'telefono') else '',
                'correo_electronico': m.correo_electronico if hasattr(m, 'correo_electronico') else '',
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

        # Ajuste de estado automático
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

        # Validar que la transición de estado sea legal
        TRANSICIONES_PERMITIDAS = {
            'EN_REVISION': {'APROBADA', 'SUBSANACION', 'RECHAZADA'},
            'SUBSANACION': {'APROBADA', 'SUBSANACION', 'RECHAZADA'},
        }
        estado_actual = g.postulacion.estado if g.postulacion else None
        permitidos = TRANSICIONES_PERMITIDAS.get(estado_actual, set())
        if estado_final not in permitidos:
            return Response(
                {'detail': f'No se puede cambiar de "{estado_actual}" a "{estado_final}".'},
                status=status.HTTP_409_CONFLICT,
            )

        with transaction.atomic():
            g.campos_incorrectos     = campos_incorrectos
            g.observaciones_revision = observaciones
            g.save(update_fields=['campos_incorrectos', 'observaciones_revision'])

            if g.postulacion:
                g.postulacion.estado = estado_final
                g.postulacion.save(update_fields=['estado'])

        return Response({'detail': 'Actualizado correctamente.'})


    @action(detail=True, methods=['post'], url_path='documentos-hogar',
            permission_classes=[AllowAny])
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
        except GestionHogarEtapa1.DoesNotExist:
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

        tipos_validos = {c[0] for c in DocumentoGestionHogar.TIPO_CHOICES}
        if tipo_documento not in tipos_validos:
            return Response(
                {'detail': f'tipo_documento inválido. Valores permitidos: {sorted(tipos_validos)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        file_error = validate_uploaded_file(archivo)
        if file_error:
            return Response(
                {'detail': file_error},
                status=status.HTTP_400_BAD_REQUEST,
            )

        doc = DocumentoGestionHogar.objects.create(
            postulacion=gestion,
            tipo_documento=tipo_documento,
            archivo=archivo,
            observaciones=observaciones,
        )
        return Response({'id': doc.id}, status=status.HTTP_201_CREATED)

    # ── Distribución equitativa de postulaciones ─────────────────────── #

    @action(detail=False, methods=['get'], url_path='funcionarios-activos')
    def funcionarios_activos(self, request):
        """
        Lista los funcionarios activos (rol id=2) para asignar postulaciones.
        GET /api/postulaciones/funcionarios-activos/
        """
        funcionarios = UsuarioSistema.objects.filter(
            id_rol_id=2,
            activo=True,
            activo_logico=True,
        ).values('id_usuario', 'nombre_completo', 'correo')

        return Response(list(funcionarios))

    @action(detail=False, methods=['post'], url_path='distribuir')
    def distribuir(self, request):
        """
        Distribuye postulaciones equitativamente entre los funcionarios activos.
        POST /api/postulaciones/distribuir/
        Body: {
          "num_grupos": 3,             // Cantidad de grupos (= funcionarios a asignar)
          "funcionario_ids": [1,2,3],  // IDs de los funcionarios seleccionados
          "postulacion_ids": [5,8,...], // (opcional) IDs específicos a distribuir;
                                       //   si se omite, distribuye TODAS las no asignadas
        }
        """
        num_grupos = request.data.get('num_grupos')
        funcionario_ids = request.data.get('funcionario_ids', [])
        postulacion_ids = request.data.get('postulacion_ids', None)

        if not num_grupos or not isinstance(num_grupos, int) or num_grupos < 1:
            return Response(
                {'detail': 'num_grupos debe ser un entero mayor a 0.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not funcionario_ids or not isinstance(funcionario_ids, list):
            return Response(
                {'detail': 'funcionario_ids debe ser una lista de IDs de funcionarios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(funcionario_ids) != num_grupos:
            return Response(
                {'detail': 'La cantidad de funcionarios debe coincidir con num_grupos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar que los funcionarios existen y son FUNCIONARIO activo
        funcionarios = UsuarioSistema.objects.filter(
            id_usuario__in=funcionario_ids,
            id_rol_id=2,
            activo=True,
            activo_logico=True,
        )
        if funcionarios.count() != len(funcionario_ids):
            return Response(
                {'detail': 'Uno o más funcionarios no son válidos o no están activos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Obtener postulaciones a distribuir con lock (evitar doble asignación)
        with transaction.atomic():
            qs = Postulacion.objects.select_for_update().filter(
                activo_logico=True,
                funcionario_asignado__isnull=True,
            )
            if postulacion_ids:
                qs = qs.filter(id__in=postulacion_ids)

            postulaciones = list(qs.order_by('id'))
            total = len(postulaciones)

            if total == 0:
                return Response(
                    {'detail': 'No hay postulaciones disponibles para distribuir.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Distribución equitativa (round-robin)
            asignaciones = {fid: [] for fid in funcionario_ids}
            for idx, post in enumerate(postulaciones):
                fid = funcionario_ids[idx % num_grupos]
                asignaciones[fid].append(post.id)

            # Actualizar en base de datos
            total_asignadas = 0
            resumen = []
            func_map = {f.id_usuario: f.nombre_completo for f in funcionarios}
            for fid, pids in asignaciones.items():
                if pids:
                    Postulacion.objects.filter(id__in=pids).update(
                        funcionario_asignado_id=fid,
                        estado='EN_REVISION',
                    )
                    total_asignadas += len(pids)
                resumen.append({
                    'funcionario_id': fid,
                    'funcionario_nombre': func_map.get(fid, ''),
                    'cantidad': len(pids),
                    'postulacion_ids': pids,
                })

        return Response({
            'total_distribuidas': total_asignadas,
            'grupos': resumen,
        })

    @action(detail=False, methods=['post'], url_path='asignar-individual')
    def asignar_individual(self, request):
        """
        Asigna una postulación individual a un funcionario.
        POST /api/postulaciones/asignar-individual/
        Body: { "postulacion_id": 5, "funcionario_id": 2 }
        """
        postulacion_id = request.data.get('postulacion_id')
        funcionario_id = request.data.get('funcionario_id')

        if not postulacion_id or not funcionario_id:
            return Response(
                {'detail': 'postulacion_id y funcionario_id son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            postulacion = Postulacion.objects.get(id=postulacion_id, activo_logico=True)
        except Postulacion.DoesNotExist:
            return Response(
                {'detail': 'La postulación no existe o no está activa.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            funcionario = UsuarioSistema.objects.get(
                id_usuario=funcionario_id,
                id_rol_id=2,
                activo=True,
                activo_logico=True,
            )
        except UsuarioSistema.DoesNotExist:
            return Response(
                {'detail': 'El funcionario no existe o no está activo.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        postulacion.funcionario_asignado = funcionario
        if postulacion.estado == 'REGISTRADA':
            postulacion.estado = 'EN_REVISION'
        postulacion.save(update_fields=['funcionario_asignado', 'estado'])

        return Response({
            'detail': 'Postulación asignada correctamente.',
            'postulacion_id': postulacion.id,
            'funcionario_id': funcionario.id_usuario,
            'funcionario_nombre': funcionario.nombre_completo,
        })

    @action(detail=False, methods=['post'], url_path='descargar-documentos')
    def descargar_documentos(self, request):
        """
        Descarga masiva de documentos en ZIP.
        POST /api/postulaciones/descargar-documentos/
        Body: {
            "postulacion_ids": [1, 2, ...],
            "tipos_documento": {
                "hogar":   ["FOTO_CEDULA_FRENTE", ...],
                "miembro": ["CEDULA", ...],
                "visita":  ["RECIBO_PREDIAL", ...],
                "proceso": ["ACTA_VISITA_TECNICA", ...]
            }
        }
        """
        import io
        import os
        import zipfile
        import unicodedata
        import re

        postulacion_ids = request.data.get('postulacion_ids', [])
        tipos = request.data.get('tipos_documento', {})

        if not postulacion_ids:
            return Response(
                {'detail': 'Debe seleccionar al menos una postulación.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tipos_hogar   = tipos.get('hogar', [])
        tipos_miembro = tipos.get('miembro', [])
        tipos_visita  = tipos.get('visita', [])
        tipos_proceso = tipos.get('proceso', [])

        if not any([tipos_hogar, tipos_miembro, tipos_visita, tipos_proceso]):
            return Response(
                {'detail': 'Debe seleccionar al menos un tipo de documento.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar que los IDs sean enteros
        try:
            postulacion_ids = [int(pid) for pid in postulacion_ids]
        except (ValueError, TypeError):
            return Response(
                {'detail': 'IDs de postulación inválidos.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Obtener postulaciones con sus relaciones
        postulaciones = Postulacion.objects.filter(
            id__in=postulacion_ids, activo_logico=True,
        ).select_related('programa')

        if not postulaciones.exists():
            return Response(
                {'detail': 'No se encontraron postulaciones válidas.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        from datetime import date as date_cls

        def safe_filename(name):
            """Elimina caracteres no válidos para nombres de carpeta."""
            name = unicodedata.normalize('NFKD', name)
            name = re.sub(r'[^\w\s\-.]', '', name)
            return name.strip()[:100]

        fecha_descarga = date_cls.today().strftime('%Y-%m-%d')

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
            for postulacion in postulaciones:
                # Datos para la carpeta
                programa_nombre = safe_filename(
                    postulacion.programa.nombre if postulacion.programa else 'Sin_programa'
                )

                # Nombre de la persona (cabeza de hogar)
                gestion = GestionHogarEtapa1.objects.filter(
                    postulacion=postulacion,
                ).select_related('ciudadano').first()

                if gestion and gestion.ciudadano:
                    c = gestion.ciudadano
                    partes = [c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido]
                    persona = safe_filename(' '.join(p for p in partes if p))
                else:
                    persona = 'Sin_nombre'

                fecha_post = ''
                if postulacion.fecha_postulacion:
                    fecha_post = f' ({postulacion.fecha_postulacion.strftime("%Y-%m-%d")})'

                carpeta_base = f'{programa_nombre} - {fecha_descarga}/{persona}_{postulacion.id}{fecha_post}'

                # Siempre crear la carpeta de la postulación (aunque no tenga documentos)
                zf.writestr(f'{carpeta_base}/', '')

                # 1) Documentos del hogar (Etapa 1)
                if tipos_hogar and gestion:
                    docs_hogar = DocumentoGestionHogar.objects.filter(
                        postulacion=gestion,
                        tipo_documento__in=tipos_hogar,
                        activo_logico=True,
                    )
                    tipo_count: dict[str, int] = {}
                    for doc in docs_hogar:
                        tipo_count[doc.tipo_documento] = tipo_count.get(doc.tipo_documento, 0) + 1
                        self._add_doc_to_zip(zf, doc.archivo, carpeta_base, doc.tipo_documento, tipo_count[doc.tipo_documento])

                # 2) Documentos de miembros
                if tipos_miembro and gestion:
                    miembros = MiembroHogar.objects.filter(postulacion=gestion)
                    for miembro in miembros:
                        nombre_miembro = safe_filename(
                            f'{miembro.primer_nombre} {miembro.primer_apellido}'
                        )
                        docs_miembro = DocumentoMiembroHogar.objects.filter(
                            miembro=miembro,
                            tipo_documento__in=tipos_miembro,
                            activo_logico=True,
                        )
                        tipo_count_m: dict[str, int] = {}
                        for doc in docs_miembro:
                            tipo_count_m[doc.tipo_documento] = tipo_count_m.get(doc.tipo_documento, 0) + 1
                            subcarpeta = f'{carpeta_base}/miembros/{nombre_miembro}'
                            self._add_doc_to_zip(zf, doc.archivo, subcarpeta, doc.tipo_documento, tipo_count_m[doc.tipo_documento])

                # 3) Documentos de visita (Etapa 2)
                if tipos_visita:
                    visitas = Visita.objects.filter(
                        postulacion=postulacion, activo_logico=True,
                    )
                    tipo_count_v: dict[str, int] = {}
                    for visita in visitas:
                        docs_visita = DocumentoVisitaEtapa2.objects.filter(
                            visita=visita,
                            tipo_documento__in=tipos_visita,
                            activo_logico=True,
                        )
                        for doc in docs_visita:
                            tipo_count_v[doc.tipo_documento] = tipo_count_v.get(doc.tipo_documento, 0) + 1
                            self._add_doc_to_zip(zf, doc.archivo, carpeta_base, doc.tipo_documento, tipo_count_v[doc.tipo_documento])

                # 4) Documentos proceso interno (Etapa 3)
                if tipos_proceso:
                    docs_proceso = DocumentoProcesoInterno.objects.filter(
                        postulacion=postulacion,
                        tipo_documento__in=tipos_proceso,
                        activo_logico=True,
                    )
                    tipo_count_p: dict[str, int] = {}
                    for doc in docs_proceso:
                        tipo_count_p[doc.tipo_documento] = tipo_count_p.get(doc.tipo_documento, 0) + 1
                        self._add_doc_to_zip(zf, doc.archivo, carpeta_base, doc.tipo_documento, tipo_count_p[doc.tipo_documento])

        buf.seek(0)
        # Nombre descriptivo para el ZIP
        programas_en_descarga = set(
            safe_filename(p.programa.nombre) for p in postulaciones if p.programa
        )
        if len(programas_en_descarga) == 1:
            zip_name = f'{programas_en_descarga.pop()} - {fecha_descarga}.zip'
        else:
            zip_name = f'Documentos_postulaciones - {fecha_descarga}.zip'
        response = FileResponse(buf, content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{zip_name}"'
        return response

    @staticmethod
    def _resolve_storage_path(name):
        """Resuelve la ruta real en el storage, manejando el prefijo documentos/ duplicado."""
        candidate = name.lstrip('/')
        if default_storage.exists(candidate):
            return candidate
        # Quitar o agregar prefijo 'documentos/' si está desalineado con MEDIA_ROOT
        if candidate.startswith('documentos/'):
            alt = candidate.replace('documentos/', '', 1)
        else:
            alt = f'documentos/{candidate}'
        if default_storage.exists(alt):
            return alt
        return None

    @staticmethod
    def _add_doc_to_zip(zf, archivo_field, carpeta, tipo_doc, counter=None):
        """Agrega un archivo al ZIP si existe en el storage."""
        import os
        if not archivo_field or not archivo_field.name:
            return
        resolved = PostulacionViewSet._resolve_storage_path(archivo_field.name)
        if not resolved:
            return
        try:
            with default_storage.open(resolved, 'rb') as f:
                ext = os.path.splitext(archivo_field.name)[1]
                # Usar sufijo numérico si hay duplicados del mismo tipo
                suffix = f'_{counter}' if counter and counter > 1 else ''
                nombre_en_zip = f'{carpeta}/{tipo_doc}{suffix}{ext}'
                zf.writestr(nombre_en_zip, f.read())
        except (FileNotFoundError, OSError):
            pass

    @action(detail=False, methods=['get'], url_path='consultar-estado',
            permission_classes=[AllowAny],
            throttle_classes=[ConsultaPublicaThrottle])
    def consultar_estado(self, request):
        """
        Consulta pública del estado de postulación por número de documento.
        Solo devuelve información si el ciudadano es cabeza de hogar.
        GET /api/postulaciones/consultar-estado/?numero_documento=123456
        """
        numero_documento = request.query_params.get('numero_documento', '').strip()
        if not numero_documento:
            return Response(
                {'detail': 'Debe proporcionar el número de documento.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Buscar miembros del hogar que sean cabeza de hogar con ese documento
        miembros = MiembroHogar.objects.filter(
            numero_documento=numero_documento,
            es_cabeza_hogar=True,
        ).select_related(
            'postulacion',
            'postulacion__postulacion',
            'postulacion__postulacion__programa',
        )

        if not miembros.exists():
            return Response(
                {'detail': 'No se encontró una postulación asociada a este número de documento.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        resultados = []
        for miembro in miembros:
            gestion = miembro.postulacion
            postulacion = gestion.postulacion if gestion else None
            if not postulacion:
                continue
            # Ocultar resultado si el programa culminó y no es beneficiario
            programa = postulacion.programa
            if (programa and programa.estado == 'CULMINADO'
                    and postulacion.estado == 'NO_BENEFICIARIO'):
                continue
            resultados.append({
                'numero_radicado': gestion.numero_radicado,
                'programa': programa.nombre if programa else '',
                'estado': postulacion.estado,
                'estado_label': dict(Postulacion.ESTADOS).get(postulacion.estado, postulacion.estado),
                'fecha_postulacion': postulacion.fecha_postulacion,
                'nombre_postulante': f'{miembro.primer_nombre} {miembro.primer_apellido}',
            })

        if not resultados:
            return Response(
                {'detail': 'No se encontró una postulación asociada a este número de documento.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(resultados)

    # ────────────────────────────────────────────────────────────────────── #
    # Sorteo de beneficiarios
    # ────────────────────────────────────────────────────────────────────── #

    @action(detail=False, methods=['get'], url_path='sorteo/estado')
    def sorteo_estado(self, request):
        """
        Consulta el estado del sorteo para un programa.
        GET /api/postulaciones/sorteo/estado/?programa_id=6
        Retorna:
          - elegibles: cantidad de postulaciones con DOCUMENTOS_CARGADOS
          - ya_sorteadas: cantidad con BENEFICIADO o NO_BENEFICIARIO
          - sorteo_realizado: bool
        """
        programa_id = request.query_params.get('programa_id')
        if not programa_id:
            return Response({'detail': 'Se requiere programa_id.'}, status=status.HTTP_400_BAD_REQUEST)

        elegibles = Postulacion.objects.filter(
            programa_id=programa_id, estado='DOCUMENTOS_CARGADOS',
        ).count()

        ya_sorteadas = Postulacion.objects.filter(
            programa_id=programa_id, estado__in=['BENEFICIADO', 'NO_BENEFICIARIO'],
        ).count()

        return Response({
            'elegibles': elegibles,
            'ya_sorteadas': ya_sorteadas,
            'sorteo_realizado': ya_sorteadas > 0,
        })

    @action(detail=False, methods=['get'], url_path='sorteo/elegibles')
    def sorteo_elegibles(self, request):
        """
        Lista las postulaciones elegibles (DOCUMENTOS_CARGADOS) para un programa.
        GET /api/postulaciones/sorteo/elegibles/?programa_id=6
        """
        programa_id = request.query_params.get('programa_id')
        if not programa_id:
            return Response({'detail': 'Se requiere programa_id.'}, status=status.HTTP_400_BAD_REQUEST)

        postulaciones = (
            Postulacion.objects
            .filter(programa_id=programa_id, estado='DOCUMENTOS_CARGADOS')
            .select_related('programa')
            .order_by('id')
        )

        # Obtener datos del ciudadano asociado a cada postulación
        resultados = []
        for p in postulaciones:
            hogar = (
                GestionHogarEtapa1.objects
                .filter(postulacion=p)
                .select_related('ciudadano')
                .first()
            )
            ciudadano = hogar.ciudadano if hogar else None
            resultados.append({
                'id': p.id,
                'numero_radicado': hogar.numero_radicado if hogar else f'POST-{p.id}',
                'nombre': (
                    f'{ciudadano.primer_nombre} {ciudadano.primer_apellido}'
                    if ciudadano else f'Postulación #{p.id}'
                ),
                'documento': (
                    f'{ciudadano.numero_documento}'
                    if ciudadano else ''
                ),
                'fecha_postulacion': str(p.fecha_postulacion) if p.fecha_postulacion else '',
            })

        return Response(resultados)

    @action(detail=False, methods=['get'], url_path='sorteo/resultados')
    def sorteo_resultados(self, request):
        """
        Devuelve los resultados del sorteo ya realizado.
        GET /api/postulaciones/sorteo/resultados/?programa_id=6
        """
        programa_id = request.query_params.get('programa_id')
        if not programa_id:
            return Response({'detail': 'Se requiere programa_id.'}, status=status.HTTP_400_BAD_REQUEST)

        beneficiados = list(
            Postulacion.objects.filter(programa_id=programa_id, estado='BENEFICIADO').order_by('id')
        )
        no_beneficiarios = list(
            Postulacion.objects.filter(programa_id=programa_id, estado='NO_BENEFICIARIO').order_by('id')
        )

        if not beneficiados and not no_beneficiarios:
            return Response({'detail': 'No se ha realizado un sorteo para este programa.'}, status=status.HTTP_404_NOT_FOUND)

        def _build(postulaciones, estado_label):
            result = []
            for p in postulaciones:
                hogar = (
                    GestionHogarEtapa1.objects
                    .filter(postulacion=p)
                    .select_related('ciudadano')
                    .first()
                )
                ciudadano = hogar.ciudadano if hogar else None
                result.append({
                    'id': p.id,
                    'numero_radicado': hogar.numero_radicado if hogar else f'POST-{p.id}',
                    'nombre': (
                        f'{ciudadano.primer_nombre} {ciudadano.primer_apellido}'
                        if ciudadano else f'Postulación #{p.id}'
                    ),
                    'estado': estado_label,
                })
            return result

        return Response({
            'total_elegibles': len(beneficiados) + len(no_beneficiarios),
            'total_beneficiados': len(beneficiados),
            'total_no_beneficiarios': len(no_beneficiarios),
            'beneficiados': _build(beneficiados, 'BENEFICIADO'),
            'no_beneficiarios': _build(no_beneficiarios, 'NO_BENEFICIARIO'),
        })

    @action(detail=False, methods=['get'], url_path='sorteo/descargar')
    def sorteo_descargar(self, request):
        """
        Descarga los resultados del sorteo como archivo CSV.
        GET /api/postulaciones/sorteo/descargar/?programa_id=6
        """
        import csv
        from django.http import HttpResponse

        programa_id = request.query_params.get('programa_id')
        if not programa_id:
            return Response({'detail': 'Se requiere programa_id.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            programa_obj = Programa.objects.get(id=programa_id)
        except Programa.DoesNotExist:
            return Response({'detail': 'Programa no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        beneficiados = list(
            Postulacion.objects.filter(programa_id=programa_id, estado='BENEFICIADO').order_by('id')
        )
        no_beneficiarios = list(
            Postulacion.objects.filter(programa_id=programa_id, estado='NO_BENEFICIARIO').order_by('id')
        )

        if not beneficiados and not no_beneficiarios:
            return Response({'detail': 'No se ha realizado un sorteo para este programa.'}, status=status.HTTP_404_NOT_FOUND)

        # Sanitize program name for filename
        nombre_seguro = programa_obj.nombre.replace(' ', '_').replace('/', '-')[:50]
        filename = f"Resultados_Sorteo_{nombre_seguro}.csv"

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response.write('\ufeff')  # BOM for Excel UTF-8

        writer = csv.writer(response)
        writer.writerow(['#', 'Nombre', 'Número de radicado', 'Estado'])

        def _write_rows(postulaciones, estado_label):
            for i, p in enumerate(postulaciones, 1):
                hogar = (
                    GestionHogarEtapa1.objects
                    .filter(postulacion=p)
                    .select_related('ciudadano')
                    .first()
                )
                ciudadano = hogar.ciudadano if hogar else None
                nombre = (
                    f'{ciudadano.primer_nombre} {ciudadano.primer_apellido}'
                    if ciudadano else f'Postulación #{p.id}'
                )
                radicado = hogar.numero_radicado if hogar else f'POST-{p.id}'
                writer.writerow([i, nombre, radicado, estado_label])

        _write_rows(beneficiados, 'Beneficiado')
        _write_rows(no_beneficiarios, 'No beneficiario')

        return response

    @action(detail=False, methods=['post'], url_path='sorteo/ejecutar')
    def sorteo_ejecutar(self, request):
        """
        Ejecuta el sorteo aleatorio. Solo se puede hacer UNA VEZ por programa.
        POST /api/postulaciones/sorteo/ejecutar/
        Body: { "programa_id": 6, "cantidad_beneficiarios": 10 }
        """
        import random as _random_mod
        rng = _random_mod.SystemRandom()

        programa_id = request.data.get('programa_id')
        cantidad = request.data.get('cantidad_beneficiarios')

        if not programa_id or cantidad is None:
            return Response(
                {'detail': 'Se requiere programa_id y cantidad_beneficiarios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            cantidad = int(cantidad)
        except (TypeError, ValueError):
            return Response(
                {'detail': 'cantidad_beneficiarios debe ser un número entero.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if cantidad < 1:
            return Response(
                {'detail': 'La cantidad de beneficiarios debe ser al menos 1.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Verificar que todas las etapas estén cerradas
            etapas_abiertas = Etapa.objects.filter(programa_id=programa_id, finalizada=False).count()
            if etapas_abiertas > 0:
                return Response(
                    {'detail': f'No se puede ejecutar el sorteo: hay {etapas_abiertas} etapa(s) sin finalizar. Todas las etapas deben estar cerradas.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Verificar que no se haya hecho sorteo antes (lock rows)
            ya_sorteadas = (
                Postulacion.objects
                .select_for_update()
                .filter(programa_id=programa_id, estado__in=['BENEFICIADO', 'NO_BENEFICIARIO'])
                .exists()
            )
            if ya_sorteadas:
                return Response(
                    {'detail': 'Ya se realizó un sorteo para este programa. No se puede repetir.'},
                    status=status.HTTP_409_CONFLICT,
                )

            # Obtener elegibles con lock
            elegibles = list(
                Postulacion.objects
                .select_for_update()
                .filter(programa_id=programa_id, estado='DOCUMENTOS_CARGADOS')
                .order_by('id')
            )

            if not elegibles:
                return Response(
                    {'detail': 'No hay postulaciones con documentos cargados para sortear.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if cantidad > len(elegibles):
                return Response(
                    {'detail': f'La cantidad de beneficiarios ({cantidad}) supera el total de elegibles ({len(elegibles)}).'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Sorteo aleatorio con CSPRNG
            rng.shuffle(elegibles)
            beneficiados = elegibles[:cantidad]
            no_beneficiados = elegibles[cantidad:]

            ids_beneficiados = [p.id for p in beneficiados]
            ids_no_beneficiados = [p.id for p in no_beneficiados]

            Postulacion.objects.filter(id__in=ids_beneficiados).update(estado='BENEFICIADO')
            Postulacion.objects.filter(id__in=ids_no_beneficiados).update(estado='NO_BENEFICIARIO')

            try:
                programa_obj = Programa.objects.get(id=programa_id)
                programa_obj.estado = 'CULMINADO'
                programa_obj.save(update_fields=['estado'])
                Etapa.objects.filter(programa_id=programa_id, finalizada=False).update(
                    finalizada=True,
                    fecha_finalizacion=timezone.now(),
                )
            except Programa.DoesNotExist:
                pass

        # Construir resultado con nombres
        def _build_result(postulaciones, estado_label):
            result = []
            for p in postulaciones:
                hogar = (
                    GestionHogarEtapa1.objects
                    .filter(postulacion=p)
                    .select_related('ciudadano')
                    .first()
                )
                ciudadano = hogar.ciudadano if hogar else None
                result.append({
                    'id': p.id,
                    'numero_radicado': hogar.numero_radicado if hogar else f'POST-{p.id}',
                    'nombre': (
                        f'{ciudadano.primer_nombre} {ciudadano.primer_apellido}'
                        if ciudadano else f'Postulación #{p.id}'
                    ),
                    'estado': estado_label,
                })
            return result

        return Response({
            'total_elegibles': len(elegibles),
            'total_beneficiados': len(beneficiados),
            'total_no_beneficiarios': len(no_beneficiados),
            'beneficiados': _build_result(beneficiados, 'BENEFICIADO'),
            'no_beneficiarios': _build_result(no_beneficiados, 'NO_BENEFICIARIO'),
        })
