from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permesso personalizzato:
    - Admin (superadmin/admin): lettura e scrittura
    - Base volunteers: solo lettura
    """
    def has_permission(self, request, view):
        # Lettura permessa a tutti gli autenticati
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Scrittura solo per admin
        return request.user and request.user.is_authenticated and request.user.role in ['superadmin', 'admin']


class IsAreaAdminOrSecretariatAdmin(permissions.BasePermission):
    """
    Permesso per creazione/modifica attività e turni:
    - Superadmin: accesso completo
    - Admin: solo per le proprie aree gestite
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Lettura permessa a tutti
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Superadmin ha accesso completo
        if request.user.role == 'superadmin':
            return True
        
        # Admin possono modificare solo le aree che gestiscono
        if request.user.role == 'admin':
            # Per Activity, controlla work_area
            if hasattr(obj, 'work_area'):
                return request.user.is_area_admin(obj.work_area.id)
            # Per Shift, controlla work_area dell'attività
            if hasattr(obj, 'attivita'):
                return request.user.is_area_admin(obj.attivita.work_area.id)
        
        return False
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Lettura permessa a tutti
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Superadmin ha accesso completo
        if request.user.role == 'superadmin':
            return True
        
        # Admin segreteria hanno accesso completo
        if request.user.role == 'admin' and request.user.area == 'segreteria':
            return True
        
        # Admin area possono modificare solo la propria area
        if request.user.role == 'admin':
            # Per Activity, controlla direttamente l'area
            if hasattr(obj, 'area'):
                return obj.area == request.user.area
            # Per Shift, controlla l'area dell'attività
            if hasattr(obj, 'attivita'):
                return obj.attivita.area == request.user.area
        
        return False


class CanManageShiftEnrollment(permissions.BasePermission):
    """
    Permesso per gestione iscrizioni turni (quando sarà attivato):
    - Volontari possono iscriversi/cancellarsi
    - Admin possono gestire tutte le iscrizioni
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Admin possono gestire tutto
        if request.user.role in ['superadmin', 'admin']:
            return True
        
        # Volontari possono gestire solo le proprie iscrizioni
        return obj.volontario == request.user