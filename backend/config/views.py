"""
Simple home view for testing
"""
from django.http import JsonResponse


def home(request):
    """
    Homepage - API info
    """
    return JsonResponse({
        'message': 'PWA Volontari API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'admin': '/admin/',
            'api_docs': '/api/docs/',
            'api_schema': '/api/schema/',
            'auth': '/api/auth/',
        }
    })