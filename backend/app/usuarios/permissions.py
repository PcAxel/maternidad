from rest_framework import permissions

class IsAdministrativo(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.perfil.rol in ['ADMINISTRATIVO', 'JEFATURA', 'ADMIN_SISTEMA']

class IsMatrona(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.perfil.rol in ['MATRONA', 'MEDICO', 'JEFATURA', 'ADMIN_SISTEMA']

class IsMedico(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.perfil.rol in ['MEDICO', 'JEFATURA', 'ADMIN_SISTEMA']

class IsJefatura(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.perfil.rol in ['JEFATURA', 'GERENCIA', 'ADMIN_SISTEMA']

class CanViewReports(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.perfil.rol in ['JEFATURA', 'GERENCIA', 'ADMIN_SISTEMA']