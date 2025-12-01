from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Todo, Document

User = get_user_model()


class TodoListSerializer(serializers.ModelSerializer):
    """
    Serializer per lista to-do.
    Include informazioni minimali per la bacheca.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priorita_display = serializers.CharField(source='get_priorita_display', read_only=True)
    assegnato_a_name = serializers.CharField(
        source='assegnato_a.get_full_name', 
        read_only=True,
        allow_null=True
    )
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Todo
        fields = [
            'id', 'titolo', 'descrizione', 'status', 'status_display',
            'priorita', 'priorita_display', 'assegnato_a', 'assegnato_a_name',
            'created_by_name', 'is_overdue', 'created_at', 'completed_at'
        ]
    
    def get_is_overdue(self, obj):
        """Verifica se il to-do è in ritardo (se ha più di 7 giorni e non è completato)"""
        from django.utils import timezone
        from datetime import timedelta
        
        if obj.status == 'done':
            return False
        
        return (timezone.now() - obj.created_at) > timedelta(days=7)


class TodoDetailSerializer(serializers.ModelSerializer):
    """
    Serializer dettagliato per singolo to-do.
    Include tutte le informazioni e metadata.
    """
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priorita_display = serializers.CharField(source='get_priorita_display', read_only=True)
    assegnato_a_name = serializers.CharField(
        source='assegnato_a.get_full_name', 
        read_only=True,
        allow_null=True
    )
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Todo
        fields = [
            'id', 'titolo', 'descrizione', 'status', 'status_display',
            'priorita', 'priorita_display', 
            'assegnato_a', 'assegnato_a_name',
            'created_by', 'created_by_name',
            'created_at', 'updated_at', 'completed_at'
        ]


class TodoCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer per creazione e modifica to-do.
    Gestisce la validazione dei dati in input.
    """
    class Meta:
        model = Todo
        fields = [
            'titolo', 'descrizione', 'status', 'priorita', 'assegnato_a'
        ]
    
    def validate_titolo(self, value):
        """Valida che il titolo non sia vuoto"""
        if not value or not value.strip():
            raise serializers.ValidationError("Il titolo è obbligatorio")
        return value.strip()
    
    def update(self, instance, validated_data):
        """Override per gestire il completed_at quando si marca come done"""
        if validated_data.get('status') == 'done' and instance.status != 'done':
            from django.utils import timezone
            instance.completed_at = timezone.now()
        elif validated_data.get('status') != 'done':
            instance.completed_at = None
        
        return super().update(instance, validated_data)


class DocumentListSerializer(serializers.ModelSerializer):
    """
    Serializer per lista documenti.
    Include informazioni minimali per la lista.
    """
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    visibile_a_display = serializers.CharField(source='get_visibile_a_display', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.CharField(read_only=True)
    file_size_mb = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'titolo', 'descrizione', 'categoria', 'categoria_display',
            'visibile_a', 'visibile_a_display', 'file_url', 'file_extension',
            'file_size_mb', 'uploaded_by_name', 'created_at'
        ]
    
    def get_file_url(self, obj):
        """Ritorna l'URL completo del file"""
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentDetailSerializer(serializers.ModelSerializer):
    """
    Serializer dettagliato per singolo documento.
    Include tutte le informazioni e metadata.
    """
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    visibile_a_display = serializers.CharField(source='get_visibile_a_display', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_extension = serializers.CharField(read_only=True)
    file_size_mb = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'titolo', 'descrizione', 'file', 'file_url',
            'categoria', 'categoria_display', 'visibile_a', 'visibile_a_display',
            'file_extension', 'file_size_mb',
            'uploaded_by', 'uploaded_by_name',
            'created_at', 'updated_at'
        ]
    
    def get_file_url(self, obj):
        """Ritorna l'URL completo del file"""
        request = self.context.get('request')
        if obj.file and hasattr(obj.file, 'url'):
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None


class DocumentCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer per creazione e modifica documenti.
    Gestisce la validazione dei dati in input e upload file.
    """
    class Meta:
        model = Document
        fields = [
            'titolo', 'descrizione', 'file', 'categoria', 'visibile_a'
        ]
    
    def validate_titolo(self, value):
        """Valida che il titolo non sia vuoto"""
        if not value or not value.strip():
            raise serializers.ValidationError("Il titolo è obbligatorio")
        return value.strip()
    
    def validate_file(self, value):
        """Valida dimensione e tipo del file"""
        # Limite 10MB
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "Il file non può superare i 10MB"
            )
        
        # Estensioni permesse
        allowed_extensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
            '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', '.png'
        ]
        
        import os
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Formato file non supportato. Formati permessi: {', '.join(allowed_extensions)}"
            )
        
        return value