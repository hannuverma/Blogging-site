from rest_framework import serializers
from .models import User, Post, Comment, Like, Follow


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "password")
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
    
    class Meta:
        model = Post
        fields = ("id", "title", "content", "description", "author", "created_at", "updated_at", "image", "published")
        extra_kwargs = {"author": {"read_only": True}, "created_at": {"read_only": True}, "updated_at": {"read_only": True}}