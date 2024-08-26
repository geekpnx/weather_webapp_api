from rest_framework import serializers

class AlertSerializer(serializers.Serializer):
    event = serializers.CharField(max_length=100)
    description = serializers.CharField(max_length=500)
    severity = serializers.CharField(max_length=50)
    effective = serializers.DateTimeField()
    expires = serializers.DateTimeField()
