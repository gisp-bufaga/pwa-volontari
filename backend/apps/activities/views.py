from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from collections import defaultdict
from datetime import datetime, timedelta

from .models import Activity
from .serializers import (
    ActivityListSerializer, ActivityDetailSerializer, ActivityCreateUpdateSerializer
)
from .permissions import IsAdminOrReadOnly, IsAreaAdminOrSecretariatAdmin


class ActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet per gestione attività.
    
    Endpoints:
    - GET /activities/ - Lista tutte le attività attive
    - GET /activities/{id}/ - Dettaglio attività
    - POST /activities/ - Crea nuova attività (solo admin)
    - PUT/PATCH /activities/{id}/ - Modifica attività (solo admin dell'area)
    - DELETE /activities/{id}/ - Soft delete attività (solo admin dell'area)
    - GET /activities/by_area/ - Filtra attività per area
    """
    permission_classes = [IsAuthenticated, IsAreaAdminOrSecretariatAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['work_area', 'is_active']
    search_fields = ['nome', 'descrizione']
    ordering_fields = ['nome', 'work_area', 'created_at']
    ordering = ['work_area', 'nome']
    
    def get_queryset(self):
        """Ritorna solo attività non eliminate"""
        queryset = Activity.objects.filter(
            deleted_at__isnull=True
        ).select_related('work_area', 'created_by')
        
        # Filtra per area se specificato
        work_area_id = self.request.query_params.get('work_area', None)
        if work_area_id:
            queryset = queryset.filter(work_area_id=work_area_id)
        
        return queryset
    
    def get_serializer_class(self):
        """Usa serializer appropriato in base all'azione"""
        if self.action == 'list':
            return ActivityListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ActivityCreateUpdateSerializer
        return ActivityDetailSerializer
    
    def perform_create(self, serializer):
        """Salva l'utente che ha creato l'attività"""
        serializer.save(created_by=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete invece di eliminazione fisica"""
        instance.soft_delete()
    
    @action(detail=False, methods=['get'])
    def by_area(self, request):
        """
        Endpoint custom: ritorna attività raggruppate per area.
        GET /activities/by_area/
        """
        activities = self.get_queryset().filter(is_active=True)
        grouped = defaultdict(list)
        
        for activity in activities:
            serializer = ActivityListSerializer(activity)
            grouped[activity.work_area.code].append(serializer.data)
        
        return Response(grouped)
    
    def get_serializer_class(self):
        """Usa serializer appropriato in base all'azione"""
        if self.action == 'list':
            return ActivityListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ActivityCreateUpdateSerializer
        return ActivityDetailSerializer
    
    def perform_create(self, serializer):
        """Salva l'utente che ha creato l'attività"""
        serializer.save(created_by=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete invece di eliminazione fisica"""
        instance.soft_delete()
    
    @action(detail=False, methods=['get'])
    def by_area(self, request):
        """
        Endpoint custom: ritorna attività raggruppate per area.
        GET /activities/by_area/
        """
        activities = self.get_queryset().filter(is_active=True)
        grouped = defaultdict(list)
        
        for activity in activities:
            serializer = ActivityListSerializer(activity)
            grouped[activity.work_area.code].append(serializer.data) 
        
        return Response(grouped)
    
    @action(detail=True, methods=['get'])
    def prossimi_turni(self, request, pk=None):
        """
        Endpoint custom: ritorna i prossimi turni di un'attività.
        GET /activities/{id}/prossimi_turni/
        """
        activity = self.get_object()
        turni = Shift.objects.filter(
            attivita=activity,
            data__gte=timezone.now().date(),
            is_active=True,
            deleted_at__isnull=True
        ).order_by('data', 'ora_inizio')[:10]
        
        serializer = ShiftListSerializer(turni, many=True)
        return Response(serializer.data)


class ShiftViewSet(viewsets.ModelViewSet):
    """
    ViewSet per gestione turni.
    
    Endpoints:
    - GET /shifts/ - Lista tutti i turni
    - GET /shifts/{id}/ - Dettaglio turno
    - POST /shifts/ - Crea nuovo turno (solo admin)
    - PUT/PATCH /shifts/{id}/ - Modifica turno (solo admin dell'area)
    - DELETE /shifts/{id}/ - Soft delete turno (solo admin dell'area)
    - GET /shifts/calendario/ - Vista calendario (filtra per periodo)
    - GET /shifts/prossimi/ - Prossimi turni in arrivo
    """
    permission_classes = [IsAuthenticated, IsAreaAdminOrSecretariatAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['attivita', 'data', 'is_active']
    search_fields = ['titolo', 'note', 'attivita__nome']
    ordering_fields = ['data', 'ora_inizio', 'created_at']
    ordering = ['data', 'ora_inizio']
    
    def get_queryset(self):
        """Ritorna solo turni non eliminati"""
        queryset = Shift.objects.filter(
            deleted_at__isnull=True
        ).select_related('attivita', 'created_by')
        
        # Filtro per data (range)
        data_da = self.request.query_params.get('data_da', None)
        data_a = self.request.query_params.get('data_a', None)
        
        if data_da:
            queryset = queryset.filter(data__gte=data_da)
        if data_a:
            queryset = queryset.filter(data__lte=data_a)
        
        # Filtro per area
        area = self.request.query_params.get('area', None)
        if area:
            queryset = queryset.filter(attivita__area=area)
        
        # Filtro solo futuri
        solo_futuri = self.request.query_params.get('solo_futuri', None)
        if solo_futuri:
            queryset = queryset.filter(data__gte=timezone.now().date())
        
        return queryset
    
    def get_serializer_class(self):
        """Usa serializer appropriato in base all'azione"""
        if self.action == 'list':
            return ShiftListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ShiftCreateUpdateSerializer
        return ShiftDetailSerializer
    
    def perform_create(self, serializer):
        """Salva l'utente che ha creato il turno"""
        serializer.save(created_by=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete invece di eliminazione fisica"""
        instance.soft_delete()
    
    @action(detail=False, methods=['get'])
    def calendario(self, request):
        """
        Endpoint custom: ritorna turni per vista calendario.
        GET /shifts/calendario/?mese=2024-01&area=protezione_civile
        
        Parametri:
        - mese: formato YYYY-MM (default: mese corrente)
        - area: filtra per area specifica (opzionale)
        """
        # Parse mese o usa quello corrente
        mese_param = request.query_params.get('mese', None)
        if mese_param:
            try:
                anno, mese = map(int, mese_param.split('-'))
            except:
                return Response(
                    {'error': 'Formato mese non valido. Usare YYYY-MM'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            oggi = timezone.now()
            anno, mese = oggi.year, oggi.month
        
        # Calcola primo e ultimo giorno del mese
        primo_giorno = datetime(anno, mese, 1).date()
        if mese == 12:
            ultimo_giorno = datetime(anno + 1, 1, 1).date() - timedelta(days=1)
        else:
            ultimo_giorno = datetime(anno, mese + 1, 1).date() - timedelta(days=1)
        
        # Query turni del mese
        queryset = self.get_queryset().filter(
            data__gte=primo_giorno,
            data__lte=ultimo_giorno,
            is_active=True
        )
        
        # Filtra per area se specificato
        area = request.query_params.get('area', None)
        if area:
            queryset = queryset.filter(attivita__area=area)
        
        serializer = ShiftListSerializer(queryset, many=True)
        
        return Response({
            'mese': f"{anno}-{mese:02d}",
            'primo_giorno': primo_giorno,
            'ultimo_giorno': ultimo_giorno,
            'turni': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def prossimi(self, request):
        """
        Endpoint custom: ritorna i prossimi N turni in arrivo.
        GET /shifts/prossimi/?limite=5&area=protezione_civile
        """
        limite = int(request.query_params.get('limite', 10))
        area = request.query_params.get('area', None)
        
        queryset = self.get_queryset().filter(
            data__gte=timezone.now().date(),
            is_active=True
        )
        
        if area:
            queryset = queryset.filter(attivita__area=area)
        
        turni = queryset[:limite]
        serializer = ShiftListSerializer(turni, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def oggi(self, request):
        """
        Endpoint custom: ritorna i turni di oggi.
        GET /shifts/oggi/
        """
        oggi = timezone.now().date()
        queryset = self.get_queryset().filter(
            data=oggi,
            is_active=True
        )
        
        serializer = ShiftListSerializer(queryset, many=True)
        return Response(serializer.data)