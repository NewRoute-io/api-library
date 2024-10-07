# (Optional) SSL Setup for NGINX Proxy

This guide explains how to configure SSL certificates for NGINX using Let's Encrypt. The certificates are generated on the host machine and mounted into the NGINX Docker container.

## 1. Generate SSL Certificates

First, install **Certbot** (the Let's Encrypt client) on your host machine if you haven’t already:

```bash
sudo apt install certbot
```

Generate SSL certificates for your domain:

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

The certificates will be saved in `/etc/letsencrypt/live/yourdomain.com/`.

## 2. Modify `nginx.conf` to Enable SSL

Add the following configuration to your existing `nginx.conf` to enable SSL for your domain. This will listen on port 443 (HTTPS) and use the SSL certificates you generated:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/certs/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Make sure you keep the existing HTTP configuration (port 80) for handling non-SSL traffic. You can optionally redirect HTTP to HTTPS:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    return 301 https://$host$request_uri;
}
```

## 3. Mount Certificates in Docker

Ensure your `docker-compose.yml` mounts the SSL certificates into the NGINX container, add the following to `nginx.volumes`. **Replace `yourdomain.com`**:

```yaml
services:
  nginx:
    volumes:
      - ./etc/letsencrypt/live/yourdomain.com:/etc/ssl/certs:ro
```

## 4. Renewing SSL Certificates

**Set Up a Cron Job:** You can use cron to automate the renewal process. Open the crontab for editing: 

```bash
sudo crontab -e
```
**Add a Renewal Job**: Add the following line to the crontab. This example checks for renewal every day at 3 AM:
```bash
0 3 * * * certbot renew --quiet && && docker compose -f /path-to-your-project/docker-compose.yml restart nginx
```
