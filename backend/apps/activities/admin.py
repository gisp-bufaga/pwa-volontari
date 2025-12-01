# Admin for activities app
from django.contrib import admin
from django.utils.html import format_html
from .models import Activity, Shift, ShiftEnrollment


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['nome', 'area_colored', 'is_active', 'created_at', 'created_by']
    list_filter = ['area', 'is_active', 'created_at']
    search_fields = ['nome', 'descrizione']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    
    fieldsets = (
        ('Informazioni Generali', {
            'fields': ('nome', 'descrizione', 'area')
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
            obj.get_area_display()
        )
    area_colored.short_description = 'Area'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ['titolo', 'attivita', 'data', 'ora_inizio', 'ora_fine', 'posti_disponibili', 'has_link', 'is_active']
    list_filter = ['attivita__area', 'data', 'is_active', 'created_at']
    search_fields = ['titolo', 'note', 'attivita__nome']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at']
    date_hierarchy = 'data'
    
    fieldsets = (
        ('Informazioni Turno', {
            'fields': ('attivita', 'titolo', 'data', 'ora_inizio', 'ora_fine')
        }),
        ('Dettagli', {
            'fields': ('posti_disponibili', 'link_iscrizione', 'note', 'is_active')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
    )

    def has_link(self, obj):
        """Mostra se il turno ha un link di iscrizione"""
        if obj.has_enrollment_link:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    has_link.short_description = 'Link Iscrizione'

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


# ⚠️ ADMIN COMMENTATO - Da attivare solo se si abilita il modello ShiftEnrollment
# @admin.register(ShiftEnrollment)
# class ShiftEnrollmentAdmin(admin.ModelAdmin):
#     list_display = ['volontario', 'turno', 'status', 'created_at']
#     list_filter = ['status', 'created_at']
#     search_fields = ['volontario__first_name', 'volontario__last_name', 'turno__titolo']
#     readonly_fields = ['created_at', 'updated_at', 'deleted_at']