"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Sparkles
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

type NavItem = {
  id: number;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string | null; phoneNumber: string } | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Cart store hydration handling
  const [cartCount, setCartCount] = useState(0);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Wishlist store hooks
  const wishlistItems = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  useEffect(() => {
    setCartCount(getTotalItems());
  }, [cartItems, getTotalItems]);

  useEffect(() => {
    // Check user session
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkSession();
  }, [pathname]);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        clearCart();
        clearWishlist();
        setUser(null);
        setIsLogoutModalOpen(false);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hide Navbar for Admin Portal
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-container to-rose-400 flex items-center justify-center shadow-[0_0_15px_rgba(229,26,52,0.5)] group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base sm:text-lg tracking-wider text-white uppercase group-hover:text-primary transition-colors">
                    XEVORA
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-primary-container -mt-1 uppercase font-semibold">
                    OPTICS
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/products"
                className={`transition-colors hover:text-white px-3 py-1.5 rounded ${
                  pathname === "/products" ? "text-primary" : "text-slate-300"
                }`}
              >
                Products
              </Link>

              <Link
                href="/#models"
                className={`transition-all px-3 py-1.5 rounded-lg font-semibold text-sm ${
                  pathname === "/"
                    ? "bg-primary-container text-white shadow-[0_0_16px_rgba(229,26,52,0.45)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                G-Flash Series
              </Link>

              <Link
                href="/#gobo"
                className="text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded"
              >
                GOBO FX
              </Link>

              <Link
                href="/#comparison"
                className="text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded"
              >
                Specs & Comparison
              </Link>

              <Link
                href="/#reviews"
                className="text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded"
              >
                Creator Reviews
              </Link>

              <Link
                href="/contact"
                className={`transition-colors hover:text-white px-3 py-1.5 rounded ${
                  pathname === "/contact" ? "text-primary" : "text-slate-300"
                }`}
              >
                Support
              </Link>
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-slate-300">
              <Link
                href="/search"
                aria-label="Search hardware"
                className="p-2 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-white/5"
              >
                <Search className="w-5 h-5" />
              </Link>

              {/* Currency Badge */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-xs font-mono text-slate-300 border border-white/5">
                <span className="text-[11px] text-primary">₹</span>
                <span>INR</span>
              </div>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="p-2 hover:text-primary transition-colors relative cursor-pointer rounded-lg hover:bg-white/5"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-container text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer / Link */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="p-2 hover:text-primary transition-colors relative cursor-pointer rounded-lg hover:bg-white/5"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary-container text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(229,26,52,0.8)]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account Dropdown */}
              {user ? (
                <ProfileDropdown user={user} onLogout={() => setIsLogoutModalOpen(true)} />
              ) : (
                <Link
                  href="/login"
                  aria-label="Login"
                  className="p-2 hover:text-[#00e5ff] transition-colors cursor-pointer"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#090a0f]/95 border-b border-white/10 px-6 py-6 space-y-4 backdrop-blur-2xl">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2"
            >
              Home
            </Link>
            <Link
              href="/products/g-flash-series"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-[#00e5ff] py-2"
            >
              ⚡ Xevora G-Flash Flagship
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2"
            >
              All Products & Accessories
            </Link>
            <a
              href="/#technology"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2"
            >
              Optical Technology
            </a>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2"
            >
              About Xevora
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2"
            >
              Support & Warranty
            </Link>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              {user ? (
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="text-white">
                  My Account ({user.fullName || "User"})
                </Link>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-[#00e5ff]">
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout confirmation modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12151f] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <h3 className="text-lg font-bold text-white">Sign Out</h3>
            <p className="text-xs text-slate-400">Are you sure you want to log out of your Xevora account?</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 rounded-full border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-600/30"
              >
                {isLoggingOut ? "Signing Out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
