from rest_framework import serializers

class AlertSerializer(serializers.Serializer):
    headline = serializers.CharField(max_length=100)
    desc = serializers.CharField(max_length=2000)
    # category = serializers.CharField(max_length=250)
    effective = serializers.DateTimeField()
    expires = serializers.DateTimeField()

