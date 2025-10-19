import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, and, or, gte, lte, desc, asc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Single product by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (product.length === 0) {
        return NextResponse.json(
          { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(product[0]);
    }

    // List products with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build where conditions
    const conditions = [];

    // Search across name, description, brand
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(products.name, searchTerm),
          like(products.description, searchTerm),
          like(products.brand, searchTerm)
        )
      );
    }

    // Filter by category
    if (category) {
      conditions.push(eq(products.category, category));
    }

    // Filter by brand
    if (brand) {
      conditions.push(eq(products.brand, brand));
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        conditions.push(gte(products.price, min));
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        conditions.push(lte(products.price, max));
      }
    }

    // Build query
    let query = db.select().from(products);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = {
      price: products.price,
      rating: products.rating,
      name: products.name,
      createdAt: products.createdAt,
    }[sortBy] || products.createdAt;

    if (order === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }

    // Get total count
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(products);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalResult = await countQuery;
    const total = totalResult[0]?.count || 0;

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json({
      products: results,
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
    const {
      name,
      description,
      price,
      imageUrl,
      category,
      brand,
      stock,
      rating,
      features,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return NextResponse.json(
        {
          error: 'Name is required and must be at least 3 characters',
          code: 'INVALID_NAME',
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        {
          error: 'Description is required and must be at least 10 characters',
          code: 'INVALID_DESCRIPTION',
        },
        { status: 400 }
      );
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        {
          error: 'Price is required and must be greater than 0',
          code: 'INVALID_PRICE',
        },
        { status: 400 }
      );
    }

    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Image URL is required',
          code: 'INVALID_IMAGE_URL',
        },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Category is required',
          code: 'INVALID_CATEGORY',
        },
        { status: 400 }
      );
    }

    if (!brand || typeof brand !== 'string' || brand.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Brand is required',
          code: 'INVALID_BRAND',
        },
        { status: 400 }
      );
    }

    if (stock === undefined || typeof stock !== 'number' || stock < 0) {
      return NextResponse.json(
        {
          error: 'Stock is required and must be 0 or greater',
          code: 'INVALID_STOCK',
        },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== 'number' || rating < 0 || rating > 5) {
      return NextResponse.json(
        {
          error: 'Rating is required and must be between 0 and 5',
          code: 'INVALID_RATING',
        },
        { status: 400 }
      );
    }

    // Validate features if provided
    let validatedFeatures = [];
    if (features !== undefined) {
      if (!Array.isArray(features)) {
        return NextResponse.json(
          {
            error: 'Features must be an array',
            code: 'INVALID_FEATURES',
          },
          { status: 400 }
        );
      }
      validatedFeatures = features;
    }

    // Create product
    const newProduct = await db
      .insert(products)
      .values({
        name: name.trim(),
        description: description.trim(),
        price,
        imageUrl: imageUrl.trim(),
        category: category.trim(),
        brand: brand.trim(),
        stock,
        rating,
        features: validatedFeatures,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}