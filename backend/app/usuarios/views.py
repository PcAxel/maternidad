from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UsuarioSerializer, MyTokenObtainPairSerializer
from .permissions import IsAdminSistema

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UsuarioSerializer
    # Escudo de seguridad: Solo el administrador logueado puede gestionar el personal
    permission_classes = [IsAuthenticated, IsAdminSistema] 

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer