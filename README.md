# Dappled Specter Co. Website

A modern e-commerce website with **two-way Etsy inventory synchronization** built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Landing Page**: Beautiful glass-morphism design showcasing your brand
- **Product Catalog**: Display all your Etsy products on your own website
- **Two-Way Sync**:
  - Pull products from Etsy to your database
  - Push inventory updates from your website to Etsy
- **Admin Dashboard**: Manage inventory with a simple interface
- **Automated Sync**: Hourly cron job keeps your catalog up-to-date
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **API Integration**: Etsy API v3
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/manisimo777-ai/dsc-website.git
cd dsc-website
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your environment variables (see [SETUP.md](./SETUP.md) for detailed instructions).

### 3. Set Up Database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Project Structure

```
dsc-website/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── products/page.tsx           # Product catalog
│   ├── admin/page.tsx              # Admin dashboard
│   └── api/
│       ├── auth/etsy/              # OAuth endpoints
│       ├── sync/                   # Sync endpoints
│       ├── admin/                  # Admin API
│       └── cron/                   # Automated sync
├── lib/
│   ├── etsy.ts                     # Etsy API utilities
│   └── prisma.ts                   # Database client
├── prisma/
│   └── schema.prisma               # Database schema
└── public/                         # Static assets
```

## Key Pages & Endpoints

### Pages
- `/` - Landing page with brand showcase
- `/products` - Product catalog
- `/admin` - Inventory management (password: admin123)

### API Endpoints
- `GET /api/auth/etsy/login` - Start OAuth flow
- `GET /api/auth/etsy/callback` - OAuth callback
- `GET /api/sync/etsy-to-db` - Pull products from Etsy
- `POST /api/sync/db-to-etsy` - Push updates to Etsy
- `GET /api/admin/products` - Get all products
- `PATCH /api/admin/products/[id]` - Update product
- `GET /api/cron/sync` - Automated hourly sync

## Setup Guide

For detailed setup instructions including:
- Creating Etsy API credentials
- Setting up database
- Configuring OAuth
- Deploying to Vercel

See **[SETUP.md](./SETUP.md)**

## How Sync Works

### Etsy → Website (Pull)
1. Fetches active listings from Etsy API
2. Updates database with latest product info
3. Product images are synced automatically
4. Runs automatically every hour via Vercel Cron

### Website → Etsy (Push)
1. Update product in admin dashboard
2. Product marked as "pending" in database
3. Click "Push to Etsy" to sync changes
4. Updates listing details and inventory on Etsy

## Database Schema

### Product
- Basic info: title, description, price, quantity
- Etsy metadata: etsyId, state, url
- Sync tracking: syncStatus, lastSyncedAt
- Relations: images (one-to-many)

### ProductImage
- Image URL and rank
- Linked to product

## Development

### Build for Production

```bash
npm run build
```

### Database Migrations

```bash
npx prisma migrate dev
```

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

See [SETUP.md](./SETUP.md) Step 7 for detailed deployment instructions.

## Environment Variables

Required environment variables:

```env
DATABASE_URL              # PostgreSQL connection string
ETSY_API_KEY             # From Etsy Developer Portal
ETSY_SHOP_ID             # Your Etsy shop ID
ETSY_ACCESS_TOKEN        # OAuth token (generated)
ETSY_REFRESH_TOKEN       # OAuth refresh token (generated)
NEXT_PUBLIC_SITE_URL     # Your site URL
CRON_SECRET              # Random secret for cron auth
```

## Troubleshooting

### Products not syncing?
- Check Etsy API credentials in `.env`
- Re-authenticate: visit `/api/auth/etsy/login`
- Check Vercel Cron logs

### Database errors?
- Verify `DATABASE_URL` is correct
- Run `npx prisma db push` to sync schema
- Check database is accessible

### OAuth errors?
- Ensure redirect URI matches in Etsy app settings
- Check `NEXT_PUBLIC_SITE_URL` is correct

## Contributing

This is a private project for Dappled Specter Co.

## License

Private - All Rights Reserved

---

Built with ❤️ for Dappled Specter Co.
