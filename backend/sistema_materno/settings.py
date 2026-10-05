from pathlib import Path
import os
from dotenv import load_dotenv
import pymysql
from datetime import timedelta

pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = os.getenv('SECRET_KEY')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Apps externas
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    # Apps del proyecto
    'app.pacientes',
    'app.partos',
    'app.recien_nacidos',
    'app.altas',
    'app.reportes',
    'app.usuarios',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',

    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sistema_materno.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sistema_materno.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '3306'),
        # Si RDS exige SSL, descomenta esto:
        # 'OPTIONS': {'ssl': {'ca': '/ruta/al/certificado.pem'}},
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es-cl'
TIME_ZONE = 'America/Santiago'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# --- AQUÍ ESTÁ LA CORRECCIÓN ---
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://maternidad.vercel.app",
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://maternidad-.*-pcaxels-projects\.vercel\.app$",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}
# --- CONFIGURACIÓN DE CORS SEGURA ---
# Si DEBUG es True (estamos desarrollando en local), permitimos todo.
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # Si DEBUG es False (estamos en producción real), cerramos la puerta.
    CORS_ALLOW_ALL_ORIGINS = False
    
    # Aquí pones las URL exactas donde vivirá tu frontend de React en el futuro
    CORS_ALLOWED_ORIGINS = [
        "https://clinica-materno-infantil.cl",
        "https://www.clinica-materno-infantil.cl",
        "https://tu-proyecto.vercel.app",
    ]

    # --- CONFIGURACIÓN DE CORS SEGURA PARA PRODUCCIÓN ---

# 1. Apagamos el permiso global por seguridad
CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOWED_ORIGINS = [
    "https://maternidad.vercel.app",
]

# Agrega esta variable para permitir envíos POST desde Vercel
CSRF_TRUSTED_ORIGINS = [
    "https://maternidad.vercel.app",
]