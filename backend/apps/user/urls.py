from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import RegisterView, LoginView, LogoutView, UserProfileView, DeleteAccountView, FavoriteLocationView, ThemePreferenceView

app_name = 'user-urls'
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('profile/delete/', DeleteAccountView.as_view(), name='delete-account'),
    path('favorites/', FavoriteLocationView.as_view(), name='favorite-locations'),
    path('profile/theme/', ThemePreferenceView.as_view(), name='theme-preference'),
] 
