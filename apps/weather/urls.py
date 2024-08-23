from django.urls import path
from . import views


app_name = 'weather-urls'
urlpatterns = [
      path('location/', views.location_list, name='location-list'),
      path('current/', views.current_list, name='current-list'),
      path('forecast/', views.forecast_list, name='forecast-list'),
]