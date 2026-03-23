from django.contrib import admin
from django.urls import path
from .views import CreateUserView, CreatePostView, UpdatePostView, DeletePostView, RetrievePostView, RetrievePostDetailView,getCategories, CreateCommentView, DeleteCommentView, whoAmI, getUserPosts, getDraftPosts, getUserPost


urlpatterns = [
    path("register/", CreateUserView.as_view(), name="register"),
    path("posts/create/", CreatePostView.as_view(), name="create_post"),
    path("posts/<int:pk>/edit/", UpdatePostView.as_view(), name="edit_post"),
    path("posts/<int:pk>/delete/", DeletePostView.as_view(), name="delete_post"),
    path('posts/', RetrievePostView, name='retrieve_post'),
    path('posts/<int:post_id>/', RetrievePostDetailView, name='retrieve_post_detail'),
    path('categories/', getCategories, name='get_categories'),
    path('posts/<int:post_id>/comments/create/', CreateCommentView, name='create_comment'),
    path('comments/<int:comment_id>/delete/', DeleteCommentView, name='delete_comment'),
    path('whoami/', whoAmI, name='whoami'),
    path('user/posts/', getUserPosts, name='get_user_posts'),
    path('user/drafts/', getDraftPosts, name='get_draft_posts'),
    path('user/posts/<int:post_id>/', getUserPost, name='get_user_post'),
]