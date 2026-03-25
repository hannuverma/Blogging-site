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
    followers = serializers.SerializerMethodField() # Renamed to match Meta and Model
    following = serializers.SerializerMethodField()
    mute = serializers.SerializerMethodField() # Added for mute functionality

    def get_mute(self, obj):
        # Return array of user IDs that this user has muted
        return list(obj.muted_users.values_list('muted_user_id', flat=True))
    def get_followers(self, obj):
        # obj.followers refers to the related_name in the Follow model
        # we want the IDs of the people following this user (the 'follower' side)
        return list(obj.followers.values_list('follower_id', flat=True))

    def get_following(self, obj):
        # obj.following refers to the related_name in the Follow model
        # we want the IDs of the people this user follows (the 'following' side)
        return list(obj.following.values_list('following_id', flat=True))

    def get_bookmarks(self, obj):
        return list(obj.bookmarks.values_list('post_id', flat=True))

    class Meta:
        model = User
        # Ensure these names match the variable names defined above exactly
        fields = ("id", "username", "email", "password", "bookmarks", "followers", "following", "mute", "created_at", "avatar")
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
    author_avatar = serializers.ReadOnlyField(source='author.avatar')
    commentCount = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()

    def get_commentCount(self, obj):
        return obj.comments.count()

    def get_likes(self, obj):
        # Return array of user IDs who liked this post
        return list(obj.likes.values_list('user_id', flat=True))

    class Meta:
        model = Post
        fields = ("id", "title", "content", "description", "author", "author_id", "author_avatar", "created_at", "updated_at", "image", "published", "category", "commentCount", "likes")
        extra_kwargs = {"author": {"read_only": True}, "created_at": {"read_only": True}, "updated_at": {"read_only": True}}


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    author_id = serializers.ReadOnlyField(source='author.id')
    
    class Meta:
        model = Comment
        fields = ("id", "post", "author", "author_id", "content", "created_at", "updated_at")
        extra_kwargs = {"author": {"read_only": True}, "created_at": {"read_only": True}, "updated_at": {"read_only": True}}

class LikeSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    
    class Meta:
        model = Like
        fields = ("id", "post", "user", "user_id", "created_at")
        extra_kwargs = {"user": {"read_only": True}, "created_at": {"read_only": True}}