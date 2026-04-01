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
from django.core.cache import cache
from .serializers import PostSerializer, UserSerializer, CommentSerializer, BookmarkSerializer
from .models import Mute, User, Post, Comment, Like, Follow, Bookmark
from django.db.models import Q, Count
from google.oauth2 import id_token
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework_simplejwt.tokens import RefreshToken


CLIENT_ID = "379118052183-m8c5h1g87oecvpbmnsclijamf4ocp9il.apps.googleusercontent.com"
POSTS_CACHE_VERSION_KEY = 'posts_cache_version'
POSTS_CACHE_TTL_SECONDS = 60


def _get_posts_cache_version():
    version = cache.get(POSTS_CACHE_VERSION_KEY)
    if version is None:
        version = 1
        cache.set(POSTS_CACHE_VERSION_KEY, version, timeout=None)
    return version


def _build_posts_cache_key(category='All', search=''):
    version = _get_posts_cache_version()
    normalized_category = str(category or 'All').strip() or 'All'
    normalized_search = str(search or '').strip().lower()
    return f"posts:v{version}:category={normalized_category}:search={normalized_search}"


def _invalidate_posts_cache():
    next_version = _get_posts_cache_version() + 1
    cache.set(POSTS_CACHE_VERSION_KEY, next_version, timeout=None)

#toggling

