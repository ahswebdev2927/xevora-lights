"use client";

import { useState, useEffect, use, useMemo } from "react";
import {
  Sparkles,
  ShoppingBag,
  Check,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronDown,
  Battery,
  Sliders,
  Zap,
  Gauge,
  Droplets,
  Layers,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { usePathname, useRouter } from "next/navigation";
import { getProductImageUrls, getFirstProductImageUrl } from "@/utils/product";
import StickyProductBar from "@/components/lighting/StickyProductBar";
import ColorModePreview from "@/components/lighting/ColorModePreview";
import OpticalZoomSimulator from "@/components/lighting/OpticalZoomSimulator";
import SpecsTable from "@/components/lighting/SpecsTable";

interface Variation {
  id: number;
  size: string; // Used for kit/bundle name
  color: string;
  stock: number;
  mrp: number;
  salePrice: number;
  sku?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  salePrice: number;
  images: string;
  colors: string;
  isFeatured: boolean | number | null;
  avgRating?: number | string | null;
  numReviews?: number | string | null;
  tags?: string | null;
  specifications?: string | null;
  variations: Variation[];
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("Matte Stealth Black");
  const [mainImage, setMainImage] = useState<string>("/images/spec-sheet.png");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const pathname = usePathname();
  const isWishlisted = useWishlistStore((state) => state.items.some((item) => item.productId === Number(id)));
  const addItemToWishlist = useWishlistStore((state) => state.addItem);
  const removeItemFromWishlist = useWishlistStore((state) => state.removeItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);

          if (data.variations && data.variations.length > 0) {
            setSelectedVariation(data.variations[0]);
          }

          const imgs = getProductImageUrls(data.images, data.colors);
          if (imgs.length > 0) {
            setMainImage(imgs[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load product", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const currentPrice = selectedVariation?.salePrice || product?.salePrice || 5999;
  const originalPrice = selectedVariation?.mrp || product?.basePrice || 8999;
  const discountPercent = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `${product.id}-${selectedVariation?.id || 1}`,
      productId: product.id,
      variationId: selectedVariation?.id || 1,
      name: product.name,
      price: currentPrice,
      image: mainImage,
      size: selectedVariation?.size || "Standard Edition",
      color: selectedColor,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleWishlist = async () => {
    if (isWishlisted) {
      await removeItemFromWishlist(Number(id));
    } else {
      await addItemToWishlist(Number(id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00e5ff] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading Xevora Optics...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex items-center justify-center text-white text-center p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">The requested light model could not be found.</p>
          <Link href="/" className="btn-primary">Return Home</Link>
        </div>
      </div>
    );
  }

  const galleryImages = getProductImageUrls(product.images, product.colors);
  if (!galleryImages.includes("/images/spec-sheet.png")) {
    galleryImages.unshift("/images/spec-sheet.png");
  }

  return (
    <div className="bg-[#090a0f] text-slate-100 min-h-screen selection:bg-[#00e5ff]/30 selection:text-white">
      {/* Sticky Top Bar on Scroll */}
      <StickyProductBar
        productId={product.id}
        productName={product.name}
        price={currentPrice}
        mrp={originalPrice}
        imageUrl={mainImage}
        variationId={selectedVariation?.id}
        selectedKit={selectedVariation?.size}
      />

      {/* Main Buy & Showcase Hero Section */}
      <section id="overview" className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Visual Showcase & Gallery */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Stage Image / Visual */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#141824] to-[#0c0e17] border border-white/10 p-6 sm:p-12 overflow-hidden flex items-center justify-center min-h-[420px] sm:min-h-[520px] group shadow-2xl">
              {/* Radial Cyan Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00e5ff]/15 rounded-full blur-[100px] pointer-events-none" />

              {/* Floating Innovation Badges */}
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-sm">
                  Quad 'White-Laser' LED
                </span>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 shadow-sm">
                  10,000 mAh Swappable
                </span>
              </div>

              {/* Product Preview Image */}
              <div className="relative z-10 w-full flex items-center justify-center">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="max-h-[380px] sm:max-h-[460px] w-auto object-contain rounded-2xl transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Zoom In Hint */}
              <div className="absolute bottom-6 right-6 text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                Aerospace 6061-T6 Chassis
              </div>
            </div>

            {/* Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-2xl border p-1 overflow-hidden transition-all cursor-pointer ${
                      mainImage === img
                        ? "border-[#00e5ff] bg-[#00e5ff]/10 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/25"
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-contain rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Specifications & Kit Buy Box */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs uppercase font-mono tracking-widest text-[#00e5ff] bg-[#00e5ff]/10 px-2.5 py-0.5 rounded-full border border-[#00e5ff]/20">
                  Flagship Spotlight
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold ml-auto">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9</span>
                  <span className="text-slate-400 font-normal">({product.numReviews || 128} reviews)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                  ₹{currentPrice.toLocaleString()}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="text-base text-slate-400 line-through font-mono">
                      ₹{originalPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Inclusive of all taxes · Free Insured Express Delivery across India
              </div>
            </div>

            {/* Kit / Edition Selection */}
            {product.variations && product.variations.length > 0 && (
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Select Hardware Edition
                </label>
                <div className="space-y-2">
                  {product.variations.map((v) => {
                    const isSelected = selectedVariation?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariation(v)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#00e5ff]/10 border-[#00e5ff] shadow-lg shadow-[#00e5ff]/10"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {v.size}
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            SKU: {v.sku || `XEV-GFL-${v.id}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white font-mono">
                            ₹{v.salePrice.toLocaleString()}
                          </div>
                          {v.stock > 0 ? (
                            <span className="text-[10px] text-emerald-400 font-mono">In Stock ({v.stock} units)</span>
                          ) : (
                            <span className="text-[10px] text-red-400 font-mono">Sold Out</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finish / Color Variant */}
            <div className="space-y-3">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                Finish: <span className="text-white font-semibold">{selectedColor}</span>
              </label>
              <div className="flex items-center gap-3">
                {["Matte Stealth Black", "Titanium Grey"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                      selectedColor === color
                        ? "bg-white/15 border-white text-white shadow-md"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/30"
                      style={{ backgroundColor: color.includes("Black") ? "#171717" : "#555b6e" }}
                    />
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-secondary py-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleWishlist}
                  className={`p-4 rounded-full border transition-all cursor-pointer ${
                    isWishlisted
                      ? "bg-red-500/20 border-red-500/40 text-red-400"
                      : "bg-white/[0.05] border-white/10 text-slate-400 hover:text-white"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full btn-accent py-4 text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                Instant Express Checkout
              </button>
            </div>

            {/* Delivery Pincode Checker */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Truck className="w-4 h-4 text-[#00e5ff]" />
                <span>Delivery Estimator</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setPincodeChecked(false);
                  }}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e5ff]"
                />
                <button
                  onClick={() => setPincodeChecked(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white border border-white/10 transition-all cursor-pointer"
                >
                  Check
                </button>
              </div>
              {pincodeChecked && (
                <div className="text-[11px] text-emerald-400 font-mono pt-1">
                  ✓ Delivery available to {pincode}: Expect delivery within 2-3 business days.
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 text-center border-t border-white/10 pt-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <ShieldCheck className="w-5 h-5 text-[#00e5ff] mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">1-Yr Warranty</div>
                <div className="text-[9px] text-slate-400">Official Replacement</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <Truck className="w-5 h-5 text-[#00e5ff] mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">Free Express</div>
                <div className="text-[9px] text-slate-400">All India Courier</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <RotateCcw className="w-5 h-5 text-[#00e5ff] mx-auto mb-1" />
                <div className="text-[11px] font-semibold text-white">7-Day Return</div>
                <div className="text-[9px] text-slate-400">Hassle-Free Policy</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Feature Deep-Dives */}
      <div id="colors">
        <ColorModePreview />
      </div>

      <div id="zoom">
        <OpticalZoomSimulator />
      </div>

      {/* Monster 10,000 mAh Swappable Battery & Power Hub Showcase */}
      <section id="battery" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0a0c14] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                Endurance Engineering
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                3× 18650 Cells.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
                  10,000 mAh Monster Power.
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Unlike sealed consumer flashlights, the Xevora G-Flash features a precision-machined swappable bay holding three high-drain 18650 lithium cells. Swap fresh cells in seconds during extended overnight film shoots or field missions.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="text-2xl font-bold font-mono text-white mb-1">10,000 mAh</div>
                  <div className="text-xs text-slate-400">Combined swappable capacity</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                  <div className="text-2xl font-bold font-mono text-cyan-400 mb-1">Type-C Fast</div>
                  <div className="text-xs text-slate-400">High-speed onboard recharging</div>
                </div>
              </div>

              {/* Digital Readout Feature */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Gauge className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Smart Digital OLED Readout</h4>
                  <p className="text-xs text-slate-400">Exact battery percentage, real-time lumen level, and active color mode shown at a glance.</p>
                </div>
              </div>
            </div>

            {/* Battery Bay Visual Diagram */}
            <div className="lg:col-span-6 relative p-8 sm:p-12 rounded-3xl bg-black border border-white/10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <div className="text-xs font-mono uppercase text-slate-400 flex justify-between">
                  <span>Swappable Lithium Bay</span>
                  <span className="text-emerald-400">Status: Optimized</span>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((cell) => (
                    <div
                      key={cell}
                      className="p-4 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/15 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Battery className="w-5 h-5 text-amber-400" />
                        <div>
                          <div className="text-xs font-bold text-white">Cell #{cell}: 18650 Li-ion</div>
                          <div className="text-[10px] text-slate-400 font-mono">3.7V · 3,350 mAh High-Drain</div>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        100% HEALTH
                      </span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-dashed border-white/20 text-center text-xs text-slate-300">
                  ⚡ <strong>USB-C Emergency Powerbank:</strong> Charge smartphones, cameras, and microphones directly from your flashlight on location.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical Specifications Matrix (Exact Match to User's Image) */}
      <SpecsTable />

      {/* FAQ & Warranty Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#07080c] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-400">Everything you need to know about the Xevora G-Flash Series.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What makes the 'White-Laser' Quad Emitter different from ordinary LEDs?",
                a: "The quad-source emitter module utilizes advanced phosphor conversion to achieve exceptional laser-like beam collimation. This allows the G-Flash to throw light over 1,200 meters without blinding spill, while also offering 4 switchable color spectrums for photography and adverse weather."
              },
              {
                q: "Can I replace the batteries myself?",
                a: "Yes! Unlike sealed lights, the G-Flash uses 3 standard 18650 swappable lithium cells. You can easily unthread the tail cap to replace cells with your own spares for infinite field runtime."
              },
              {
                q: "Is it safe to use in the rain?",
                a: "The Xevora G-Flash features precision CNC O-ring sealing providing daily-life splash and rain resistance. It is engineered for downpours, misty trails, and humid tropical shoots."
              },
              {
                q: "What does the 1-Year Comprehensive Warranty cover?",
                a: "Our warranty covers all optical defects, switch mechanisms, driver boards, and digital display components. In the unlikely event of any hardware failure, we provide free express replacement."
              }
            ].map((faq, i) => (
              <details
                key={i}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all [&_summary::-webkit-details-marker]:none"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-white text-sm sm:text-base">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Floating Action Bar */}
      <div className="py-16 px-4 text-center bg-gradient-to-t from-black to-transparent">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to illuminate the darkness?</h3>
        <button onClick={handleBuyNow} className="btn-accent px-8 py-4 text-base font-bold cursor-pointer">
          Order Xevora G-Flash Today — ₹{currentPrice.toLocaleString()}
        </button>
      </div>
    </div>
  );
}
