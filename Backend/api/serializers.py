from rest_framework import serializers
from .models import User, Post, Comment, Like, Follow, Bookmark

class BookmarkSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    post_title = serializers.ReadOnlyField(source='post.title')
    post_id = serializers.ReadOnlyField(source='post.id')
    
    class Meta:
        model = Bookmark
        fields = ("id", "user", "user_id", "post", "post_title", "post_id", "created_at")
        extra_kwargs = {"user": {"read_only": True}, "created_at": {"read_only": True}}

class UserSerializer(serializers.ModelSerializer):
    bookmarks = serializers.SerializerMethodField()

    def get_bookmarks(self, obj):
        # Return bookmarked post IDs so frontend can compare against post.id directly.
        return list(obj.bookmarks.values_list('post_id', flat=True))

    class Meta:
        model = User
        fields = ("id", "username", "email", "password", "bookmarks")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        profile = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return profile
    
class PostSerializer(serializers.ModelSerializer):

    author = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')
    class Meta:
        model = Post
        fields = ("id", "title", "content", "description", "author", "author_id", "created_at", "updated_at", "image", "published", "category")
        extra_kwargs = {"author": {"read_only": True}, "created_at": {"read_only": True}, "updated_at": {"read_only": True}}


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')
    
    class Meta:
        model = Comment
        fields = ("id", "post", "author", "author_id", "content", "created_at", "updated_at")
        extra_kwargs = {"author": {"read_only": True}, "created_at": {"read_only": True}, "updated_at": {"read_only": True}}