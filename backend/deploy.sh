#!/bin/bash

# Exit on error
set -e

# Project directory
PROJECT_DIR="/root/dsahboard/backend"
DJANGO_SETTINGS_MODULE="dsp.settings"

# Create necessary directories if they don't exist
mkdir -p $PROJECT_DIR/logs
mkdir -p $PROJECT_DIR/run

# Activate virtual environment
source /root/dsahboard/backend/myenv/bin/activate

# Install/update requirements
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Create Gunicorn systemd service file
sudo tee /etc/systemd/system/gunicorn.service << EOF
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=$PROJECT_DIR
ExecStart=$PROJECT_DIR/../.venv/bin/gunicorn \\
    --access-logfile - \\
    --workers 3 \\
    --bind unix:$PROJECT_DIR/run/gunicorn.sock \\
    dsp.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Create Gunicorn socket file
sudo tee /etc/systemd/system/gunicorn.socket << EOF
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=$PROJECT_DIR/run/gunicorn.sock
SocketUser=www-data
SocketGroup=www-data
SocketMode=0660

[Install]
WantedBy=sockets.target
EOF

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/campaign_manager << EOF
server {
    listen 80;
    server_name localhost;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root $PROJECT_DIR;
    }

    location /media/ {
        root $PROJECT_DIR;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:$PROJECT_DIR/run/gunicorn.sock;
    }
}
EOF

# Enable the Nginx site
sudo ln -sf /etc/nginx/sites-available/campaign_manager /etc/nginx/sites-enabled/

# Restart services
sudo systemctl daemon-reload
sudo systemctl restart gunicorn.socket gunicorn.service
sudo systemctl restart nginx

echo "Deployment completed successfully!"
echo "Your application should now be running at http://localhost" 