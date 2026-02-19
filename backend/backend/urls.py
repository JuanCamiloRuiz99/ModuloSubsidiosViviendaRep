from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from programas.views import ProgramaViewSet

router = DefaultRouter()
router.register(r'programas', ProgramaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

