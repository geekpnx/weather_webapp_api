from . import models

from django.contrib import admin


# Register your models here.

admin.site.register(models.Current)
admin.site.register(models.Forecast)
admin.site.register(models.Location)
