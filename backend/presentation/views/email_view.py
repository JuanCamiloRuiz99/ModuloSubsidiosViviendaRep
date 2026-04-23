"""
Vista para ver correos guardados en desarrollo (solo DEBUG=True)
"""

import os
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def list_emails(request):
    """
    Endpoint para listar correos guardados en desarrollo.
    Solo disponible cuando DEBUG=True
    
    GET /api/emails/ - Lista todos los correos
    GET /api/emails/?limit=5 - Últimos 5 correos
    """
    if not settings.DEBUG:
        return JsonResponse({'error': 'Endpoint solo disponible en desarrollo'}, status=403)
    
    email_dir = getattr(settings, 'EMAIL_FILE_PATH', os.path.join(settings.BASE_DIR, 'emails'))
    
    if not os.path.exists(email_dir):
        return JsonResponse({'message': 'No hay correos guardados aún', 'emails': []})
    
    try:
        files = sorted(os.listdir(email_dir), reverse=True)
        limit = int(request.GET.get('limit', 10))
        files = files[:limit]
        
        emails = []
        for filename in files:
            filepath = os.path.join(email_dir, filename)
            if os.path.isfile(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    emails.append({
                        'filename': filename,
                        'content': content,
                        'size': len(content)
                    })
        
        return JsonResponse({
            'total_files': len(os.listdir(email_dir)),
            'showing': len(emails),
            'emails': emails,
            'path': email_dir
        })
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_email(request, filename):
    """
    Obtener un correo específico por nombre de archivo
    
    GET /api/emails/{filename}/ - Ver contenido del correo
    """
    if not settings.DEBUG:
        return JsonResponse({'error': 'Endpoint solo disponible en desarrollo'}, status=403)
    
    email_dir = getattr(settings, 'EMAIL_FILE_PATH', os.path.join(settings.BASE_DIR, 'emails'))
    filepath = os.path.join(email_dir, filename)
    
    # Validar que el archivo existe y está en la carpeta correcta
    if not os.path.exists(filepath) or not os.path.isfile(filepath):
        return JsonResponse({'error': 'Correo no encontrado'}, status=404)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return JsonResponse({
            'filename': filename,
            'content': content
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
