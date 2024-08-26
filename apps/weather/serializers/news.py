from rest_framework import serializers


class NewsSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    link = serializers.URLField()
    published = serializers.DateTimeField()
    summary = serializers.CharField(max_length=500)
