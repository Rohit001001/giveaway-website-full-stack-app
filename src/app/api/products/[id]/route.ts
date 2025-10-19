import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, 
        { status: 400 }
      );
    }

    const product = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (product.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    return NextResponse.json(product[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, 
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate price if provided
    if (body.price !== undefined) {
      const price = parseFloat(body.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { 
            error: "Price must be greater than 0",
            code: "INVALID_PRICE" 
          }, 
          { status: 400 }
        );
      }
    }

    // Validate stock if provided
    if (body.stock !== undefined) {
      const stock = parseInt(body.stock);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { 
            error: "Stock must be greater than or equal to 0",
            code: "INVALID_STOCK" 
          }, 
          { status: 400 }
        );
      }
    }

    // Validate rating if provided
    if (body.rating !== undefined) {
      const rating = parseFloat(body.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        return NextResponse.json(
          { 
            error: "Rating must be between 0 and 5",
            code: "INVALID_RATING" 
          }, 
          { status: 400 }
        );
      }
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    // Prepare update object
    const updates: any = {};

    if (body.name !== undefined) {
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description.trim();
    }

    if (body.price !== undefined) {
      updates.price = parseFloat(body.price);
    }

    if (body.imageUrl !== undefined) {
      updates.imageUrl = body.imageUrl.trim();
    }

    if (body.category !== undefined) {
      updates.category = body.category.trim();
    }

    if (body.brand !== undefined) {
      updates.brand = body.brand.trim();
    }

    if (body.stock !== undefined) {
      updates.stock = parseInt(body.stock);
    }

    if (body.rating !== undefined) {
      updates.rating = parseFloat(body.rating);
    }

    if (body.features !== undefined) {
      updates.features = body.features;
    }

    // Update product
    const updated = await db.update(products)
      .set(updates)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update product',
          code: 'UPDATE_FAILED' 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
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
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, 
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { 
          error: 'Product not found',
          code: 'PRODUCT_NOT_FOUND' 
        }, 
        { status: 404 }
      );
    }

    // Delete product
    const deleted = await db.delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to delete product',
          code: 'DELETE_FAILED' 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
        product: deleted[0]
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