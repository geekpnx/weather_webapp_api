from rest_framework import serializers

class RadarSerializer(serializers.Serializer):
    radar_image_url = serializers.URLField()
    timestamp = serializers.DateTimeField()

    def validate_radar_image_url(self, value):
        if not value.lower().endswith(('.png', '.jpg', '.jpeg')):
            raise serializers.ValidationError("URL must link to a valid image (jpg, jpeg, png).")
        return value
