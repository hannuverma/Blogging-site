# Blogging Site Backend API

Django REST Framework API for the Blogging Site application. This backend handles all blog post management, user authentication, and image uploads.

## Overview

The backend provides RESTful endpoints for managing blog posts, user authentication via Google OAuth, and post image uploads. It uses SQLite as the default database and can be easily configured for production databases like PostgreSQL.

## Technology Stack

- **Framework:** Django 5.x with Django REST Framework
- **Database:** SQLite (development), PostgreSQL (production-ready)
- **Authentication:** Django authentication + Google OAuth
- **Image Processing:** Pillow
- **API:** RESTful API with CORS support
- **Containerization:** Docker support included

## Project Structure

```
Backend/
├── Backend/              # Django project configuration
│   ├── settings.py       # Django settings
│   ├── urls.py          # URL routing
│   ├── wsgi.py          # WSGI configuration
│   └── asgi.py          # ASGI configuration
├── api/                 # Main API application
│   ├── models.py        # Database models
│   ├── views.py         # API views
│   ├── serializers.py   # DRF serializers
│   ├── urls.py          # API URL routing
│   └── permissions.py   # Custom permissions
├── post_images/         # Uploaded post images storage
├── manage.py            # Django management script
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
├── build.sh            # Build script
├── db.sqlite3          # SQLite database
└── README.md           # This file
```

## Prerequisites

- Python 3.13+
- pip or uv package manager
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hannuverma/Blogging-site.git
cd Blogging-site/Backend
```

### 2. Create Virtual Environment

```bash
# Using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Or using uv
uv venv
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
# Or with uv:
uv pip install -r requirements.txt
```

### 4. Apply Migrations

```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 6. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## Configuration

### Django Settings

Key settings in `Backend/settings.py`:

- **DEBUG:** Set to `False` in production
- **ALLOWED_HOSTS:** Configure for your domain
- **DATABASES:** Configure database connection
- **CORS_ALLOWED_ORIGINS:** Set frontend URL

### Environment Variables

Create a `.env` file in the Backend directory:

```env
DEBUG=False
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
DATABASE_URL=postgresql://user:password@localhost/dbname
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Blog Posts
- `GET /api/posts` - List all posts
- `GET /api/posts/{id}` - Retrieve single post
- `POST /api/posts` - Create new post (authenticated)
- `PUT /api/posts/{id}` - Update post (authenticated, owner only)
- `DELETE /api/posts/{id}` - Delete post (authenticated, owner only)

### Comments
- `GET /api/posts/{id}/comments` - Get post comments
- `POST /api/posts/{id}/comments` - Add comment (authenticated)

## Docker Deployment

### Build Docker Image

```bash
docker build -t blogging-site-backend .
```

### Run Docker Container

```bash
docker run -p 8000:8000 blogging-site-backend
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: blogging_site
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
  
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DEBUG: 'False'
      DATABASE_URL: postgresql://postgres:postgres@db:5432/blogging_site
    depends_on:
      - db
```

Run with: `docker-compose up`

## Database Models

### Post Model
```python
- title (CharField)
- content (TextField)
- excerpt (TextField)
- author (ForeignKey to User)
- image (ImageField, optional)
- created_at (DateTimeField)
- updated_at (DateTimeField)
- published (BooleanField)
```

### Comment Model
```python
- post (ForeignKey to Post)
- author (ForeignKey to User)
- content (TextField)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

## Migrations

### Create New Migration

```bash
python manage.py makemigrations
```

### Apply Migrations

```bash
python manage.py migrate
```

### Reverse Migration

```bash
python manage.py migrate api 0001  # Rollback to specific migration
```

## Testing

### Run Tests

```bash
python manage.py test
```

### Run Tests with Coverage

```bash
coverage run --source='.' manage.py test
coverage report
coverage html
```

## Admin Panel

Access Django admin at `http://localhost:8000/admin/`

- Username: superuser username
- Password: superuser password

## Common Issues

### Port Already in Use

```bash
python manage.py runserver 8001
```

### Database Locked

```bash
rm db.sqlite3
python manage.py migrate
```

### Static Files Not Loading

```bash
python manage.py collectstatic
```

### Permission Denied on Images

```bash
chmod -R 755 post_images/
```

## Production Checklist

- [ ] Set `DEBUG = False`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set strong `SECRET_KEY`
- [ ] Configure HTTPS
- [ ] Set up PostgreSQL or another production database
- [ ] Configure CORS properly
- [ ] Set up logging and error tracking
- [ ] Configure static files serving (WhiteNoise or CDN)
- [ ] Set up media files serving
- [ ] Run security checks: `python manage.py check --deploy`

## Useful Commands

```bash
# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Load fixture data
python manage.py loaddata fixture.json

# Dump data
python manage.py dumpdata > backup.json

# Shell
python manage.py shell

# Check deployment settings
python manage.py check --deploy

# View URL patterns
python manage.py show_urls
```

## Dependencies

Key packages (see `requirements.txt`):
- Django 5.x
- Django REST Framework
- django-cors-headers
- Pillow (image processing)
- python-decouple (environment variables)
- gunicorn (production server)

## Performance Optimization

- Use database indexes on frequently queried fields
- Enable query caching with Redis
- Implement pagination for large datasets
- Use select_related() and prefetch_related() for queries
- Compress static files
- Enable GZIP compression in production

## Security

- Keep Django updated
- Use environment variables for sensitive data
- Enable CSRF protection
- Implement rate limiting on API endpoints
- Validate all user inputs
- Use HTTPS in production
- Keep dependencies updated

## Troubleshooting

### Debug Mode Issues

Check `DEBUG` setting and logs for detailed error messages.

### Database Errors

- Verify database connection in settings
- Run migrations: `python manage.py migrate`
- Check database user permissions

### CORS Issues

- Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check `Access-Control` headers in responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## Support

For issues or questions, please open an issue on GitHub.

## License

This project is open source and available under the MIT License.

## Related

- [Frontend Documentation](../Frontend/README.md)
- [Main Project README](../README.md)

---

Last Updated: 2026-06-13
