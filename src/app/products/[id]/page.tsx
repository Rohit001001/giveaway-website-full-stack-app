"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Star, ShoppingCart, ArrowLeft, Check } from "lucide-react";
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

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setProduct(data);
      } else {
        toast.error("Product not found");
        router.push("/");
      }
    } catch (error) {
      toast.error("Error loading product");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!session?.user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!product || product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    setAddingToCart(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Added ${quantity} item(s) to cart`);
        setQuantity(1);
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-orange-600 hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded">
                    {product.category}
                  </span>
                  <span className="text-sm text-gray-500">{product.brand}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">
                    {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  ${product.price.toFixed(2)}
                </p>
                {product.stock > 0 && product.stock < 10 && (
                  <p className="text-red-600 text-sm">Only {product.stock} left - order soon!</p>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">{product.description}</p>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="font-semibold text-gray-900">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-100"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart || product.stock === 0}
                      className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>

                  {!session?.user && (
                    <p className="text-sm text-gray-600">
                      <Link href="/login" className="text-orange-600 hover:underline">
                        Sign in
                      </Link>{" "}
                      to add items to your cart
                    </p>
                  )}
                </div>
              )}

              {product.stock === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">This item is currently out of stock</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="mt-12 border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="mt-12 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Brand</p>
                <p className="font-semibold text-gray-900">{product.brand}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Category</p>
                <p className="font-semibold text-gray-900">{product.category}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Price</p>
                <p className="font-semibold text-gray-900">${product.price.toFixed(2)}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Rating</p>
                <p className="font-semibold text-gray-900">{product.rating} / 5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}