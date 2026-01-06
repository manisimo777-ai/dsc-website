import { NextRequest, NextResponse } from 'next/server';
import { getShopListings } from '@/lib/etsy';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check for access token
    const accessToken = process.env.ETSY_ACCESS_TOKEN;
    const shopId = process.env.ETSY_SHOP_ID;

    if (!accessToken || !shopId) {
      return NextResponse.json(
        { error: 'Missing Etsy credentials. Please complete OAuth flow first.' },
        { status: 400 }
      );
    }

    // Fetch listings from Etsy
    console.log('Fetching listings from Etsy...');
    const listings = await getShopListings(shopId, accessToken);

    console.log(`Found ${listings.length} listings`);

    // Sync each listing to database
    const syncedProducts = [];

    for (const listing of listings) {
      const price = listing.price.amount / listing.price.divisor;

      // Upsert product
      const product = await prisma.product.upsert({
        where: { etsyId: listing.listing_id.toString() },
        update: {
          title: listing.title,
          description: listing.description || null,
          price,
          quantity: listing.quantity,
          sku: listing.sku?.[0] || null,
          state: listing.state,
          url: listing.url,
          etsyUpdatedAt: new Date(listing.updated_timestamp * 1000),
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
        },
        create: {
          etsyId: listing.listing_id.toString(),
          title: listing.title,
          description: listing.description || null,
          price,
          quantity: listing.quantity,
          sku: listing.sku?.[0] || null,
          state: listing.state,
          url: listing.url,
          etsyCreatedAt: new Date(listing.created_timestamp * 1000),
          etsyUpdatedAt: new Date(listing.updated_timestamp * 1000),
          lastSyncedAt: new Date(),
          syncStatus: 'synced',
        },
      });

      // Sync images
      if (listing.images && listing.images.length > 0) {
        // Delete old images
        await prisma.productImage.deleteMany({
          where: { productId: product.id },
        });

        // Create new images
        await prisma.productImage.createMany({
          data: listing.images.map((img) => ({
            productId: product.id,
            url: img.url_fullxfull,
            rank: img.rank,
          })),
        });
      }

      syncedProducts.push({
        id: product.id,
        etsyId: product.etsyId,
        title: product.title,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedProducts.length} products from Etsy`,
      products: syncedProducts,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync products',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
