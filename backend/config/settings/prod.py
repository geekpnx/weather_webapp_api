from .base import *
import environs
import os
import logging

env = environs.Env()

env.read_env(str(BASE_DIR / '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.str('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ["141.147.30.217", "weather.trncthll.com", "localhost", "127.0.0.1"]

THIRD_PARTY_APPS = [
    
]


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get('DB_NAME'),
        "USER": os.environ.get('DB_USER'),
        "PASSWORD": os.environ.get('DB_PWD'),
        "PORT": os.environ.get('DB_PORT'),
        "HOST": os.environ.get('DB_HOST'),  
    }
}

WEATHER_API_KEY = env('WEATHER_API_KEY')
OPENWEATHERMAP_API_KEY = env('OPENWEATHERMAP_API_KEY')
NEWS_API_KEY = env('NEWS_API_KEY')


STATIC_URL = os.getenv('STATIC_URL', '/static/')
STATIC_ROOT = str(BASE_DIR /"staticfiles")
STATICFILES_DIRS = ["static"]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = os.getenv('MEDIA_URL', '/media/')
MEDIA_ROOT = os.path.join(BASE_DIR, '/app/backend/media/')  # Project-level media


# Ensure these are set for file uploads
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_PERMISSIONS = 0o644

CORS_ALLOWED_ORIGINS = [
    "https://weather.trncthll.com",  # Changed to HTTPS
    "http://localhost:85",           # Keep HTTP for local development
    # Add any other environments you use
]

CSRF_TRUSTED_ORIGINS = [
    "https://weather.trncthll.com",  # Changed to HTTPS
    "http://localhost:85",           # Keep HTTP for local
]

# Force HTTPS redirects (requires proper proxy headers)
ECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HSTS settings (careful with this - can't go back to HTTP)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}