import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About GITTE</h3>
            <p className="text-sm">
              Your trusted source for quality sewing machines. From beginners to professionals, we have the perfect machine for your needs.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-orange-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-500">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-orange-500">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-orange-500">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/?category=Basic" className="hover:text-orange-500">
                  Basic Machines
                </Link>
              </li>
              <li>
                <Link href="/?category=Computerized" className="hover:text-orange-500">
                  Computerized
                </Link>
              </li>
              <li>
                <Link href="/?category=Heavy Duty" className="hover:text-orange-500">
                  Heavy Duty
                </Link>
              </li>
              <li>
                <Link href="/?category=Embroidery" className="hover:text-orange-500">
                  Embroidery
                </Link>
              </li>
              <li>
                <Link href="/?category=Quilting" className="hover:text-orange-500">
                  Quilting
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>Contact Us</li>
              <li>Shipping Information</li>
              <li>Returns & Exchanges</li>
              <li>Warranty Information</li>
              <li>FAQ</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} GITTE Sewing Machines. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};