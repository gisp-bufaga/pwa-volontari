from rest_framework import permissions


class IsSecretariatOrSuperadmin(permissions.BasePermission):
    """
    Permesso per gestione segreteria:
    - Superadmin: accesso completo
    - Admin segreteria: accesso completo
    - Altri: nessun accesso
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superadmin ha sempre accesso
        if request.user.role == 'superadmin':
            return True
        
        # Admin segreteria hanno accesso
        if request.user.role == 'admin' and request.user.area == 'segreteria':
            return True
        
        return False


class CanViewDocument(permissions.BasePermission):
    """
    Permesso per visualizzazione documenti basato su visibilità:
    - tutti: tutti i volontari autenticati
    - admin: solo admin e superadmin
    - segreteria: solo segreteria e superadmin
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superadmin vede tutto
        if request.user.role == 'superadmin':
            return True
        
        # Controllo in base alla visibilità del documento
        if obj.visibile_a == 'tutti':
            return True
        elif obj.visibile_a == 'admin':
            return request.user.role in ['admin', 'superadmin']
        elif obj.visibile_a == 'segreteria':
            return (request.user.role == 'superadmin') or \
                   (request.user.role == 'admin' and request.user.area == 'segreteria')
        
        return False