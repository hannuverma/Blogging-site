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
from .serializers import PostSerializer, UserSerializer, CommentSerializer, BookmarkSerializer
from .models import User, Post, Comment, Like, Follow, Bookmark
from django.db.models import Q
from google.oauth2 import id_token
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken


CLIENT_ID = "379118052183-m8c5h1g87oecvpbmnsclijamf4ocp9il.apps.googleusercontent.com"

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleLike(request, post_id):
    user = request.user
    try:
        post = Post.objects.get(id=post_id, published=True)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    like, created = Like.objects.get_or_create(user=user, post=post)

    if not created:
        like.delete()
        return Response({"detail": "Like removed."}, status=status.HTTP_200_OK)

    return Response({"detail": "Post liked."}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetAllBookmarks(request):
    user = request.user
    bookmarks = Bookmark.objects.filter(user=user).select_related('post')
    serializer = BookmarkSerializer(bookmarks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleBookmark(request,):
    userId = request.data.get('userId')
    postId = request.data.get('postId')
    if not userId:
        return Response({"detail": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        post = Post.objects.get(id=postId, published=True)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    bookmark, created = Bookmark.objects.get_or_create(user_id=userId, post=post)

    if not created:
        bookmark.delete()
        return Response({"detail": "Bookmark removed."}, status=status.HTTP_200_OK)

    serializer = BookmarkSerializer(bookmark)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("token")

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)

        email = idinfo['email']
        name = idinfo.get('name')

        user, created = User.objects.get_or_create(username=email, defaults={
            'email': email,
            'first_name': name
        })
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    except ValueError:
        return Response({"error": "Invalid token"}, status=400)

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
@permission_classes([IsAuthenticated])
def getUserPosts(request):  
    user = request.user    
    posts = Post.objects.filter(author=user).order_by('-updated_at', '-created_at')

    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUserPost(request, post_id):
    user = request.user
    try:
        post = Post.objects.get(id=post_id, author=user)
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
@permission_classes([IsAuthenticated])
def getDraftPosts(request):
    user = request.user
    posts = Post.objects.filter(author=user, published=False).order_by('-updated_at', '-created_at')
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([AllowAny])
def whoAmI(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def RetrievePostView(request):
    if request.method == 'POST':
        data = request.data
        post = Post.objects.filter(published=True).order_by('-updated_at', '-created_at')

        category = data.get('category', None)
        if category and category != 'All':
            post = post.filter(category=category)
        search_query = data.get('search', None)
        if search_query:
            post = post.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query) |
                Q(author__username__icontains=search_query)
            )
        serializer = PostSerializer(post, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['GET'])
@permission_classes([AllowAny])
def SearchPosts(request):
    query = request.GET.get('q', '')

    if query:
        posts = Post.objects.filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query) |
            Q(author__username__icontains=query)
        ).filter(published=True)
    else:
        posts = Post.objects.filter(published=True)
        
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)
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
@permission_classes([AllowAny])
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
