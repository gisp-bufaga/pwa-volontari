"""
Core models - Base classes for all models
"""

from django.db import models
from django.conf import settings
from django.utils import timezone


class TimeStampedModel(models.Model):
    """
    Abstract base class with automatic timestamp fields
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Creato il")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Modificato il")
    
    class Meta:
        abstract = True


class SoftDeleteManager(models.Manager):
    """
    Manager that automatically excludes soft-deleted objects
    """
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def with_deleted(self):
        """Include soft-deleted objects in queryset"""
        return super().get_queryset()
    
    def deleted_only(self):
        """Return only soft-deleted objects"""
        return super().get_queryset().filter(is_deleted=True)


class SoftDeleteModel(models.Model):
    """
    Abstract base class with soft delete functionality
    """
    is_deleted = models.BooleanField(
        default=False,
        db_index=True,
        verbose_name="Eliminato"
    )
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Eliminato il"
    )
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='%(class)s_deleted',
        verbose_name="Eliminato da"
    )
    
    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Manager that includes everything
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False, hard=False, user=None):
        """
        Soft delete by default, hard delete if hard=True
        
        Args:
            using: Database alias
            keep_parents: Keep parent objects
            hard: If True, permanently delete from database
            user: User performing the deletion
        """
        if hard:
            return super().delete(using=using, keep_parents=keep_parents)
        
        self.is_deleted = True
        self.deleted_at = timezone.now()
        if user:
            self.deleted_by = user
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
    
    def restore(self):
        """
        Restore a soft-deleted object
        """
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None
        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])
