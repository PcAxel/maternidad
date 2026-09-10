from django.contrib.auth.models import User
from rest_framework import serializers
from .models import PerfilUsuario

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['rol', 'telefono', 'especialidad', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']

class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.ChoiceField(choices=PerfilUsuario.ROLES, write_only=True)
    telefono = serializers.CharField(required=False, allow_blank=True, write_only=True)
    especialidad = serializers.CharField(required=False, allow_blank=True, write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)
    perfil = PerfilUsuarioSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'password', 'rol', 'telefono', 'especialidad', 'perfil', 'is_active',
        ]

    def create(self, validated_data):
        rol = validated_data.pop('rol')
        telefono = validated_data.pop('telefono', '')
        especialidad = validated_data.pop('especialidad', '')
        password = validated_data.pop('password')

        usuario = User(**validated_data)
        usuario.set_password(password)
        usuario.save()

        PerfilUsuario.objects.create(
            usuario=usuario, rol=rol, telefono=telefono, especialidad=especialidad
        )
        return usuario

    def update(self, instance, validated_data):
        rol = validated_data.pop('rol', None)
        telefono = validated_data.pop('telefono', None)
        especialidad = validated_data.pop('especialidad', None)
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        if hasattr(instance, 'perfil'):
            if rol is not None:
                instance.perfil.rol = rol
            if telefono is not None:
                instance.perfil.telefono = telefono
            if especialidad is not None:
                instance.perfil.especialidad = especialidad
            instance.perfil.save()

        return instance

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        usuario = self.user
        data['username'] = usuario.username
        data['nombre'] = usuario.get_full_name() or usuario.username
        data['rol'] = usuario.perfil.rol if hasattr(usuario, 'perfil') else None
        return data
