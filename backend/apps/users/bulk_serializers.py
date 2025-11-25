"""
Serializers for bulk operations and CSV import/export
"""

import csv
import io
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.db import transaction
from .models import User, WorkArea


class BulkActionSerializer(serializers.Serializer):
    """
    Serializer for bulk actions on users
    """
    ACTION_CHOICES = [
        ('activate', 'Attiva'),
        ('deactivate', 'Disattiva'),
        ('delete', 'Elimina'),
        ('send_credentials', 'Invia Credenziali'),
        ('assign_role', 'Assegna Ruolo'),
    ]
    
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True,
        help_text="Lista di ID utenti su cui eseguire l'azione"
    )
    action = serializers.ChoiceField(
        choices=ACTION_CHOICES,
        required=True,
        help_text="Azione da eseguire"
    )
    
    # Optional fields for specific actions
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=False,
        help_text="Ruolo da assegnare (solo per assign_role)"
    )
    
    def validate(self, attrs):
        action = attrs.get('action')
        role = attrs.get('role')
        
        # Validate that role is provided for assign_role action
        if action == 'assign_role' and not role:
            raise serializers.ValidationError({
                'role': 'Il ruolo è obbligatorio per l\'azione assign_role'
            })
        
        return attrs


class CSVImportSerializer(serializers.Serializer):
    """
    Serializer for CSV import
    """
    file = serializers.FileField(
        required=True,
        help_text="File CSV da importare"
    )
    send_credentials = serializers.BooleanField(
        default=False,
        help_text="Invia credenziali via email dopo l'import"
    )
    
    def validate_file(self, file):
        """Validate CSV file"""
        if not file.name.endswith('.csv'):
            raise serializers.ValidationError('Il file deve essere in formato CSV')
        
        # Check file size (max 5MB)
        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Il file non può superare i 5MB')
        
        return file
    
    def parse_csv(self):
        """
        Parse CSV file and return list of user data
        
        Expected CSV format:
        username,email,first_name,last_name,role,phone,work_area_codes
        
        Returns:
            list: List of dictionaries with user data
            list: List of errors
        """
        file = self.validated_data['file']
        file.seek(0)
        
        # Read CSV
        decoded_file = file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        users_data = []
        errors = []
        
        required_fields = ['username', 'email', 'first_name', 'last_name']
        
        for row_num, row in enumerate(reader, start=2):  # start=2 because row 1 is header
            row_errors = []
            
            # Check required fields
            for field in required_fields:
                if not row.get(field, '').strip():
                    row_errors.append(f"Campo '{field}' obbligatorio mancante")
            
            # Validate email
            email = row.get('email', '').strip()
            if email:
                try:
                    validate_email(email)
                except Exception as e:
                    row_errors.append(f"Email non valida: {str(e)}")
            
            # Check if username or email already exists
            username = row.get('username', '').strip()
            if username and User.objects.filter(username=username).exists():
                row_errors.append(f"Username '{username}' già esistente")
            
            if email and User.objects.filter(email=email).exists():
                row_errors.append(f"Email '{email}' già esistente")
            
            # Validate role
            role = row.get('role', 'base').strip().lower()
            valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
            if role and role not in valid_roles:
                row_errors.append(f"Ruolo '{role}' non valido. Valori: {', '.join(valid_roles)}")
            
            # Parse work areas
            work_area_codes = []
            if row.get('work_area_codes'):
                codes = [code.strip() for code in row['work_area_codes'].split(',')]
                for code in codes:
                    if code and not WorkArea.objects.filter(code=code, is_active=True).exists():
                        row_errors.append(f"Area di lavoro '{code}' non trovata")
                    elif code:
                        work_area_codes.append(code)
            
            if row_errors:
                errors.append({
                    'row': row_num,
                    'data': row,
                    'errors': row_errors
                })
            else:
                users_data.append({
                    'username': username,
                    'email': email,
                    'first_name': row.get('first_name', '').strip(),
                    'last_name': row.get('last_name', '').strip(),
                    'role': role or 'base',
                    'phone': row.get('phone', '').strip(),
                    'work_area_codes': work_area_codes,
                })
        
        return users_data, errors


class UserCSVPreviewSerializer(serializers.Serializer):
    """
    Serializer for CSV preview before import
    """
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    role = serializers.CharField()
    phone = serializers.CharField(required=False, allow_blank=True)
    work_area_codes = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )


class ExportFilterSerializer(serializers.Serializer):
    """
    Serializer for export filters
    """
    FORMAT_CHOICES = [
        ('csv', 'CSV'),
        ('xlsx', 'Excel'),
    ]
    
    format = serializers.ChoiceField(
        choices=FORMAT_CHOICES,
        default='csv',
        help_text="Formato del file di export"
    )
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        required=False,
        help_text="Filtra per ruolo"
    )
    is_active_volunteer = serializers.BooleanField(
        required=False,
        help_text="Filtra per volontari attivi"
    )
    work_area_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="Filtra per aree di lavoro"
    )
    search = serializers.CharField(
        required=False,
        help_text="Cerca per nome, cognome, email o username"
    )