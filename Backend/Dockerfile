FROM python:3.11-slim

# Prevents Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY . .

# Collect static files (crucial for WhiteNoise)
RUN python manage.py collectstatic --noinput

# Run using Gunicorn (Replace 'your_project_name' with your folder containing wsgi.py)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "Backend.wsgi:application"]