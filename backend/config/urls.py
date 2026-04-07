"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from presentation.views.programa_viewset import ProgramaViewSet
from presentation.views.usuario_viewset import UsuarioViewSet
from presentation.views.etapa_viewset import EtapaViewSet
from presentation.views.postulacion_viewset import PostulacionViewSet
from presentation.views.miembro_hogar_viewset import MiembroHogarViewSet
from presentation.views.visita_etapa2_viewset import VisitaEtapa2ViewSet
from presentation.views.visita_viewset import VisitaViewSet
from presentation.views.llamada_viewset import LlamadaViewSet
from presentation.views.documento_proceso_interno_viewset import DocumentoProcesoInternoViewSet

router = DefaultRouter()
router.register(r'programas',      ProgramaViewSet,      basename='programa')
router.register(r'usuarios',       UsuarioViewSet,       basename='usuario')
router.register(r'etapas',         EtapaViewSet,         basename='etapa')
router.register(r'postulaciones',  PostulacionViewSet,   basename='postulacion')
router.register(r'miembros-hogar', MiembroHogarViewSet,  basename='miembro-hogar')
router.register(r'visitas-etapa2', VisitaEtapa2ViewSet,  basename='visita-etapa2')
router.register(r'visitas',        VisitaViewSet,        basename='visita')
router.register(r'llamadas',       LlamadaViewSet,       basename='llamada')
router.register(r'documentos-proceso-interno', DocumentoProcesoInternoViewSet, basename='documento-proceso-interno')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
