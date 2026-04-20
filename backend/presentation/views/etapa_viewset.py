"""
ViewSet para la entidad Etapa

Proporciona endpoints REST para CRUD de etapas del proceso
"""
from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from infrastructure.database.models import (
    Etapa, FormularioEtapa, CampoFormulario, Ciudadano,
    ConfigRegistroHogar, ConfigVisitaTecnica, ConfigGestionDocumental,
    Postulacion, GestionHogarEtapa1, MiembroHogar,
)
from presentation.serializers.etapa_serializer import EtapaSerializer
from presentation.serializers.registro_hogar_serializer import RegistroHogarSubmitSerializer


def _validar_campos_config(campos_data):
    """Valida que cada entrada del dict campos tenga 'requerido' y 'habilitado' como booleanos."""
    if not isinstance(campos_data, dict):
        return 'El campo "campos" debe ser un objeto.'
    for campo_id, cfg in campos_data.items():
        if not isinstance(cfg, dict) or 'requerido' not in cfg or 'habilitado' not in cfg:
            return f'Entrada inválida para el campo "{campo_id}". Se esperan las claves "requerido" y "habilitado".'
        if not isinstance(cfg['requerido'], bool) or not isinstance(cfg['habilitado'], bool):
            return f'Los valores de "requerido" y "habilitado" deben ser booleanos en el campo "{campo_id}".'
    return None


class EtapaViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar Etapas de proceso"""

    serializer_class = EtapaSerializer

    # list y retrieve son públicos (HomePage ciudadano consulta etapas).
    PUBLIC_ACTIONS = {'list', 'retrieve'}

    def get_permissions(self):
        if self.action in self.PUBLIC_ACTIONS:
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        """Retorna etapas activas, filtradas por programa si se proporciona"""
        queryset = (
            Etapa.objects.filter(activo_logico=True)
            .select_related(
                'programa',
                'formulario',
                'config_registro_hogar',
                'config_visita_tecnica',
                'config_gestion_documental',
            )
            .order_by('numero_etapa')
        )
        programa_id = self.request.query_params.get('programa', None)
        if programa_id:
            queryset = queryset.filter(programa_id=programa_id)
        return queryset

    def perform_update(self, serializer):
        """Registra fecha de modificación al actualizar"""
        serializer.save(fecha_modificacion=timezone.now())

    def destroy(self, request, *args, **kwargs):
        """Soft-delete: marca la etapa como inactiva."""
        etapa = self.get_object()
        etapa.activo_logico = False
        etapa.save(update_fields=['activo_logico'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get', 'post'], url_path='formulario')
    def formulario(self, request, pk=None):
        """
        GET  – Devuelve la configuración guardada del formulario de la etapa.
        POST – Crea o reemplaza el formulario de la etapa.
               Body: { "campos": [{"campo_catalogo": ..., "orden": ..., "obligatorio": ..., "texto_ayuda": ...}] }
        """
        etapa = self.get_object()

        # ── GET ─────────────────────────────────────────────────────────── #
        if request.method == 'GET':
            try:
                formulario = etapa.formulario
                campos = list(
                    formulario.campos.order_by('orden').values(
                        'campo_catalogo', 'orden', 'obligatorio', 'texto_ayuda'
                    )
                )
                return Response({
                    'estado': formulario.estado,
                    'fecha_publicacion': formulario.fecha_publicacion,
                    'campos': campos,
                })
            except FormularioEtapa.DoesNotExist:
                return Response({'estado': None, 'fecha_publicacion': None, 'campos': []})

        # ── POST ─────────────────────────────────────────────────────────── #
        campos_data = request.data.get('campos', [])

        if not isinstance(campos_data, list) or len(campos_data) == 0:
            return Response(
                {'detail': 'Se requiere al menos un campo en el formulario.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        formulario, _ = FormularioEtapa.objects.get_or_create(etapa=etapa)

        with transaction.atomic():
            formulario.campos.all().delete()

            for item in campos_data:
                campo_catalogo = str(item.get('campo_catalogo', '')).strip()
                if not campo_catalogo:
                    continue
                CampoFormulario.objects.create(
                    formulario=formulario,
                    campo_catalogo=campo_catalogo,
                    orden=int(item.get('orden', 1)),
                    obligatorio=bool(item.get('obligatorio', True)),
                    texto_ayuda=str(item.get('texto_ayuda', '')),
                )

            # Guardar sin publicar: conservar el estado actual (BORRADOR por defecto)
            ahora = timezone.now()
            etapa.fecha_modificacion = ahora
            etapa.save(update_fields=['fecha_modificacion'])

        campos_resp = list(
            formulario.campos.order_by('orden').values(
                'campo_catalogo', 'orden', 'obligatorio', 'texto_ayuda'
            )
        )
        return Response({
            'estado': formulario.estado,
            'fecha_publicacion': formulario.fecha_publicacion,
            'campos': campos_resp,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='inhabilitar-formulario')
    def inhabilitar_formulario(self, request, pk=None):
        """
        Toggle del estado del formulario:
        - Si PUBLICADO → cambiar a INHABILITADO
        - Si INHABILITADO → cambiar a PUBLICADO
        """
        etapa = self.get_object()
        try:
            formulario = etapa.formulario
        except FormularioEtapa.DoesNotExist:
            return Response(
                {'detail': 'Esta etapa no tiene formulario configurado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Toggle entre PUBLICADO e INHABILITADO
        if formulario.estado == 'PUBLICADO':
            formulario.estado = 'INHABILITADO'
        elif formulario.estado == 'INHABILITADO':
            formulario.estado = 'PUBLICADO'
            # Restaurar fecha de publicación si se reactiva
            if not formulario.fecha_publicacion:
                formulario.fecha_publicacion = timezone.now()
        else:
            # Si está en BORRADOR, no se puede in/habilitar
            return Response(
                {'detail': 'El formulario debe estar publicado para ser inhabilitado.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        formulario.save(update_fields=['estado', 'fecha_publicacion'])

        campos = list(
            formulario.campos.order_by('orden').values(
                'campo_catalogo', 'orden', 'obligatorio', 'texto_ayuda'
            )
        )
        return Response({
            'estado': formulario.estado,
            'fecha_publicacion': formulario.fecha_publicacion,
            'campos': campos,
        })

    @action(detail=True, methods=['post'], url_path='publicar-formulario')
    def publicar_formulario(self, request, pk=None):
        """
        Publica el formulario de la etapa sin necesidad de reenviar campos.
        POST /api/etapas/{id}/publicar-formulario/
        Requiere que el formulario ya tenga campos configurados.
        """
        etapa = self.get_object()

        # Validar que el sorteo esté realizado para etapas posteriores a la 1
        if etapa.numero_etapa > 1:
            ya_sorteadas = Postulacion.objects.filter(
                programa_id=etapa.programa_id,
                estado__in=['BENEFICIADO', 'NO_BENEFICIARIO']
            ).exists()
            if not ya_sorteadas:
                return Response(
                    {'detail': 'No se puede publicar: el sorteo de beneficiarios debe estar realizado antes de publicar etapas posteriores.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            formulario = etapa.formulario
        except FormularioEtapa.DoesNotExist:
            return Response(
                {'detail': 'Esta etapa no tiene formulario configurado.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        if not formulario.campos.exists():
            return Response(
                {'detail': 'El formulario no tiene campos configurados.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        formulario.estado = 'PUBLICADO'
        formulario.fecha_publicacion = timezone.now()
        formulario.save(update_fields=['estado', 'fecha_publicacion'])
        return Response({'estado': 'PUBLICADO', 'fecha_publicacion': formulario.fecha_publicacion})

    @action(detail=True, methods=['post'], url_path='enviar-formulario',
            permission_classes=[AllowAny],
            throttle_classes=[AnonRateThrottle])
    def enviar_formulario(self, request, pk=None):
        """
        Endpoint público para registrar los datos de un ciudadano.
        POST /api/etapas/{id}/enviar-formulario/
        Body: { "respuestas": { "tipo_documento": "CEDULA_CIUDADANIA", ... } }
        Crea o actualiza el registro en la tabla `ciudadanos`.
        """
        etapa = self.get_object()

        try:
            formulario = etapa.formulario
        except FormularioEtapa.DoesNotExist:
            return Response(
                {'detail': 'Esta etapa no tiene formulario configurado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if formulario.estado != 'PUBLICADO':
            return Response(
                {'detail': 'El formulario no está disponible para recibir respuestas.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        respuestas = request.data.get('respuestas', {})
        if not isinstance(respuestas, dict):
            return Response(
                {'detail': 'El campo "respuestas" debe ser un objeto clave-valor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validar campos obligatorios según la config del formulario
        errores = {}
        for campo in formulario.campos.filter(obligatorio=True):
            if not str(respuestas.get(campo.campo_catalogo, '')).strip():
                errores[campo.campo_catalogo] = 'Este campo es obligatorio.'

        if errores:
            return Response({'errores': errores}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        def campo(key):
            """Extrae y limpia un valor del dict de respuestas."""
            val = str(respuestas.get(key, '')).strip()
            return val if val else None

        datos = {
            'primer_nombre':           campo('primer_nombre') or '',
            'segundo_nombre':          campo('segundo_nombre'),
            'primer_apellido':         campo('primer_apellido') or '',
            'segundo_apellido':        campo('segundo_apellido'),
            'fecha_nacimiento':        campo('fecha_nacimiento') or '',
            'sexo':                    campo('sexo') or '',
            'genero':                  campo('genero'),
            'nacionalidad':            campo('nacionalidad') or '',
            'telefono':                campo('telefono'),
            'correo_electronico':      campo('correo_electronico'),
            'departamento_nacimiento': campo('departamento_nacimiento'),
            'municipio_nacimiento':    campo('municipio_nacimiento'),
            'formulario':              formulario,
        }

        tipo_doc = campo('tipo_documento') or ''
        num_doc  = campo('numero_documento') or ''

        if not tipo_doc or not num_doc:
            return Response(
                {'errores': {
                    'tipo_documento':   'Requerido.' if not tipo_doc else '',
                    'numero_documento': 'Requerido.' if not num_doc else '',
                }},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        ciudadano, creado = Ciudadano.objects.update_or_create(
            tipo_documento=tipo_doc,
            numero_documento=num_doc,
            defaults=datos,
        )

        return Response({
            'id_persona':      ciudadano.pk,
            'primer_nombre':   ciudadano.primer_nombre,
            'primer_apellido': ciudadano.primer_apellido,
            'fecha_creacion':  ciudadano.fecha_creacion,
            'registrado':      creado,
        }, status=status.HTTP_201_CREATED if creado else status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='info-publica',
            permission_classes=[AllowAny])
    def info_publica(self, request, pk=None):
        """
        Devuelve información básica pública de la etapa (nombre del programa,
        número de etapa) sin requerir autenticación ni FormularioEtapa.
        GET /api/etapas/{id}/info-publica/
        """
        etapa = self.get_object()
        try:
            registro_hogar_publicado = etapa.config_registro_hogar.publicado
        except ConfigRegistroHogar.DoesNotExist:
            registro_hogar_publicado = False
        return Response({
            'etapa_id':       etapa.id,
            'numero_etapa':   etapa.numero_etapa,
            'programa_nombre': etapa.programa.nombre,
            'registro_hogar_publicado': registro_hogar_publicado,
        })

    @action(detail=True, methods=['get'], url_path='formulario-publico',
            permission_classes=[AllowAny])
    def formulario_publico(self, request, pk=None):
        """
        Endpoint público (sin autenticación) que devuelve el formulario
        publicado de una etapa para que el ciudadano lo pueda completar.
        """
        etapa = self.get_object()

        try:
            formulario = etapa.formulario
        except FormularioEtapa.DoesNotExist:
            return Response(
                {'detail': 'Esta etapa aún no tiene formulario configurado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if formulario.estado != 'PUBLICADO':
            return Response(
                {'detail': 'El formulario de esta etapa aún no ha sido publicado.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        campos = list(
            formulario.campos.order_by('orden').values(
                'campo_catalogo', 'orden', 'obligatorio', 'texto_ayuda'
            )
        )
        return Response({
            'etapa_id': etapa.id,
            'numero_etapa': etapa.numero_etapa,
            'modulo_principal': etapa.modulo_principal,
            'programa_nombre': etapa.programa.nombre,
            'estado': formulario.estado,
            'fecha_publicacion': formulario.fecha_publicacion,
            'campos': campos,
        })

    @action(detail=True, methods=['get', 'post'], url_path='registro-hogar-config')
    def registro_hogar_config(self, request, pk=None):
        """
        GET  – Devuelve la configuración de campos del formulario de Registro del Hogar.
        POST – Guarda (crea o actualiza) la configuración de campos.
               Body: { "campos": { "campo_id": { "requerido": bool, "habilitado": bool } } }
        """
        etapa = self.get_object()

        if request.method == 'GET':
            try:
                config = etapa.config_registro_hogar
                return Response({
                    'campos': config.campos,
                    'fecha_modificacion': config.fecha_modificacion,
                })
            except ConfigRegistroHogar.DoesNotExist:
                return Response({'campos': {}, 'fecha_modificacion': None})

        # POST
        campos_data = request.data.get('campos', {})
        error = _validar_campos_config(campos_data)
        if error:
            return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            config, _ = ConfigRegistroHogar.objects.get_or_create(etapa=etapa)
            config.campos = campos_data
            config.save(update_fields=['campos', 'fecha_modificacion'])

        return Response({
            'campos': config.campos,
            'fecha_modificacion': config.fecha_modificacion,
        })

    @action(detail=True, methods=['post'], url_path='registro-hogar',
            permission_classes=[AllowAny],
            throttle_classes=[AnonRateThrottle])
    def registro_hogar(self, request, pk=None):
        """
        Endpoint público para registrar un hogar completo con sus miembros.
        POST /api/etapas/{id}/registro-hogar/
        Body: { "info_hogar": {...}, "miembros": [...] }
        Devuelve: { id_postulacion, numero_radicado, fecha_radicado, miembros_ids }
        """
        import uuid
        etapa = self.get_object()

        # Verificar que el formulario esté publicado.
        try:
            if not etapa.config_registro_hogar.publicado:
                return Response(
                    {'detail': 'El formulario de registro del hogar no está disponible actualmente.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
        except ConfigRegistroHogar.DoesNotExist:
            return Response(
                {'detail': 'El formulario de registro del hogar no está disponible actualmente.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = RegistroHogarSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Verificar cédulas duplicadas en otras postulaciones del mismo programa.
        numeros_enviados = [m['numero_documento'] for m in data['miembros']]
        cedulas_ya_registradas = list(
            MiembroHogar.objects.filter(
                postulacion__etapa__programa=etapa.programa,
                numero_documento__in=numeros_enviados,
            ).values_list('numero_documento', flat=True).distinct()
        )
        if cedulas_ya_registradas:
            cedulas_str = ', '.join(cedulas_ya_registradas)
            return Response(
                {'detail': f'Las siguientes cédulas ya están registradas en este programa: {cedulas_str}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 1. Crear Postulacion ──────────────────────────────────────── #
        with transaction.atomic():
            postulacion = Postulacion.objects.create(
                programa=etapa.programa,
                etapa_actual=etapa,
                estado='REGISTRADA',
            )

            # ── 2. Generar numero_radicado único ──────────────────────────── #
            ahora = timezone.now()
            numero_radicado = (
                f"RAD-{ahora.strftime('%Y%m')}-"
                f"{postulacion.id:06d}-{uuid.uuid4().hex[:4].upper()}"
            )

            # ── 3. Crear GestionHogarEtapa1 ──────────────────────────────── #
            info_data = dict(data['info_hogar'])
            gestion = GestionHogarEtapa1.objects.create(
                postulacion=postulacion,
                etapa=etapa,
                numero_radicado=numero_radicado,
                **info_data,
            )

            # ── 4. Crear MiembroHogar[] ──────────────────────────────────── #
            miembros_ids: dict = {}
            cabeza_data = None
            for miembro_data in data['miembros']:
                local_id = miembro_data['_localId']
                campos_miembro = {
                    k: v for k, v in miembro_data.items() if k != '_localId'
                }
                miembro = MiembroHogar.objects.create(
                    postulacion=gestion,
                    **campos_miembro,
                )
                miembros_ids[local_id] = miembro.id
                if campos_miembro.get('es_cabeza_hogar'):
                    cabeza_data = campos_miembro

            # ── 5. Crear o recuperar Ciudadano desde el cabeza de hogar ──── #
            if cabeza_data:
                ciudadano, _ = Ciudadano.objects.get_or_create(
                    tipo_documento=cabeza_data['tipo_documento'],
                    numero_documento=cabeza_data['numero_documento'],
                    defaults={
                        'primer_nombre':    cabeza_data['primer_nombre'],
                        'segundo_nombre':   cabeza_data.get('segundo_nombre') or '',
                        'primer_apellido':  cabeza_data['primer_apellido'],
                        'segundo_apellido': cabeza_data.get('segundo_apellido') or '',
                        'fecha_nacimiento': cabeza_data['fecha_nacimiento'],
                        'sexo':             cabeza_data.get('sexo') or '',
                        'nacionalidad':     '',
                        'telefono':         cabeza_data.get('telefono') or '',
                        'correo_electronico': cabeza_data.get('correo_electronico') or '',
                    },
                )
                gestion.ciudadano = ciudadano
                gestion.save(update_fields=['ciudadano'])

        return Response(
            {
                'id_postulacion': postulacion.id,
                'numero_radicado': gestion.numero_radicado,
                'fecha_radicado': gestion.fecha_radicado,
                'miembros_ids': miembros_ids,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['post'], url_path='publicar-registro-hogar')
    def publicar_registro_hogar(self, request, pk=None):
        """
        Publica el formulario de Registro del Hogar para que los ciudadanos puedan acceder.
        POST /api/etapas/{id}/publicar-registro-hogar/
        """
        etapa = self.get_object()
        config, _ = ConfigRegistroHogar.objects.get_or_create(etapa=etapa)
        if not config.campos:
            return Response(
                {'detail': 'No se puede publicar: la configuración de campos está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        config.publicado = True
        config.save(update_fields=['publicado', 'fecha_modificacion'])
        return Response({'publicado': True, 'fecha_modificacion': config.fecha_modificacion})

    @action(detail=True, methods=['post'], url_path='inhabilitar-registro-hogar')
    def inhabilitar_registro_hogar(self, request, pk=None):
        """
        Toggle del estado de Registro del Hogar:
        - Si PUBLICADO → cambiar a INHABILITADO
        - Si INHABILITADO → cambiar a PUBLICADO
        POST /api/etapas/{id}/inhabilitar-registro-hogar/
        """
        etapa = self.get_object()
        config, _ = ConfigRegistroHogar.objects.get_or_create(etapa=etapa)
        
        # Toggle: si publicado → inhabilitado; si inhabilitado → publicado
        if config.publicado:
            config.publicado = False
            config.inhabilitado = True
        elif config.inhabilitado:
            config.publicado = True
            config.inhabilitado = False
        else:
            # Si no está publicado ni inhabilitado, publicar
            config.publicado = True
            config.inhabilitado = False
        
        config.save(update_fields=['publicado', 'inhabilitado', 'fecha_modificacion'])
        return Response({
            'publicado': config.publicado,
            'inhabilitado': config.inhabilitado,
            'fecha_modificacion': config.fecha_modificacion
        })

    # ── Publicación Visita Técnica ─────────────────────────────────────── #

    @action(detail=True, methods=['get', 'post'], url_path='visita-tecnica-config')
    def visita_tecnica_config(self, request, pk=None):
        """
        GET  – Devuelve la configuración de campos del formulario de Visita Técnica.
        POST – Guarda (crea o actualiza) la configuración de campos.
               Body: { "campos": { "campo_id": { "requerido": bool, "habilitado": bool } } }
        """
        etapa = self.get_object()

        if request.method == 'GET':
            try:
                config = etapa.config_visita_tecnica
                return Response({
                    'campos': config.campos,
                    'fecha_modificacion': config.fecha_modificacion,
                })
            except ConfigVisitaTecnica.DoesNotExist:
                return Response({'campos': {}, 'fecha_modificacion': None})

        # POST
        campos_data = request.data.get('campos', {})
        error = _validar_campos_config(campos_data)
        if error:
            return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            config, _ = ConfigVisitaTecnica.objects.get_or_create(etapa=etapa)
            config.campos = campos_data
            config.save(update_fields=['campos', 'fecha_modificacion'])

        return Response({
            'campos': config.campos,
            'fecha_modificacion': config.fecha_modificacion,
        })

    @action(detail=True, methods=['post'], url_path='publicar-visita-tecnica')
    def publicar_visita_tecnica(self, request, pk=None):
        """
        Publica la etapa de Visita Técnica para que los técnicos puedan acceder.
        POST /api/etapas/{id}/publicar-visita-tecnica/
        """
        etapa = self.get_object()

        # Validar que el sorteo esté realizado para etapas posteriores a la 1
        if etapa.numero_etapa > 1:
            ya_sorteadas = Postulacion.objects.filter(
                programa_id=etapa.programa_id,
                estado__in=['BENEFICIADO', 'NO_BENEFICIARIO']
            ).exists()
            if not ya_sorteadas:
                return Response(
                    {'detail': 'No se puede publicar: el sorteo de beneficiarios debe estar realizado antes de publicar etapas posteriores.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        config, _ = ConfigVisitaTecnica.objects.get_or_create(etapa=etapa)
        if not config.campos:
            return Response(
                {'detail': 'No se puede publicar: la configuración de campos está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        config.publicado = True
        config.save(update_fields=['publicado', 'fecha_modificacion'])
        return Response({'publicado': True, 'fecha_modificacion': config.fecha_modificacion})

    @action(detail=True, methods=['post'], url_path='inhabilitar-visita-tecnica')
    def inhabilitar_visita_tecnica(self, request, pk=None):
        """
        Toggle del estado de Visita Técnica:
        - Si PUBLICADO → cambiar a INHABILITADO
        - Si INHABILITADO → cambiar a PUBLICADO
        POST /api/etapas/{id}/inhabilitar-visita-tecnica/
        """
        etapa = self.get_object()
        config, _ = ConfigVisitaTecnica.objects.get_or_create(etapa=etapa)
        
        # Toggle: si publicado → inhabilitado; si inhabilitado → publicado
        if config.publicado:
            config.publicado = False
            config.inhabilitado = True
        elif config.inhabilitado:
            config.publicado = True
            config.inhabilitado = False
        else:
            # Si no está publicado ni inhabilitado, publicar
            config.publicado = True
            config.inhabilitado = False
        
        config.save(update_fields=['publicado', 'inhabilitado', 'fecha_modificacion'])
        return Response({
            'publicado': config.publicado,
            'inhabilitado': config.inhabilitado,
            'estado': 'INHABILITADO' if config.inhabilitado else 'PUBLICADO' if config.publicado else 'BORRADOR'
        })

    # ── Publicación Gestión Documental Interna ─────────────────────────── #

    @action(detail=True, methods=['get', 'post'], url_path='gestion-documental-config')
    def gestion_documental_config(self, request, pk=None):
        """
        GET  – Devuelve la configuración de campos del formulario de Gestión Documental.
        POST – Guarda (crea o actualiza) la configuración de campos.
               Body: { "campos": { "campo_id": { "requerido": bool, "habilitado": bool } } }
        """
        etapa = self.get_object()

        if request.method == 'GET':
            try:
                config = etapa.config_gestion_documental
                return Response({
                    'campos': config.campos,
                    'fecha_modificacion': config.fecha_modificacion,
                })
            except ConfigGestionDocumental.DoesNotExist:
                return Response({'campos': {}, 'fecha_modificacion': None})

        # POST
        campos_data = request.data.get('campos', {})
        error = _validar_campos_config(campos_data)
        if error:
            return Response({'detail': error}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            config, _ = ConfigGestionDocumental.objects.get_or_create(etapa=etapa)
            config.campos = campos_data
            config.save(update_fields=['campos', 'fecha_modificacion'])

        return Response({
            'campos': config.campos,
            'fecha_modificacion': config.fecha_modificacion,
        })

    @action(detail=True, methods=['post'], url_path='publicar-gestion-documental')
    def publicar_gestion_documental(self, request, pk=None):
        """
        Publica la etapa de Gestión Documental Interna.
        POST /api/etapas/{id}/publicar-gestion-documental/
        """
        etapa = self.get_object()

        # Validar que el sorteo esté realizado para etapas posteriores a la 1
        if etapa.numero_etapa > 1:
            ya_sorteadas = Postulacion.objects.filter(
                programa_id=etapa.programa_id,
                estado__in=['BENEFICIADO', 'NO_BENEFICIARIO']
            ).exists()
            if not ya_sorteadas:
                return Response(
                    {'detail': 'No se puede publicar: el sorteo de beneficiarios debe estar realizado antes de publicar etapas posteriores.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        config, _ = ConfigGestionDocumental.objects.get_or_create(etapa=etapa)
        if not config.campos:
            return Response(
                {'detail': 'No se puede publicar: la configuración de campos está vacía.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        config.publicado = True
        config.save(update_fields=['publicado', 'fecha_modificacion'])
        return Response({'publicado': True, 'fecha_modificacion': config.fecha_modificacion})

    @action(detail=True, methods=['post'], url_path='inhabilitar-gestion-documental')
    def inhabilitar_gestion_documental(self, request, pk=None):
        """
        Toggle del estado de Gestión Documental:
        - Si PUBLICADO → cambiar a INHABILITADO
        - Si INHABILITADO → cambiar a PUBLICADO
        POST /api/etapas/{id}/inhabilitar-gestion-documental/
        """
        etapa = self.get_object()
        config, _ = ConfigGestionDocumental.objects.get_or_create(etapa=etapa)
        
        # Toggle: si publicado → inhabilitado; si inhabilitado → publicado
        if config.publicado:
            config.publicado = False
            config.inhabilitado = True
        elif config.inhabilitado:
            config.publicado = True
            config.inhabilitado = False
        else:
            # Si no está publicado ni inhabilitado, publicar
            config.publicado = True
            config.inhabilitado = False
        
        config.save(update_fields=['publicado', 'inhabilitado', 'fecha_modificacion'])
        return Response({
            'publicado': config.publicado,
            'inhabilitado': config.inhabilitado
        })

    # ── Terminar / Reactivar Etapa ─────────────────────────────────────── #

    @action(detail=True, methods=['post'], url_path='terminar-etapa')
    def terminar_etapa(self, request, pk=None):
        """
        Finaliza la etapa. Solo si el programa está ACTIVO y la etapa está publicada.
        POST /api/etapas/{id}/terminar-etapa/
        """
        etapa = self.get_object()

        if etapa.programa.estado != 'ACTIVO':
            return Response(
                {'detail': 'No se puede finalizar: el programa no está activo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Verificar que la etapa esté publicada
        publicada = False
        if etapa.modulo_principal == 'REGISTRO_HOGAR':
            publicada = getattr(
                getattr(etapa, 'config_registro_hogar', None), 'publicado', False
            )
        elif etapa.modulo_principal == 'VISITA_TECNICA':
            publicada = getattr(
                getattr(etapa, 'config_visita_tecnica', None), 'publicado', False
            )
        elif etapa.modulo_principal == 'GESTION_DOCUMENTAL_INTERNA':
            publicada = getattr(
                getattr(etapa, 'config_gestion_documental', None), 'publicado', False
            )
        else:
            try:
                publicada = etapa.formulario.estado == 'PUBLICADO'
            except FormularioEtapa.DoesNotExist:
                publicada = False

        if not publicada:
            return Response(
                {'detail': 'No se puede finalizar: la etapa no está publicada.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Inhabilitar el formulario/registro al finalizar
        with transaction.atomic():
            if etapa.modulo_principal == 'REGISTRO_HOGAR':
                try:
                    config = etapa.config_registro_hogar
                    config.publicado = False
                    config.save(update_fields=['publicado', 'fecha_modificacion'])
                except ConfigRegistroHogar.DoesNotExist:
                    pass
            elif etapa.modulo_principal == 'VISITA_TECNICA':
                try:
                    config = etapa.config_visita_tecnica
                    config.publicado = False
                    config.save(update_fields=['publicado', 'fecha_modificacion'])
                except ConfigVisitaTecnica.DoesNotExist:
                    pass
            elif etapa.modulo_principal == 'GESTION_DOCUMENTAL_INTERNA':
                try:
                    config = etapa.config_gestion_documental
                    config.publicado = False
                    config.save(update_fields=['publicado', 'fecha_modificacion'])
                except ConfigGestionDocumental.DoesNotExist:
                    pass
            else:
                try:
                    formulario = etapa.formulario
                    formulario.estado = 'BORRADOR'
                    formulario.save(update_fields=['estado'])
                except FormularioEtapa.DoesNotExist:
                    pass

            etapa.finalizada = True
            etapa.fecha_finalizacion = timezone.now()
            etapa.save(update_fields=['finalizada', 'fecha_finalizacion'])
        return Response(EtapaSerializer(etapa).data)

    @action(detail=True, methods=['post'], url_path='reactivar-etapa')
    def reactivar_etapa(self, request, pk=None):
        """
        Reactiva una etapa previamente finalizada.
        POST /api/etapas/{id}/reactivar-etapa/
        """
        etapa = self.get_object()

        if not etapa.finalizada:
            return Response(
                {'detail': 'La etapa no está finalizada.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Bloquear si el programa está CULMINADO
        if etapa.programa.estado == 'CULMINADO':
            return Response(
                {'detail': 'No se puede reactivar una etapa de un programa culminado.'},
                status=status.HTTP_409_CONFLICT,
            )

        etapa.finalizada = False
        etapa.fecha_finalizacion = None
        etapa.save(update_fields=['finalizada', 'fecha_finalizacion'])
        return Response(EtapaSerializer(etapa).data)
