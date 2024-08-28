from django.urls import path
from . import views


app_name = 'weather-urls'
urlpatterns = [
        path('location/', views.location_list, name='location-list'),
        path('current/', views.CurrentWeatherView.as_view(), name='current-list'),
        path('forecast/', views.forecast_list, name='forecast-list'),
        path('alerts/', views.AlertsView.as_view(), name='alerts-view'),
        path('news/', views.NewsView.as_view(), name='news-view'),
        path('radar/', views.RadarView.as_view(), name='radar-view'),
      ]
