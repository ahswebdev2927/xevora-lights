"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  Star,
  Check,
  CheckCircle,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Rocket,
  Receipt,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Clapperboard,
  BatteryCharging,
  Palette,
  Timer,
  Zap,
  Sliders,
  Maximize2,
  X
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { isVideoUrl } from "@/utils/product";


const DEFAULT_SLOT1 = {
  id: 14,
  variationId: 1,
  name: "Xevora G-Flash 10W RGB",
  price: 4999,
  mrp: 7999,
  discount: 38,
  image: "/images/landing/product-10w-rgb.jpg",
  stock: 22,
  rating: 4.9,
  numReviews: 110,
  size: "Standard Edition",
  slotLabel: "CREATOR ESSENTIAL",
  specBullets: [
    "7500mAh Lithium Cell — Up to 350 min continuous runtime",
    "20 GOBO precision projection plates included in box",
    "4 lighting modes, fully dimmable 1% – 100% dial",
    "USB-C Fast charging with handheld pocket portability"
  ]
};

const DEFAULT_SLOT2 = {
  id: 15,
  variationId: 1,
  name: "Xevora G-Flash PRO 30W",
  price: 7499,
  mrp: 10999,
  discount: 32,
  image: "/images/landing/product-30w-pro.jpg",
  stock: 18,
  rating: 4.9,
  numReviews: 341,
  size: "Studio Pro Edition",
  slotLabel: "MOST POWERFUL FLAGSHIP",
  specBullets: [
    "30W Ultra-High Output — 3x brighter than 10W standard",
    "CRI 98+ True-to-life studio color rendering fidelity",
    "Silent active internal cooling fan for marathon long shoots",
    "Push-pull zoom barrel + 4 magnetic diffusion gels included"
  ]
};

const DEFAULT_REELS = [
  {
    id: 1,
    title: "Dramatic Rim Light",
    creatorHandle: "@filmmaker_sam",
    videoUrl: "/videos/reels/reel-1.mp4",
    thumbnailUrl: "/images/landing/reel-1.jpg",
    badgeText: "PRO IN ACTION",
  },
  {
    id: 2,
    title: "RGB Mood Shifter",
    creatorHandle: "@studio_claire",
    videoUrl: "/videos/reels/reel-2.mp4",
    thumbnailUrl: "/images/landing/reel-2.jpg",
    badgeText: "G-FLASH 10W",
  },
  {
    id: 3,
    title: "One Room, 5 Sets",
    creatorHandle: "@cinema_dan",
    videoUrl: "/videos/reels/reel-3.mp4",
    thumbnailUrl: "/images/landing/reel-3.jpg",
    badgeText: "GOBO EFFECTS",
  },
  {
    id: 4,
    title: "60-Sec Pod Desk",
    creatorHandle: "@alex_tech",
    videoUrl: "/videos/reels/reel-4.mp4",
    thumbnailUrl: "/images/landing/reel-4.jpg",
    badgeText: "SETUP GUIDE",
  },
  {
    id: 5,
    title: "Adjust Intensity",
    creatorHandle: "@luxe_visuals",
    videoUrl: "/videos/reels/reel-5.mp4",
    thumbnailUrl: "/images/landing/reel-5.jpg",
    badgeText: "BEAM DEMO",
  },
];

