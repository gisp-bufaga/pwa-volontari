"""
Views for users app
"""

from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import logout
from django.db import models
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import User, WorkArea
from .serializers import (
    UserListSerializer, UserDetailSerializer, UserCreateSerializer,
    UserUpdateSerializer, ChangePasswordSerializer, LoginSerializer,
    WorkAreaSerializer
)
from .permissions import IsAdmin, IsSuperAdmin, IsOwnerOrAdmin


class LoginView(generics.GenericAPIView):
    """
    Login endpoint - returns JWT tokens
    """
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    
    @extend_schema(
        summary="Login",
        description="Autentica un utente e restituisce i token JWT",
        responses={
            200: OpenApiResponse(description="Login successful"),
            400: OpenApiResponse(description="Invalid credentials"),
        }
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserDetailSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)


class LogoutView(generics.GenericAPIView):
    """
    Logout endpoint - blacklists refresh token
    """
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Logout",
        description="Effettua il logout invalidando il refresh token",
        responses={
            200: OpenApiResponse(description="Logout successful"),
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            return Response({
                'message': 'Logout effettuato con successo'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user profile
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailSerializer
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserDetailSerializer
    
    @extend_schema(
        summary="Get Profile",
        description="Restituisce il profilo dell'utente corrente",
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update Profile",
        description="Aggiorna il profilo dell'utente corrente",
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class ChangePasswordView(generics.GenericAPIView):
    """
    Change password for current user
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    @extend_schema(
        summary="Change Password",
        description="Cambia la password dell'utente corrente",
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'old_password': 'Password corrente non corretta'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password modificata con successo'
        }, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for users (admin only)
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        elif self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserDetailSerializer
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # SuperAdmin can see everyone
        if self.request.user.is_superadmin:
            return queryset
        
        # Admin can see users in their areas
        if self.request.user.is_admin:
            user_areas = self.request.user.work_areas.all()
            return queryset.filter(
                models.Q(work_areas__in=user_areas) |
                models.Q(role='base')
            ).distinct()
        
        return queryset.none()
    
    @extend_schema(
        summary="List Users",
        description="Lista di tutti gli utenti (solo admin)",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        summary="Create User",
        description="Crea un nuovo utente (solo admin)",
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        summary="Get User",
        description="Dettagli di un utente specifico",
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update User",
        description="Aggiorna un utente (solo admin)",
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        summary="Delete User",
        description="Soft delete di un utente (solo admin)",
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete(user=request.user)  # Soft delete
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def restore(self, request, pk=None):
        """Restore a soft-deleted user (superadmin only)"""
        user = self.get_object()
        if user.is_deleted:
            user.restore()
            return Response({
                'message': 'Utente ripristinato con successo'
            })
        return Response({
            'message': 'Utente non eliminato'
        }, status=status.HTTP_400_BAD_REQUEST)


class WorkAreaViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for work areas
    """
    queryset = WorkArea.objects.filter(is_active=True)
    serializer_class = WorkAreaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        # List and retrieve available to all authenticated users
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        # Create, update, delete only for superadmin
        return [IsAuthenticated(), IsSuperAdmin()]
    
    @extend_schema(
        summary="List Work Areas",
        description="Lista di tutte le aree di lavoro attive",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class BulkActionsView(generics.GenericAPIView):
    """
    Bulk actions on users (admin only)
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="Bulk Actions",
        description="Esegue azioni bulk su più utenti",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'user_ids': {
                        'type': 'array',
                        'items': {'type': 'integer'}
                    },
                    'action': {
                        'type': 'string',
                        'enum': ['activate', 'deactivate', 'delete', 'send_credentials', 'assign_role']
                    },
                    'role': {
                        'type': 'string',
                        'enum': ['superadmin', 'admin', 'base']
                    }
                }
            }
        }
    )
    def post(self, request):
        from .bulk_serializers import BulkActionSerializer
        from .utils import generate_random_password, send_bulk_credentials_emails
        
        serializer = BulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_ids = serializer.validated_data['user_ids']
        action = serializer.validated_data['action']
        role = serializer.validated_data.get('role')
        
        # Get users
        users = User.objects.filter(id__in=user_ids)
        
        # Check permissions
        if not request.user.is_superadmin:
            # Admin can only manage users in their areas
            user_areas = request.user.work_areas.all()
            users = users.filter(
                models.Q(work_areas__in=user_areas) |
                models.Q(role='base')
            ).distinct()
        
        if not users.exists():
            return Response({
                'error': 'Nessun utente trovato o permessi insufficienti'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        results = {
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        # Execute action
        if action == 'activate':
            count = users.update(is_active_volunteer=True)
            results['success'] = count
            message = f'{count} utenti attivati'
            
        elif action == 'deactivate':
            count = users.update(is_active_volunteer=False)
            results['success'] = count
            message = f'{count} utenti disattivati'
            
        elif action == 'delete':
            count = 0
            for user in users:
                user.delete(user=request.user)
                count += 1
            results['success'] = count
            message = f'{count} utenti eliminati'
            
        elif action == 'send_credentials':
            # Generate new passwords and send emails
            users_with_passwords = []
            for user in users:
                password = generate_random_password()
                user.set_password(password)
                user.save()
                users_with_passwords.append((user, password))
            
            email_results = send_bulk_credentials_emails(users_with_passwords)
            results['success'] = email_results['success_count']
            results['failed'] = email_results['failed_count']
            if email_results['failed_emails']:
                results['errors'] = email_results['failed_emails']
            
            message = f"Credenziali inviate: {email_results['success_count']} successi, {email_results['failed_count']} falliti"
            
        elif action == 'assign_role':
            # Check if user can assign this role
            if role == 'superadmin' and not request.user.is_superadmin:
                return Response({
                    'error': 'Solo i superadmin possono assegnare il ruolo superadmin'
                }, status=status.HTTP_403_FORBIDDEN)
            
            count = users.update(role=role)
            results['success'] = count
            message = f'{count} utenti con ruolo aggiornato a {role}'
        
        else:
            return Response({
                'error': 'Azione non valida'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': message,
            'results': results
        }, status=status.HTTP_200_OK)


class CSVImportPreviewView(generics.GenericAPIView):
    """
    Preview CSV import before confirming
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="CSV Import Preview",
        description="Anteprima dell'import CSV prima di confermare",
    )
    def post(self, request):
        from .bulk_serializers import CSVImportSerializer, UserCSVPreviewSerializer
        
        serializer = CSVImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        users_data, errors = serializer.parse_csv()
        
        return Response({
            'preview': UserCSVPreviewSerializer(users_data, many=True).data,
            'errors': errors,
            'valid_count': len(users_data),
            'error_count': len(errors),
        }, status=status.HTTP_200_OK)


class CSVImportConfirmView(generics.GenericAPIView):
    """
    Confirm and execute CSV import
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="CSV Import Confirm",
        description="Conferma ed esegue l'import CSV",
    )
    def post(self, request):
        from django.db import transaction
        from .bulk_serializers import CSVImportSerializer
        from .utils import generate_random_password, send_bulk_credentials_emails
        
        serializer = CSVImportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        users_data, errors = serializer.parse_csv()
        
        if errors:
            return Response({
                'error': 'Il file contiene errori. Correggerli prima di importare.',
                'errors': errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        send_credentials = serializer.validated_data.get('send_credentials', False)
        
        created_users = []
        users_with_passwords = []
        
        try:
            with transaction.atomic():
                for user_data in users_data:
                    # Generate password
                    password = generate_random_password()
                    
                    # Extract work areas
                    work_area_codes = user_data.pop('work_area_codes', [])
                    
                    # Create user
                    user = User.objects.create_user(
                        password=password,
                        **user_data
                    )
                    
                    # Assign work areas
                    if work_area_codes:
                        work_areas = WorkArea.objects.filter(
                            code__in=work_area_codes,
                            is_active=True
                        )
                        user.work_areas.set(work_areas)
                    
                    created_users.append(user)
                    users_with_passwords.append((user, password))
            
            # Send emails if requested
            email_results = None
            if send_credentials:
                email_results = send_bulk_credentials_emails(users_with_passwords)
            
            response_data = {
                'message': f'{len(created_users)} utenti importati con successo',
                'created_count': len(created_users),
            }
            
            if email_results:
                response_data['email_results'] = email_results
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Errore durante l\'import: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


class ExportUsersView(generics.GenericAPIView):
    """
    Export users to CSV/Excel
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    
    @extend_schema(
        summary="Export Users",
        description="Esporta gli utenti in formato CSV o Excel",
    )
    def get(self, request):
        import csv
        from django.http import HttpResponse
        from .bulk_serializers import ExportFilterSerializer
        
        # Parse filters
        filter_serializer = ExportFilterSerializer(data=request.query_params)
        filter_serializer.is_valid(raise_exception=True)
        
        filters = filter_serializer.validated_data
        export_format = filters.get('format', 'csv')
        
        # Build queryset
        queryset = User.objects.all()
        
        # Apply filters
        if not request.user.is_superadmin:
            user_areas = request.user.work_areas.all()
            queryset = queryset.filter(
                models.Q(work_areas__in=user_areas) |
                models.Q(role='base')
            ).distinct()
        
        if 'role' in filters:
            queryset = queryset.filter(role=filters['role'])
        
        if 'is_active_volunteer' in filters:
            queryset = queryset.filter(is_active_volunteer=filters['is_active_volunteer'])
        
        if 'work_area_ids' in filters:
            queryset = queryset.filter(work_areas__id__in=filters['work_area_ids'])
        
        if 'search' in filters:
            search = filters['search']
            queryset = queryset.filter(
                models.Q(username__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        
        # Export to CSV
        if export_format == 'csv':
            response = HttpResponse(content_type='text/csv; charset=utf-8')
            response['Content-Disposition'] = 'attachment; filename="users_export.csv"'
            
            writer = csv.writer(response)
            writer.writerow([
                'ID', 'Username', 'Email', 'Nome', 'Cognome',
                'Ruolo', 'Telefono', 'Aree di Lavoro',
                'Volontario Attivo', 'Data Iscrizione', 'Data Creazione'
            ])
            
            for user in queryset:
                work_areas = ', '.join([wa.name for wa in user.work_areas.all()])
                writer.writerow([
                    user.id,
                    user.username,
                    user.email,
                    user.first_name,
                    user.last_name,
                    user.get_role_display(),
                    user.phone,
                    work_areas,
                    'Sì' if user.is_active_volunteer else 'No',
                    user.joined_date.strftime('%Y-%m-%d') if user.joined_date else '',
                    user.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                ])
            
            return response
        
        # Export to Excel would require openpyxl
        # For now, return CSV for both formats
        return Response({
            'error': 'Formato Excel non ancora implementato. Usa CSV.'
        }, status=status.HTTP_400_BAD_REQUEST)