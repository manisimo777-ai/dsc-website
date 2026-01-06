import { NextRequest, NextResponse } from 'next/server';
import { updateListingInventory, updateListing } from '@/lib/etsy';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.ETSY_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing Etsy access token' },
        { status: 400 }
      );
    }

    // Get the product ID from the request body
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId in request body' },
        { status: 400 }
      );
    }

    // Fetch the product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update the listing on Etsy
    try {
      // Update basic details
      await updateListing(
        product.etsyId,
        {
          title: product.title,
          description: product.description || undefined,
          price: product.price,
        },
        accessToken
      );

      // Update inventory
      await updateListingInventory(
        product.etsyId,
        product.quantity,
        accessToken
      );

      // Mark as synced
      await prisma.product.update({
        where: { id: productId },
        data: {
          syncStatus: 'synced',
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Product "${product.title}" synced to Etsy`,
      });
    } catch (etsyError) {
      // Mark as error
      await prisma.product.update({
        where: { id: productId },
        data: {
          syncStatus: 'error',
        },
      });

      throw etsyError;
    }
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync product to Etsy',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Sync all pending products
export async function GET() {
  try {
    const accessToken = process.env.ETSY_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing Etsy access token' },
        { status: 400 }
      );
    }

    // Get products marked as pending
    const pendingProducts = await prisma.product.findMany({
      where: {
        syncStatus: 'pending',
      },
    });

    if (pendingProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending products to sync',
      });
    }

    const results = [];

    for (const product of pendingProducts) {
      try {
        await updateListing(
          product.etsyId,
          {
            title: product.title,
            description: product.description || undefined,
            price: product.price,
          },
          accessToken
        );

        await updateListingInventory(
          product.etsyId,
          product.quantity,
          accessToken
        );

        await prisma.product.update({
          where: { id: product.id },
          data: {
            syncStatus: 'synced',
            lastSyncedAt: new Date(),
          },
        });

        results.push({ id: product.id, title: product.title, status: 'success' });
      } catch (error) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            syncStatus: 'error',
          },
        });

        results.push({
          id: product.id,
          title: product.title,
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} products`,
      results,
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
