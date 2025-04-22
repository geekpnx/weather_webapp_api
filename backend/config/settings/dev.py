from .base import *
import environs

env = environs.Env() 

env.read_env(str(BASE_DIR / '.env.dev'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.str('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = []

THIRD_PARTY_APPS = [
    
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env.str('DB_NAME'),
        "USER": env.str('DB_USER'),
        "PASSWORD": env.str('DB_PWD'),
        "PORT": env.str('DB_PORT'),
        "HOST": env.str('DB_HOST')
    }
}

WEATHER_API_KEY = env('WEATHER_API_KEY')
OPENWEATHERMAP_API_KEY = env('OPENWEATHERMAP_API_KEY')
NEWS_API_KEY = env('NEWS_API_KEY')

STATIC_URL = '/static/'
# STATIC_ROOT = os.path.join(BASE_DIR.parent, 'static')  # Project-level static
STATICFILES_DIRS = [
     os.path.join(BASE_DIR, "static"), 
]



MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')  # Project-level media


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]