# Vercel Deployment Guide

This guide will help you deploy the Donation Management System to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (recommended: [Neon](https://neon.tech) or [Supabase](https://supabase.com))
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Database

1. Set up a PostgreSQL database on Neon, Supabase, or your preferred provider
2. Copy your database connection string (it should look like: `postgresql://user:password@host:5432/database?sslmode=require`)

## Step 2: Run Database Migrations

Before deploying, you need to run migrations on your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

**Note:** For production databases, use `prisma migrate deploy` instead of `prisma migrate dev`.

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect Next.js settings
4. Configure environment variables (see Step 4)
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 4: Configure Environment Variables

In your Vercel project settings, add the following environment variables:

### Required Variables

- **`DATABASE_URL`**: Your PostgreSQL database connection string
  ```
  postgresql://user:password@host:5432/database?sslmode=require
  ```

### Optional Variables

- **`NEXT_PUBLIC_ORGANIZATION_NAME`**: Organization name to display (defaults to "Bhatti Welfare Management System")
  ```
  Bhatti Welfare Management System
  ```

### How to Add Environment Variables in Vercel:

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for the appropriate environments (Production, Preview, Development)
4. Click **Save**
5. Redeploy your application for changes to take effect

## Step 5: Verify Deployment

1. After deployment completes, visit your Vercel URL
2. Test the application:
   - Login page should load
   - Dashboard should display correctly
   - Database operations should work

## Important Notes

1. **Database Migrations**: Run migrations manually before first deployment, or set up a migration script in your CI/CD pipeline

2. **Environment Variables**: 
   - `DATABASE_URL` is required for the app to function
   - `NEXT_PUBLIC_ORGANIZATION_NAME` is optional and has a default value

3. **Build Settings**: 
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
   - Node.js Version: 18.x or higher (auto-detected)

4. **Prisma Client**: The build script automatically runs `prisma generate` to ensure Prisma Client is generated during build

## Troubleshooting

### Build Fails with Database Connection Error

- Ensure `DATABASE_URL` is set correctly in Vercel environment variables
- Verify your database allows connections from Vercel's IP addresses
- Check that your database URL includes `?sslmode=require` for secure connections

### Build Fails with Prisma Errors

- Ensure `prisma` is in your `devDependencies` (it already is)
- The `postinstall` script should automatically generate Prisma Client
- If issues persist, verify your `prisma/schema.prisma` file is correct

### Application Fails at Runtime

- Check Vercel function logs in the dashboard
- Verify all environment variables are set correctly
- Ensure database migrations have been run on your production database
- Check that your database is accessible from Vercel's servers

## Continuous Deployment

Once connected to a Git repository, Vercel will automatically:
- Deploy on every push to the main branch (production)
- Create preview deployments for pull requests
- Run builds automatically

## Next Steps

- Set up a custom domain (optional)
- Configure monitoring and analytics
- Set up database backups
- Configure environment-specific settings

