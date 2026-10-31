"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Truck, RotateCcw, Award, ArrowUp, PlayCircle, Camera, MessageSquare, Share2 } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Hide Footer for Admin Portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmail("");
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-surface-container-lowest text-on-surface border-t border-white/5">
      
      {/* 4 Brand Guarantee Ribbons */}
      <div className="w-full bg-surface-container-low border-b border-white/5 py-8">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-white/5">
              <ShieldCheck className="w-6 h-6 text-primary-container" />
            </div>
            <div>
              <div className="font-semibold text-sm text-on-surface">Official Store</div>
              <div className="text-xs text-slate-400">Direct manufacturer guarantee</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-white/5">
              <Truck className="w-6 h-6 text-primary-container" />
            </div>
            <div>
              <div className="font-semibold text-sm text-on-surface">24h Dispatch</div>
              <div className="text-xs text-slate-400">Priority insured express courier</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-white/5">
              <RotateCcw className="w-6 h-6 text-primary-container" />
            </div>
            <div>
              <div className="font-semibold text-sm text-on-surface">Hassle-Free Returns</div>
              <div className="text-xs text-slate-400">30-day studio trial policy</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0 border border-white/5">
              <Award className="w-6 h-6 text-primary-container" />
            </div>
            <div>
              <div className="font-semibold text-sm text-on-surface">1-Year Warranty</div>
              <div className="text-xs text-slate-400">Full replacement coverage</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* Col 1: Brand & Newsletter */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight text-white uppercase">XEVORA</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary text-[10px] font-mono uppercase tracking-wider border border-white/5">
              Optics Lab
            </span>
          </div>
          
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Precision lighting instruments and beam shaping optics engineered for cinematographers, studio creators, and visual architects worldwide.
          </p>

          <div className="flex flex-col gap-2.5 mt-2 max-w-md">
            <span className="text-sm font-semibold text-white">Join the VIP Creator Dispatch</span>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@studio.com"
                className="flex-1 bg-surface-container px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-slate-500 border border-white/5 focus:outline-none focus:border-primary-container transition-colors"
              />
              <button
                type="submit"
                className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-tertiary-container transition-all shadow-[0_0_15px_rgba(229,26,52,0.4)]"
              >
                {subscribed ? "Joined!" : "Subscribe"}
              </button>
            </form>
            <span className="text-[11px] font-mono text-slate-400">
              Firmware releases, optical presets, and private hardware drops.
            </span>
          </div>
        </div>

        {/* Col 2: Instruments */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
            Instruments
          </h3>
          <Link href="/#models" className="text-sm text-slate-400 hover:text-white transition-colors">
            G-Flash 10W RGB
          </Link>
          <Link href="/#models" className="text-sm text-slate-400 hover:text-white transition-colors">
            G-Flash PRO 30W
          </Link>
          <Link href="/#gobo" className="text-sm text-slate-400 hover:text-white transition-colors">
            GOBO Optical Barrels
          </Link>
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">
            20-Disc Stencils
          </Link>
          <Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">
            Diffusion Mounts
          </Link>
        </div>

        {/* Col 3: Ecosystem */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
            Ecosystem
          </h3>
          <Link href="/#comparison" className="text-sm text-slate-400 hover:text-white transition-colors">
            Hardware Matrix
          </Link>
          <Link href="/#reviews" className="text-sm text-slate-400 hover:text-white transition-colors">
            Creator Case Studies
          </Link>
          <Link href="/#faq" className="text-sm text-slate-400 hover:text-white transition-colors">
            Photometric Data & FAQ
          </Link>
          <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
            About Xevora
          </Link>
          <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">
            Warranty Registration
          </Link>
        </div>

        {/* Col 4: Studio Support */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
            Studio Support
          </h3>
          <div className="text-xs text-slate-400">
            HQ: Industrial Optical Park, Sector 4, New Delhi
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Direct Line: +91 (800) 843-9386
          </div>
          <div className="text-xs text-slate-400 font-mono">
            Studio Desk: support@xevoralights.com
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube / Video Reviews"
              className="p-2 rounded-lg bg-surface-container text-slate-400 hover:text-white hover:bg-surface-container-high transition-colors border border-white/5"
            >
              <PlayCircle className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Creator Gallery"
              className="p-2 rounded-lg bg-surface-container text-slate-400 hover:text-white hover:bg-surface-container-high transition-colors border border-white/5"
            >
              <Camera className="w-4 h-4" />
            </a>
            <a
              href="/contact"
              aria-label="Community Forum"
              className="p-2 rounded-lg bg-surface-container text-slate-400 hover:text-white hover:bg-surface-container-high transition-colors border border-white/5"
            >
              <MessageSquare className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Xevora Lights", url: window.location.href });
                }
              }}
              aria-label="Share Xevora Lights"
              className="p-2 rounded-lg bg-surface-container text-slate-400 hover:text-white hover:bg-surface-container-high transition-colors border border-white/5"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleBackToTop}
              title="Back to Top"
              className="p-2 rounded-lg bg-surface-container text-slate-400 hover:text-white hover:bg-surface-container-high transition-colors ml-auto border border-white/5"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Sub-Footer */}
      <div className="w-full bg-surface-container-lowest py-6 border-t border-white/5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} XEVORA Optics Corp. All studio rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="hover:text-white transition-colors">
              Shipping & Duties
            </Link>
            <Link href="/cancellation-returns" className="hover:text-white transition-colors">
              Returns & Compliance
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
