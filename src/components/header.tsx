"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";
import { ShoppingCart, User, Search, Menu, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Header = () => {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error("Sign out failed");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      router.push("/");
      toast.success("Signed out successfully");
    }
  };

  return (
    <header className="bg-gray-900 text-white sticky top-0 z-50">
      {/* Top Banner */}
      <div className="bg-orange-500 text-center py-2 text-sm font-medium">
        Free shipping on orders over $500 | Shop Now
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-orange-500 px-4 py-2 rounded font-bold text-xl">
                GITTE
              </div>
              <span className="hidden sm:block text-sm">Sewing Machines</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for sewing machines..."
                className="flex-1 px-4 py-2 rounded-l bg-white text-black focus:outline-none"
              />
              <button
                type="submit"
                className="bg-orange-500 px-6 py-2 rounded-r hover:bg-orange-600 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Account */}
              {isPending ? (
                <div className="w-20 h-8 bg-gray-700 animate-pulse rounded"></div>
              ) : session?.user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                    <User className="w-5 h-5" />
                    <div className="hidden lg:block text-left">
                      <div className="text-xs">Hello, {session.user.name?.split(' ')[0]}</div>
                      <div className="text-sm font-bold">Account</div>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg hidden group-hover:block">
                    <Link
                      href="/account"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 hover:text-orange-500 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <div className="hidden lg:block text-left">
                    <div className="text-xs">Hello, Sign in</div>
                    <div className="text-sm font-bold">Account</div>
                  </div>
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                className="flex items-center gap-2 hover:text-orange-500 transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="hidden lg:block font-bold">Cart</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-4 flex md:hidden">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for sewing machines..."
              className="flex-1 px-4 py-2 rounded-l bg-white text-black focus:outline-none"
            />
            <button
              type="submit"
              className="bg-orange-500 px-6 py-2 rounded-r hover:bg-orange-600 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-800">
        <div className="container mx-auto px-4 py-2">
          <ul className="flex items-center gap-6 text-sm overflow-x-auto">
            <li>
              <Link href="/?category=All" className="hover:text-orange-500 whitespace-nowrap">
                All Machines
              </Link>
            </li>
            <li>
              <Link href="/?category=Basic" className="hover:text-orange-500 whitespace-nowrap">
                Basic
              </Link>
            </li>
            <li>
              <Link href="/?category=Computerized" className="hover:text-orange-500 whitespace-nowrap">
                Computerized
              </Link>
            </li>
            <li>
              <Link href="/?category=Heavy Duty" className="hover:text-orange-500 whitespace-nowrap">
                Heavy Duty
              </Link>
            </li>
            <li>
              <Link href="/?category=Embroidery" className="hover:text-orange-500 whitespace-nowrap">
                Embroidery
              </Link>
            </li>
            <li>
              <Link href="/?category=Quilting" className="hover:text-orange-500 whitespace-nowrap">
                Quilting
              </Link>
            </li>
            <li>
              <Link href="/?brand=GITTE" className="hover:text-orange-500 whitespace-nowrap">
                GITTE Brand
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-2">
              {session?.user ? (
                <>
                  <Link
                    href="/account"
                    className="block py-2 hover:text-orange-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    className="block py-2 hover:text-orange-500"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 hover:text-orange-500 w-full text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block py-2 hover:text-orange-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};