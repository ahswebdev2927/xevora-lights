"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Star, 
  Check, 
  AlertCircle, 
  MessageSquare, 
  Upload, 
  Edit3, 
  X, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  User,
  Phone,
  Filter
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  designation: string | null;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  createdAt?: string | null;
}

interface AdminProductReview {
  id: number;
  productId: number;
  productName: string | null;
  firstImage: string | null;
  userId: number;
  userName: string | null;
  userPhone: string | null;
  userEmail: string | null;
  orderId: number;
  orderTotal: number | null;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();

  // Active top tab: product_reviews or homepage_testimonials
  const [activeTab, setActiveTab] = useState<"product_reviews" | "homepage_testimonials">("product_reviews");

  // Product Reviews State
  const [productReviews, setProductReviews] = useState<AdminProductReview[]>([]);
  const [isLoadingProductReviews, setIsLoadingProductReviews] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Homepage Testimonials State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  // Form State (Homepage Testimonial)
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [designation, setDesignation] = useState("Verified Buyer");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("EXPLORE COLLECTION");
  const [buttonLink, setButtonLink] = useState("/all");

  // Feedback State
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchProductReviews = async () => {
    setIsLoadingProductReviews(true);
    try {
      const res = await fetch("/api/admin/product-reviews");
      const data = await res.json();
      if (data.success) {
        setProductReviews(data.data || []);
      }
    } catch {
      setError("Failed to load customer product reviews.");
    } finally {
      setIsLoadingProductReviews(false);
    }
  };