@api_view(['POST'])
def toggleMute(request):
    userId = request.data.get('userId')
    targetUserId = request.data.get('targetUserId')

    if not userId or not targetUserId:
        return Response({"detail": "Both userId and targetUserId are required."}, status=status.HTTP_400_BAD_REQUEST)

    if userId == targetUserId:
        return Response({"detail": "You cannot mute yourself."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        mute, created = Mute.objects.get_or_create(user_id=userId, muted_user_id=targetUserId)

        if not created:
            mute.delete()
            return Response({"detail": "Unmuted successfully."}, status=status.HTTP_200_OK)

        return Response({"detail": "Muted successfully."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def toggleReport(request):
    # Implement report logic here
    return Response({"detail": "Report functionality not implemented yet."}, status=status.HTTP_501_NOT_IMPLEMENTED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleFollow(request):
    targetUserId = request.data.get('targetUserId')
    user = request.user

    if not targetUserId:
        return Response({"detail": "targetUserId is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Optional guard if client still sends userId.
    provided_user_id = request.data.get('userId')
    if provided_user_id is not None and str(provided_user_id) != str(user.id):
        return Response({"detail": "userId does not match authenticated user."}, status=status.HTTP_403_FORBIDDEN)

    if str(user.id) == str(targetUserId):
        return Response({"detail": "You cannot follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        follow, created = Follow.objects.get_or_create(follower_id=user.id, following_id=targetUserId)

        target_user = User.objects.get(id=targetUserId)

        if not created:
            follow.delete()
            return Response(
                {
                    "detail": "Unfollowed successfully.",
                    "currentUser": UserSerializer(user).data,
                    "targetUser": UserSerializer(target_user).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": "Followed successfully.",
                "currentUser": UserSerializer(user).data,
                "targetUser": UserSerializer(target_user).data,
            },
            status=status.HTTP_201_CREATED,
        )

    except User.DoesNotExist:
        return Response({"detail": "Target user not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

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
        _invalidate_posts_cache()
        return Response({"detail": "Like removed."}, status=status.HTTP_200_OK)

    _invalidate_posts_cache()
    return Response({"detail": "Post liked."}, status=status.HTTP_201_CREATED)



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

#GET ----------------------------------------------------------------------------------

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
@permission_classes([IsAuthenticated])
def getUserFromPosts(request):
    postId = request.GET.get('postId')
    if not postId:
        return Response({"detail": "postId query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
    try:
        post = Post.objects.get(id=postId)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)
    author_serializer = UserSerializer(post.author)
    return Response({"author": author_serializer.data}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def whoAmI(request):
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response({"detail": "Not authenticated."}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def RetrievePostView(request):
    if request.method == 'POST':
        data = request.data
        category = data.get('category', 'All')
        search_query = data.get('search', '')
        cache_key = _build_posts_cache_key(category=category, search=search_query)
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        post = (
            Post.objects.filter(published=True)
            .select_related('author')
            .prefetch_related('likes')
            .annotate(comment_count=Count('comments'))
            .order_by('-updated_at', '-created_at')
        )

        if category and category != 'All':
            post = post.filter(category=category)
        search_query = str(search_query).strip()
        if search_query:
            post = post.filter(
                Q(title__icontains=search_query) | 
                Q(content__icontains=search_query) |
                Q(author__username__icontains=search_query)
            )
        serializer = PostSerializer(post, many=True)
        response_data = serializer.data
        cache.set(cache_key, response_data, timeout=POSTS_CACHE_TTL_SECONDS)
        return Response(response_data, status=status.HTTP_200_OK)
    else:
        cache_key = _build_posts_cache_key(category='All', search='')
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)

        post = (
            Post.objects.filter(published=True)
            .select_related('author')
            .prefetch_related('likes')
            .annotate(comment_count=Count('comments'))
            .order_by('-updated_at', '-created_at')
        )
        serializer = PostSerializer(post, many=True)
        response_data = serializer.data
        cache.set(cache_key, response_data, timeout=POSTS_CACHE_TTL_SECONDS)
        return Response(response_data, status=status.HTTP_200_OK)
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

@cache_page(60 * 15)
@api_view(['GET'])
@permission_classes([AllowAny])
def getCategories(request):
    categories = Post.Categories
    return Response(categories, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def GetAllBookmarks(request):
    user = request.user
    bookmarks = Bookmark.objects.filter(user=user).select_related('post')
    serializer = BookmarkSerializer(bookmarks, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


#POST ----------------------------------------------------------------------------------

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ChangeUserDescription(request):
    user = request.user
    request_user_id = request.data.get('userId')
    if request_user_id is None:
        return Response({"detail": "userId is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        request_user_id = int(request_user_id)
    except (TypeError, ValueError):
        return Response({"detail": "Invalid userId."}, status=status.HTTP_400_BAD_REQUEST)

    if request_user_id != user.id:
        return Response({"detail": "You can only change your own description."}, status=status.HTTP_403_FORBIDDEN)

    if 'avatar' in request.data:
        user.avatar = request.data.get('avatar') or None
    if 'bio' in request.data:
        user.bio = request.data.get('bio') or ''
    if 'name' in request.data:
        user.username = request.data.get('name') or user.username
    if 'website' in request.data:
        user.website = request.data.get('website') or None
    if 'location' in request.data:
        user.location = request.data.get('location') or None
    
    user.save()
    _invalidate_posts_cache()
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get("token")

    try:
        # Verify the Google Token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0]) # Fallback for name
        avatar = idinfo.get('picture')

        # FIX: Look up by EMAIL, not username
        # Since Email is your unique identifier, use it as the lookup key.
        user, created = User.objects.get_or_create(
            email=email, 
            defaults={
                'username': name,
                'avatar': avatar # Ensure this matches your model field name
            }
        )

        # Optional: Update the avatar if the user already existed
        if not created and avatar:
            user.profilePicture = avatar
            user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

    except ValueError:
        return Response({"error": "Invalid token"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

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
        _invalidate_posts_cache()


class UpdatePostView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = PostSerializer

    def perform_update(self, serializer):
        post = self.get_object()
        if post.author != self.request.user:
            raise ValidationError("You do not have permission to edit this post.")
        serializer.save()
        _invalidate_posts_cache()

#DELETE ----------------------------------------------------------------------------------

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
        _invalidate_posts_cache()
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
    _invalidate_posts_cache()
    return Response({"detail": "Comment deleted successfully."}, status=status.HTTP_204_NO_CONTENT)



class DeletePostView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    permission_classes = (IsAuthenticated,)

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise ValidationError("You do not have permission to delete this post.")
        instance.delete()
        _invalidate_posts_cache()
        return Response({"detail": "Post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def DeleteUserView(request):
    user = request.user
    user.delete()
    _invalidate_posts_cache()
    return Response({"detail": "User account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)