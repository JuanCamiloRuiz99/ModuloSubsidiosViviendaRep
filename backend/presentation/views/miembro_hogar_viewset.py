"""
ViewSet para MiembroHogar.

Expone la subida de documentos por miembro:
  POST /api/miembros-hogar/{id}/documentos/
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from infrastructure.database.models import MiembroHogar, DocumentoMiembroHogar
from shared.file_validators import validate_uploaded_file


class MiembroHogarViewSet(viewsets.GenericViewSet):
    """ViewSet para gestionar Miembros del Hogar."""

    queryset = MiembroHogar.objects.all()

    @action(detail=True, methods=['post'], url_path='documentos',
            permission_classes=[AllowAny])
    def documentos(self, request, pk=None):
        """
        Sube un documento adjunto a un miembro del hogar.
        POST /api/miembros-hogar/{id}/documentos/
        Body (multipart/form-data):
          - tipo_documento  (str, requerido)
          - archivo         (file, requerido)
          - observaciones   (str, opcional)
        """
        miembro       = self.get_object()
        tipo_documento = request.data.get('tipo_documento', '').strip()
        archivo        = request.FILES.get('archivo')
        observaciones  = request.data.get('observaciones', '')

        if not tipo_documento:
            return Response(
                {'detail': 'tipo_documento es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tipos_validos = {c[0] for c in DocumentoMiembroHogar.TIPO_CHOICES}
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

        doc = DocumentoMiembroHogar.objects.create(
            miembro=miembro,
            tipo_documento=tipo_documento,
            archivo=archivo,
            observaciones=observaciones,
        )
        return Response({'id': doc.id}, status=status.HTTP_201_CREATED)
