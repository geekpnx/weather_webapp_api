from django.urls import path, re_path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', views.index, name='frontend_index'),
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')), 
]
