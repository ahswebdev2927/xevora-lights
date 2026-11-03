"use client";

import { useState, useEffect, use, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Check,
  ShoppingBag,
  Zap,
  Shield,
  Plane,
  RotateCcw,
  ZoomIn,
  Sun,
  Palette,
  Maximize2,
  BatteryCharging,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  X,
  Plus,
  Minus,
  MessageSquare
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Engine model selection: '10w' or '30w'
  const isInitial10W = id === "14";
  const [model, setModel] = useState<"10w" | "30w">(isInitial10W ? "10w" : "30w");

  // Synchronize model if URL param changes
  useEffect(() => {
    if (id === "14") {
      setModel("10w");
    } else {
      setModel("30w");
    }
  }, [id]);

  // Finish / Colorway selection
  const [finish, setFinish] = useState<"Stealth Matte Black" | "Titanium Slate Grey">("Stealth Matte Black");

  // Optical Kit Bundle selection
  type BundleType = "Solo Creator Kit" | "Pro Master Kit" | "Cinema Duo Kit";
  const [bundle, setBundle] = useState<BundleType>("Pro Master Kit");

  // Quantity stepper
  const [quantity, setQuantity] = useState<number>(1);

  // Gallery state
  const [currentImgIdx, setCurrentImgIdx] = useState<number>(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Spec tab switcher
  const [specTab, setSpecTab] = useState<"optics" | "power" | "build">("optics");

  // Interactive Optical Zoom & CCT simulator states
  const [simBeamAngle, setSimBeamAngle] = useState<number>(30); // 15° to 60°
  const [simCCT, setSimCCT] = useState<number>(5600); // 2500K to 10000K
  const [simDimming, setSimDimming] = useState<number>(100); // 0 to 100%

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sticky bottom drawer observer
  const buyBoxRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      if (buyBoxRef.current) {
        const rect = buyBoxRef.current.getBoundingClientRect();
        // Show floating bar when user scrolls past the main buy box
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Pricing calculations
  const basePrice = model === "10w" ? 4999 : 7499;
  const mrpPrice = model === "10w" ? 7999 : 10999;
  const bundleAddon = bundle === "Solo Creator Kit" ? 0 : bundle === "Pro Master Kit" ? 1999 : 6999;
  const unitPrice = basePrice + bundleAddon;
  const unitMrp = mrpPrice + bundleAddon;
  const totalPrice = unitPrice * quantity;
  const totalSavings = (unitMrp - unitPrice) * quantity;

  // Handle Model Switching
  const handleModelChange = (newModel: "10w" | "30w") => {
    setModel(newModel);
    const targetId = newModel === "10w" ? "14" : "15";
    router.replace(`/product/${targetId}`, { scroll: false });
  };

  // Gallery items
  const galleryImages = [
    {
      src: "/images/product/hero-main.jpg",
      tag: "LENS",
      label: "Aspheric Dual Quartz Lens",
      alt: "Front projection lens with multi-coated glass elements reflecting red and violet optical flares",
    },
    {
      src: "/images/product/thumb-profile.jpg",
      tag: "PROFILE",
      label: "CNC Aerospace Barrel & Knurling",
      alt: "Side profile highlighting diamond knurled focus adjustment barrel and cooling slits",
    },
    {
      src: "/images/product/thumb-kit-knolling.jpg",
      tag: "KIT EXP",
      label: "Pro Master Knolling Display",
      alt: "Unboxing display of complete kit with GOBO discs, silicone gel filters, and EVA case",
    },
    {
      src: "/images/product/thumb-studio.jpg",
      tag: "STUDIO",
      label: "Cinematic Volumetric Projection",
      alt: "Behind-the-scenes cinematography showing model with patterned window blind GOBO projection",
    },
  ];

  // Cart operations
  const handleAddToCart = () => {
    const activeProductId = model === "10w" ? 14 : 15;
    const variantId = (model === "10w" ? 1400 : 1500) + (bundle === "Pro Master Kit" ? 1 : bundle === "Cinema Duo Kit" ? 2 : 0);
    const productName = model === "10w" ? "Xevora G-Flash 10W RGB Spotlight" : "Xevora G-Flash PRO 30W Spotlight";

    addItem({
      id: `${activeProductId}-${bundle}-${finish}`,
      productId: activeProductId,
      name: productName,
      price: unitPrice,
      size: `${bundle} (${finish})`,
      color: finish,
      quantity: quantity,
      image: galleryImages[currentImgIdx]?.src || "/images/product/hero-main.jpg",
      variationId: variantId,
    });

    showToast(`Added ${quantity}x ${productName} (${bundle}) to Cart`);
  };

  const handleInstantBuy = () => {
    handleAddToCart();
    router.push("/cart");
  };

  // What's In The Box items
  const boxItems = [
    {
      title: "G-Flash Spotlight",
      desc: "1x Optical Unit",
      img: "/images/product/box-spotlight.jpg",
    },
    {
      title: "GOBO Stencil Pack",
      desc: "20x Stainless Discs",
      img: "/images/product/box-gobo-pack.jpg",
    },
    {
      title: "Silicone Grid",
      desc: "1x 30° Honeycomb",
      img: "/images/product/box-silicone-grid.jpg",
    },
    {
      title: "Studio Mini Tripod",
      desc: "1x Ball-Head Mount",
      img: "/images/product/box-tripod.jpg",
    },
    {
      title: "Magnetic Gels",
      desc: "8x Diffusion Filters",
      img: "/images/product/box-magnetic-gels.jpg",
    },
    {
      title: "Hard Travel Case",
      desc: "1x EVA Molded Armor",
      img: "/images/product/box-hard-case.jpg",
    },
  ];

  // Creator Reviews with BTS Stills
  const reviews = [
    {
      stars: 5,
      time: "3 days ago",
      title: "“The optical sharpness of the GOBOs is unbelievable.”",
      content:
        "“I swapped out my bulky Aputure spotlight adapter for the G-Flash on a high-end commercial. The edge sharpness with zero chromatic fringing cut our setup time in half. USB-C 65W charging via powerbank saved our night shoot.”",
      btsImg: "/images/product/review-bts-fx6.jpg",
      btsCaption: "BTS STILL: SONY FX6 LOADOUT",
      author: "Marcus Kane",
      role: "Commercial DP • Pro Master Kit",
      initials: "MK",
    },
    {
      stars: 5,
      time: "1 week ago",
      title: "“Silent cooling fan makes sound recording effortless.”",
      content:
        "“Normally small 30W lights sound like screaming jet engines. Xevora did magic with the hydro-bearing thermal chassis. We had a shotgun mic 12 inches away and zero noise entered the track. Absolutely revolutionary build quality.”",
      btsImg: "/images/product/review-bts-portrait.jpg",
      btsCaption: "BTS STILL: PORTRAIT SESSION",
      author: "Sarah Lindqvist",
      role: "Fashion Photographer • Cinema Duo Kit",
      initials: "SL",
    },
    {
      stars: 5,
      time: "2 weeks ago",
      title: "“Fits directly onto my travel camera cage rig.”",
      content:
        "“The 1/4-inch mount and Arca-Swiss plate compatibility means I don't have to bring heavy C-stands when doing documentary work abroad. It clamps onto my rig or a mini Gorillapod. The 9,450 lux output punches right through ambient daylight.”",
      btsImg: "/images/product/review-bts-cage.jpg",
      btsCaption: "BTS STILL: RUN-AND-GUN CAGE",
      author: "Daisuke Ryotaro",
      role: "Indie Filmmaker • Pro Master Kit",
      initials: "DR",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary-container text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-white/20">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ── SECTION 1: BREADCRUMBS & TELEMETRY HEADER ───────────────────── */}
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 pt-8">
        <div className="flex items-center gap-2 font-mono text-xs text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Catalog</Link>
          <span>/</span>
          <span className="text-secondary/70">Optical Projectors</span>
          <span>/</span>
          <span className="text-white font-semibold">
            {model === "10w" ? "Xevora G-Flash 10W RGB" : "Xevora G-Flash PRO 30W Spotlight"}
          </span>
        </div>
      </div>

      {/* ── SECTION 2: INTERACTIVE CORE BUY GRID (12 Cols) ─────────────── */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Media Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Interactive Frame with HUD */}
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container-lowest shadow-2xl flex items-center justify-center group border border-white/5">
              <Image
                src={galleryImages[currentImgIdx]?.src || "/images/product/hero-main.jpg"}
                alt={galleryImages[currentImgIdx]?.alt || "Xevora G-Flash Spotlight"}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Tactical Viewport Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
                <span className="px-3 py-1 rounded bg-surface-container-highest/80 backdrop-blur-md font-mono text-[11px] text-white uppercase tracking-widest border border-white/10">
                  OPTICAL APERTURE f/1.4
                </span>
                <span className="px-3 py-1 rounded bg-primary-container text-white font-mono text-[11px] font-bold w-fit uppercase shadow-sm">
                  {model === "10w" ? "10W RGB Pocket" : "30W High-Output PRO"}
                </span>
              </div>

              {/* Action Buttons Top Right */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomModalOpen(true)}
                  aria-label="Enlarge image"
                  className="p-2.5 rounded-xl bg-surface/80 backdrop-blur-md text-white hover:text-primary hover:bg-surface-container-high transition-all shadow-md border border-white/10"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Telemetry HUD Bar */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-surface-container-lowest/85 backdrop-blur-md flex items-center justify-between text-secondary font-mono text-xs pointer-events-none border border-white/10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-primary font-semibold">
                    <span className="h-2 w-2 rounded-full bg-primary-container animate-pulse" />
                    ACTIVE EMITTER
                  </span>
                  <span className="hidden sm:inline text-secondary/70">•</span>
                  <span className="hidden sm:inline">
                    {model === "10w" ? "BEAM: 20°–50° CONTINUOUS" : "BEAM: 15°–60° STEPLESS"}
                  </span>
                </div>
                <div className="font-bold text-white tracking-wider">
                  FRAME 0{currentImgIdx + 1} / 0{galleryImages.length}
                </div>
              </div>
            </div>

            {/* Thumbnail Carousel Strip */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => {
                const isActive = currentImgIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentImgIdx(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-video bg-surface-container-low transition-all p-0.5 border ${
                      isActive
                        ? "border-primary-container shadow-[0_0_12px_rgba(229,26,52,0.4)]"
                        : "border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono text-white bg-surface-container-lowest/80 backdrop-blur-xs px-1.5 py-0.5 rounded">
                      {img.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Secondary Visual Teaser: Dynamic Interactive Optical Simulation */}
            <div className="p-6 rounded-2xl bg-surface-container-low mt-2 flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-surface-container-high text-primary border border-white/5">
                  <Sparkles className="w-6 h-6 text-primary-container" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">Dual Aspheric Glass Optics</h4>
                  <p className="text-xs sm:text-sm text-secondary">
                    Zero chromatic aberration at edge boundaries. Razor-sharp GOBO projection.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-2xl font-bold text-primary">
                  {model === "10w" ? "3,100" : "9,450"}
                </div>
                <div className="font-mono text-[11px] text-secondary tracking-widest">
                  LUX @ 1.0M
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Configuration & Buy Box (5 Cols) */}
          <div ref={buyBoxRef} className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Title & Badges */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-mono text-[11px] font-bold tracking-wider uppercase border border-primary/20">
                  BEST SELLER
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-mono text-[11px] uppercase border border-white/5">
                  2026 Red Dot Design Winner
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                {model === "10w"
                  ? "Xevora G-Flash 10W RGB Optical Spotlight"
                  : "Xevora G-Flash PRO 30W Modular Spotlight"}
              </h1>

              {/* Reviews Aggregate */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center text-primary-container">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                  ))}
                </div>
                <span className="font-bold text-sm text-white">4.9 / 5.0</span>
                <a
                  href="#reviews"
                  className="text-xs text-secondary underline hover:text-primary transition-colors"
                >
                  (1,248 Verified Creator Reviews)
                </a>
              </div>
            </div>

            {/* Pricing Tier Display */}
            <div className="p-5 rounded-2xl bg-surface-container-low shadow-sm flex items-center justify-between border border-white/5">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    ₹{unitPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-base text-secondary/60 line-through">
                    ₹{unitMrp.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider block mt-1">
                  Save ₹{(unitMrp - unitPrice).toLocaleString("en-IN")} (25% OFF Series Launch)
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-primary flex items-center justify-end gap-1.5 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-primary-container animate-ping" /> IN STOCK
                </span>
                <span className="text-xs text-secondary block mt-0.5">
                  Ships within 24h via Express Air
                </span>
              </div>
            </div>

            {/* Selector 1: Power & Engine Variant */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  1. Engine Power Output
                </span>
                <span className="font-mono text-xs text-primary font-semibold">
                  {model === "10w" ? "10W RGB Standard" : "30W High-Output PRO"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleModelChange("10w")}
                  className={`text-left p-4 rounded-xl transition-all flex flex-col justify-between border ${
                    model === "10w"
                      ? "bg-surface-container-high border-primary-container shadow-md"
                      : "bg-surface-container border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-sm sm:text-base text-white">10W RGB</span>
                    <span className="font-mono text-xs text-secondary font-semibold">₹4,999</span>
                  </div>
                  <span className="text-xs text-secondary">3,100 Lux @ 1m • Pocket Engine</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleModelChange("30w")}
                  className={`text-left p-4 rounded-xl transition-all flex flex-col justify-between relative overflow-hidden border ${
                    model === "30w"
                      ? "bg-gradient-to-br from-surface-container-high via-surface-container-high to-primary-container/20 border-primary-container shadow-md"
                      : "bg-surface-container border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="absolute top-0 right-0 bg-primary-container text-white px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-bl">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-sm sm:text-base text-white">30W PRO</span>
                    <span className="font-mono text-xs text-primary font-bold">₹7,499</span>
                  </div>
                  <span className="text-xs text-secondary">9,450 Lux @ 1m • Silent Fan Cooler</span>
                </button>
              </div>
            </div>

            {/* Selector 2: Finish & Colorway */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  2. Chassis Finish
                </span>
                <span className="font-mono text-xs text-secondary">{finish}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFinish("Stealth Matte Black")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                    finish === "Stealth Matte Black"
                      ? "bg-surface-container-high text-white border-primary-container"
                      : "bg-surface-container text-secondary hover:text-white border-white/5"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-[#111115] border border-white/30 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Stealth Matte Black</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFinish("Titanium Slate Grey")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${
                    finish === "Titanium Slate Grey"
                      ? "bg-surface-container-high text-white border-primary-container"
                      : "bg-surface-container text-secondary hover:text-white border-white/5"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full bg-[#52525e] border border-white/30 shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold">Titanium Slate Grey</span>
                </button>
              </div>
            </div>

            {/* Selector 3: Creator Kit Bundles */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  3. Optical Kit Bundle
                </span>
                <span className="font-mono text-xs text-primary font-semibold">
                  {bundleAddon === 0 ? "Included (+₹0)" : `+₹${bundleAddon.toLocaleString("en-IN")}`}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {/* Solo Kit */}
                <label
                  onClick={() => setBundle("Solo Creator Kit")}
                  className={`flex items-start justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                    bundle === "Solo Creator Kit"
                      ? "bg-surface-container-high border-primary-container"
                      : "bg-surface-container border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="bundle"
                      checked={bundle === "Solo Creator Kit"}
                      onChange={() => setBundle("Solo Creator Kit")}
                      className="accent-primary-container mt-1"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">Solo Creator Kit</div>
                      <div className="text-xs text-secondary mt-0.5">
                        Spotlight unit, standard optical snoot, 6 stencil GOBOs, USB-C 100W cable
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-secondary shrink-0 ml-2">+₹0</span>
                </label>

                {/* Pro Master Kit (Recommended) */}
                <label
                  onClick={() => setBundle("Pro Master Kit")}
                  className={`flex items-start justify-between p-3.5 rounded-xl cursor-pointer transition-all shadow-md border ${
                    bundle === "Pro Master Kit"
                      ? "bg-gradient-to-r from-surface-container-high to-surface-container-highest border-primary-container"
                      : "bg-surface-container border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="bundle"
                      checked={bundle === "Pro Master Kit"}
                      onChange={() => setBundle("Pro Master Kit")}
                      className="accent-primary-container mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Pro Master Kit</span>
                        <span className="px-1.5 py-0.5 rounded bg-primary-container text-white font-mono text-[9px] font-bold">
                          MOST POPULAR
                        </span>
                      </div>
                      <div className="text-xs text-secondary mt-0.5">
                        Includes 20 GOBOs, Honeycomb Grid, 3-Leg Desk Tripod, Magnetic Filters &amp; Hard Case
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-primary font-bold shrink-0 ml-2">
                    +₹1,999
                  </span>
                </label>

                {/* Cinema Duo Kit */}
                <label
                  onClick={() => setBundle("Cinema Duo Kit")}
                  className={`flex items-start justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                    bundle === "Cinema Duo Kit"
                      ? "bg-surface-container-high border-primary-container"
                      : "bg-surface-container border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="bundle"
                      checked={bundle === "Cinema Duo Kit"}
                      onChange={() => setBundle("Cinema Duo Kit")}
                      className="accent-primary-container mt-1"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">Cinema Duo Kit</div>
                      <div className="text-xs text-secondary mt-0.5">
                        2x G-Flash Spotlights + Dual Studio Flight Case + Complete Master GOBO Library
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-secondary shrink-0 ml-2">
                    +₹6,999
                  </span>
                </label>
              </div>
            </div>

            {/* Quantity Stepper & Instant Purchase */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center bg-surface-container rounded-xl p-1 border border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-surface-container-high transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-surface-container-high transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-primary-container text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(229,26,52,0.45)] hover:bg-tertiary-container hover:shadow-[0_0_32px_rgba(229,26,52,0.6)] transition-all active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add To Cart • ₹{totalPrice.toLocaleString("en-IN")}</span>
                </button>
              </div>

              {/* Fast Instant One-Click Buy */}
              <button
                type="button"
                onClick={handleInstantBuy}
                className="w-full py-3.5 rounded-xl bg-surface-container-highest text-white hover:bg-surface-bright transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/10 active:scale-98"
              >
                <span className="font-mono text-primary text-xs uppercase tracking-wider font-bold">
                  INSTANT ONE-CLICK
                </span>
                <span>Buy Now with UPI / Card</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Assurance Trust Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-1 border border-white/5">
                <Plane className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-white">Express Air</span>
                <span className="text-[11px] text-secondary leading-tight">Free Fast Delivery</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-1 border border-white/5">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-white">30-Day Trial</span>
                <span className="text-[11px] text-secondary leading-tight">100% Studio Refund</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low text-center flex flex-col items-center gap-1 border border-white/5">
                <Shield className="w-4 h-4 text-primary" />
                <span className="font-bold text-xs text-white">2-Year Pro</span>
                <span className="text-[11px] text-secondary leading-tight">Instant Replacement</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 3: TECHNICAL BENCHMARKS (Bento Architecture) ────────── */}
      <section className="w-full bg-surface-container-lowest py-20 border-t border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest font-semibold mb-2">
                // LABORATORY BENCHMARKS
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Cinematic Optical Precision
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-secondary max-w-lg leading-relaxed">
              Engineered with multi-coated optical quartz glass and high-CRI German phosphor LED emitters for broadcast-certified chromatic accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Metric 1: Output */}
            <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col justify-between gap-6 border border-white/5 shadow-md">
              <div className="flex items-center justify-between text-secondary font-mono text-xs">
                <span>PEAK ILLUMINANCE</span>
                <Sun className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {model === "10w" ? "3,100" : "9,450"}
                </div>
                <div className="font-mono text-xs text-primary mt-1 font-semibold">
                  LUX @ 1 METER ({model === "10w" ? "20° CONE" : "15° CONE"})
                </div>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary-container h-full transition-all duration-500"
                  style={{ width: model === "10w" ? "65%" : "92%" }}
                />
              </div>
            </div>

            {/* Metric 2: Color Fidelity */}
            <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col justify-between gap-6 border border-white/5 shadow-md">
              <div className="flex items-center justify-between text-secondary font-mono text-xs">
                <span>COLOR ACCURACY</span>
                <Palette className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  98.4
                </div>
                <div className="font-mono text-xs text-primary mt-1 font-semibold">
                  CRI / 99 TLCI BROADCAST SPEC
                </div>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[98%]" />
              </div>
            </div>

            {/* Metric 3: Stepless Beam */}
            <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col justify-between gap-6 border border-white/5 shadow-md">
              <div className="flex items-center justify-between text-secondary font-mono text-xs">
                <span>ZOOM MECHANISM</span>
                <Sliders className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {model === "10w" ? "20°–50°" : "15°–60°"}
                </div>
                <div className="font-mono text-xs text-primary mt-1 font-semibold">
                  SMOOTH ROTARY HELICOID
                </div>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[85%]" />
              </div>
            </div>

            {/* Metric 4: PD Architecture */}
            <div className="p-6 rounded-2xl bg-surface-container-low flex flex-col justify-between gap-6 border border-white/5 shadow-md">
              <div className="flex items-center justify-between text-secondary font-mono text-xs">
                <span>POWER DELIVERY</span>
                <BatteryCharging className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                  {model === "10w" ? "30W PD" : "65W PD"}
                </div>
                <div className="font-mono text-xs text-primary mt-1 font-semibold">
                  TYPE-C RUNTIME OR PASS-THROUGH
                </div>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-container h-full w-[100%]" />
              </div>
            </div>

          </div>

          {/* Tabbed Technical Hardware Specification Console */}
          <div className="rounded-2xl bg-surface-container p-6 sm:p-8 shadow-lg flex flex-col gap-6 border border-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-surface-container-highest text-primary border border-white/5">
                  <Sliders className="w-5 h-5 text-primary-container" />
                </span>
                <h3 className="font-bold text-lg sm:text-xl text-white">
                  Hardware Blueprint &amp; Specs
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSpecTab("optics")}
                  className={`px-4 py-2 rounded-xl font-mono text-xs transition-all font-semibold ${
                    specTab === "optics"
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-high text-secondary hover:text-white"
                  }`}
                >
                  OPTICS
                </button>
                <button
                  type="button"
                  onClick={() => setSpecTab("power")}
                  className={`px-4 py-2 rounded-xl font-mono text-xs transition-all font-semibold ${
                    specTab === "power"
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-high text-secondary hover:text-white"
                  }`}
                >
                  POWER &amp; THERMAL
                </button>
                <button
                  type="button"
                  onClick={() => setSpecTab("build")}
                  className={`px-4 py-2 rounded-xl font-mono text-xs transition-all font-semibold ${
                    specTab === "build"
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-high text-secondary hover:text-white"
                  }`}
                >
                  PHYSICAL CHASSIS
                </button>
              </div>
            </div>

            {/* Spec Content: OPTICS */}
            {specTab === "optics" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Optical System</span>
                  <span className="font-mono font-semibold text-white">Dual Aspheric Coated Quartz Glass</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Color Temperature Range</span>
                  <span className="font-mono font-semibold text-white">2,500K – 10,000K (Stepless CCT)</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Beam Spot Uniformity</span>
                  <span className="font-mono font-semibold text-white">&gt;94% Edge-to-Edge Luminance</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">GOBO Slot Diameter</span>
                  <span className="font-mono font-semibold text-white">Standard 33mm Size M Compatible</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Dimming Curves</span>
                  <span className="font-mono font-semibold text-white">Linear, Exponential, Logarithmic, S-Curve</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Flicker-Free Rating</span>
                  <span className="font-mono font-semibold text-white">Up to 24,000 fps High-Speed Video</span>
                </div>
              </div>
            )}

            {/* Spec Content: POWER */}
            {specTab === "power" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Internal Battery</span>
                  <span className="font-mono font-semibold text-white">
                    {model === "10w" ? "Li-Ion 3,600mAh (7.4V)" : "Li-Ion 5,000mAh (7.4V / 37Wh)"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Runtime (100% Full Load)</span>
                  <span className="font-mono font-semibold text-white">
                    {model === "10w" ? "110 Minutes Continuous" : "85 Minutes Continuous"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Charging Protocol</span>
                  <span className="font-mono font-semibold text-white">
                    {model === "10w" ? "USB-PD 20W Fast Charge" : "USB-PD 3.0 (65W Fast Charge: 0-80% in 35m)"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Active Cooling Level</span>
                  <span className="font-mono font-semibold text-white">
                    {model === "10w" ? "Passive Graphene Chamber" : "<18dB Hydro-Bearing Ultra-Silent Fan"}
                  </span>
                </div>
              </div>
            )}

            {/* Spec Content: BUILD */}
            {specTab === "build" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Material Construction</span>
                  <span className="font-mono font-semibold text-white">CNC Machined 6061 Aerospace Aluminum</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Total Weight</span>
                  <span className="font-mono font-semibold text-white">
                    {model === "10w" ? "280 grams (Body only)" : "420 grams (Body only)"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Mounting Standard</span>
                  <span className="font-mono font-semibold text-white">1/4"-20 Thread + Arca-Swiss Foot Mount</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-xl bg-surface-container-low text-xs sm:text-sm border border-white/5">
                  <span className="text-secondary">Weather Resistance</span>
                  <span className="font-mono font-semibold text-white">IP54 Splash &amp; Dust Sealed Barrel</span>
                </div>
              </div>
            )}

            {/* Interactive Optical Beam & CCT Simulator Controls */}
            <div className="mt-4 p-5 rounded-xl bg-surface-container-low border border-white/5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-primary font-bold uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Live Optical Helicoid Simulator
                </span>
                <span className="font-mono text-xs text-secondary">Interactive Studio Bench</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Control 1: Beam Angle */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Beam Focus Helicoid</span>
                    <span className="font-mono text-primary font-bold">{simBeamAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    value={simBeamAngle}
                    onChange={(e) => setSimBeamAngle(Number(e.target.value))}
                    className="w-full accent-primary-container h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-secondary/60">
                    <span>15° Spot</span>
                    <span>60° Flood</span>
                  </div>
                </div>

                {/* Control 2: Color Temperature (CCT) */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Color Temperature (CCT)</span>
                    <span className="font-mono text-white font-bold">{simCCT}K</span>
                  </div>
                  <input
                    type="range"
                    min="2500"
                    max="10000"
                    step="100"
                    value={simCCT}
                    onChange={(e) => setSimCCT(Number(e.target.value))}
                    className="w-full accent-primary-container h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-secondary/60">
                    <span>2500K Warm Tungsten</span>
                    <span>10000K Ice Blue</span>
                  </div>
                </div>

                {/* Control 3: Dimming */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Dimming Output</span>
                    <span className="font-mono text-white font-bold">{simDimming}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={simDimming}
                    onChange={(e) => setSimDimming(Number(e.target.value))}
                    className="w-full accent-primary-container h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-secondary/60">
                    <span>0% (Flicker-Free)</span>
                    <span>100% Full Blast</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Beam Simulation Preview Canvas */}
              <div className="relative h-28 rounded-xl bg-black overflow-hidden flex items-center justify-center border border-white/10">
                <div
                  className="rounded-full transition-all duration-300 blur-md pointer-events-none"
                  style={{
                    width: `${simBeamAngle * 3.5}px`,
                    height: `${simBeamAngle * 3.5}px`,
                    backgroundColor:
                      simCCT < 3200
                        ? "#ff9e54"
                        : simCCT < 5000
                        ? "#ffe7d0"
                        : simCCT < 6500
                        ? "#f5f8ff"
                        : "#99bfff",
                    opacity: simDimming / 100,
                    boxShadow: `0 0 50px ${
                      simCCT < 3200
                        ? "#ff9e54"
                        : simCCT < 5000
                        ? "#ffe7d0"
                        : "#99bfff"
                    }`,
                  }}
                />
                <div className="absolute bottom-2 left-3 font-mono text-[10px] text-secondary/70">
                  BEAM EMITTANCE: {Math.round(((65 - simBeamAngle) / 50) * (model === "10w" ? 3100 : 9450) * (simDimming / 100))} LUX
                </div>
                <div className="absolute top-2 right-3 font-mono text-[10px] text-primary">
                  CCT: {simCCT}K • CRI 98.4
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 4: WHAT'S IN THE BOX ─────────────────────────────────── */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-20">
        <div className="flex flex-col gap-3 mb-10">
          <div className="font-mono text-xs text-primary uppercase tracking-widest font-semibold">
            // COMPLETE PACKAGE BREAKDOWN
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
            What's In The Box
          </h2>
          <p className="text-xs sm:text-sm text-secondary max-w-xl">
            Every G-Flash Pro Master Kit arrives pre-calibrated in our rugged custom-molded armor flight case.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {boxItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-container-low flex flex-col items-center text-center gap-3 group hover:bg-surface-container transition-all border border-white/5"
            >
              <div className="w-full aspect-square rounded-xl bg-surface-container-lowest overflow-hidden relative p-2 border border-white/5">
                <Image
                  src={item.img}
                  alt={item.title}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-white block">
                  {item.title}
                </span>
                <span className="font-mono text-[11px] text-secondary">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: CREATOR REVIEWS & FIELD VALIDATION ────────────────── */}
      <section id="reviews" className="w-full bg-surface-container-lowest py-20 border-t border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="font-mono text-xs text-primary uppercase tracking-widest font-semibold mb-2">
                // FIELD VALIDATION
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Created by Cinematographers. Tested in Real Studios.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => showToast("Review form opening soon — Thank you for your feedback!")}
              className="px-5 py-3 rounded-xl bg-surface-container text-white hover:bg-surface-container-high transition-colors font-semibold text-xs sm:text-sm flex items-center gap-2 border border-white/10 w-fit"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-container flex flex-col justify-between gap-6 border border-white/5 shadow-md hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-primary-container">
                      {[...Array(rev.stars)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                      ))}
                    </div>
                    <span className="font-mono text-xs text-secondary">{rev.time}</span>
                  </div>
                  <h4 className="font-bold text-base text-white leading-snug">
                    {rev.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-secondary leading-relaxed">
                    {rev.content}
                  </p>
                </div>

                {/* BTS Photo Attachment */}
                <div className="w-full h-36 rounded-xl overflow-hidden relative group border border-white/10">
                  <Image
                    src={rev.btsImg}
                    alt={rev.btsCaption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute bottom-2 left-2 bg-surface-container-lowest/85 backdrop-blur-xs text-white px-2 py-0.5 rounded font-mono text-[10px] font-semibold border border-white/10">
                    {rev.btsCaption}
                  </span>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center font-mono text-primary font-bold text-xs border border-white/10">
                    {rev.initials}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <span>{rev.author}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="text-[11px] text-secondary">
                      {rev.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 6: ZOOM MODAL PREVIEW ────────────────────────────────── */}
      {isZoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full aspect-video bg-surface-container-lowest rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={galleryImages[currentImgIdx]?.src || "/images/product/hero-main.jpg"}
              alt="Zoomed Product View"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 right-4 p-3 rounded-full bg-surface-container-high/80 text-white hover:bg-primary-container transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 font-mono text-xs text-white bg-black/60 px-3 py-1 rounded">
              {galleryImages[currentImgIdx]?.label}
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 7: STICKY BOTTOM PURCHASE DRAWER (On Scroll) ─────────── */}
      <aside
        className={`fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl py-3.5 px-4 sm:px-8 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] border-t border-white/10 transition-transform duration-300 ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-low overflow-hidden relative border border-white/10 shrink-0">
              <Image
                src="/images/product/thumb-mini.jpg"
                alt="Product Preview"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="font-bold text-sm text-white">
                {model === "10w" ? "Xevora G-Flash 10W RGB" : "Xevora G-Flash PRO 30W Spotlight"}
              </div>
              <div className="font-mono text-xs text-primary font-semibold">
                {model === "10w" ? "10W Pocket" : "30W PRO"} • {finish} • {bundle}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <div className="text-lg sm:text-xl font-extrabold text-white font-mono">
                ₹{totalPrice.toLocaleString("en-IN")}
              </div>
              <div className="font-mono text-primary text-[10px] font-semibold">
                Free Express Air Shipping
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-3 px-6 sm:px-8 rounded-xl bg-primary-container text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(229,26,52,0.4)] hover:bg-tertiary-container transition-all flex items-center gap-2 active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add To Cart</span>
            </button>
          </div>
        </div>
      </aside>

    </div>
  );
}
