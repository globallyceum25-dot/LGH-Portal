# Connecting Lyceum Portal to portal.lgh.lk via Cloudflare

This guide outlines two clean, professional methods for routing traffic to your Lyceum Global Holdings Portal at **`portal.lgh.lk`** via Cloudflare.

---

## Method 1: Cloudflare Tunnel (Zero Trust) — *Recommended*

Cloudflare Tunnel (`cloudflared`) creates a secure, outbound-only connection between your server and Cloudflare. This means **you do not need to open any ports (like 80, 443, or 3001) in your firewall or expose your server's public IP address.**

### Step 1: Create a Tunnel in Cloudflare

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Zero Trust** (under the side menu) -> **Networks** -> **Tunnels**.
3. Click **Add a tunnel** and select **Cloudflare Tunnel**.
4. Name your tunnel (e.g., `lyceum-portal`) and click **Save tunnel**.
5. Under **Install and run a connector**, select **Docker**.
6. Copy the command shown. It will contain a long token (e.g. `eyJh...`). Save this token — you will need it as `CLOUDFLARE_TUNNEL_TOKEN`.

### Step 2: Route the Domain

1. In the same Cloudflare Tunnel settings, click the **Public Hostname** tab.
2. Click **Add a public hostname**.
3. Configure the hostname:
   - **Subdomain**: `portal`
   - **Domain**: `lgh.lk`
   - **Type**: `HTTP`
   - **URL**: `lyceum-portal-production:3001` (if running inside Docker network) or `localhost:3001` (if running on host).
4. Click **Save hostname**.

---

### Step 3: Run the Services with Docker Compose

Create a `docker-compose.yml` file on your server to orchestrate both the portal and the secure tunnel:

```yaml
version: '3.8'

services:
  portal:
    image: ghcr.io/globallyceum25-dot/lgh-portal:latest
    container_name: lyceum-portal-production
    restart: unless-stopped
    # Port exposure is optional since cloudflared accesses it on the internal network!
    ports:
      - "3001:3001"
    volumes:
      - lyceum-prod-data:/app/data
    environment:
      - NODE_ENV=production
      - PORT=3001

  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      - portal

volumes:
  lyceum-prod-data:
```

Launch the services on your VPS:
```bash
export CLOUDFLARE_TUNNEL_TOKEN="your_copied_token_here"
docker-compose up -d
```

---

## Method 2: Standard Cloudflare Proxy (Standard DNS)

If you prefer a traditional DNS routing architecture using an Nginx reverse proxy on your server:

### Step 1: Update Cloudflare DNS Settings
1. Go to **DNS** -> **Records** on your Cloudflare dashboard for `lgh.lk`.
2. Add a new **A Record**:
   - **Name**: `portal`
   - **IPv4 Address**: `your-server-ip-address`
   - **Proxy Status**: **Proxied** (Orange cloud icon enabled)
3. Under **SSL/TLS** settings, set the encryption mode to **Full** or **Full (Strict)**.

### Step 2: Configure Nginx Reverse Proxy on Server
Install Nginx on your VPS and create a configuration file at `/etc/nginx/sites-available/portal.lgh.lk`:

```nginx
server {
    listen 80;
    server_name portal.lgh.lk;

    # Redirect all HTTP traffic to HTTPS (handled securely by Cloudflare or local cert)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.lgh.lk;

    # SSL Certificates (Recommended: Cloudflare Origin CA certificate)
    ssl_certificate /etc/ssl/certs/cloudflare_origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare_origin.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/portal.lgh.lk /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
