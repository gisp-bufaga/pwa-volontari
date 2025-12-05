from django.contrib import admin
from django.utils.html import format_html
from .models import Activity

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['nome', 'area_colored', 'is_active', 'created_at', 'created_by']
    list_filter = ['work_area', 'is_active', 'created_at']
    search_fields = ['nome', 'descrizione']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    
    fieldsets = (
        ('Informazioni Generali', {
            'fields': ('nome', 'descrizione', 'work_area')
        }),
        ('Configurazione', {
            'fields': ('colore_hex', 'link_iscrizione', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )
    
    def area_colored(self, obj):
        """Mostra l'area con il colore associato"""
        return format_html(
            '<span style="background-color: {}; padding: 3px 10px; border-radius: 3px; color: white;">{}</span>',
            obj.colore_hex,
            obj.work_area.name 
        )
    area_colored.short_description = 'Area'
    
    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)