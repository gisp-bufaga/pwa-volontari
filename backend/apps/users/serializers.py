"""
Serializers for users app
"""

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, WorkArea


class WorkAreaSerializer(serializers.ModelSerializer):
    """
    Serializer for WorkArea model
    """
    class Meta:
        model = WorkArea
        fields = [
            'id', 'name', 'code', 'description',
            'color', 'icon', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for User list (minimal info)
    """
    work_areas = WorkAreaSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'work_areas', 'is_active_volunteer',
            'avatar', 'phone'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for User detail (complete info)
    """
    work_areas = WorkAreaSerializer(many=True, read_only=True)
    work_area_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=WorkArea.objects.filter(is_active=True),
        source='work_areas',
        required=False
    )
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'work_areas', 'work_area_ids',
            'is_active_volunteer', 'avatar', 'phone',
            'joined_date', 'notification_preferences',
            'is_active', 'created_at', 'updated_at',
            'last_login', 'date_joined'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'last_login', 'date_joined', 'full_name'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)
    work_area_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=WorkArea.objects.filter(is_active=True),
        source='work_areas',
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'work_area_ids',
            'phone', 'is_active_volunteer', 'joined_date'
        ]
    
    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Le password non corrispondono'
            })
        attrs.pop('password_confirm')
        return attrs
    
    def create(self, validated_data):
        work_areas = validated_data.pop('work_areas', [])
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        if work_areas:
            user.work_areas.set(work_areas)
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating users
    """
    work_area_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=WorkArea.objects.filter(is_active=True),
        source='work_areas',
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'email', 'first_name', 'last_name', 'role',
            'work_area_ids', 'phone', 'is_active_volunteer',
            'joined_date', 'notification_preferences', 'is_active'
        ]
    
    def update(self, instance, validated_data):
        work_areas = validated_data.pop('work_areas', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        if work_areas is not None:
            instance.work_areas.set(work_areas)
        
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for changing password
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Le password non corrispondono'
            })
        return attrs


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(
                request=self.context.get('request'),
                username=username,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError(
                    'Credenziali non valide',
                    code='authorization'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'Account disabilitato',
                    code='authorization'
                )
            
            if user.is_deleted:
                raise serializers.ValidationError(
                    'Account non disponibile',
                    code='authorization'
                )
        else:
            raise serializers.ValidationError(
                'Username e password obbligatori',
                code='authorization'
            )
        
        attrs['user'] = user
        return attrs