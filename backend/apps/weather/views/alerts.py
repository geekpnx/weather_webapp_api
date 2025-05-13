import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import requests
from django.core.cache import cache
from apps.weather.serializers.alerts import AlertSerializer

class AlertsView(APIView):
    """Optimized weather alerts endpoint with caching"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_cache_key(self, location):
        return f"weather_alerts_{location.lower().replace(' ', '_')}"

    def get(self, request, *args, **kwargs):
        # Get location with proper validation
        city = request.query_params.get('location', '').strip()
        if not city:
            user_profile = getattr(request.user, 'userprofile', None)
            city = getattr(user_profile, 'location', '').strip() if user_profile else ''
            if not city:
                return Response(
                    {'error': 'Location required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Check cache first
        cache_key = self.get_cache_key(city)
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        # Fetch from weather API
        api_key = os.getenv('WEATHER_API_KEY')
        if not api_key:
            return Response(
                {'error': 'Service unavailable'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            # Timeout after 5 seconds to prevent hanging
            response = requests.get(
                'http://api.weatherapi.com/v1/forecast.json',
                params={'key': api_key, 'q': city, 'alerts': 'yes'},
                timeout=5
            )
            response.raise_for_status()
            
            alerts_data = response.json().get('alerts', {}).get('alert', [])
            
            # Strong deduplication
            unique_alerts = []
            seen_hashes = set()
            
            for alert in alerts_data:
                alert_hash = hash(frozenset({
                    'headline': alert.get('headline', '').lower().strip(),
                    'event': alert.get('event', '').lower().strip(),
                    'effective': alert.get('effective', '').strip(),
                    'expires': alert.get('expires', '').strip()
                }.items()))
                
                if alert_hash not in seen_hashes:
                    seen_hashes.add(alert_hash)
                    unique_alerts.append({
                        "headline": alert.get("headline"),
                        "msgtype": alert.get("msgtype"),
                        "urgency": alert.get("urgency"),
                        "event": alert.get("event"),
                        "desc": alert.get("desc"),
                        "effective": alert.get("effective"),
                        "expires": alert.get("expires")
                    })

            serializer = AlertSerializer(unique_alerts, many=True)
            
            # Cache for 15 minutes
            cache.set(cache_key, serializer.data, 900)
            
            return Response(serializer.data)

        except requests.exceptions.Timeout:
            return Response(
                {'error': 'Weather service timeout'},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            return Response(
                {'error': f'Weather service error: {str(e)}'},
                status=status.HTTP_502_BAD_GATEWAY
            )