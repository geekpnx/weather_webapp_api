from rest_framework import serializers

class AlertSerializer(serializers.Serializer):
    headline = serializers.CharField(max_length=100)
    msgtype = serializers.CharField(max_length=50)
    urgency = serializers.CharField(max_length=50)
    event = serializers.CharField(max_length=50)
    effective = serializers.DateTimeField()
    desc = serializers.CharField(max_length=2000)
    expires = serializers.DateTimeField()

    def validate(self, data):
        if data['expires'] <= data['effective']:
            raise serializers.ValidationError("Expiration time must be later than effective time.")
        return data
