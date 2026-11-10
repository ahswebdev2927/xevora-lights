"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Loader2, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Megaphone, 
  Video, 
  ImageIcon, 
  Layers, 
  ExternalLink 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { isVideoUrl } from "@/utils/product";

interface Offer {
  id: number;
  text: string;
  link: string | null;
  order: number;
}

export default function SettingsPage() {
  const router = useRouter();

  // Hero Card State
  const [heroMediaUrl, setHeroMediaUrl] = useState("/images/landing/hero-gflash.jpg");
  const [heroTag1, setHeroTag1] = useState("TYPE-C FAST CHARGING");
  const [heroTag2, setHeroTag2] = useState("CNC AEROSPACE CHASSIS");
  const [isUploadingHeroMedia, setIsUploadingHeroMedia] = useState(false);

  // Offers (Top Ticker) State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOfferText, setNewOfferText] = useState("");
  const [newOfferSubtext, setNewOfferSubtext] = useState("");
  const [newOfferLink, setNewOfferLink] = useState("");

  // Loading & Feedback State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingHero, setIsSubmittingHero] = useState(false);
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      // 1. Fetch Hero Media & Badges
      const resHero = await fetch("/api/admin/settings?key=hero_media");
      const dataHero = await resHero.json();
      if (dataHero.success && dataHero.data?.value) {
        try {
          const parsed = JSON.parse(dataHero.data.value);
          if (parsed.mediaUrl) setHeroMediaUrl(parsed.mediaUrl);
          if (parsed.tag1 !== undefined) setHeroTag1(parsed.tag1);
          if (parsed.tag2 !== undefined) setHeroTag2(parsed.tag2);
        } catch {
          if (typeof dataHero.data.value === "string") {
            setHeroMediaUrl(dataHero.data.value);
          }
        }
      }

      // 2. Fetch Offer Ticker Announcements
      const resOffers = await fetch("/api/admin/offers");
      const dataOffers = await resOffers.json();
      if (dataOffers.success) {
        setOffers(dataOffers.data);
      }

      if (resHero.status === 401 || resOffers.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      setError("Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  // Upload hero media directly (Image or Video)
  const handleHeroMediaUpload = async (file: File) => {
    setError("");
    setSuccess("Uploading media to Cloudinary, please wait...");
    setIsUploadingHeroMedia(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setHeroMediaUrl(data.url);
        setSuccess("Media uploaded successfully!");
      } else {
        setSuccess("");
        setError(data.error || "Failed to upload file.");
      }
    } catch {
      setSuccess("");
      setError("An error occurred during file upload.");
    } finally {
      setIsUploadingHeroMedia(false);
    }
  };

  // Save Hero Card settings
  const handleSaveHeroMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHero(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "hero_media",
          value: JSON.stringify({
            mediaUrl: heroMediaUrl.trim(),
            tag1: heroTag1.trim(),
            tag2: heroTag2.trim(),
          }),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Homepage Hero media & callout tags updated successfully!");
        router.refresh();
      } else {
        setError(data.error || "Failed to save hero settings.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // Add Announcement Offer
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferText.trim()) return;

    setIsSubmittingOffer(true);
    setError("");
    setSuccess("");

    const combinedText = newOfferSubtext.trim()
      ? `${newOfferText.trim()} | ${newOfferSubtext.trim()}`
      : newOfferText.trim();

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: combinedText,
          link: newOfferLink || null,
          order: offers.length,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Offer banner added successfully!");
        setNewOfferText("");
        setNewOfferSubtext("");
        setNewOfferLink("");
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to add offer.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  // Delete Announcement Offer
  const handleDeleteOffer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this offer announcement?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Offer announcement deleted successfully!");
        fetchData();
        router.refresh();
      } else {
        setError(data.error || "Failed to delete offer.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#e51a34] animate-spin" />
      </div>
    );
  }

  const isCurrentMediaVideo = isVideoUrl(heroMediaUrl);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="text-center sm:text-left flex flex-col items-center sm:items-start">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Site Settings</h1>
        <p className="mt-1 text-slate-500 font-medium tracking-tight flex items-center">
          <Sparkles size={16} className="text-[#e51a34] mr-2 shrink-0" />
          Customize the homepage hero section media, badges, and top announcement offers.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center space-x-3 text-emerald-700 animate-in fade-in">
          <Check size={20} className="shrink-0 text-emerald-600" />
          <span className="text-sm font-semibold">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-xl flex items-center space-x-3 text-rose-700 animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* ── 1. Homepage Hero Media & Badges ──────────────────────── */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Homepage Hero Card Media</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#e51a34] border border-rose-200/60">
                  Hero Section
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure the showcase image or video that appears prominently inside the Hero Spec Card on the storefront homepage.
              </p>
            </div>

            <form onSubmit={handleSaveHeroMedia} className="space-y-6">
              {/* Media URL Input & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Hero Image / Video URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={heroMediaUrl}
                      onChange={(e) => setHeroMediaUrl(e.target.value)}
                      placeholder="e.g. /images/landing/hero-gflash.jpg or Cloudinary MP4 video URL"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                      required
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors shrink-0">
                    {isUploadingHeroMedia ? (
                      <Loader2 size={16} className="animate-spin text-[#e51a34]" />
                    ) : (
                      <Upload size={16} />
                    )}
                    <span>{isUploadingHeroMedia ? "Uploading..." : "Upload Media"}</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      disabled={isUploadingHeroMedia}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleHeroMediaUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-slate-400">
                  Supports video formats (<strong>.mp4</strong>, <strong>.webm</strong>, Cloudinary video) or high-res images (<strong>.jpg</strong>, <strong>.png</strong>, <strong>.webp</strong>).
                </p>
              </div>

              {/* Callout Tag 1 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Top-Left Callout Tag</span>
                  <span className="text-[10px] text-slate-400 font-normal">Pulsating Indicator</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#e51a34] animate-pulse" />
                  <input
                    type="text"
                    value={heroTag1}
                    onChange={(e) => setHeroTag1(e.target.value)}
                    placeholder="e.g. TYPE-C FAST CHARGING"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  />
                </div>
              </div>

              {/* Callout Tag 2 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Bottom-Right Callout Tag</span>
                  <span className="text-[10px] text-slate-400 font-normal">Chassis / Spec Badge</span>
                </label>
                <div className="relative">
                  <Layers size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={heroTag2}
                    onChange={(e) => setHeroTag2(e.target.value)}
                    placeholder="e.g. CNC AEROSPACE CHASSIS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingHero}
                  className="inline-flex items-center gap-2 bg-[#e51a34] hover:bg-[#d0152d] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#e51a34]/20 transition-all disabled:opacity-50"
                >
                  {isSubmittingHero ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>{isSubmittingHero ? "Saving..." : "Save Hero Settings"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* ── 2. Top Bar Announcement Carousel ──────────────────────── */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Megaphone size={18} className="text-[#e51a34]" />
                <span>Offer Announcement Carousel</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage the promotional ticker lines that rotate across the top announcement bar of your storefront.
              </p>
            </div>

            {/* Add Offer Form */}
            <form onSubmit={handleAddOffer} className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Announcement Headline *
                  </label>
                  <input
                    type="text"
                    value={newOfferText}
                    onChange={(e) => setNewOfferText(e.target.value)}
                    placeholder="e.g. ⚡ Introducing Xevora G-Flash"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Offer Details / Subtext (Optional)
                  </label>
                  <input
                    type="text"
                    value={newOfferSubtext}
                    onChange={(e) => setNewOfferSubtext(e.target.value)}
                    placeholder="e.g. Special Launch Price + Free Shipping"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Target Link (Optional)
                </label>
                <input
                  type="text"
                  value={newOfferLink}
                  onChange={(e) => setNewOfferLink(e.target.value)}
                  placeholder="e.g. /product/14 or /contact"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmittingOffer ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>Add Announcement</span>
                </button>
              </div>
            </form>

            {/* List of Current Offers */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Active Announcements ({offers.length})
              </h3>
              {offers.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">
                  No announcement banners currently configured.
                </p>
              ) : (
                offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition-colors group"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {offer.text}
                      </p>
                      {offer.link && (
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <ExternalLink size={10} />
                          <span className="truncate">{offer.link}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Offer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 sticky top-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Storefront Hero Card Preview
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {isCurrentMediaVideo ? (
                <>
                  <Video size={12} className="text-[#e51a34]" />
                  <span>Video Media</span>
                </>
              ) : (
                <>
                  <ImageIcon size={12} className="text-blue-500" />
                  <span>Image Media</span>
                </>
              )}
            </span>
          </div>

          {/* Simulated Dark Storefront Container */}
          <div className="p-4 bg-[#0a0a0e] rounded-3xl border border-white/10 shadow-2xl space-y-3">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-2">
              Xevora Optics Storefront Hero Card
            </div>

            {/* Spec Card identical to Homepage */}
            <div className="relative rounded-2xl bg-[#13141a] overflow-hidden shadow-2xl border border-white/10 group">
              <div className="relative h-80 w-full overflow-hidden bg-black/40">
                {isCurrentMediaVideo ? (
                  <video
                    key={heroMediaUrl}
                    src={heroMediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <img
                    src={heroMediaUrl || "/images/landing/hero-gflash.jpg"}
                    alt="Hero Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/landing/hero-gflash.jpg";
                    }}
                  />
                )}

                {/* Floating Callout Tag 1 */}
                {heroTag1 && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded bg-[#0e0e12]/80 backdrop-blur-md flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-[#e51a34] animate-pulse" />
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">
                      {heroTag1}
                    </span>
                  </div>
                )}

                {/* Floating Callout Tag 2 */}
                {heroTag2 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded bg-[#0e0e12]/80 backdrop-blur-md flex items-center gap-1.5 border border-white/10">
                    <Layers className="w-3.5 h-3.5 text-[#e51a34]" />
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">
                      {heroTag2}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Bottom Specs Ribbon */}
              <div className="p-5 bg-[#171821] flex items-center justify-between border-t border-white/5">
                <div>
                  <div className="font-bold text-sm text-white">G-Flash Series</div>
                  <div className="text-[11px] text-slate-400">Pocket-Size Handheld Optical Projector</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[9px] text-[#e51a34] uppercase font-bold tracking-wider">
                    Starting From
                  </div>
                  <div className="font-bold text-base text-white">
                    ₹4,999 <span className="text-[10px] text-slate-500 line-through ml-1">₹7,999</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center px-2 py-1">
              ✨ Updates saved here will instantly reflect on your live homepage hero section.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
