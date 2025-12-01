# Models for segreteria app
from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class Todo(models.Model):
    """
    Rappresenta un task nella bacheca to-do della segreteria.
    """
    STATUS_CHOICES = [
        ('todo', 'Da fare'),
        ('in_progress', 'In corso'),
        ('done', 'Completato'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Bassa'),
        ('medium', 'Media'),
        ('high', 'Alta'),
    ]

    titolo = models.CharField(max_length=200, verbose_name="Titolo")
    descrizione = models.TextField(blank=True, verbose_name="Descrizione")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo',
        verbose_name="Stato"
    )
    priorita = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name="Priorità"
    )
    assegnato_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='todos_assegnati',
        verbose_name="Assegnato a"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='todos_creati',
        verbose_name="Creato da"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creato il")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Aggiornato il")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Completato il")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Eliminato il")

    class Meta:
        verbose_name = "To-Do"
        verbose_name_plural = "To-Do"
        ordering = ['-priorita', '-created_at']

    def __str__(self):
        return self.titolo

    def soft_delete(self):
        """Soft delete del to-do"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.save()

    def mark_as_done(self):
        """Marca il to-do come completato"""
        from django.utils import timezone
        self.status = 'done'
        self.completed_at = timezone.now()
        self.save()


class Document(models.Model):
    """
    Rappresenta un documento utile nella sezione documenti della segreteria.
    """
    CATEGORIA_CHOICES = [
        ('organigramma', 'Organigramma'),
        ('guida', 'Guida/Manuale'),
        ('modulo', 'Modulo/Template'),
        ('regolamento', 'Regolamento'),
        ('verbale', 'Verbale'),
        ('altro', 'Altro'),
    ]

    titolo = models.CharField(max_length=200, verbose_name="Titolo")
    descrizione = models.TextField(blank=True, verbose_name="Descrizione")
    file = models.FileField(
        upload_to='documents/%Y/%m/',
        verbose_name="File"
    )
    categoria = models.CharField(
        max_length=50,
        choices=CATEGORIA_CHOICES,
        default='altro',
        verbose_name="Categoria"
    )
    visibile_a = models.CharField(
        max_length=50,
        choices=[
            ('tutti', 'Tutti i volontari'),
            ('admin', 'Solo admin'),
            ('segreteria', 'Solo segreteria'),
        ],
        default='tutti',
        verbose_name="Visibile a"
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='documents_uploaded',
        verbose_name="Caricato da"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Caricato il")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Aggiornato il")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Eliminato il")

    class Meta:
        verbose_name = "Documento"
        verbose_name_plural = "Documenti"
        ordering = ['-created_at']

    def __str__(self):
        return self.titolo

    def soft_delete(self):
        """Soft delete del documento"""
        from django.utils import timezone
        self.deleted_at = timezone.now()
        self.save()

    @property
    def file_extension(self):
        """Ritorna l'estensione del file"""
        import os
        return os.path.splitext(self.file.name)[1].lower()

    @property
    def file_size_mb(self):
        """Ritorna la dimensione del file in MB"""
        return round(self.file.size / (1024 * 1024), 2)