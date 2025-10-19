import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, 
        { status: 400 }
      );
    }

    const orderId = parseInt(id);

    // Get order
    const orderResult = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (orderResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          code: 'ORDER_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Verify ownership if userId provided
    if (userId && order.userId !== userId) {
      return NextResponse.json(
        { 
          error: 'Forbidden - order does not belong to user',
          code: 'FORBIDDEN' 
        }, 
        { status: 403 }
      );
    }

    // Get order items with product details
    const items = await db.select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      price: orderItems.price,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        category: products.category,
        brand: products.brand,
        stock: products.stock,
        rating: products.rating,
        features: products.features,
        createdAt: products.createdAt,
      }
    })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    // Construct response
    const orderWithItems = {
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      items: items
    };

    return NextResponse.json(orderWithItems, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error 
      }, 
      { status: 500 }
    );
  }
}