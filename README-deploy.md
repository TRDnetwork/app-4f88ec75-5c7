# TeamFlow PM Deployment Guide

## Prerequisites

- **Docker** (for Docker/Compose deployment) or **Node.js 18+** (for PaaS)
- **PostgreSQL 12+** database (managed or self-hosted)
- **Stripe account** for payment processing
- **Email service** (SMTP or Resend)

## Deploy with Docker

### 1. Build and run the container

```bash
# Build the Docker image
docker build -t teamflow-pm .

# Run the container
docker run -d \
  --name teamflow-pm \
  -p 3000:3000 \
  --env-file .env \
  teamflow-pm
```

### 2. Verify deployment

```bash
# Check container status
docker ps

# View logs
docker logs teamflow-pm

# Test health endpoint
curl http://localhost:3000/api/health
```

## Deploy with Docker Compose

### 1. Set up environment variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 2. Start all services

```bash
# Start PostgreSQL and backend
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Initialize database

```bash
# Run database migrations
docker-compose exec backend node -e "
  const { Pool } = require('pg');
  const fs = require('fs');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const sql = fs.readFileSync('db/schema.sql', 'utf8');
  pool.query(sql).then(() => {
    console.log('Database initialized');
    process.exit(0);
  }).catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
"
```

## Deploy to Railway

### 1. Create railway.json

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci --only=production"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 2. Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Link to project
railway link

# Set environment variables
railway variables set DATABASE_URL=postgresql://...
railway variables set JWT_SECRET=your_secret
# ... set all other variables from .env.example

# Deploy
railway up
```

### 3. Add PostgreSQL plugin

```bash
# Add PostgreSQL database
railway add postgresql

# Get connection string
railway variables
```

## Deploy to Render

### 1. Create render.yaml

```yaml
services:
  - type: web
    name: teamflow-pm-backend
    env: node
    buildCommand: npm ci --only=production
    startCommand: node server.js
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: teamflow-db
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: STRIPE_PRO_PRICE_ID
        sync: false
      - key: FRONTEND_URL
        value: https://your-frontend-domain.com

databases:
  - name: teamflow-db
    databaseName: teamflow
    user: teamflow_user
```

### 2. Deploy to Render

```bash
# Push to GitHub
git add .
git commit -m "Initial deployment"
git push origin main

# Connect Render to your GitHub repository
# Render will automatically deploy from render.yaml
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT token signing | `your_super_secret_key` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_xxxxxxxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_xxxxxxxx` |
| `STRIPE_PRO_PRICE_ID` | Stripe Pro plan price ID | `price_xxxxxxxx` |
| `FRONTEND_URL` | Frontend application URL | `https://app.teamflowpm.com` |

### Email Configuration (choose one)

**Option A - SMTP:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@teamflowpm.com
```

**Option B - Resend:**
```
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM=TeamFlow PM <onboarding@resend.dev>
EMAIL_REPLY_TO=support@teamflowpm.com
```

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Backend server port |
| `NODE_ENV` | `production` | Node environment |
| `CORS_ORIGIN` | `FRONTEND_URL` | CORS allowed origin |

## Database Migrations

### Initial Setup

```bash
# Using Docker Compose
docker-compose exec postgres psql -U teamflow_user -d teamflow -f /app/db/schema.sql

# Using direct connection
psql -h localhost -U teamflow_user -d teamflow -f db/schema.sql
```

### Migration Script

Create `migrate.js` for future migrations:

```javascript
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add your migration SQL here
    const migrationSQL = `
      -- Example: Add new column
      ALTER TABLE app_4994_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
    `;
    
    await client.query(migrationSQL);
    await client.query('COMMIT');
    console.log('Migration completed successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
```

## Frontend Deployment

### Static Hosting (Vercel, Netlify, GitHub Pages)

1. **Update API URL** in `index.html`:
   ```html
   <script>
     window.__API_BASE_URL__ = 'https://your-backend-domain.com/api';
   </script>
   ```

2. **Deploy static files**:
   ```bash
   # All frontend files are in the root directory
   # Deploy index.html, styles.css, app.js, and public/ folder
   ```

### Docker with Nginx (Full stack)

Use the provided `nginx.conf` to serve both frontend and backend:

```bash
# Build and run with nginx
docker-compose -f docker-compose.yml -f docker-compose.nginx.yml up -d
```

## Health Checks

### Backend Health
```bash
curl https://your-backend-domain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Database Connection
```bash
# Using Docker Compose
docker-compose exec postgres pg_isready -U teamflow_user
```

### Stripe Webhook Test
```bash
# Test webhook endpoint
curl -X POST https://your-backend-domain.com/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}'
```

## Monitoring

### Logs
```bash
# Docker Compose
docker-compose logs -f backend

# Docker
docker logs -f teamflow-pm

# Railway
railway logs

# Render
# Check dashboard for logs
```

### Performance
- Monitor response times at `/api/health`
- Check database connection pool
- Review Stripe webhook delivery

## Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Test connection
   psql "${DATABASE_URL}" -c "SELECT 1"
   
   # Check Docker network
   docker network ls
   docker network inspect teamflow-pm_default
   ```

2. **Stripe webhook not working**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
   - Check webhook endpoint URL in Stripe Dashboard
   - Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

3. **Emails not sending**
   - Check SMTP/Resend credentials
   - Verify email service is not blocking
   - Check application logs for email errors

4. **CORS errors**
   - Ensure `FRONTEND_URL` is set correctly
   - Check browser console for specific errors
   - Verify nginx proxy configuration

### Getting Help

1. Check application logs
2. Verify all environment variables are set
3. Test each service independently
4. Review deployment platform documentation

## Security Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Enable database encryption at rest
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor failed login attempts
- [ ] Implement rate limiting
- [ ] Regular backups

## Backup Strategy

### Database Backups
```bash
# Daily backup script
docker-compose exec postgres pg_dump -U teamflow_user teamflow > backup_$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec postgres psql -U teamflow_user teamflow < backup.sql
```

### File Uploads
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Restore uploads
tar -xzf uploads_backup.tar.gz
```

## Scaling

### Horizontal Scaling
- Add more backend instances behind load balancer
- Use Redis for session storage
- Implement database connection pooling

### Vertical Scaling
- Increase database memory/CPU
- Add more backend resources
- Enable database read replicas

---

**Note:** Always test deployments in a staging environment before production. Monitor application performance and set up alerts for critical issues.