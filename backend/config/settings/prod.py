from .base import *
import environs
import os

env = environs.Env()

env.read_env(str(BASE_DIR / '.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.str('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ["*"]

THIRD_PARTY_APPS = [
    
]

import os

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


STATIC_URL = '/static/'
STATIC_ROOT = str(BASE_DIR /"staticfiles")
STATICFILES_DIRS = ["static"]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Project-level media

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