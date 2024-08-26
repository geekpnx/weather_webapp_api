from rest_framework import serializers

class RadarSerializer(serializers.Serializer):
    radar_image_url = serializers.URLField()
    timestamp = serializers.DateTimeField()
