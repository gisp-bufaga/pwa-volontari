from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Activity, Shift, ShiftEnrollment

User = get_user_model()


class ActivityListSerializer(serializers.ModelSerializer):
    """
    Serializer per lista attività (vista card).
    Include informazioni minimali per performance.
    """
    area_display = serializers.CharField(source='get_area_display', read_only=True)
    prossimi_turni_count = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'nome', 'descrizione', 'area', 'area_display',
            'colore_hex', 'link_iscrizione', 'is_active',
            'prossimi_turni_count', 'created_by_name', 'created_at'
        ]
    
    def get_prossimi_turni_count(self, obj):
        """Conta i turni futuri dell'attività"""
        from django.utils import timezone
        return obj.turni.filter(
            data__gte=timezone.now().date(),
            is_active=True,
            deleted_at__isnull=True
        ).count()


class ShiftListSerializer(serializers.ModelSerializer):
    """
    Serializer per lista turni (vista calendario).
    Include informazioni dell'attività associata.
    """
    attivita_nome = serializers.CharField(source='attivita.nome', read_only=True)
    attivita_colore = serializers.CharField(source='attivita.colore_hex', read_only=True)
    attivita_area = serializers.CharField(source='attivita.area', read_only=True)
    enrollment_link = serializers.SerializerMethodField()
    has_enrollment_link = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Shift
        fields = [
            'id', 'attivita', 'attivita_nome', 'attivita_colore', 'attivita_area',
            'titolo', 'data', 'ora_inizio', 'ora_fine', 
            'posti_disponibili', 'enrollment_link', 'has_enrollment_link',
            'note', 'is_active', 'created_at'
        ]
    
    def get_enrollment_link(self, obj):
        """Ritorna il link di iscrizione prioritario"""
        return obj.get_enrollment_link()


class ShiftDetailSerializer(serializers.ModelSerializer):
    """
    Serializer dettagliato per singolo turno.
    Include tutte le informazioni necessarie per la vista dettaglio.
    """
    attivita_detail = ActivityListSerializer(source='attivita', read_only=True)
    enrollment_link = serializers.SerializerMethodField()
    has_enrollment_link = serializers.BooleanField(read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Shift
        fields = [
            'id', 'attivita', 'attivita_detail', 'titolo', 
            'data', 'ora_inizio', 'ora_fine', 'posti_disponibili',
            'link_iscrizione', 'enrollment_link', 'has_enrollment_link',
            'note', 'is_active', 
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
    
    def get_enrollment_link(self, obj):
        """Ritorna il link di iscrizione prioritario"""
        return obj.get_enrollment_link()


class ActivityDetailSerializer(serializers.ModelSerializer):
    """
    Serializer dettagliato per singola attività.
    Include i prossimi turni associati.
    """
    area_display = serializers.CharField(source='get_area_display', read_only=True)
    prossimi_turni = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'nome', 'descrizione', 'area', 'area_display',
            'colore_hex', 'link_iscrizione', 'is_active',
            'prossimi_turni', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
    
    def get_prossimi_turni(self, obj):
        """Ritorna i prossimi turni dell'attività"""
        from django.utils import timezone
        turni = obj.turni.filter(
            data__gte=timezone.now().date(),
            is_active=True,
            deleted_at__isnull=True
        ).order_by('data', 'ora_inizio')[:5]  # Primi 5 turni
        return ShiftListSerializer(turni, many=True).data


class ActivityCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer per creazione e modifica attività.
    Gestisce la validazione dei dati in input.
    """
    class Meta:
        model = Activity
        fields = [
            'nome', 'descrizione', 'area', 'colore_hex', 
            'link_iscrizione', 'is_active'
        ]
    
    def validate_colore_hex(self, value):
        """Valida il formato del colore hex"""
        import re
        if not re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', value):
            raise serializers.ValidationError(
                "Il colore deve essere in formato hex (es. #FF5733)"
            )
        return value
    
    def validate_link_iscrizione(self, value):
        """Valida l'URL del link iscrizione"""
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                "Il link deve iniziare con http:// o https://"
            )
        return value


class ShiftCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer per creazione e modifica turni.
    Gestisce la validazione dei dati in input.
    """
    class Meta:
        model = Shift
        fields = [
            'attivita', 'titolo', 'data', 'ora_inizio', 'ora_fine',
            'posti_disponibili', 'link_iscrizione', 'note', 'is_active'
        ]
    
    def validate(self, data):
        """Valida che ora_fine sia dopo ora_inizio"""
        if data.get('ora_inizio') and data.get('ora_fine'):
            if data['ora_fine'] <= data['ora_inizio']:
                raise serializers.ValidationError({
                    'ora_fine': 'L\'ora di fine deve essere successiva all\'ora di inizio'
                })
        return data
    
    def validate_data(self, value):
        """Valida che la data non sia nel passato"""
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Non è possibile creare turni con data passata"
            )
        return value
    
    def validate_posti_disponibili(self, value):
        """Valida il numero di posti"""
        if value < 0:
            raise serializers.ValidationError(
                "Il numero di posti non può essere negativo"
            )
        return value
    
    def validate_link_iscrizione(self, value):
        """Valida l'URL del link iscrizione"""
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError(
                "Il link deve iniziare con http:// o https://"
            )
        return value


# ⚠️ SERIALIZER PREPARATO MA NON ATTIVO
# Da decommentare solo se si attiva il modello ShiftEnrollment

# class ShiftEnrollmentSerializer(serializers.ModelSerializer):
#     """
#     Serializer per iscrizioni ai turni.
#     NOTA: Attualmente non attivo, si usano link esterni.
#     """
#     volontario_name = serializers.CharField(source='volontario.get_full_name', read_only=True)
#     turno_detail = ShiftListSerializer(source='turno', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     
#     class Meta:
#         model = ShiftEnrollment
#         fields = [
#             'id', 'turno', 'turno_detail', 'volontario', 'volontario_name',
#             'status', 'status_display', 'note_volontario',
#             'created_at', 'updated_at'
#         ]
#         read_only_fields = ['volontario']
#     
#     def validate(self, data):
#         """Valida che il volontario non sia già iscritto al turno"""
#         turno = data.get('turno')
#         volontario = self.context['request'].user
#         
#         if ShiftEnrollment.objects.filter(
#             turno=turno,
#             volontario=volontario,
#             deleted_at__isnull=True
#         ).exists():
#             raise serializers.ValidationError(
#                 "Sei già iscritto a questo turno"
#             )
#         
#         return data