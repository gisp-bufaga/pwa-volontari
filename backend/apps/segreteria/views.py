from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Todo, Document
from .serializers import (
    TodoListSerializer, TodoDetailSerializer, TodoCreateUpdateSerializer,
    DocumentListSerializer, DocumentDetailSerializer, DocumentCreateUpdateSerializer
)
from .permissions import IsSecretariatOrSuperadmin, CanViewDocument


class TodoViewSet(viewsets.ModelViewSet):
    """
    ViewSet per gestione To-Do della segreteria.
    
    Endpoints:
    - GET /todos/ - Lista tutti i to-do
    - GET /todos/{id}/ - Dettaglio to-do
    - POST /todos/ - Crea nuovo to-do
    - PUT/PATCH /todos/{id}/ - Modifica to-do
    - DELETE /todos/{id}/ - Soft delete to-do
    - POST /todos/{id}/mark_done/ - Marca to-do come completato
    - GET /todos/bacheca/ - Vista bacheca raggruppata per status
    """
    permission_classes = [IsAuthenticated, IsSecretariatOrSuperadmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priorita', 'assegnato_a']
    search_fields = ['titolo', 'descrizione']
    ordering_fields = ['priorita', 'created_at', 'completed_at']
    ordering = ['-priorita', '-created_at']
    
    def get_queryset(self):
        """Ritorna solo to-do non eliminati"""
        return Todo.objects.filter(deleted_at__isnull=True).select_related(
            'assegnato_a', 'created_by'
        )
    
    def get_serializer_class(self):
        """Usa serializer appropriato in base all'azione"""
        if self.action == 'list':
            return TodoListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TodoCreateUpdateSerializer
        return TodoDetailSerializer
    
    def perform_create(self, serializer):
        """Salva l'utente che ha creato il to-do"""
        serializer.save(created_by=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete invece di eliminazione fisica"""
        instance.soft_delete()
    
    @action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None):
        """
        Endpoint custom: marca un to-do come completato.
        POST /todos/{id}/mark_done/
        """
        todo = self.get_object()
        todo.mark_as_done()
        serializer = self.get_serializer(todo)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def bacheca(self, request):
        """
        Endpoint custom: ritorna to-do raggruppati per status.
        GET /todos/bacheca/
        """
        from collections import defaultdict
        
        todos = self.get_queryset()
        grouped = {
            'todo': [],
            'in_progress': [],
            'done': []
        }
        
        for todo in todos:
            serializer = TodoListSerializer(todo)
            grouped[todo.status].append(serializer.data)
        
        return Response(grouped)
    
    @action(detail=False, methods=['get'])
    def miei(self, request):
        """
        Endpoint custom: ritorna i to-do assegnati all'utente corrente.
        GET /todos/miei/
        """
        todos = self.get_queryset().filter(assegnato_a=request.user)
        serializer = TodoListSerializer(todos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistiche(self, request):
        """
        Endpoint custom: ritorna statistiche sui to-do.
        GET /todos/statistiche/
        """
        queryset = self.get_queryset()
        
        stats = {
            'totali': queryset.count(),
            'da_fare': queryset.filter(status='todo').count(),
            'in_corso': queryset.filter(status='in_progress').count(),
            'completati': queryset.filter(status='done').count(),
            'alta_priorita': queryset.filter(priorita='high', status__in=['todo', 'in_progress']).count(),
        }
        
        return Response(stats)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet per gestione documenti della segreteria.
    
    Endpoints:
    - GET /documents/ - Lista tutti i documenti accessibili
    - GET /documents/{id}/ - Dettaglio documento
    - POST /documents/ - Upload nuovo documento (solo segreteria)
    - PUT/PATCH /documents/{id}/ - Modifica documento (solo segreteria)
    - DELETE /documents/{id}/ - Soft delete documento (solo segreteria)
    - GET /documents/by_categoria/ - Documenti raggruppati per categoria
    """
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'visibile_a']
    search_fields = ['titolo', 'descrizione']
    ordering_fields = ['titolo', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Permessi diversi per lettura e scrittura"""
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated(), CanViewDocument()]
        return [IsAuthenticated(), IsSecretariatOrSuperadmin()]
    
    def get_queryset(self):
        """Ritorna documenti filtrati per visibilità utente"""
        queryset = Document.objects.filter(deleted_at__isnull=True).select_related('uploaded_by')
        
        user = self.request.user
        
        # Superadmin vede tutto
        if user.role == 'superadmin':
            return queryset
        
        # Admin vedono tutti e admin
        if user.role == 'admin':
            # Admin segreteria vedono tutto
            if user.area == 'segreteria':
                return queryset
            # Altri admin vedono tutti e admin
            return queryset.filter(visibile_a__in=['tutti', 'admin'])
        
        # Base volunteers vedono solo "tutti"
        return queryset.filter(visibile_a='tutti')
    
    def get_serializer_class(self):
        """Usa serializer appropriato in base all'azione"""
        if self.action == 'list':
            return DocumentListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return DocumentCreateUpdateSerializer
        return DocumentDetailSerializer
    
    def get_serializer_context(self):
        """Aggiunge request al context per generare URL completi"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Salva l'utente che ha caricato il documento"""
        serializer.save(uploaded_by=self.request.user)
    
    def perform_destroy(self, instance):
        """Soft delete invece di eliminazione fisica"""
        instance.soft_delete()
    
    @action(detail=False, methods=['get'])
    def by_categoria(self, request):
        """
        Endpoint custom: ritorna documenti raggruppati per categoria.
        GET /documents/by_categoria/
        """
        from collections import defaultdict
        
        documents = self.get_queryset()
        grouped = defaultdict(list)
        
        for doc in documents:
            serializer = DocumentListSerializer(doc, context={'request': request})
            grouped[doc.categoria].append(serializer.data)
        
        return Response(grouped)
    
    @action(detail=False, methods=['get'])
    def recenti(self, request):
        """
        Endpoint custom: ritorna i documenti più recenti.
        GET /documents/recenti/?limite=5
        """
        limite = int(request.query_params.get('limite', 5))
        documents = self.get_queryset()[:limite]
        serializer = DocumentListSerializer(documents, many=True, context={'request': request})
        return Response(serializer.data)