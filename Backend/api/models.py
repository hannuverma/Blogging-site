from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profilePicture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]  
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    avatar = models.URLField(blank=True, null=True)  # New field for Google profile picture
    def __str__(self):
        return self.username
    
class Post(models.Model):
    Categories = [
        ('All', 'All'),
        ('Tech', 'Tech'),
        ('Lifestyle', 'Lifestyle'),
        ('Travel', 'Travel'),
        ('Food', 'Food'),
        ('Education', 'Education'),
        ('Health', 'Health'),
        ('Entertainment', 'Entertainment'),
        ('Business', 'Business'),
        ('Sports', 'Sports'),
        ('Other', 'Other'),
        ]
    title = models.CharField(max_length=200)
    content = models.TextField()
    description = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    published = models.BooleanField(default=False)
    category = models.CharField(max_length=100, blank=True, null=True, choices=Categories)
    isBookmarked = models.BooleanField(default=False)
    commentCount = models.IntegerField(default=0)
    def __str__(self):
        return f"{self.id} - {self.title} - {self.author.username}"
    
class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)    

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.title}"

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{self.user.username} likes {self.post.title} by {self.post.author.username}"
    
class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} bookmarked {self.post.title} by {self.post.author.username}"

# Create your models here.

class Mute(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='muted_users')
    muted_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='muted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'muted_user')

    def __str__(self):
        return f"{self.user.username} muted {self.muted_user.username}"
    
class Report(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_received')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports', null=True, blank=True)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reports', null=True, blank=True)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.post:
            return f"{self.reporter.username} reported {self.reported_user.username} for post '{self.post.title}'"
        elif self.comment:
            return f"{self.reporter.username} reported {self.reported_user.username} for comment '{self.comment.content[:20]}...'"
        else:
            return f"{self.reporter.username} reported {self.reported_user.username}"