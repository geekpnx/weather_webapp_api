from django.contrib.auth.models import User
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404

from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserProfileSerializer


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

        serializer = UserProfileSerializer(user_profile)
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
        request.user.auth_token.delete()  # Delete the user's token
        return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """Allows users to retrieve and update their profile. Requires token authentication."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_or_create_user_profile(self, user):
        """Helper method to get or create the user profile."""
        return get_object_or_404(UserProfile, user=user)

    def get(self, request):
        user_profile = self.get_or_create_user_profile(request.user)
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)

    def put(self, request):
        user_profile = self.get_or_create_user_profile(request.user)
        data = request.data

        # Update the User model fields
        user = request.user
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.username = data.get('username', user.username)
        user.save()

        # Update the UserProfile model fields
        user_profile.location = data.get('location', user_profile.location)
        user_profile.preferred_temperature_unit = data.get('preferred_temperature_unit', user_profile.preferred_temperature_unit)
        user_profile.save()

        # Serialize the updated UserProfile
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data)
