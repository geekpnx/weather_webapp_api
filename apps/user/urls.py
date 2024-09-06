from django.urls import path
from .views import RegisterView, UserProfileView

app_name = 'user-urls'
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]

