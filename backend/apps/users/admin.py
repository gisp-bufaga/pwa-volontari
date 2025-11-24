"""
Admin configuration for users app
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, WorkArea


@admin.register(WorkArea)
class WorkAreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'description']
    prepopulated_fields = {'code': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = [
        'username', 'email', 'first_name', 'last_name',
        'role', 'is_active_volunteer', 'is_deleted', 'is_staff'
    ]
    list_filter = [
        'role', 'is_active_volunteer', 'is_deleted',
        'is_staff', 'is_superuser', 'work_areas'
    ]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'deleted_by']
    
    fieldsets = (
        (None, {
            'fields': ('username', 'password')
        }),
        ('Informazioni Personali', {
            'fields': ('first_name', 'last_name', 'email', 'phone', 'avatar')
        }),
        ('Ruolo e Permessi', {
            'fields': ('role', 'work_areas', 'is_active_volunteer', 'joined_date')
        }),
        ('Permessi Django', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Notifiche', {
            'fields': ('notification_preferences',),
            'classes': ('collapse',)
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at', 'deleted_by'),
            'classes': ('collapse',)
        }),
        ('Date Importanti', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'first_name', 'last_name', 'role'
            ),
        }),
    )
    
    filter_horizontal = ['work_areas', 'groups', 'user_permissions']
    
    def get_queryset(self, request):
        """Include soft-deleted users in admin"""
        return self.model.all_objects.all()
