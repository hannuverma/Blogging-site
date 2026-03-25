from django.contrib import admin
from .models import Mute, User, Post, Comment, Like, Follow, Bookmark

admin.site.register(User)
admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Follow)
admin.site.register(Bookmark)
admin.site.register(Mute)
# Register your models here.
