import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cart, products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity) {
      return NextResponse.json(
        { error: 'Quantity is required', code: 'MISSING_QUANTITY' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        {
          error: 'Quantity must be greater than 0',
          code: 'INVALID_QUANTITY',
        },
        { status: 400 }
      );
    }

    const existingCartItem = await db
      .select()
      .from(cart)
      .where(eq(cart.id, parseInt(id)))
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found', code: 'CART_ITEM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, existingCartItem[0].productId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (product[0].stock < quantity) {
      return NextResponse.json(
        {
          error: 'Insufficient stock available',
          code: 'INSUFFICIENT_STOCK',
          available: product[0].stock,
          requested: quantity,
        },
        { status: 400 }
      );
    }

    const updated = await db
      .update(cart)
      .set({
        quantity,
      })
      .where(eq(cart.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update cart item', code: 'UPDATE_FAILED' },
        { status: 404 }
      );
    }

    const updatedCartItemWithProduct = {
      ...updated[0],
      product: product[0],
    };

    return NextResponse.json(updatedCartItemWithProduct, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingCartItem = await db
      .select()
      .from(cart)
      .where(eq(cart.id, parseInt(id)))
      .limit(1);

    if (existingCartItem.length === 0) {
      return NextResponse.json(
        { error: 'Cart item not found', code: 'CART_ITEM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(cart)
      .where(eq(cart.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete cart item', code: 'DELETE_FAILED' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Item removed from cart',
        item: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}