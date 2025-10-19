import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, cart, products } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId || !userId.trim()) {
      return NextResponse.json(
        { error: 'userId query parameter is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId.trim()))
      .orderBy(desc(orders.createdAt));

    if (userOrders.length === 0) {
      return NextResponse.json([]);
    }

    const ordersWithItems = await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            quantity: orderItems.quantity,
            price: orderItems.price,
            product: products,
          })
          .from(orderItems)
          .leftJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        return {
          id: order.id,
          userId: order.userId,
          totalAmount: order.totalAmount,
          status: order.status,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
          items: items,
        };
      })
    );

    return NextResponse.json(ordersWithItems);
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
    const { userId, shippingAddress, status = 'pending' } = body;

    if (!userId || !userId.trim()) {
      return NextResponse.json(
        { error: 'userId is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !shippingAddress.trim()) {
      return NextResponse.json(
        { error: 'shippingAddress is required', code: 'MISSING_SHIPPING_ADDRESS' },
        { status: 400 }
      );
    }

    const trimmedAddress = shippingAddress.trim();
    if (trimmedAddress.length < 10) {
      return NextResponse.json(
        {
          error: 'shippingAddress must be at least 10 characters',
          code: 'INVALID_SHIPPING_ADDRESS',
        },
        { status: 400 }
      );
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const cartItems = await db
      .select({
        id: cart.id,
        productId: cart.productId,
        quantity: cart.quantity,
        product: products,
      })
      .from(cart)
      .leftJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.userId, userId.trim()));

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty', code: 'EMPTY_CART' },
        { status: 400 }
      );
    }

    for (const item of cartItems) {
      if (!item.product) {
        return NextResponse.json(
          {
            error: `Product with ID ${item.productId} not found`,
            code: 'PRODUCT_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for product: ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}`,
            code: 'INSUFFICIENT_STOCK',
          },
          { status: 400 }
        );
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    const createdAt = new Date().toISOString();

    const [newOrder] = await db
      .insert(orders)
      .values({
        userId: userId.trim(),
        totalAmount,
        status,
        shippingAddress: trimmedAddress,
        createdAt,
      })
      .returning();

    const orderItemsData = cartItems.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product?.price || 0,
    }));

    const createdOrderItems = await db
      .insert(orderItems)
      .values(orderItemsData)
      .returning();

    for (const item of cartItems) {
      if (item.product) {
        await db
          .update(products)
          .set({
            stock: item.product.stock - item.quantity,
          })
          .where(eq(products.id, item.productId));
      }
    }

    await db.delete(cart).where(eq(cart.userId, userId.trim()));

    const itemsWithProducts = await Promise.all(
      createdOrderItems.map(async (item) => {
        const [product] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        return {
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product,
        };
      })
    );

    const orderResponse = {
      id: newOrder.id,
      userId: newOrder.userId,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status,
      shippingAddress: newOrder.shippingAddress,
      createdAt: newOrder.createdAt,
      items: itemsWithProducts,
    };

    return NextResponse.json(orderResponse, { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}