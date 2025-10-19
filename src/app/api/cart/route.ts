import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cart, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const cartItems = await db
      .select({
        id: cart.id,
        quantity: cart.quantity,
        createdAt: cart.createdAt,
        product: products,
      })
      .from(cart)
      .innerJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.userId, userId));

    if (cartItems.length === 0) {
      return NextResponse.json({ items: [], total: 0 });
    }

    const itemsWithSubtotal = cartItems.map(item => ({
      id: item.id,
      quantity: item.quantity,
      createdAt: item.createdAt,
      product: item.product,
      subtotal: item.product.price * item.quantity,
    }));

    const total = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({
      items: itemsWithSubtotal,
      total,
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId, quantity } = body;

    if (!userId) {
      return NextResponse.json(
        {
          error: 'userId is required',
          code: 'MISSING_USER_ID',
        },
        { status: 400 }
      );
    }

    if (!productId) {
      return NextResponse.json(
        {
          error: 'Product ID is required',
          code: 'MISSING_PRODUCT_ID',
        },
        { status: 400 }
      );
    }

    if (!quantity) {
      return NextResponse.json(
        {
          error: 'Quantity is required',
          code: 'MISSING_QUANTITY',
        },
        { status: 400 }
      );
    }

    const parsedProductId = parseInt(productId);
    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedProductId)) {
      return NextResponse.json(
        {
          error: 'Product ID must be a valid integer',
          code: 'INVALID_PRODUCT_ID',
        },
        { status: 400 }
      );
    }

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json(
        {
          error: 'Quantity must be greater than 0',
          code: 'INVALID_QUANTITY',
        },
        { status: 400 }
      );
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parsedProductId))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        {
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    if (product[0].stock < parsedQuantity) {
      return NextResponse.json(
        {
          error: 'Insufficient stock available',
          code: 'INSUFFICIENT_STOCK',
        },
        { status: 400 }
      );
    }

    const existingCartItem = await db
      .select()
      .from(cart)
      .where(
        and(
          eq(cart.userId, userId),
          eq(cart.productId, parsedProductId)
        )
      )
      .limit(1);

    if (existingCartItem.length > 0) {
      const newQuantity = existingCartItem[0].quantity + parsedQuantity;

      if (product[0].stock < newQuantity) {
        return NextResponse.json(
          {
            error: 'Insufficient stock available for requested quantity',
            code: 'INSUFFICIENT_STOCK',
          },
          { status: 400 }
        );
      }

      const updated = await db
        .update(cart)
        .set({
          quantity: newQuantity,
        })
        .where(
          and(
            eq(cart.userId, userId),
            eq(cart.productId, parsedProductId)
          )
        )
        .returning();

      const cartItemWithProduct = {
        ...updated[0],
        product: product[0],
        subtotal: product[0].price * updated[0].quantity,
      };

      return NextResponse.json(cartItemWithProduct, { status: 201 });
    }

    const newCartItem = await db
      .insert(cart)
      .values({
        userId: userId,
        productId: parsedProductId,
        quantity: parsedQuantity,
        createdAt: new Date().toISOString(),
      })
      .returning();

    const cartItemWithProduct = {
      ...newCartItem[0],
      product: product[0],
      subtotal: product[0].price * newCartItem[0].quantity,
    };

    return NextResponse.json(cartItemWithProduct, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(cart)
      .where(eq(cart.userId, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
      deletedCount: deleted.length,
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}