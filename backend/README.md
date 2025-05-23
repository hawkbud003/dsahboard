# Campaign Manager 

This is the backend for the Campaign Manager application, built with Django and PostgreSQL.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd campaign-manager/backend
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL Database

```bash
# Log in to PostgreSQL
psql -U postgres

# Create a new database
CREATE DATABASE campaign_manager;

# Exit PostgreSQL
\q
```

### 5. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials and other settings.

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create a Superuser

```bash
python manage.py createsuperuser
```

### 8. Collect Static Files

```bash
python manage.py collectstatic
```

### 9. Run the Development Server

```bash
python manage.py runserver
```

The application will be available at http://localhost:8000/

## Deployment

For production deployment, make sure to:

1. Set `DEBUG=False` in your environment variables
2. Use a secure `DJANGO_SECRET_KEY`
3. Configure a production-grade web server (e.g., Gunicorn with Nginx)
4. Set up proper database backups
5. Configure HTTPS

## API Documentation

API documentation is available at `/api/docs/` when the server is running.

## License

[Your License]
