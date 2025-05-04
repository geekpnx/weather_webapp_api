from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserProfileSerializer, UserSerializer

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from django.http import FileResponse, HttpResponseNotFound
from django.conf import settings
import os

import mimetypes

class RegisterView(APIView):
    """Allows new users to register and get a token for authentication."""
    authentication_classes = []  # No authentication needed for registration
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        location = request.data.get('location')
        preferred_temperature_unit = request.data.get('preferred_temperature_unit')

        if not username or not password or not email:
            return Response({'error': 'Please provide all required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create new user
        user = User.objects.create_user(username=username, password=password, email=email)
        user_profile = UserProfile.objects.create(user=user, location=location, preferred_temperature_unit=preferred_temperature_unit)

        # Generate token for the user
        token, created = Token.objects.get_or_create(user=user)

        serializer = UserProfileSerializer(user_profile, context={'request': request})
        return Response({'token': token.key, 'user': serializer.data}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Logs in a user and returns a token."""
    authentication_classes = []  # No authentication required for login
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Get or create a token for the user
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Logs out a user by deleting their authentication token."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete() 
        return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    """Handle profile updates and retrieval"""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    

    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_profile(self):
        return get_object_or_404(UserProfile, user=self.request.user)

    def get(self, request):
        profile = self.get_profile()
        serializer = UserProfileSerializer(profile, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        return self.update_profile(request)
    
    # Add this method to handle PATCH requests
    def patch(self, request):
        return self.update_profile(request)
    
    # Refactored common update logic
    def update_profile(self, request):
        profile = self.get_profile()
        data = request.data.copy()
        
        # Handle profile picture removal first
        if data.get('remove_profile_picture', False):
            if profile.profile_picture:
                profile.profile_picture.delete(save=False)
            profile.profile_picture = None
            profile.save()
            return Response(
                UserProfileSerializer(profile, context={'request': request}).data,
                status=status.HTTP_200_OK
            )

        # Handle profile picture upload
        if 'profile_picture' in request.FILES:
            if profile.profile_picture:
                profile.profile_picture.delete(save=False)
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()
            return Response(
                UserProfileSerializer(profile, context={'request': request}).data,
                status=status.HTTP_200_OK
            )

        # Handle regular profile updates
        user_data = data.pop('user', {})
        user = request.user

        # Validate username uniqueness
        if 'username' in user_data and user_data['username'] != user.username:
            if User.objects.filter(username=user_data['username']).exists():
                return Response(
                    {'error': 'Username already taken'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Update User model
        user_serializer = UserSerializer(user, data=user_data, partial=True)
        if not user_serializer.is_valid():
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user_serializer.save()

        # Update UserProfile
        profile_serializer = UserProfileSerializer(
            profile,
            data=data,
            partial=True,
            context={'request': request}
        )
        
        if not profile_serializer.is_valid():
            return Response(
                {'profile_errors': profile_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile_serializer.save()

        return Response({
            'user': user_serializer.data,
            'profile': profile_serializer.data
        }, status=status.HTTP_200_OK)
    
class DeleteAccountView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.check_password(request.data.get('password')):
            return Response({'error': 'Incorrect password'}, status=status.HTTP_401_UNAUTHORIZED)
        
        request.user.delete()
        return Response({'message': 'Account deleted successfully'}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class FavoriteLocationView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_profile(self):
        return get_object_or_404(UserProfile, user=self.request.user)

    def post(self, request):
        profile = self.get_profile()
        location = request.data.get('location', '').strip()
        
        if not location:
            return Response({'error': 'Location required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if location in profile.favorite_locations:
            return Response(UserProfileSerializer(profile, context={'request': request}).data)
        
        # Add to beginning of list and keep only last 5
        profile.favorite_locations = [location] + profile.favorite_locations
        profile.favorite_locations = profile.favorite_locations[:5]
        profile.save()
        return Response(UserProfileSerializer(profile, context={'request': request}).data)

    def delete(self, request):
        profile = self.get_profile()
        location = request.data.get('location', '').strip()
        
        if location in profile.favorite_locations:
            profile.favorite_locations.remove(location)
            profile.save()
        return Response(UserProfileSerializer(profile, context={'request': request}).data)

class ThemePreferenceView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request):
        profile = get_object_or_404(UserProfile, user=request.user)
        theme = request.data.get('theme', 'light')
        
        if theme not in dict(UserProfile._meta.get_field('preferred_theme').choices):
            return Response({'error': 'Invalid theme choice'}, status=status.HTTP_400_BAD_REQUEST)
        
        profile.preferred_theme = theme
        profile.save()
        return Response(UserProfileSerializer(profile, context={'request': request}).data)
    

# Add this new view class at the bottom of the file
class ServeImageView(APIView):
    """Secure media file serving"""
    permission_classes = [AllowAny]

    def get(self, request, path):
        # Security: Validate path is within MEDIA_ROOT
        safe_path = os.path.normpath(path).lstrip('/')
        full_path = os.path.abspath(os.path.join(settings.MEDIA_ROOT, safe_path))
        
        # Prevent directory traversal
        if not full_path.startswith(os.path.abspath(settings.MEDIA_ROOT)):
            return HttpResponseNotFound("Invalid path")
            
        # Check file existence
        if not os.path.isfile(full_path):
            return HttpResponseNotFound("File not found")

        # Get MIME type
        content_type, _ = mimetypes.guess_type(full_path)
        if not content_type:
            content_type = 'application/octet-stream'

        return FileResponse(
            open(full_path, 'rb'),
            content_type=content_type,
            as_attachment=False
        )