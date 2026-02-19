from rest_framework import viewsets
from .models import Programa
from .serializers import ProgramaSerializer


class ProgramaViewSet(viewsets.ModelViewSet):
    queryset = Programa.objects.all()
    serializer_class = ProgramaSerializer
