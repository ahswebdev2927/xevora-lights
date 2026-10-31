"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string | null; phoneNumber: string } | null>(null);

  // Cart store hydration handling
  const [cartCount, setCartCount] = useState(0);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const cartItems = useCartStore((state) => state.items);

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

  // Hide Navbar for Admin Portal
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-18 relative">
            
            {/* ── 1. Left-Aligned: Logo ────────────────────────────────────── */}
            <div className="flex items-center">
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

            {/* ── 2. Center-Aligned: Navigation Links ───────────────────────── */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 text-sm font-medium">
              <Link
                href="/#models"
                className="text-slate-300 hover:text-white transition-colors"
              >
                G-Flash
              </Link>

              <Link
                href="/#reviews"
                className="text-slate-300 hover:text-white transition-colors"
              >
                Creators Reviews
              </Link>

              <Link
                href="/about"
                className={`transition-colors ${
                  pathname === "/about"
                    ? "text-primary font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                About Us
              </Link>

              <Link
                href="/contact"
                className={`transition-colors ${
                  pathname === "/contact" || pathname === "/support"
                    ? "text-primary font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Support
              </Link>
            </nav>

            {/* ── 3. Right-Aligned: Cart & Account Icons ────────────────────── */}
            <div className="flex items-center gap-2 sm:gap-3 text-slate-300">
              
              {/* Cart Icon */}
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

              {/* Account Icon (Redirects to /account if logged-in, /login if guest) */}
              <Link
                href={user ? "/account" : "/login"}
                aria-label={user ? "My Account" : "Sign In"}
                className="p-2 hover:text-primary transition-colors cursor-pointer rounded-lg hover:bg-white/5 relative"
                title={user ? `Signed in as ${user.fullName || "User"}` : "Sign In"}
              >
                <User className="w-5 h-5" />
                {user && (
                  <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0e0e12]" />
                )}
              </Link>

              {/* Mobile menu trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer focus:outline-none rounded-lg hover:bg-white/5"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>

          </div>
        </div>

        {/* ── Mobile Navigation Drawer ────────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0e0e12]/98 border-b border-white/10 px-6 py-6 space-y-4 backdrop-blur-2xl">
            <Link
              href="/#models"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2 hover:text-primary transition-colors"
            >
              G-Flash
            </Link>
            <Link
              href="/#reviews"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-base font-semibold text-white py-2 hover:text-primary transition-colors"
            >
              Creators Reviews
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-base font-semibold py-2 transition-colors ${
                pathname === "/about" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-base font-semibold py-2 transition-colors ${
                pathname === "/contact" || pathname === "/support" ? "text-primary" : "text-white hover:text-primary"
              }`}
            >
              Support
            </Link>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <Link
                href="/cart"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-300 hover:text-white"
              >
                <ShoppingCart className="w-4 h-4 text-primary" />
                <span>Cart ({cartCount})</span>
              </Link>

              <Link
                href={user ? "/account" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-primary font-semibold"
              >
                <User className="w-4 h-4" />
                <span>{user ? "My Account" : "Sign In"}</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
