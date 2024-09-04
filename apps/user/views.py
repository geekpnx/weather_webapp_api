
from django.contrib.auth.models import User
from django.http import Http404

from rest_framework.authtoken.models import Token
from rest_framework.authentication import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView

from .models import UserProfile
from .serializer import UserProfileSerializer

class RegisterView(RetrieveUpdateDestroyAPIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        location = request.data.get('location')
        preferred_temperature_unit = request.data.get('preferred_temperature_unit')

        if not username or not password or not email:
            return Response({'error': 'Please provide all required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)
        user_profile = UserProfile.objects.create(user=user, location=location, preferred_temperature_unit=preferred_temperature_unit)
        
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class UserProfileView(APIView):
    def post(self, request):
        # Extract username and password from the request
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(username=username, password=password)

        if user is not None:
            # Get or create the token for the user
            token, created = Token.objects.get_or_create(user=user)

            # Get or create the user profile
            user_profile, created = UserProfile.objects.get_or_create(user=user)

            # Serialize the user profile
            serializer = UserProfileSerializer(user_profile)

            # Return the token and user profile data
            return Response({
                'token': token.key,
                'profile': serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    def get(self, request):
        try:
            # Try to get the user profile; if it doesn't exist, create one
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            user_profile, created = UserProfile.objects.get_or_create(user=request.user)
            data = request.data

            user_profile.location = data.get('location', user_profile.location)
            user_profile.preferred_temperature_unit = data.get('preferred_temperature_unit', user_profile.preferred_temperature_unit)

            user_profile.save()
            serializer = UserProfileSerializer(user_profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
            user_profile.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

# class LoginView(APIView):
#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')

#         if not username or not password:
#             return Response({'error': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)

#         user = authenticate(username=username, password=password)

#         if user is not None:
#             token, created = Token.objects.get_or_create(user=user)
#             return Response({'token': token.key}, status=status.HTTP_200_OK)
#         else:
#             return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        

# class LogoutView(APIView):
#     permission_classes = [IsAuthenticated]
#     def post(self, request):
#         try:
#             # Get the token from the user and delete it
#             token = Token.objects.get(user=request.user)
#             token.delete()
#             return Response({"success": "Successfully logged out."}, status=status.HTTP_200_OK)
#         except Token.DoesNotExist:
#             return Response({"error": "Token not found."}, status=status.HTTP_400_BAD_REQUEST)
