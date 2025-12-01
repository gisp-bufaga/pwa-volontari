# Models for activities app
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
    area = models.CharField(
        max_length=50,
        choices=User.ROLE_CHOICES,
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
        ordering = ['area', 'nome']

    def __str__(self):
        return f"{self.get_area_display()} - {self.nome}"

    def soft_delete(self):
        """Soft delete dell'attività"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save()


class Shift(models.Model):
    """
    Rappresenta un turno specifico di un'attività.
    Ogni turno ha data, orari e può avere un link di iscrizione dedicato.
    """
    attivita = models.ForeignKey(
        Activity,
        on_delete=models.CASCADE,
        related_name='turni',
        verbose_name="Attività"
    )
    titolo = models.CharField(max_length=200, verbose_name="Titolo turno")
    data = models.DateField(verbose_name="Data")
    ora_inizio = models.TimeField(verbose_name="Ora inizio")
    ora_fine = models.TimeField(verbose_name="Ora fine")
    posti_disponibili = models.PositiveIntegerField(
        default=0,
        help_text="Numero di volontari richiesti (0 = illimitato)",
        verbose_name="Posti disponibili"
    )
    link_iscrizione = models.URLField(
        blank=True,
        null=True,
        help_text="Link specifico per questo turno (sovrascrive quello dell'attività)",
        verbose_name="Link iscrizione"
    )
    note = models.TextField(blank=True, verbose_name="Note")
    is_active = models.BooleanField(default=True, verbose_name="Attivo")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='shifts_created',
        verbose_name="Creato da"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creato il")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Aggiornato il")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Eliminato il")

    class Meta:
        verbose_name = "Turno"
        verbose_name_plural = "Turni"
        ordering = ['data', 'ora_inizio']

    def __str__(self):
        return f"{self.titolo} - {self.data.strftime('%d/%m/%Y')} {self.ora_inizio.strftime('%H:%M')}"

    def soft_delete(self):
        """Soft delete del turno"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save()

    def get_enrollment_link(self):
        """Ritorna il link di iscrizione prioritario"""
        return self.link_iscrizione or self.attivita.link_iscrizione

    @property
    def has_enrollment_link(self):
        """Verifica se esiste un link di iscrizione"""
        return bool(self.get_enrollment_link())


# ⚠️ MODELLO PREPARATO MA NON ATTIVO - Da attivare in futuro se necessario
class ShiftEnrollment(models.Model):
    """
    NOTA: Questo modello è preparato ma NON ATTIVO.
    Per ora si usano link esterni per le iscrizioni.
    Da attivare solo se si decide di gestire le iscrizioni internamente.
    """
    STATUS_CHOICES = [
        ('pending', 'In attesa'),
        ('confirmed', 'Confermato'),
        ('cancelled', 'Annullato'),
    ]

    turno = models.ForeignKey(
        Shift,
        on_delete=models.CASCADE,
        related_name='iscrizioni',
        verbose_name="Turno"
    )
    volontario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='iscrizioni_turni',
        verbose_name="Volontario"
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Stato"
    )
    note_volontario = models.TextField(
        blank=True,
        verbose_name="Note del volontario"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Iscritto il")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Aggiornato il")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Eliminato il")

    class Meta:
        verbose_name = "Iscrizione Turno"
        verbose_name_plural = "Iscrizioni Turni"
        unique_together = ['turno', 'volontario']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.volontario.get_full_name()} - {self.turno.titolo}"

    def soft_delete(self):
        """Soft delete dell'iscrizione"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.save()