export default function Home() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Cart button interaction states
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const [slot1, setSlot1] = useState(DEFAULT_SLOT1);
  const [slot2, setSlot2] = useState<typeof DEFAULT_SLOT2 | null>(DEFAULT_SLOT2);
  const [heroStartingPrice, setHeroStartingPrice] = useState(4999);
  const [heroStartingMrp, setHeroStartingMrp] = useState(7999);
  const [heroMedia, setHeroMedia] = useState({
    mediaUrl: "/images/landing/hero-gflash.jpg",
    tag1: "TYPE-C FAST CHARGING",
    tag2: "CNC AEROSPACE CHASSIS",
  });

  const [reelsList, setReelsList] = useState<any[]>(DEFAULT_REELS);
  const [selectedReelModal, setSelectedReelModal] = useState<any | null>(null);
  const reelsScrollRef = useRef<HTMLDivElement>(null);

  const scrollReels = (direction: "left" | "right") => {
    if (reelsScrollRef.current) {
      const scrollAmount = reelsScrollRef.current.clientWidth * 0.8;
      reelsScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    fetch("/api/homepage-products")
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          if (res.data.slot1) {
            setSlot1(prev => ({
              ...prev,
              ...res.data.slot1,
              specBullets: (res.data.slot1.specBullets && res.data.slot1.specBullets.length > 0)
                ? res.data.slot1.specBullets
                : prev.specBullets
            }));
          }
          if (res.data.slot2) {
            setSlot2(prev => ({
              ...(prev || DEFAULT_SLOT2),
              ...res.data.slot2,
              specBullets: (res.data.slot2.specBullets && res.data.slot2.specBullets.length > 0)
                ? res.data.slot2.specBullets
                : (prev?.specBullets || DEFAULT_SLOT2.specBullets)
            }));
          } else if (!res.data.slot2 && res.data.slot1) {
            setSlot2(null);
          }
          if (res.data.heroStartingPrice) setHeroStartingPrice(res.data.heroStartingPrice);
          if (res.data.heroStartingMrp) setHeroStartingMrp(res.data.heroStartingMrp);
          if (res.data.heroMedia) setHeroMedia(res.data.heroMedia);
        }
      })
      .catch(() => {});

    // Fetch dynamic reels
    fetch("/api/reels")
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setReelsList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Interactive FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Reel Sound preview state
  const [activeMute, setActiveMute] = useState<Record<number, boolean>>({});

  const toggleSound = (index: number) => {
    setActiveMute((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddToCart = (product: {
    id: number;
    variationId: number;
    name: string;
    price: number;
    image: string;
    size: string;
  }) => {
    addItem({
      id: `${product.id}-${product.variationId}`,
      productId: product.id,
      variationId: product.variationId,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.size,
      color: "Matte Stealth Black",
      quantity: 1,
    });

    setAddedItem(product.name);
    setTimeout(() => setAddedItem(null), 2500);
  };

  const handleQuickBuy = (product: {
    id: number;
    variationId: number;
    name: string;
    price: number;
    image: string;
    size: string;
  }) => {
    addItem({
      id: `${product.id}-${product.variationId}`,
      productId: product.id,
      variationId: product.variationId,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.size,
      color: "Matte Stealth Black",
      quantity: 1,
    });
    router.push("/cart");
  };

  const faqs = [
    {
      q: "What warranty is included with the hardware?",
      a: "Every Xevora G-Flash spotlight comes standard with our 1-Year Comprehensive Replacement Warranty covering internal optical glass, LED emitters, internal battery cells, and CNC casing components.",
    },
    {
      q: "Which model should I buy: 10W RGB or 30W PRO?",
      a: "If you shoot mainly TikTok, Reels, mobile vlogs, or travel content, the 10W RGB is ideal due to its ultra-compact size and full-spectrum color palettes. If you run a YouTube studio, shoot commercial interviews, or need your spotlight to overpower ambient studio daylight, choose the 30W PRO for 3x the photometric luminance.",
    },
    {
      q: "Does the G-Flash operate while charging?",
      a: "Yes. Both the 10W RGB and 30W PRO support simultaneous pass-through charging via USB-C PD. You can plug it directly into a wall adapter or external power bank for infinite studio shoot durations.",
    },
    {
      q: "Can I exchange or return it if it doesn't fit my studio setup?",
      a: "We offer a 30-Day Hassle-Free Studio Trial. If the light does not completely transform your production quality, simply return it in original packaging for a 100% full refund with prepaid return shipping labels.",
    },
    {
      q: "How do the GOBO projection discs mount?",
      a: "The front optical barrel features a quick magnetic drop-in aperture slot. Simply slide any of the 20 laser-cut steel discs into the slot — they lock automatically and remain cool to the touch during operation.",
    },
  ];

  return (
    <div className="w-full bg-[#0e0e12] text-[#e4e1e7] min-h-screen">
      
      {/* ── 1. HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-surface-container-lowest py-16 lg:py-24 border-b border-white/5">
        {/* Cinematic Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-container/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Copy */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-primary font-mono text-xs uppercase tracking-wider border border-white/5">
                  <Sparkles className="w-3.5 h-3.5 text-primary-container" />
                  Official Creator Hardware Series
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-secondary font-mono text-xs border border-white/5">
                  v4.2 Optical Core
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                Dull, Flat Videos?<br />
                <span className="text-primary-container drop-shadow-[0_0_24px_rgba(229,26,52,0.45)]">
                  One Light Fixes
                </span> Everything.
              </h1>

              <p className="text-base sm:text-lg text-secondary max-w-xl leading-relaxed">
                Turn any ordinary blank room into a moody, high-end film set. 20 precision GOBO pattern projections, all-day 350-minute battery stamina, and CRI 98+ cinema fidelity — precision engineered by Xevora.
              </p>

              {/* Social Proof Pill */}
              <div className="flex items-center gap-3 py-2 px-4 rounded-xl bg-surface-container-low max-w-fit border border-white/5">
                <div className="flex text-primary-container">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  Trusted by 50,000+ creators & cinematographers
                </span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#models"
                  className="px-8 py-3.5 rounded-lg bg-primary-container text-white font-semibold text-sm hover:bg-tertiary-container shadow-[0_0_28px_rgba(229,26,52,0.4)] transition-all flex items-center gap-2 group"
                >
                  <span>Shop Xevora G-Flash</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#comparison"
                  className="px-7 py-3.5 rounded-lg bg-surface-container text-white hover:bg-surface-container-high font-semibold text-sm transition-colors flex items-center gap-2 border border-white/5"
                >
                  <Sliders className="w-4 h-4 text-slate-400" />
                  <span>Compare Models</span>
                </a>
              </div>

              {/* 4 Assurance Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-xs text-secondary whitespace-nowrap">1-Year Warranty</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-white/5">
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-xs text-secondary whitespace-nowrap">Flexible Pay / COD</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-white/5">
                  <Rocket className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-xs text-secondary whitespace-nowrap">24h Dispatch</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-low border border-white/5">
                  <Receipt className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-mono text-xs text-secondary whitespace-nowrap">GST Invoice Ready</span>
                </div>
              </div>
            </div>

            {/* Hero Media Spec Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl bg-surface-container overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/10 group">
                <div className="relative h-96 w-full overflow-hidden bg-surface-container-lowest">
                  {isVideoUrl(heroMedia.mediaUrl) ? (
                    <video
                      src={heroMedia.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={heroMedia.mediaUrl || "/images/landing/hero-gflash.jpg"}
                      alt="Dark cyber cinematic studio shot of the Xevora handheld spotlight cylinder casting a crisp geometric warm projection"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {/* Floating Callout Tags */}
                  {heroMedia.tag1 && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-2 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                      <span className="font-mono text-xs font-semibold text-white">{heroMedia.tag1}</span>
                    </div>
                  )}
                  {heroMedia.tag2 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      <span className="font-mono text-xs font-semibold text-white">{heroMedia.tag2}</span>
                    </div>
                  )}
                </div>

                {/* Card Bottom Specs Ribbon */}
                <div className="p-6 bg-surface-container-high flex items-center justify-between border-t border-white/5">
                  <div>
                    <div className="font-bold text-base text-white">G-Flash Series</div>
                    <div className="text-xs text-secondary">Pocket-Size Handheld Optical Projector</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                      Starting From
                    </div>
                    <div className="font-bold text-lg text-white">
                      ₹{heroStartingPrice.toLocaleString()} <span className="text-xs text-secondary line-through ml-1">₹{heroStartingMrp.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 2. VALUE PROPOSITIONS ────────────────────────────────────────── */}
      <section className="w-full bg-surface py-20 border-b border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="flex flex-col gap-2 max-w-2xl">
            <span className="font-mono text-xs uppercase text-primary tracking-widest font-semibold">
              Architectural Lighting
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Why Creators & Photographers Choose Xevora
            </h2>
            <p className="text-sm sm:text-base text-secondary leading-relaxed">
              Engineered to bypass expensive three-point lighting crews, studio rentals, and hour-long set dressings with single-point optical magic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-surface-container-low flex flex-col gap-5 hover:bg-surface-container transition-colors group border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                <Clapperboard className="w-6 h-6 text-primary-container" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-white">Cinematic Look, In-Camera</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  20 included precision GOBO projection plates turn any blank drywall into textured Venetian blinds, tree canopies, architectural arches, and studio windows. Zero post-production masks required.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-mono text-xs font-semibold">
                <span>20 SHADOW DISCS INCLUDED</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-surface-container-low flex flex-col gap-5 hover:bg-surface-container transition-colors group border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                <BatteryCharging className="w-6 h-6 text-primary-container" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-white">Shoot Anywhere, All Day</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Ultra-high density lithium core yields up to 350 continuous minutes of run time. Complete Type-C USB-PD pass-through power allows non-stop continuous podcast and YouTube filming.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-mono text-xs font-semibold">
                <span>UP TO 350 MIN RUNTIME</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-surface-container-low flex flex-col gap-5 hover:bg-surface-container transition-colors group border border-white/5">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary-container flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                <Palette className="w-6 h-6 text-primary-container" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-lg text-white">Pro Color You Can Trust</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  CRI 98+ and TLCI 99 color rendering metrics guarantee faithful melanin rendering and crisp color separation. Integrated active silent fans prevent thermal throttling during marathon studio takes.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-mono text-xs font-semibold">
                <span>CRI 98+ / TLCI 99 ACCURACY</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. SOCIAL PROOF & CREATOR TESTIMONIALS ───────────────────────── */}
      <section className="w-full bg-surface-container-lowest py-20 border-b border-white/5" id="reviews">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          {/* Ratings Summary Banner */}
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex text-primary-container">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary-container text-primary-container" />
                ))}
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white ml-2">4.9 / 5.0</span>
            </div>
            <p className="text-sm text-secondary">
              Across 1,200+ verified cinematographers, portrait shooters & video podcasters.
            </p>
          </div>

          {/* Feature Spotlight Testimonial */}
          <div className="p-8 sm:p-12 rounded-3xl bg-surface-container-low max-w-4xl mx-auto flex flex-col items-center text-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/5 relative">
            <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="text-4xl font-serif leading-none select-none">“</span>
            </div>
            <blockquote className="text-lg sm:text-2xl text-white italic max-w-3xl leading-snug font-normal">
              &ldquo;Powerful and incredibly well-built light. The variable brightness control is butter smooth, GOBO filters are ultra-sharp, and battery runtime lasted through a full 6-hour commercial portrait session.&rdquo;
            </blockquote>
            <div className="flex flex-col items-center">
              <div className="font-bold text-base text-white">Bhumika Malik</div>
              <div className="font-mono text-xs text-primary font-semibold">Commercial Director & G-Flash PRO User</div>
            </div>
          </div>

          {/* Testimonials 3-Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl bg-surface-container flex flex-col gap-4 border border-white/5">
              <div className="flex text-primary-container">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                ))}
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                &ldquo;Being a solo run-and-gun creator, this is easily my most valuable tool. Very compact, punchy output, and effortlessly fits in my shoulder bag. The zoom throw is shockingly sharp.&rdquo;
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                <span className="font-semibold text-sm text-white">Harshleen K.</span>
                <span className="font-mono text-xs text-primary">G-Flash 10W RGB</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container flex flex-col gap-4 border border-white/5">
              <div className="flex text-primary-container">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                ))}
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                &ldquo;One of the best gear investments I've made. The aluminum barrel quality feels like a ₹50,000 ARRI cinema accessory. Totally worth every single rupee for YouTube sets.&rdquo;
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                <span className="font-semibold text-sm text-white">Pankaj Bhatt</span>
                <span className="font-mono text-xs text-primary">G-Flash 10W RGB</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-container flex flex-col gap-4 border border-white/5">
              <div className="flex text-primary-container">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary-container text-primary-container" />
                ))}
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                &ldquo;The 30W PRO output is intense. I use the Venetian blinds GOBO behind my key light on every interview. Clients constantly ask how I got that Hollywood window pattern.&rdquo;
              </p>
              <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                <span className="font-semibold text-sm text-white">Arpit S.</span>
                <span className="font-mono text-xs text-primary">G-Flash PRO 30W</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. CHOOSE YOUR G-FLASH PRODUCT CARDS ──────────────────────────── */}
      <section className="w-full bg-surface py-20 scroll-mt-28 border-b border-white/5" id="models">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="text-center flex flex-col gap-2 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase text-primary tracking-widest font-semibold">
              Hardware Lineup
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Choose Your Xevora G-Flash
            </h2>
            <p className="text-sm sm:text-base text-secondary">
              Select the pocket powerhouse or the 30W studio flagship spotlight.
            </p>
          </div>

          <div className={`grid grid-cols-1 ${slot2 ? "lg:grid-cols-2" : "max-w-xl mx-auto"} gap-8 items-stretch`}>
            
            {/* Model 1: Slot 1 (Creator / Essential) */}
            <div className="rounded-3xl bg-surface-container-low p-6 sm:p-8 flex flex-col justify-between gap-8 hover:bg-surface-container transition-all shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/5">
              <div className="flex flex-col gap-6">
                
                <div className="h-64 sm:h-72 rounded-2xl bg-surface-container-lowest overflow-hidden relative border border-white/5 group">
                  <img
                    src={slot1.image}
                    alt={slot1.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded bg-surface-container-high/90 text-secondary font-mono text-xs border border-white/10 uppercase font-semibold">
                    {slot1.slotLabel}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-white">{slot1.name}</h3>
                    {slot1.discount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono text-xs uppercase font-bold border border-primary-container/30">
                        Save {slot1.discount}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex text-primary-container">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-primary-container text-primary-container" />
                      ))}
                    </div>
                    <span className="font-mono text-xs text-secondary">{slot1.rating} ({slot1.numReviews} verified reviews)</span>
                  </div>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">₹{slot1.price.toLocaleString()}</span>
                  {slot1.mrp > slot1.price && (
                    <span className="text-lg text-secondary line-through">₹{slot1.mrp.toLocaleString()}</span>
                  )}
                  <span className="font-mono text-xs text-primary-container font-semibold">
                    {slot1.stock > 0 ? `Limited Stock (${slot1.stock} Left)` : "In Stock"}
                  </span>
                </div>

                {/* Spec bullets */}
                <ul className="flex flex-col gap-3 text-sm text-secondary">
                  {slot1.specBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    handleAddToCart({
                      id: slot1.id,
                      variationId: slot1.variationId,
                      name: slot1.name,
                      price: slot1.price,
                      image: slot1.image,
                      size: slot1.size,
                    })
                  }
                  className="w-full py-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-white/10 active:scale-98 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span>
                    {addedItem === slot1.name
                      ? "Added to Cart! ✓"
                      : `Add ${slot1.name} — ₹${slot1.price.toLocaleString()}`}
                  </span>
                </button>
                <div className="font-mono text-[11px] text-center text-slate-400">
                  Free Express Shipping Across India • 30-Day Studio Guarantee
                </div>
              </div>
            </div>

            {/* Model 2: Slot 2 (Flagship Pro) */}
            {slot2 && (
              <div className="rounded-3xl bg-surface-container p-6 sm:p-8 flex flex-col justify-between gap-8 relative shadow-[0_16px_48px_rgba(229,26,52,0.18)] border border-primary-container/30">
                
                <div className="flex flex-col gap-6">
                  <div className="h-64 sm:h-72 rounded-2xl bg-surface-container-lowest overflow-hidden relative border border-white/10 group">
                    <img
                      src={slot2.image}
                      alt={slot2.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 rounded bg-primary-container text-white font-mono text-xs uppercase font-bold tracking-wider shadow-[0_0_12px_rgba(229,26,52,0.6)]">
                      {slot2.slotLabel}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl sm:text-2xl font-bold text-white">{slot2.name}</h3>
                      {slot2.discount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary-container font-mono text-xs uppercase font-bold border border-primary-container/30">
                          Save {slot2.discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex text-primary-container">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-primary-container text-primary-container" />
                        ))}
                      </div>
                      <span className="font-mono text-xs text-secondary">{slot2.rating} ({slot2.numReviews} verified studio reviews)</span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">₹{slot2.price.toLocaleString()}</span>
                    {slot2.mrp > slot2.price && (
                      <span className="text-lg text-secondary line-through">₹{slot2.mrp.toLocaleString()}</span>
                    )}
                    <span className="font-mono text-xs text-primary font-semibold">
                      {slot2.stock > 0 ? "In Stock — Ships in 24 Hours" : "Available on Order"}
                    </span>
                  </div>

                  {/* Coupon Promo Banner */}
                  <div className="p-3 rounded-xl bg-surface-container-high flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-mono text-xs">🎟️</span>
                      <span className="font-mono text-xs text-secondary">
                        VIP Coupon applied: <strong className="text-white">STUDIO20</strong>
                      </span>
                    </div>
                    <span className="font-mono text-xs text-primary uppercase font-bold">Active</span>
                  </div>

                  {/* Spec Bullets */}
                  <ul className="flex flex-col gap-3 text-sm text-secondary">
                    {slot2.specBullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        {idx === 0 ? (
                          <Zap className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleAddToCart({
                        id: slot2.id,
                        variationId: slot2.variationId,
                        name: slot2.name,
                        price: slot2.price,
                        image: slot2.image,
                        size: slot2.size,
                      })
                    }
                    className="w-full py-4 rounded-xl bg-primary-container hover:bg-tertiary-container text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(229,26,52,0.4)] active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {addedItem === slot2.name
                        ? "Added to Cart! ✓"
                        : `Add ${slot2.name} — ₹${slot2.price.toLocaleString()}`}
                    </span>
                  </button>
                  <div className="font-mono text-[11px] text-center text-slate-400">
                    Free Express Priority Shipping • 1-Year Comprehensive Warranty
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── 5. DETAILED TECHNICAL COMPARISON TABLE ───────────────────────── */}
      <section className="w-full bg-surface-container-lowest py-20 scroll-mt-28 border-b border-white/5" id="comparison">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="text-center flex flex-col gap-2 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase text-primary tracking-widest font-semibold">
              Ocular Matrix
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              G-Flash vs. G-Flash PRO
            </h2>
            <p className="text-sm sm:text-base text-secondary">
              Detailed optical specifications compared side-by-side.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-container-high text-white border-b border-white/10">
                  <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider">Specifications</th>
                  <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-secondary">G-Flash 10W RGB</th>
                  <th className="py-4 px-6 font-mono text-xs uppercase tracking-wider text-primary font-bold">G-Flash PRO 30W</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Light Output</td>
                  <td className="py-4 px-6 font-mono text-xs text-secondary">10W Standard Core</td>
                  <td className="py-4 px-6 font-mono text-xs text-primary font-bold">30W — 3× Luminance Boost</td>
                </tr>
                <tr className="bg-surface-container hover:bg-surface-container-high transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Battery Architecture</td>
                  <td className="py-4 px-6 font-mono text-xs text-secondary">7500mAh — Up to 350 min</td>
                  <td className="py-4 px-6 font-mono text-xs text-white">5000mAh High-Discharge USB-C PD</td>
                </tr>
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Projection Effects</td>
                  <td className="py-4 px-6 font-mono text-xs text-secondary">20 GOBO Patterns Included</td>
                  <td className="py-4 px-6 font-mono text-xs text-white">20 GOBO Patterns + 4 Color Filters</td>
                </tr>
                <tr className="bg-surface-container hover:bg-surface-container-high transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Color Fidelity</td>
                  <td className="py-4 px-6 font-mono text-xs text-secondary">Full RGB Colour Array</td>
                  <td className="py-4 px-6 font-mono text-xs text-primary font-bold">CRI 98+ Cinema True-Colour</td>
                </tr>
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Cooling Engine</td>
                  <td className="py-4 px-6 font-mono text-xs text-secondary">Passive Heatsink (Silent)</td>
                  <td className="py-4 px-6 font-mono text-xs text-white">Active Ultra-Quiet Hydro Bearing Fan</td>
                </tr>
                <tr className="bg-surface-container hover:bg-surface-container-high transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Best Suited For</td>
                  <td className="py-4 px-6 text-xs text-secondary">Reels, Vlogs, TikTok, Mobile Travel</td>
                  <td className="py-4 px-6 text-xs text-white">Pro Video, Studio Commercials, YouTube Keylight</td>
                </tr>
                <tr className="bg-surface-container-low hover:bg-surface-container transition-colors">
                  <td className="py-4 px-6 font-semibold text-white">Price</td>
                  <td className="py-4 px-6 text-lg font-bold text-white">₹4,999</td>
                  <td className="py-4 px-6 text-lg font-bold text-primary">₹7,499</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ── 6. WATCH IT IN ACTION (CREATOR REELS) ────────────────────────── */}
      <section className="w-full bg-surface py-20 border-b border-white/5" id="reels">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-10">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs uppercase text-primary tracking-widest font-semibold">
                In the Wild
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Watch It In Action
              </h2>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <p className="text-xs sm:text-sm text-secondary max-w-sm hidden md:block">
                Tap any preview to see raw unedited camera footage shot exclusively with Xevora spotlights.
              </p>
              
              {/* Carousel Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scrollReels("left")}
                  className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  aria-label="Previous reels"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollReels("right")}
                  className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                  aria-label="Next reels"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Snap-Scroll Carousel Track */}
          <div
            ref={reelsScrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {reelsList.map((reel) => (
              <div
                key={reel.id}
                onClick={() => setSelectedReelModal(reel)}
                className="relative rounded-2xl overflow-hidden aspect-[9/16] bg-surface-container group cursor-pointer border border-white/10 shadow-lg snap-start shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] min-w-[170px] sm:min-w-[200px]"
              >
                {/* Thumbnail ONLY (Fast page load, no streaming video until clicked) */}
                <img
                  src={reel.thumbnailUrl || "/images/landing/reel-1.jpg"}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/images/landing/reel-1.jpg";
                  }}
                />

                {/* Gradient Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-black/20 to-black/40 pointer-events-none" />

                {/* Badge Tag with Red Recording Dot */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white font-mono text-[10px] border border-white/10 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>{reel.badgeText}</span>
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                  <div className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center shadow-xl border border-white/15 group-hover:bg-[#e51a34] group-hover:border-transparent transition-colors">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Details (Title + Creator Handle) */}
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                  <div className="font-semibold text-xs text-white truncate drop-shadow">
                    {reel.title}
                  </div>
                  <div className="font-mono text-[10px] text-secondary truncate mt-0.5">
                    {reel.creatorHandle || "@creator"}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Expanded Reel Modal Viewer (Fullscreen HUD Player) ── */}
      {selectedReelModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in"
          onClick={() => setSelectedReelModal(null)}
        >
          <div 
            className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[9/16] max-h-[92vh] bg-black rounded-3xl overflow-hidden border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Video / Image Player */}
            {isVideoUrl(selectedReelModal.videoUrl) ? (
              <video
                src={selectedReelModal.videoUrl}
                poster={selectedReelModal.thumbnailUrl || undefined}
                autoPlay
                controls
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={selectedReelModal.thumbnailUrl || "/images/landing/reel-1.jpg"}
                alt={selectedReelModal.title}
                className="w-full h-full object-cover"
              />
            )}

            {/* Camera HUD Header Overlay */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-none">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 w-fit text-[10px] font-mono font-bold text-white">
                  <span>00:18</span>
                  <span className="text-white/40">|</span>
                  <span className="text-red-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    REC
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white font-mono text-[9px] border border-white/10 uppercase tracking-wide w-fit">
                  {selectedReelModal.badgeText}
                </span>
              </div>

              <div className="flex items-center gap-3 pointer-events-auto">
                <span className="font-mono text-xs font-bold tracking-widest text-white/70 uppercase">
                  XEVORA
                </span>
                <button
                  onClick={() => setSelectedReelModal(null)}
                  className="p-1.5 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-black/90 transition-colors cursor-pointer border border-white/10"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Glass Bottom Details Capsule */}
            <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-auto">
              <div className="bg-black/75 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg space-y-2">
                <h3 className="font-bold text-sm text-white drop-shadow">
                  {selectedReelModal.title}
                </h3>
                <p className="font-mono text-xs text-red-400 font-semibold">
                  {selectedReelModal.creatorHandle || "@creator"}
                </p>

                {selectedReelModal.product && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {selectedReelModal.product.name}
                      </p>
                      <p className="text-xs font-mono font-bold text-primary">
                        ₹{(selectedReelModal.product.salePrice || selectedReelModal.product.basePrice).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleAddToCart({
                          id: selectedReelModal.product.id,
                          variationId: 1,
                          name: selectedReelModal.product.name,
                          price: selectedReelModal.product.salePrice || selectedReelModal.product.basePrice,
                          image: selectedReelModal.product.images?.[0] || "/images/placeholder.png",
                          size: "Standard Edition",
                        });
                        setSelectedReelModal(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-primary-container hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
                    >
                      Shop Spotlight
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. FEATURE DEEP DIVES ────────────────────────────────────────── */}
      <section className="w-full bg-surface-container-lowest py-20 border-b border-white/5" id="gobo">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-24">
          
          <div className="text-center flex flex-col gap-2 max-w-xl mx-auto">
            <span className="font-mono text-xs uppercase text-primary tracking-widest font-semibold">
              Engineering Highlights
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Every Feature, Up Close
            </h2>
            <p className="text-sm sm:text-base text-secondary">
              Bespoke optics crafted for high performance creator rigs.
            </p>
          </div>

          {/* Deep Dive 1: 20 GOBO Effects */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 rounded-3xl bg-surface-container overflow-hidden border border-white/10 shadow-xl group">
              <img
                src="/images/landing/gobo-scenarios.jpg"
                alt="Collage showcasing 4 dramatic projection scenarios created by Xevora GOBO discs"
                className="w-full h-[400px] sm:h-[440px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="inline-flex px-3 py-1 rounded bg-surface-container text-primary font-mono text-xs uppercase font-semibold w-fit border border-white/5">
                G-Flash Standard & Pro
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                20 GOBO Effects — Any Wall Becomes a Film Set
              </h3>
              <p className="text-base text-secondary leading-relaxed">
                Project windows, blinds, foliage, and architectural patterns instantly. The optical barrel achieves razor-sharp cutaways that take other creators hours of editing and synthetic digital masking.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5">
                  <span className="text-xl font-bold text-white">20 Discs</span>
                  <span className="text-xs text-secondary">Stainless steel heat-proof stencils</span>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-white/5">
                  <span className="text-xl font-bold text-white">Instant</span>
                  <span className="text-xs text-secondary">Drop-in magnetic slot system</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deep Dive 2: 350-Minute Battery */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col gap-5">
              <span className="inline-flex px-3 py-1 rounded bg-surface-container text-primary font-mono text-xs uppercase font-semibold w-fit border border-white/5">
                Power Endurance
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                350-Minute Battery. Shoot All Day.
              </h3>
              <p className="text-base text-secondary leading-relaxed">
                The 7500mAh lithium power pack outlasts every shoot — delivering up to 350 minutes of continuous runtime. Continuous USB-C fast charging allows you to plug into portable power banks anywhere on location.
              </p>
              <div className="flex items-center gap-8 pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-container-high border border-white/5 text-primary">
                    <Timer className="w-6 h-6 text-primary-container" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">350 Minutes</div>
                    <div className="font-mono text-xs text-secondary">Continuous runtime</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-surface-container-high border border-white/5 text-primary">
                    <Zap className="w-6 h-6 text-primary-container" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Pass-Through</div>
                    <div className="font-mono text-xs text-secondary">Charge while shooting</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 rounded-3xl bg-surface-container overflow-hidden border border-white/10 shadow-xl group">
              <img
                src="/images/landing/battery-architecture.jpg"
                alt="Technical schematic render of the Xevora G-Flash internal high-capacity battery cell"
                className="w-full h-[400px] sm:h-[440px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Deep Dive 3: Box Contents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 rounded-3xl bg-surface-container overflow-hidden border border-white/10 shadow-xl group">
              <img
                src="/images/landing/box-contents.jpg"
                alt="Knolling layout of the complete Xevora G-Flash creator kit"
                className="w-full h-[400px] sm:h-[440px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="inline-flex px-3 py-1 rounded bg-surface-container text-primary font-mono text-xs uppercase font-semibold w-fit border border-white/5">
                Ready Out Of The Box
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Complete Creator Kit in the Box
              </h3>
              <p className="text-base text-secondary leading-relaxed">
                No unexpected add-ons or hidden accessories. Everything required to shoot professional cinema lighting is included right in the case.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  "G-Flash Optical Unit",
                  "20 GOBO Projection Filters",
                  "Silicone Honeycomb Grid",
                  "Braided USB-C Cable",
                  "Hard Zipper Travel Pouch",
                  "1/4-20 Standard Tripod Mount"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-low text-xs sm:text-sm text-white border border-white/5">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deep Dive 4: 30W Spotlight Beam */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 flex flex-col gap-5">
              <span className="inline-flex px-3 py-1 rounded bg-surface-container text-primary font-mono text-xs uppercase font-semibold w-fit border border-white/5">
                G-Flash PRO Exclusive
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                30W Spotlight Beam — 3× The Power
              </h3>
              <p className="text-base text-secondary leading-relaxed">
                A concentrated, high-intensity beam strong enough to serve as your primary key light for YouTube and commercial interviews — making it the most potent 30W light in its weight class.
              </p>
              <div className="p-6 rounded-2xl bg-surface-container flex items-center justify-between border border-white/5">
                <div>
                  <div className="text-2xl font-bold text-primary-container">4,800 LUX</div>
                  <div className="font-mono text-xs text-secondary">At 1 Meter (Spot Focused)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">5,600K</div>
                  <div className="font-mono text-xs text-secondary">Daylight Balanced</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">98+</div>
                  <div className="font-mono text-xs text-secondary">CRI Index</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 rounded-3xl bg-surface-container overflow-hidden border border-white/10 shadow-xl group">
              <img
                src="/images/landing/beam-power-30w.jpg"
                alt="Dramatic volumetric golden beam of light cutting through haze in a dark cinematography studio"
                className="w-full h-[400px] sm:h-[440px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Deep Dive 5: Flexible Beam Adjustment */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 rounded-3xl bg-surface-container overflow-hidden border border-white/10 shadow-xl group">
              <img
                src="/images/landing/flexible-beam-zoom.jpg"
                alt="Diagram showing sliding push-pull head transitioning from narrow 15 degree spot to wide 60 degree flood"
                className="w-full h-[400px] sm:h-[440px] object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-6 flex flex-col gap-5">
              <span className="inline-flex px-3 py-1 rounded bg-surface-container text-primary font-mono text-xs uppercase font-semibold w-fit border border-white/5">
                Optic Zoom Control
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Flexible Beam — Tight or Wide, You Decide
              </h3>
              <p className="text-base text-secondary leading-relaxed">
                Slide the knurled optical head to focus the beam into a razor-sharp circle or open it up into a wide, even studio wash. Perfect for switching between pin-point rim lighting and ambient set washes in seconds.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-white/5">
                  <div className="text-xl font-bold text-white">15° Spot</div>
                  <div className="text-xs text-secondary mt-1">Sharp GOBO shadow cuts</div>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-surface-container-low border border-white/5">
                  <div className="text-xl font-bold text-white">60° Flood</div>
                  <div className="text-xs text-secondary mt-1">Soft portrait illumination</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 8. INTERACTIVE FAQ ACCORDION ─────────────────────────────────── */}
      <section className="w-full bg-surface py-20 border-b border-white/5" id="faq">
        <div className="max-w-[880px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col gap-12">
          
          <div className="text-center flex flex-col gap-2">
            <span className="font-mono text-xs uppercase text-primary tracking-widest font-semibold">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-secondary">
              Everything you need to know about the Xevora G-Flash platform.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-surface-container-low overflow-hidden transition-all border border-white/5"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface-container transition-colors"
                  >
                    <span className="font-semibold text-base sm:text-lg text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform duration-300 shrink-0 ${
                        isOpen ? "rotate-180 text-primary-container" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-secondary leading-relaxed border-t border-white/5 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 9. FINAL CONVERSION CTA BANNER ───────────────────────────────── */}
      <section className="w-full bg-surface-container-lowest py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-container/5 to-transparent pointer-events-none" />
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10 text-center flex flex-col items-center gap-8">
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container text-primary font-mono text-xs uppercase border border-white/5">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-ping" />
            Limited Launch Units Remaining
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white max-w-3xl leading-tight">
            Ready to upgrade your lighting to{" "}
            <span className="text-primary-container drop-shadow-[0_0_24px_rgba(229,26,52,0.45)]">
              cinema standards?
            </span>
          </h2>

          <p className="text-base sm:text-lg text-secondary max-w-xl leading-relaxed">
            Join over 50,000 filmmakers who retired bulky softboxes and flat lights. 30-day studio trial, free insured express shipping.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a
              href="#models"
              className="px-10 py-4 rounded-xl bg-primary-container text-white font-semibold text-sm hover:bg-tertiary-container shadow-[0_0_32px_rgba(229,26,52,0.5)] transition-all flex items-center gap-2 group"
            >
              <span>Claim Your Xevora G-Flash</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            <a
              href="#comparison"
              className="px-8 py-4 rounded-xl bg-surface-container text-white hover:bg-surface-container-high font-semibold text-sm transition-colors border border-white/5"
            >
              View Technical Matrix
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-secondary font-mono text-xs">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              No Risk 30-Day Trial
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              1-Year Warranty
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-primary" />
              24h Express Air Dispatch
            </span>
          </div>

        </div>
      </section>

    </div>
  );
}
