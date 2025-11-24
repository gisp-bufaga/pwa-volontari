"""
Admin configuration for users app
"""

from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, WorkArea


class NotificationPreferencesWidget(forms.Widget):
    """
    Custom widget for notification preferences with checkboxes
    """
    template_name = 'admin/notification_preferences_widget.html'
    
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        
        # Parse current value
        if isinstance(value, dict):
            prefs = value
        else:
            prefs = {'email': True, 'push': True}
        
        context['email_checked'] = prefs.get('email', True)
        context['push_checked'] = prefs.get('push', True)
        
        return context
    
    def value_from_datadict(self, data, files, name):
        return {
            'email': f'{name}_email' in data,
            'push': f'{name}_push' in data,
        }


class UserAdminForm(forms.ModelForm):
    """Custom form for User admin with notification preferences checkboxes"""
    
    notification_email = forms.BooleanField(
        required=False,
        initial=True,
        label='Email',
        help_text='Ricevi notifiche via email'
    )
    notification_push = forms.BooleanField(
        required=False,
        initial=True,
        label='Push',
        help_text='Ricevi notifiche push'
    )
    
    class Meta:
        model = User
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.pk:
            prefs = self.instance.notification_preferences or {}
            self.fields['notification_email'].initial = prefs.get('email', True)
            self.fields['notification_push'].initial = prefs.get('push', True)
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.notification_preferences = {
            'email': self.cleaned_data.get('notification_email', True),
            'push': self.cleaned_data.get('notification_push', True),
        }
        if commit:
            user.save()
        return user


@admin.register(WorkArea)
class WorkAreaAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'code', 'description']
    prepopulated_fields = {'code': ('name',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = UserAdminForm
    
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
        ('Preferenze Notifiche', {
            'fields': ('notification_email', 'notification_push'),
            'description': 'Scegli come ricevere le notifiche'
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