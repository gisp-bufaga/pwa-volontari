"""
Settings module - loads appropriate settings based on DJANGO_SETTINGS_MODULE
"""

import os

# Default to development settings
settings_module = os.environ.get('DJANGO_SETTINGS_MODULE', 'config.settings.development')

if 'development' in settings_module:
    from .development import *
elif 'production' in settings_module:
    from .production import *
else:
    from .base import *
