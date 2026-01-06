import { NextRequest, NextResponse } from 'next/server';
import { getShopListings } from '@/lib/etsy';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accessToken = process.env.ETSY_ACCESS_TOKEN;
    const shopId = process.env.ETSY_SHOP_ID;

    if (!accessToken || !shopId) {
      return NextResponse.json(
        { error: 'Missing Etsy credentials' },
        { status: 400 }
      );
    }

    // Sync from Etsy to database
    const listings = await getShopListings(shopId, accessToken);

    for (const listing of listings) {
      const price = listing.price.amount / listing.price.divisor;

      await prisma.product.upsert({
        where: { etsyId: listing.listing_id.toString() },
        update: {
          title: listing.title,
          description: listing.description || null,
          price,
          quantity: listing.quantity,
          state: listing.state,
          url: listing.url,
          etsyUpdatedAt: new Date(listing.updated_timestamp * 1000),
          lastSyncedAt: new Date(),
        },
        create: {
          etsyId: listing.listing_id.toString(),
          title: listing.title,
          description: listing.description || null,
          price,
          quantity: listing.quantity,
          state: listing.state,
          url: listing.url,
          etsyCreatedAt: new Date(listing.created_timestamp * 1000),
          etsyUpdatedAt: new Date(listing.updated_timestamp * 1000),
          lastSyncedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${listings.length} products`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
