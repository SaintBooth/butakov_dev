from .base import *

# Import environment-specific settings
if os.getenv('DJANGO_ENV') == 'production':
    from .production import *
else:
    from .development import *

