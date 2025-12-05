# backend/apps/activities/models.py
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class Activity(models.Model):
    """
    Rappresenta un'area di attività dell'organizzazione.
    Ogni attività può avere più turni associati.
    """
    nome = models.CharField(max_length=200, verbose_name="Nome attività")
    descrizione = models.TextField(blank=True, verbose_name="Descrizione")
    
    # ✅ CORREZIONE: usa WorkArea invece di CharField con ROLE_CHOICES
    work_area = models.ForeignKey(
        'users.WorkArea',
        on_delete=models.PROTECT,
        related_name='activities',
        verbose_name="Area di competenza"
    )
    
    colore_hex = models.CharField(
        max_length=7,
        default="#1976d2",
        help_text="Colore per visualizzazione calendario (es. #FF5733)",
        verbose_name="Colore"
    )
    link_iscrizione = models.URLField(
        blank=True,
        null=True,
        help_text="Link esterno per iscrizione (es. Google Form)",
        verbose_name="Link iscrizione predefinito"
    )
    is_active = models.BooleanField(default=True, verbose_name="Attivo")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='activities_created',
        verbose_name="Creato da"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creato il")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Aggiornato il")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Eliminato il")

    class Meta:
        verbose_name = "Attività"
        verbose_name_plural = "Attività"
        ordering = ['work_area', 'nome']

    def __str__(self):
        return f"{self.work_area.name} - {self.nome}"

    def soft_delete(self):
        """Soft delete dell'attività"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save()


# Il modello Shift rimane invariato