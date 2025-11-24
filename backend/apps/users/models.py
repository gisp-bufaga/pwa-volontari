"""
Users app models
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.core.models import TimeStampedModel, SoftDeleteModel, SoftDeleteManager


class WorkArea(TimeStampedModel):
    """
    Work areas within the organization (e.g., Logistica, Sanità, Protezione Civile)
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    code = models.SlugField(max_length=50, unique=True, verbose_name="Codice")
    description = models.TextField(blank=True, verbose_name="Descrizione")
    color = models.CharField(
        max_length=7,
        default='#1976d2',
        verbose_name="Colore",
        help_text="Codice colore esadecimale (es. #1976d2)"
    )
    icon = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Icona",
        help_text="Nome icona Material UI"
    )
    is_active = models.BooleanField(default=True, verbose_name="Attiva")
    
    class Meta:
        verbose_name = "Area di Lavoro"
        verbose_name_plural = "Aree di Lavoro"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class UserManager(SoftDeleteManager):
    """
    Custom manager for User with soft delete support
    """
    
    def create_user(self, username, email, password=None, **extra_fields):
        """Create and save a regular user"""
        if not email:
            raise ValueError('Email è obbligatoria')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, username, email, password=None, **extra_fields):
        """Create and save a superuser"""
        extra_fields.setdefault('role', 'superadmin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active_volunteer', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(username, email, password, **extra_fields)


class User(AbstractUser, TimeStampedModel, SoftDeleteModel):
    """
    Custom User model with role-based access and soft delete
    """
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('base', 'Volontario Base'),
    ]
    
    # Override email to make it unique and required
    email = models.EmailField(unique=True, verbose_name="Email")
    
    # Role and permissions
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='base',
        verbose_name="Ruolo"
    )
    
    work_areas = models.ManyToManyField(
        WorkArea,
        blank=True,
        related_name='users',
        verbose_name="Aree di Lavoro",
        help_text="Aree di cui l'utente Admin è referente"
    )
    
    # Additional info
    phone = models.CharField(max_length=20, blank=True, verbose_name="Telefono")
    avatar = models.ImageField(
        upload_to='avatars/',
        null=True,
        blank=True,
        verbose_name="Avatar"
    )
    
    # Volunteer status
    is_active_volunteer = models.BooleanField(
        default=True,
        verbose_name="Volontario Attivo",
        help_text="Indica se il volontario è attivo operativamente"
    )
    joined_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data Iscrizione"
    )
    
    # Notification preferences
    notification_preferences = models.JSONField(
        default=dict,
        verbose_name="Preferenze Notifiche",
        help_text="Preferenze di notifica: {'email': true, 'push': true}"
    )
    
    objects = UserManager()
    
    class Meta:
        verbose_name = "Utente"
        verbose_name_plural = "Utenti"
        ordering = ['last_name', 'first_name']
    
    def __str__(self):
        full_name = self.get_full_name()
        if full_name:
            return f"{full_name} ({self.get_role_display()})"
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_superadmin(self):
        """Check if user is a superadmin"""
        return self.role == 'superadmin'
    
    @property
    def is_admin(self):
        """Check if user is an admin (includes superadmin)"""
        return self.role in ['admin', 'superadmin']
    
    @property
    def is_base(self):
        """Check if user is a base volunteer"""
        return self.role == 'base'
    
    def is_area_admin(self, area_id):
        """
        Check if user is admin of a specific work area
        
        Args:
            area_id: ID of the work area to check
            
        Returns:
            bool: True if user is admin of the area
        """
        if self.is_superadmin:
            return True
        return self.work_areas.filter(id=area_id).exists()
    
    def get_managed_areas(self):
        """Get list of work areas managed by this admin"""
        if self.is_superadmin:
            return WorkArea.objects.filter(is_active=True)
        return self.work_areas.filter(is_active=True)
