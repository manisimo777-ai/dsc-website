# Dappled Specter Co. - Setup Guide

This guide will help you set up the Etsy API integration and deploy your website.

## Prerequisites

- Node.js 18+ installed
- An Etsy shop
- A database (we recommend Vercel Postgres or Supabase)

## Step 1: Set up Etsy API Credentials

### 1.1 Create an Etsy App

1. Go to [Etsy Developers Portal](https://www.etsy.com/developers/your-apps)
2. Click "Create a New App"
3. Fill in the app details:
   - App Name: "Dappled Specter Co. Website"
   - App Description: "Inventory sync for dappledspecterco.com"
   - Redirect URI: `http://localhost:3000/api/auth/etsy/callback` (for local dev)
4. Click "Create App" and note your **API Key** (called "Keystring")

### 1.2 Get Your Shop ID

1. Go to your Etsy shop manager
2. Your shop ID is in the URL: `https://www.etsy.com/your/shops/{SHOP_ID}`
3. Or use the API: Visit `https://openapi.etsy.com/v3/application/shops?shop_name=dappledspecterco` with your API key

## Step 2: Set up Database

### Option A: Vercel Postgres (Recommended - Free Tier)

1. Go to [Vercel](https://vercel.com)
2. Create a new project (don't deploy yet)
3. Go to Storage → Create Database → Postgres
4. Copy the `DATABASE_URL` from the `.env.local` tab

### Option B: Supabase (Alternative - Free Tier)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the Connection String (URI mode)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your `.env` file:
   ```env
   DATABASE_URL="postgresql://..." # From Step 2
   ETSY_API_KEY="your_api_key"     # From Step 1.1
   ETSY_SHOP_ID="your_shop_id"     # From Step 1.2
   ```

## Step 4: Initialize Database

Run Prisma migrations to create your database tables:

```bash
npx prisma db push
npx prisma generate
```

## Step 5: Set up Etsy OAuth

The Etsy API requires OAuth 2.0 authentication. You'll need to:

1. Run the app locally:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/api/auth/etsy/login`
3. Authorize the app with your Etsy account
4. The tokens will be saved automatically

## Step 6: Test the Integration

1. Visit `http://localhost:3000/api/sync/etsy-to-db` to sync products from Etsy
2. Check your database to see the products
3. Visit `/products` to see your product listings

## Step 7: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Set up Etsy integration"
   git push
   ```

2. Go to [Vercel](https://vercel.com) and import your repository

3. Add environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file
   - Update `NEXT_PUBLIC_SITE_URL` to your production URL

4. Add the production redirect URI to your Etsy app:
   - Go to your Etsy app settings
   - Add: `https://your-domain.vercel.app/api/auth/etsy/callback`

5. Deploy!

## Ongoing Sync

Products will sync automatically:
- **Etsy → Website**: Every hour via Vercel Cron
- **Website → Etsy**: When you update inventory in the admin panel

## Troubleshooting

### "Invalid OAuth token"
- Re-authenticate by visiting `/api/auth/etsy/login`

### "Database connection error"
- Check your `DATABASE_URL` is correct
- Ensure database is accessible from your deployment environment

### "Products not syncing"
- Check the Vercel Cron logs
- Manually trigger sync at `/api/sync/etsy-to-db`

## Next Steps

- Customize product pages in `app/products/page.tsx`
- Add more fields to the Product model in `prisma/schema.prisma`
- Set up automated backups for your database
- Add product search and filtering
