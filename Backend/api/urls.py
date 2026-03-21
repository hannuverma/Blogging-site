from django.contrib import admin
from django.urls import path
from .views import CreateUserView, CreatePostView, UpdatePostView, DeletePostView, RetrievePostView


urlpatterns = [
    path("register/", CreateUserView.as_view(), name="register"),
    path("posts/create/", CreatePostView.as_view(), name="create_post"),
    path("posts/<int:pk>/edit/", UpdatePostView.as_view(), name="edit_post"),
    path("posts/<int:pk>/delete/", DeletePostView.as_view(), name="delete_post"),
    path('posts/', RetrievePostView, name='retrieve_post'),
]