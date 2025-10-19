"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  stock: number;
  rating: number;
  features: string[];
}

export default function Home() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");

  useEffect(() => {
    fetchProducts();
  }, [category, brand, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("limit", "12");
      
      if (category && category !== "All") params.append("category", category);
      if (brand) params.append("brand", brand);
      if (search) params.append("search", search);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
        setTotal(data.total);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      toast.error("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      {!category && !brand && !search && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to GITTE Sewing Machines
              </h1>
              <p className="text-xl md:text-2xl mb-8">
                Discover quality sewing machines for every skill level. From beginners to professionals.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/?category=Basic"
                  className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Shop Basic Machines
                </Link>
                <Link
                  href="/?brand=GITTE"
                  className="bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors"
                >
                  View GITTE Collection
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Info */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              {category && category !== "All" && (
                <p className="text-gray-700">
                  Category: <span className="font-semibold">{category}</span>
                </p>
              )}
              {brand && (
                <p className="text-gray-700">
                  Brand: <span className="font-semibold">{brand}</span>
                </p>
              )}
              {search && (
                <p className="text-gray-700">
                  Search: <span className="font-semibold">"{search}"</span>
                </p>
              )}
            </div>
            <p className="text-gray-600">{total} products found</p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found</p>
            <Link
              href="/"
              className="inline-block mt-4 text-orange-600 hover:underline"
            >
              View all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className="text-xs text-gray-500">{product.brand}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.stock} in stock)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </p>
                    <ShoppingCart className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      {!category && !brand && !search && (
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose GITTE?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  All our machines come with manufacturer warranty and quality assurance
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">🚚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
                <p className="text-gray-600">
                  Free shipping on all orders over $500 across the country
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">💡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Our team of experts is here to help you choose the perfect machine
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}