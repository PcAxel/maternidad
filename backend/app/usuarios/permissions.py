from rest_framework import permissions


def _tiene_rol(request, roles_permitidos):
    if not request.user.is_authenticated:
        return False
    if not hasattr(request.user, 'perfil'):
        return False
    return request.user.perfil.rol in roles_permitidos


class IsAdministrativo(permissions.BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request, ['ADMINISTRATIVO', 'JEFATURA', 'ADMIN_SISTEMA'])


class IsMatrona(permissions.BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request, ['MATRONA', 'MEDICO', 'JEFATURA', 'ADMIN_SISTEMA'])


class IsMedico(permissions.BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request, ['MEDICO', 'JEFATURA', 'ADMIN_SISTEMA'])


class IsJefatura(permissions.BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request, ['JEFATURA', 'GERENCIA', 'ADMIN_SISTEMA'])


class CanViewReports(permissions.BasePermission):
    def has_permission(self, request, view):
        return _tiene_rol(request, ['JEFATURA', 'GERENCIA', 'ADMIN_SISTEMA'])


# NUEVA CLASE PARA EL PANEL DE CONTROL
class IsAdminSistema(permissions.BasePermission):
    def has_permission(self, request, view):
        # Solo y exclusivamente el ADMIN_SISTEMA puede pasar por aquí
        return _tiene_rol(request, ['ADMIN_SISTEMA'])