  const fetchTestimonials = async () => {
    setIsLoadingTestimonials(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
      }
    } catch {
      setError("Failed to load homepage testimonials.");
    } finally {
      setIsLoadingTestimonials(false);
    }
  };

  useEffect(() => {
    fetchProductReviews();
    fetchTestimonials();
  }, []);

  // Product Review Status Toggle (Approve / Reject)
  const handleUpdateProductReviewStatus = async (reviewId: number, newStatus: "approved" | "rejected") => {
    setActionLoadingId(reviewId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/product-reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Review ${newStatus === "approved" ? "approved & published to storefront!" : "marked as rejected."}`);
        setProductReviews((prev) =>
          prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
        );
      } else {
        setError(data.error || "Failed to update review status.");
      }
    } catch {
      setError("An error occurred while updating review status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Product Review Delete
  const handleDeleteProductReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to permanently delete this product review?")) return;

    setActionLoadingId(reviewId);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/product-reviews?id=${reviewId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Product review deleted successfully!");
        setProductReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else {
        setError(data.error || "Failed to delete review.");
      }
    } catch {
      setError("Error deleting review.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Homepage Testimonial Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
        setSuccess("Image uploaded successfully!");
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch {
      setError("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditTestimonial = (review: Review) => {
    setEditingReviewId(review.id);
    setUserName(review.userName);
    setRating(review.rating);
    setComment(review.comment);
    setDesignation(review.designation || "");
    setImageUrl(review.imageUrl || "");
    setButtonText(review.buttonText || "EXPLORE COLLECTION");
    setButtonLink(review.buttonLink || "/all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingReviewId(null);
    setUserName("");
    setRating(5);
    setComment("");
    setDesignation("Verified Buyer");
    setImageUrl("");
    setButtonText("EXPLORE COLLECTION");
    setButtonLink("/all");
    setError("");
    setSuccess("");
  };

  // Homepage Testimonial Submit
  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !comment.trim()) {
      setError("Customer Name and Review Text are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      id: editingReviewId,
      userName: userName.trim(),
      rating,
      comment: comment.trim(),
      designation: designation.trim() || "Verified Buyer",
      imageUrl: imageUrl.trim() || null,
      buttonText: buttonText.trim() || "EXPLORE COLLECTION",
      buttonLink: buttonLink.trim() || "/all",
    };

    try {
      const res = await fetch("/api/admin/reviews", {
        method: editingReviewId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(editingReviewId ? "Review card updated!" : "Review card added successfully!");
        resetForm();
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to save review card.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Homepage Testimonial Delete
  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review card?")) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Review card deleted!");
        fetchTestimonials();
      } else {
        setError(data.error || "Failed to delete review card.");
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  const pendingCount = productReviews.filter((r) => r.status === "pending").length;
  const filteredProductReviews = productReviews.filter((r) => {
    if (statusFilter === "all") return true;
    return r.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#e51a34] text-white rounded-2xl shadow-md shadow-[#e51a34]/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Reviews &amp; Field Validation
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Moderate verified buyer reviews from delivered orders and curate homepage testimonials.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("product_reviews")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "product_reviews"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Product Reviews</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("homepage_testimonials")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "homepage_testimonials"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>Homepage Testimonials ({reviews.length})</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
          <Check size={20} className="shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
          <AlertCircle size={20} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ── TAB 1: PRODUCT REVIEWS (MODERATION QUEUE) ────────────────────── */}
      {activeTab === "product_reviews" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Filter By Status:</span>
              <div className="flex items-center gap-1.5 ml-2">
                {(["all", "pending", "approved", "rejected"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      statusFilter === filter
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {filter === "all" ? `All (${productReviews.length})` : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredProductReviews.length}</strong> reviews
            </div>
          </div>

          {/* List */}
          {isLoadingProductReviews ? (
            <div className="py-24 text-center text-slate-500 flex flex-col items-center">
              <Loader2 className="animate-spin h-8 w-8 mb-3 text-[#e51a34]" />
              <p className="text-sm font-medium">Loading product reviews...</p>
            </div>
          ) : filteredProductReviews.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">No Reviews Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {statusFilter === "pending"
                  ? "No reviews currently waiting for moderation. Great job!"
                  : "Verified buyers can submit reviews once their order status is set to Delivered."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredProductReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between gap-5 relative hover:border-slate-300 transition-all"
                >
                  {/* Top: Product & Status */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 shrink-0">
                          {rev.firstImage ? (
                            <img src={rev.firstImage} alt={rev.productName || "Product"} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{rev.productName || "Product"}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Order #{rev.orderId} • ₹{(rev.orderTotal || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          rev.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : rev.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200 animate-pulse"
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>

                    {/* Reviewer Details */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-900 font-semibold">{rev.userName || "Verified Buyer"}</span>
                      </div>
                      {rev.userPhone && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{rev.userPhone}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating & Content */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= rev.rating ? "fill-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                        <span className="font-mono text-xs font-bold text-slate-700 ml-1.5">
                          {rev.rating}.0 / 5.0
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono ml-auto">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h5 className="font-bold text-sm text-slate-900">{rev.title}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        "{rev.comment}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={actionLoadingId === rev.id}
                      onClick={() => handleDeleteProductReview(rev.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      {rev.status !== "approved" && (
                        <button
                          type="button"
                          disabled={actionLoadingId === rev.id}
                          onClick={() => handleUpdateProductReviewStatus(rev.id, "approved")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === rev.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Approve &amp; Publish</span>
                        </button>
                      )}

                      {rev.status !== "rejected" && (
                        <button
                          type="button"
                          disabled={actionLoadingId === rev.id}
                          onClick={() => handleUpdateProductReviewStatus(rev.id, "rejected")}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: HOMEPAGE TESTIMONIALS (MARKETING CAROUSEL) ────────────── */}
      {activeTab === "homepage_testimonials" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {editingReviewId ? "Edit Testimonial Card" : "Add Homepage Testimonial"}
                </h2>
                {editingReviewId && (
                  <button
                    onClick={resetForm}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X size={14} /> Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                {/* Reviewer Image */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Customer / Creator Photo
                  </label>
                  <div className="space-y-3">
                    {imageUrl && (
                      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                        <img src={imageUrl} alt="Review Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-800 px-4 py-3 rounded-2xl border border-slate-200 text-xs font-bold cursor-pointer transition-colors">
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <span>{isUploading ? "Uploading Image..." : "Upload Photo"}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL (e.g. https://...)"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Customer / Creator Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Marcus Kane / Studio Claire"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Subtext / Designation */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Designation / Kit Owned
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Commercial DP • Pro Master Kit"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Star Rating (1 to 5)
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          size={22}
                          className={star <= rating ? "fill-[#eab308] text-[#eab308]" : "text-slate-200"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Quote / Feedback Text *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder='e.g. "The optical sharpness of the GOBOs is unbelievable. Edge-to-edge clarity with zero chromatic fringing."'
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none leading-relaxed"
                    required
                  />
                </div>

                {/* CTA Button Text & Link */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="EXPLORE COLLECTION"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={buttonLink}
                      onChange={(e) => setButtonLink(e.target.value)}
                      placeholder="/products"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#e51a34] rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-[#e51a34] text-white py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-[#c9142b] transition-all shadow-md shadow-[#e51a34]/20 disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingReviewId ? (
                    <Check size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                  <span>{editingReviewId ? "Update Testimonial Card" : "Add Testimonial Card"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/80">
              <h2 className="text-base font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                Configured Testimonials ({reviews.length})
              </h2>

              {isLoadingTestimonials ? (
                <div className="py-20 text-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#e51a34]" />
                  <p className="text-xs">Loading testimonials...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-200 rounded-3xl text-slate-400">
                  <MessageSquare className="mx-auto mb-3 text-slate-300" size={36} />
                  <p className="text-xs font-bold uppercase tracking-wider">No testimonial cards yet</p>
                  <p className="text-xs mt-1 text-slate-400">Use the form to add your first homepage card.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between relative group hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div>
                        {/* Image Preview */}
                        <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-white border border-slate-200">
                          {review.imageUrl ? (
                            <img src={review.imageUrl} alt={review.userName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                              <ImageIcon size={28} />
                              <span className="text-[9px] font-bold mt-1 uppercase">No photo</span>
                            </div>
                          )}
                        </div>

                        {/* Stars */}
                        <div className="flex items-center justify-center gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? "fill-[#eab308] text-[#eab308]" : "text-slate-200"}
                            />
                          ))}
                        </div>

                        {/* Comment */}
                        <p className="text-xs font-medium text-slate-800 text-center italic leading-snug mb-3">
                          "{review.comment}"
                        </p>

                        {/* Reviewer Name */}
                        <p className="text-xs font-extrabold text-slate-900 text-center uppercase tracking-wide">
                          - {review.userName}
                        </p>

                        {review.designation && review.designation !== review.userName && (
                          <p className="text-[10px] font-semibold text-slate-500 text-center uppercase tracking-wider mt-0.5">
                            {review.designation}
                          </p>
                        )}
                      </div>

                      {/* Button & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col space-y-2">
                        <div className="w-full py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg text-center shadow-xs">
                          {review.buttonText || "EXPLORE COLLECTION"}
                        </div>
                        <div className="flex items-center justify-end space-x-2 pt-1">
                          <button
                            onClick={() => handleEditTestimonial(review)}
                            className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            title="Edit Card"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(review.id)}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all border border-rose-200 cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
