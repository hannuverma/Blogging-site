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
from .serializers import PostSerializer, UserSerializer, CommentSerializer
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
@permission_classes([AllowAny])
def RetrievePostView(request):
    if request.method == 'GET':
        posts = Post.objects.filter(published=True).order_by('-updated_at','-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET'])
@permission_classes([AllowAny])
def RetrievePostDetailView(request, post_id):
    try:
        post = Post.objects.get(id=post_id, published=True)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    comments = Comment.objects.filter(post_id=post_id).order_by('-updated_at', '-created_at')

    post_serializer = PostSerializer(post)
    comment_serializer = CommentSerializer(comments, many=True)

    return Response({
        "post": post_serializer.data,
        "comments": comment_serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def getCategories(request):
    categories = Post.Categories
    return Response(categories, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateCommentView(request, post_id):
    try:
        post = Post.objects.get(id=post_id, published=True)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data.copy()
    data['post'] = post.id
    serializer = CommentSerializer(data=data)

    if serializer.is_valid():
        serializer.save(author=request.user, post=post)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteCommentView(request, comment_id):
    try:
        comment = Comment.objects.get(id=comment_id)
    except Comment.DoesNotExist:
        return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)

    if comment.author != request.user:
        return Response({"detail": "You do not have permission to delete this comment."}, status=status.HTTP_403_FORBIDDEN)

    comment.delete()
    return Response({"detail": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
