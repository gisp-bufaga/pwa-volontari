"""
Custom permissions for users app
"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission: only admin and superadmin users
    """
    message = 'Solo gli amministratori possono accedere a questa risorsa'
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin
        )


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission: only superadmin users
    """
    message = 'Solo i super amministratori possono accedere a questa risorsa'
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_superadmin
        )


class IsAreaAdmin(permissions.BasePermission):
    """
    Permission: admin of specific work area
    Usage: check in has_object_permission with area_id
    """
    message = 'Non sei amministratore di questa area'
    
    def has_permission(self, request, view):
        # Allow admins to access the list
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin
        )
    
    def has_object_permission(self, request, view, obj):
        # SuperAdmin can access everything
        if request.user.is_superadmin:
            return True
        
        # Check if user is admin of the object's area
        if hasattr(obj, 'area'):
            return request.user.is_area_admin(obj.area.id)
        
        # Check if user is admin of any of the object's areas
        if hasattr(obj, 'work_areas'):
            return any(
                request.user.is_area_admin(area.id)
                for area in obj.work_areas.all()
            )
        
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission: owner of object or admin
    """
    message = 'Non hai i permessi per accedere a questa risorsa'
    
    def has_object_permission(self, request, view, obj):
        # SuperAdmin can access everything
        if request.user.is_superadmin:
            return True
        
        # Owner can access their own object
        if hasattr(obj, 'user'):
            if obj.user == request.user:
                return True
        elif isinstance(obj, request.user.__class__):
            if obj == request.user:
                return True
        
        # Admins can access
        if request.user.is_admin:
            return True
        
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission: admin can write, everyone can read
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Read permissions for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for admins
        return request.user.is_admin