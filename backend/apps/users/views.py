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