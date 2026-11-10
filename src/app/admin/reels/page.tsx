"use client";

import { useState, useEffect } from "react";
import { 
  Video, 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  Check, 
  AlertCircle, 
  Loader2, 
  X, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Volume2
} from "lucide-react";
import { isVideoUrl } from "@/utils/product";

interface ProductOption {
  id: number;
  name: string;
  basePrice: number;
  salePrice: number | null;
  images: string[];
}

interface ReelItem {
  id: number;
  title: string;
  creatorHandle: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  productId: number | null;
  badgeText: string;
  viewsCount: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  product?: {
    id: number;
    name: string;
    basePrice: number;
    salePrice: number | null;
    images: string[];
  } | null;
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReel, setEditingReel] = useState<ReelItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formCreatorHandle, setFormCreatorHandle] = useState("@creator");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formProductId, setFormProductId] = useState<number | "">("");
  const [formBadgeText, setFormBadgeText] = useState("PRO IN ACTION");
  const [formViewsCount, setFormViewsCount] = useState("2.5M");
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Feedback states
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Reels
      const resReels = await fetch("/api/admin/reels");
      const dataReels = await resReels.json();
      if (dataReels.success) {
        setReels(dataReels.data || []);
      }

      // Fetch Products for Link Dropdown
      const resProducts = await fetch("/api/products");
      const dataProducts = await resProducts.json();
      if (dataProducts.success) {
        setProducts(dataProducts.data || []);
      }
    } catch (err) {
      setError("Failed to load reels data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingReel(null);
    setFormTitle("");
    setFormCreatorHandle("@creator");
    setFormVideoUrl("");
    setFormThumbnailUrl("");
    setFormProductId("");
    setFormBadgeText("PRO IN ACTION");
    setFormViewsCount("2.5M");
    setFormDisplayOrder(reels.length + 1);
    setFormIsActive(true);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (reel: ReelItem) => {
    setEditingReel(reel);
    setFormTitle(reel.title || "");
    setFormCreatorHandle(reel.creatorHandle || "@creator");
    setFormVideoUrl(reel.videoUrl || "");
    setFormThumbnailUrl(reel.thumbnailUrl || "");
    setFormProductId(reel.productId || "");
    setFormBadgeText(reel.badgeText || "PRO IN ACTION");
    setFormViewsCount(reel.viewsCount || "2.5M");
    setFormDisplayOrder(reel.displayOrder || 0);
    setFormIsActive(reel.isActive);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (file: File, type: "video" | "thumb") => {
    if (type === "video") setIsUploadingVideo(true);
    if (type === "thumb") setIsUploadingThumb(true);
    setError("");
    setSuccess(`Uploading ${type === "video" ? "video" : "poster thumbnail"}... please wait`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        if (type === "video") setFormVideoUrl(data.url);
        if (type === "thumb") setFormThumbnailUrl(data.url);
        setSuccess(`${type === "video" ? "Video" : "Thumbnail"} uploaded successfully!`);
      } else {
        setSuccess("");
        setError(data.error || "Upload failed.");
      }
    } catch {
      setSuccess("");
      setError("Error uploading file.");
    } finally {
      setIsUploadingVideo(false);
      setIsUploadingThumb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formVideoUrl.trim()) {
      setError("Title and Video URL are required.");
      return;
    }

    const activeCount = reels.filter(r => r.isActive).length;
    if (formIsActive && (!editingReel || !editingReel.isActive) && activeCount >= 10) {
      setError("Maximum of 10 active reels can be displayed on the storefront. Please deactivate an existing reel first.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      id: editingReel?.id,
      title: formTitle.trim(),
      creatorHandle: formCreatorHandle.trim(),
      videoUrl: formVideoUrl.trim(),
      thumbnailUrl: formThumbnailUrl ? formThumbnailUrl.trim() : null,
      productId: formProductId === "" ? null : Number(formProductId),
      badgeText: formBadgeText.trim(),
      viewsCount: formViewsCount.trim(),
      displayOrder: Number(formDisplayOrder) || 0,
      isActive: formIsActive,
    };

    try {
      const method = editingReel ? "PUT" : "POST";
      const res = await fetch("/api/admin/reels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingReel ? "Reel updated successfully!" : "Reel added successfully!");
        setIsModalOpen(false);
        fetchData();
      } else {
        setError(data.error || "Operation failed.");
      }
    } catch {
      setError("An error occurred while saving the reel.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;

    try {
      const res = await fetch(`/api/admin/reels?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setReels(reels.filter(r => r.id !== id));
        setSuccess("Reel deleted successfully!");
      } else {
        setError(data.error || "Failed to delete reel.");
      }
    } catch {
      setError("Error deleting reel.");
    }
  };

  const handleToggleStatus = async (reel: ReelItem) => {
    const updatedStatus = !reel.isActive;
    if (updatedStatus && reels.filter((r) => r.isActive).length >= 10) {
      alert("Maximum 10 active reels allowed on the storefront. Please deactivate another reel first.");
      return;
    }
    try {
      const res = await fetch("/api/admin/reels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...reel, isActive: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setReels(reels.map((r) => (r.id === reel.id ? { ...r, isActive: updatedStatus } : r)));
      }
    } catch (err) {
      console.error("Toggle error", err);
    }
  };

  const activeReelsCount = reels.filter((r) => r.isActive).length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#e51a34] text-white rounded-2xl shadow-md shadow-[#e51a34]/20">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                In the Wild — Watch It In Action
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Manage video reels and raw camera footage showcasing Xevora spotlights on your homepage.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                activeReelsCount >= 10 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span>
              Active Reels: <strong className="text-slate-900">{activeReelsCount}</strong> / 10
            </span>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#e51a34] hover:bg-[#c9142b] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#e51a34]/20 cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add New Reel</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
          <Check size={20} className="shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="py-24 text-center text-slate-500 flex flex-col items-center">
          <Loader2 className="animate-spin h-8 w-8 mb-3 text-[#e51a34]" />
          <p className="text-sm font-medium">Loading reels...</p>
        </div>
      ) : reels.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <Video className="mx-auto h-12 w-12 text-slate-400 mb-4 animate-bounce" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Video Reels Yet</h3>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Create video reels to showcase Xevora spotlight setups, GOBO projections, and creator reviews right on your homepage.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-[#e51a34] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#c9142b] transition-all cursor-pointer shadow-md"
          >
            Create First Reel
          </button>
        </div>
      ) : (
        /* Reels Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {reels.map((reel) => {
            const linkedProduct = reel.product;
            const productImage = linkedProduct?.images?.[0] || "/images/placeholder.png";
            const isVideo = isVideoUrl(reel.videoUrl);

            return (
              <div
                key={reel.id}
                className={`relative bg-[#0d0e12] border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                  reel.isActive ? "border-white/10" : "border-white/5 opacity-50"
                }`}
              >
                {/* 9:16 Video / Thumbnail Preview Header */}
                <div className="relative aspect-[9/16] w-full bg-black/60 overflow-hidden group">
                  {isVideo ? (
                    <video
                      src={reel.videoUrl}
                      poster={reel.thumbnailUrl || undefined}
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={reel.thumbnailUrl || "/images/landing/reel-1.jpg"}
                      alt={reel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/landing/reel-1.jpg";
                      }}
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 bg-black/80 backdrop-blur-md text-white font-mono text-[9px] font-semibold uppercase tracking-wider rounded border border-white/10">
                      {reel.badgeText}
                    </span>
                    <span className="p-1 rounded-full bg-black/50 backdrop-blur-md text-white/80">
                      <Volume2 size={12} />
                    </span>
                  </div>

                  {/* Bottom Info on Card */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="font-bold text-xs text-white truncate drop-shadow">
                      {reel.title}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-300 truncate mt-0.5">
                      {reel.creatorHandle || "@creator"}
                    </p>

                    {/* Linked Product Preview Pill */}
                    {linkedProduct && (
                      <div className="mt-2 bg-black/70 backdrop-blur-md rounded-lg p-1.5 border border-white/10 flex items-center gap-2">
                        <img
                          src={productImage}
                          alt={linkedProduct.name}
                          className="w-6 h-6 rounded object-cover flex-shrink-0 bg-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-bold text-white truncate">
                            {linkedProduct.name}
                          </p>
                          <p className="text-[8px] font-mono text-[#e51a34]">
                            ₹{linkedProduct.salePrice || linkedProduct.basePrice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls & Actions */}
                <div className="p-3 bg-[#13141b] border-t border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Pos #{reel.displayOrder}</span>
                    <button
                      onClick={() => handleToggleStatus(reel)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                        reel.isActive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-700/40 text-slate-400 border border-slate-600/30"
                      }`}
                    >
                      {reel.isActive ? "Active" : "Hidden"}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1 border-t border-white/5">
                    <button
                      onClick={() => handleOpenEditModal(reel)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Edit Reel"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(reel.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete Reel"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Reel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingReel ? "Edit Video Reel" : "Add New Video Reel"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set video footage, creator handle, and badge tags for the homepage.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reel Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Dramatic Rim Light or RGB Mood Shifter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  required
                />
              </div>

              {/* Creator Handle & Badge Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Creator Handle *
                  </label>
                  <input
                    type="text"
                    value={formCreatorHandle}
                    onChange={(e) => setFormCreatorHandle(e.target.value)}
                    placeholder="e.g. @filmmaker_sam"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Badge Tag (Top-Left)
                  </label>
                  <input
                    type="text"
                    value={formBadgeText}
                    onChange={(e) => setFormBadgeText(e.target.value)}
                    placeholder="e.g. PRO IN ACTION, GOBO EFFECTS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  />
                </div>
              </div>

              {/* Video URL & Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Video URL (MP4 / WebM / Cloudinary) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="e.g. /videos/reels/reel-1.mp4 or Cloudinary URL"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                    required
                  />
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors shrink-0">
                    {isUploadingVideo ? <Loader2 size={14} className="animate-spin text-[#e51a34]" /> : <Upload size={14} />}
                    <span>{isUploadingVideo ? "Uploading..." : "Upload Video"}</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={isUploadingVideo}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "video");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Poster Thumbnail URL & Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Poster Thumbnail URL (Image)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                    placeholder="e.g. /images/landing/reel-1.jpg"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors shrink-0">
                    {isUploadingThumb ? <Loader2 size={14} className="animate-spin text-[#e51a34]" /> : <Upload size={14} />}
                    <span>{isUploadingThumb ? "Uploading..." : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingThumb}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "thumb");
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Linked Product & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Link Product (Optional)
                  </label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  >
                    <option value="">No linked product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.salePrice || p.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#e51a34]/20 focus:border-[#e51a34]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-[#e51a34] focus:ring-[#e51a34] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="formIsActive" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Visible on Homepage (Active)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#e51a34] hover:bg-[#c9142b] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-[#e51a34]/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingReel ? "Update Reel" : "Save Reel"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
