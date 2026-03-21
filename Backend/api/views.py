from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.shortcuts import render
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework import status
from django.db import transaction
from django.contrib.auth import authenticate, login as django_login
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
import os
from django.db.models import Avg
from rest_framework.exceptions import ValidationError
from django.views.decorators.cache import cache_page
from .serializers import PostSerializer, UserSerializer
from .models import User, Post, Comment, Like, Follow

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            profile = serializer.save()

class CreatePostView(generics.CreateAPIView):
    queryset = Post.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
class UpdatePostView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = PostSerializer

    def perform_update(self, serializer):
        post = self.get_object()
        if post.author != self.request.user:
            raise ValidationError("You do not have permission to edit this post.")
        return Response({"detail": "Post updated successfully."}, status=status.HTTP_200_OK)
        serializer.save()

class DeletePostView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = (IsAuthenticated,)

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise ValidationError("You do not have permission to delete this post.")
        instance.delete()
        return Response({"detail": "Post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def RetrievePostView(request):
    if request.method == 'GET':
        posts = Post.objects.filter(published=True).order_by('-updated_at','-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)





