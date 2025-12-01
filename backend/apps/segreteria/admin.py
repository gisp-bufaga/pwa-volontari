# Admin for segreteria app
from django.contrib import admin
from django.utils.html import format_html
from .models import Todo, Document


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ['titolo', 'status_colored', 'priority_colored', 'assegnato_a', 'created_at']
    list_filter = ['status', 'priorita', 'created_at']
    search_fields = ['titolo', 'descrizione']
    readonly_fields = ['created_at', 'updated_at', 'completed_at', 'deleted_at']
    
    fieldsets = (
        ('Informazioni', {
            'fields': ('titolo', 'descrizione', 'status', 'priorita')
        }),
        ('Assegnazione', {
            'fields': ('assegnato_a',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at', 'completed_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )

    def status_colored(self, obj):
        """Mostra lo stato con colore"""
        colors = {
            'todo': '#ff9800',
            'in_progress': '#2196f3',
            'done': '#4caf50'
        }
        return format_html(
            '<span style="background-color: {}; padding: 3px 10px; border-radius: 3px; color: white;">{}</span>',
            colors.get(obj.status, '#999'),
            obj.get_status_display()
        )
    status_colored.short_description = 'Stato'

    def priority_colored(self, obj):
        """Mostra la priorità con colore"""
        colors = {
            'low': '#4caf50',
            'medium': '#ff9800',
            'high': '#f44336'
        }
        return format_html(
            '<span style="background-color: {}; padding: 3px 10px; border-radius: 3px; color: white;">{}</span>',
            colors.get(obj.priorita, '#999'),
            obj.get_priorita_display()
        )
    priority_colored.short_description = 'Priorità'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['titolo', 'categoria', 'file_info', 'visibile_a', 'uploaded_by', 'created_at']
    list_filter = ['categoria', 'visibile_a', 'created_at']
    search_fields = ['titolo', 'descrizione']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'file_size_mb']
    
    fieldsets = (
        ('Informazioni', {
            'fields': ('titolo', 'descrizione', 'file', 'categoria')
        }),
        ('Visibilità', {
            'fields': ('visibile_a',)
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'created_at', 'updated_at', 'deleted_at', 'file_size_mb'),
            'classes': ('collapse',)
        }),
    )

    def file_info(self, obj):
        """Mostra informazioni sul file"""
        return format_html(
            '{} ({}MB)',
            obj.file_extension,
            obj.file_size_mb
        )
    file_info.short_description = 'File'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)