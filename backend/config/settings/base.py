from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent


# Application definition

DEFAULT_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

CUSTOM_APPS = [
    "apps.user",
    "apps.weather",
    "apps.main",
]


THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'django_extensions',
    'corsheaders',
]


INSTALLED_APPS = [
    *DEFAULT_APPS,
    *CUSTOM_APPS,
    *THIRD_PARTY_APPS
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True


CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:8000',
    'http://localhost:8000',
    'http://localhost:5173',  # Add the URL of your React frontend
]


TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static/')]


# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Inform django about the new user model 
# AUT = <app_name>.<model_class>
#AUTH_USER_MODEL = "user.User" # <-- your User authentication model goes here

ROOT_URLCONF = "config.urls"


REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        #'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}


# import logging

# class SensitiveDataFilter(logging.Filter):
#     def filter(self, record):
#         # Replace any occurrence of sensitive data (like api_key) with '[REDACTED]'
#         if 'api_key' in record.getMessage():
#             record.msg = record.msg.replace('api_key', '[REDACTED]')
#         return True
    

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'level': 'DEBUG',
#             'class': 'logging.StreamHandler',
#         },
#     },
#     'loggers': {
#         'django': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#             'propagate': True,
#         },
#     },
# }

# # Add the filter to the logger in views.py or globally in settings
# logger = logging.getLogger(__name__)
# logger.addFilter(SensitiveDataFilter())

