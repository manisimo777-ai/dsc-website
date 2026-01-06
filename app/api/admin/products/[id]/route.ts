import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { price, quantity, title, description } = body;

    const updates: any = {};

    if (price !== undefined) updates.price = parseFloat(price);
    if (quantity !== undefined) updates.quantity = parseInt(quantity);
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    // Mark as pending sync when updated
    updates.syncStatus = 'pending';

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updates,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
