"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from presentation.views.programa_viewset import ProgramaViewSet

router = DefaultRouter()
router.register(r'programas', ProgramaViewSet, basename='programa')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
