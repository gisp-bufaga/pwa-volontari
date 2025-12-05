from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Activity

User = get_user_model()


class ActivityListSerializer(serializers.ModelSerializer):
    """Serializer per lista attività"""
    work_area_name = serializers.CharField(source='work_area.name', read_only=True)
    work_area_code = serializers.CharField(source='work_area.code', read_only=True)
    work_area_color = serializers.CharField(source='work_area.color', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'nome', 'descrizione', 'work_area', 'work_area_name',
            'work_area_code', 'work_area_color', 'colore_hex', 'link_iscrizione',
            'is_active', 'created_by_name', 'created_at'
        ]


class ActivityDetailSerializer(serializers.ModelSerializer):
    """
    Serializer dettagliato per singola attività.
    """
    work_area_name = serializers.CharField(source='work_area.name', read_only=True)
    work_area_code = serializers.CharField(source='work_area.code', read_only=True)
    work_area_color = serializers.CharField(source='work_area.color', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Activity
        fields = [
            'id', 'nome', 'descrizione', 'work_area', 'work_area_name',
            'work_area_code', 'work_area_color', 'colore_hex', 'link_iscrizione',
            'is_active', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]


class ActivityCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer per creazione e modifica attività"""
    class Meta:
        model = Activity
        fields = [
            'nome', 'descrizione', 'work_area', 'colore_hex',
            'link_iscrizione', 'is_active'
        ]

    def validate_work_area(self, value):
        """Valida che l'area sia attiva"""
        if not value.is_active:
            raise serializers.ValidationError(
                "Non è possibile assegnare attività a un'area disattivata"
            )
        return value


# ⚠️ SHIFT SERIALIZERS - DA IMPLEMENTARE NELLO SPRINT 2B
# Decommentare quando saranno creati i modelli Shift e ShiftEnrollment

# class ShiftListSerializer(serializers.ModelSerializer):
#     pass

# class ShiftDetailSerializer(serializers.ModelSerializer):
#     pass

# class ShiftCreateUpdateSerializer(serializers.ModelSerializer):
#     pass