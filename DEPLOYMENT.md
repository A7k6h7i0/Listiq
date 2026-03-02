# Production Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase/AWS RDS)
- AWS S3 bucket for image storage
- Stripe account for payments
- Google Cloud project for OAuth

## Running Locally (Windows/PowerShell)

### 1. Install PostgreSQL

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, set a password for the postgres user
4. Keep the default port 5432

### 2. Create Database

Open pgAdmin or use psql:

```sql
CREATE DATABASE olx;
```

Or via command line:
```powershell
"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres olx
```

### 3. Update Environment

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/olx?schema=public"
```

### 4. Backend
```powershell
cd backend
npm install
npm run db:generate
npm run dev
```

### Frontend (in a new terminal)
```powershell
cd frontend
npm install
npm run dev
```

## Backend Deployment

### 1. Environment Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` with production values:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=generate-secure-random-string
JWT_REFRESH_SECRET=generate-secure-random-string
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-domain.com
```

### 2. Install Dependencies & Build

```bash
npm install
npm run build
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Deploy to Render/AWS

#### Option A: Render.com
1. Connect GitHub repository
2. Set `Root Directory` to `backend` (required for monorepo)
3. Set build command: `npm ci && npm run build`
4. Set start command: `npm start`
5. Add environment variables

If you do not set `Root Directory=backend`, Render runs commands at repo root, where no
`package-lock.json` exists, and `npm ci` fails with `EUSAGE`.

#### Option B: AWS EC2
1. Launch EC2 instance
2. Install Node.js, PostgreSQL client
3. Clone repository and install dependencies
4. Set up PM2 for process management
5. Configure Nginx as reverse proxy

## Frontend Deployment (Vercel)

### 1. Environment Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-api.com
```

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect GitHub repository to Vercel for automatic deployments.

## Database Schema Seeding

Create seed file `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@olx.com' },
    update: {},
    create: {
      email: 'admin@olx.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  // Create categories
  const categories = [
    { name: 'Vehicles', slug: 'vehicles', icon: 'car' },
    { name: 'Electronics', slug: 'electronics', icon: 'laptop' },
    { name: 'Furniture', slug: 'furniture', icon: 'sofa' },
    { name: 'Real Estate', slug: 'real-estate', icon: 'home' },
    { name: 'Jobs', slug: 'jobs', icon: 'briefcase' },
    { name: 'Services', slug: 'services', icon: 'tool' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Create sample locations
  const locations = [
    { city: 'New York', state: 'NY', country: 'USA' },
    { city: 'Los Angeles', state: 'CA', country: 'USA' },
    { city: 'Chicago', state: 'IL', country: 'USA' },
    { city: 'Houston', state: 'TX', country: 'USA' },
  ];

  for (const location of locations) {
    await prisma.location.upsert({
      where: { city_state: { city: location.city, state: location.state } },
      update: {},
      create: location,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:

```bash
npx ts-node prisma/seed.ts
```

## Stripe Setup

1. Create Stripe account
2. Get API keys from dashboard
3. Create products:
   - Featured Ad (7 days): $9.99
   - Premium Ad (30 days): $29.99
4. Get price IDs and add to environment
5. Set up webhook endpoint: `https://your-api.com/api/payment/webhook`

## AWS S3 Setup

1. Create S3 bucket
2. Configure CORS:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://your-domain.com"],
    "ExposeHeaders": []
  }
]
```
3. Create IAM user with S3 access
4. Get credentials and add to environment

## Google OAuth Setup

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs
4. Get client ID and secret

## Security Checklist

- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Configure AWS S3 bucket policies
- [ ] Set up Stripe webhook signatures
- [ ] Enable JWT refresh token rotation
- [ ] Configure proper error handling
- [ ] Set up logging and monitoring

## Monitoring & Maintenance

1. Set up error tracking (Sentry)
2. Configure application monitoring
3. Set up regular database backups
4. Configure log rotation
5. Set up health check endpoints

## SSL Certificate (if using Nginx)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```
