from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import UsuarioSerializer
from .permissions import IsAdminSistema # <-- Importamos tu nueva regla
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('username')
    serializer_class = UsuarioSerializer
    # Aplicamos el escudo: Solo el ADMIN_SISTEMA logueado puede hacer esto
    permission_classes = [IsAuthenticated, IsAdminSistema] 

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer