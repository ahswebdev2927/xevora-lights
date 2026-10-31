"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

interface StickyProductBarProps {
  productId: number;
  productName: string;
  price: number;
  mrp?: number;
  imageUrl?: string;
  variationId?: number;
  selectedKit?: string;
}

export default function StickyProductBar({
  productId,
  productName,
  price,
  mrp,
  imageUrl = "/images/spec-sheet.png",
  variationId,
  selectedKit = "Standard Edition"
}: StickyProductBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    addItem({
      id: `${productId}-${variationId || 1}`,
      productId,
      variationId: variationId || 1,
      name: productName,
      price: price,
      image: imageUrl,
      size: selectedKit,
      color: "Matte Stealth Black",
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  if (!isScrolled) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[#090a0f]/90 backdrop-blur-xl border-b border-white/10 transition-all duration-300 py-3 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Product branding & Quick jump links */}
        <div className="flex items-center gap-6">
          <div>
            <div className="text-sm font-bold text-white tracking-wide">
              {productName}
            </div>
            <div className="text-[11px] text-[#00e5ff] font-mono">
              Quad-Emitter Flagship
            </div>
          </div>

          <div className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#colors" className="hover:text-white transition-colors">Color Modes</a>
            <a href="#zoom" className="hover:text-white transition-colors">Optical Zoom</a>
            <a href="#battery" className="hover:text-white transition-colors">10,000 mAh Power</a>
            <a href="#specifications" className="hover:text-white transition-colors">Tech Specs</a>
          </div>
        </div>

        {/* Right: Pricing & CTA Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-right">
            <div className="text-sm sm:text-base font-bold text-white font-mono">
              ₹{price.toLocaleString()}
            </div>
            {mrp && mrp > price && (
              <div className="text-[10px] text-slate-500 line-through">
                ₹{mrp.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/15 border border-white/20 transition-all cursor-pointer"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>

          <button
            onClick={handleBuyNow}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-[#00e5ff] text-black hover:bg-[#38bdf8] shadow-lg shadow-[#00e5ff]/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
