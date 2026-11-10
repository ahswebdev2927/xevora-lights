"use client";

import React, { useEffect, useState, Suspense } from "react";
import { ShoppingBag, Loader2, Package, CheckCircle2, Clock, Ruler, XCircle, AlertTriangle, Image as ImageIcon, MapPin, Check, X, Star, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productCategory: string | null;
  variationSku: string | null;
  quantity: number;
  price: number;
  size: string;
  color: string;
  customizations: {
    type: string;
    measurements: Record<string, string>;
  } | null;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string | null;
  createdAt: string;
  couponCode: string | null;
  discountAmount: number | null;
  couponTargetType: string | null;
  couponTargetValue: string | null;
  items: OrderItem[];
  courierServiceName?: string | null;
  courierId?: string | null;
  trackingNumber?: string | null;
  trackingLink?: string | null;
  estimatedDeliveryDate?: string | null;
  shippingNotes?: string | null;
  cancellationReason?: string | null;
}

const isProductCouponMatch = (item: OrderItem, couponCode: string | null, targetType: string | null, targetValue: string | null) => {
  if (!couponCode || !targetType || !targetValue) return false;
  if (targetType === "all" || targetType === "first_order") return false;
  
  const targetCriteria = targetValue
    .toLowerCase()
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);
    
  const prodIdStr = item.productId.toString();
  const prodCategory = (item.productCategory || "").toLowerCase().trim();
  const varSku = (item.variationSku || "").toLowerCase().trim();
  
  return targetCriteria.some(criterion => 
    criterion === prodIdStr || 
    prodCategory === criterion || 
    prodCategory.includes(criterion) || 
    varSku === criterion
  );
};

const parseAddress = (addrString: string | null) => {
  if (!addrString) return null;

  const getSubstringBetween = (str: string, startKey: string, endKey: string | null) => {
    const startIndex = str.indexOf(startKey);
    if (startIndex === -1) return "";
    const startValIndex = startIndex + startKey.length;
    if (!endKey) {
      return str.slice(startValIndex).trim();
    }
    const endIndex = str.indexOf(endKey);
    if (endIndex === -1 || endIndex < startValIndex) {
      return str.slice(startValIndex).trim();
    }
    
    let res = str.slice(startValIndex, endIndex).trim();
    if (res.endsWith(",")) {
      res = res.slice(0, -1).trim();
    }
    return res;
  };

  const hasKeys = ["Name:", "Street:", "City:", "State:", "Pincode:", "Contact:"].every(k => addrString.includes(k));
  
  if (hasKeys) {
    return {
      name: getSubstringBetween(addrString, "Name:", "Street:"),
      street: getSubstringBetween(addrString, "Street:", "City:"),
      city: getSubstringBetween(addrString, "City:", "State:"),
      state: getSubstringBetween(addrString, "State:", "Pincode:"),
      pincode: getSubstringBetween(addrString, "Pincode:", "Contact:"),
      contact: getSubstringBetween(addrString, "Contact:", null),
    };
  }
  
  return null;
};

interface UserReview {
  id: number;
  productId: number;
  orderId: number;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const MILESTONES = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered"
];

function MyOrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [confirmingCancelId, setConfirmingCancelId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const searchParams = useSearchParams();

  // Review states
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    orderId: number;
    item: OrderItem;
  } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const fetchUserReviews = async () => {
    try {
      const res = await fetch("/api/reviews/user");
      const data = await res.json();
      if (data.success) {
        setUserReviews(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch user reviews", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchUserReviews();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const orderId = searchParams.get("orderId");
    if (paymentStatus === "success") {
      useCartStore.getState().clearCart();
      setSuccessBanner(
        orderId
          ? `Payment successful! Order #${orderId} has been placed successfully via PhonePe.`
          : "Payment successful! Your order has been placed successfully via PhonePe."
      );
    }
  }, [searchParams]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/profile/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCancelOrder = async (orderId: number) => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/profile/orders/${orderId}/cancel`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (data.success) {
        showToast("Order cancelled successfully");
        fetchOrders();
      } else {
        showToast(data.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Cancellation error:", error);
      showToast("Something went wrong");
    } finally {
      setIsCancelling(false);
      setConfirmingCancelId(null);
    }
  };

  const handleOpenReviewModal = (orderId: number, item: OrderItem) => {
    setSelectedReviewItem({ orderId, item });
    setReviewError("");

    // Check if user already submitted review for this item in this order
    const existing = userReviews.find((r) => r.orderId === orderId && r.productId === item.productId);
    if (existing) {
      setReviewRating(existing.rating || 5);
      setReviewTitle(existing.title || "");
      setReviewComment(existing.comment || "");
    } else {
      setReviewRating(5);
      setReviewTitle("");
      setReviewComment("");
    }
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReviewItem) return;

    if (!reviewTitle.trim() || reviewTitle.trim().length < 3) {
      setReviewError("Please provide a headline of at least 3 characters.");
      return;
    }
    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError("Please provide feedback of at least 5 characters.");
      return;
    }

    setIsSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedReviewItem.orderId,
          productId: selectedReviewItem.item.productId,
          rating: reviewRating,
          title: reviewTitle.trim(),
          comment: reviewComment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Review submitted! Pending approval by admin.");
        setIsReviewModalOpen(false);
        fetchUserReviews();
      } else {
        setReviewError(data.error || "Failed to submit review.");
      }
    } catch (err) {
      setReviewError("An error occurred while submitting review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00e5ff] animate-spin mb-4" />
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
      {successBanner && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-emerald-600" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Order Confirmed</h4>
              <p className="text-xs font-medium mt-0.5">{successBanner}</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-playfair font-bold text-white mb-2">My Orders</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Track your orders</p>
        </div>
        <Link href="/" className="p-3 rounded-full bg-[#0d0f17]/[0.02] text-white hover:bg-brand/10 transition-all border border-white/10">
          <ShoppingBag size={20} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#0d0f17] rounded-[2.5rem] p-20 shadow-sm border border-white/10 text-center">
          <div className="w-20 h-20 bg-[#0d0f17]/[0.02] rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-white/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
          <p className="text-white/60 text-sm mb-10 max-w-xs mx-auto">Your customized collection will appear here once you place your first order.</p>
          <Link href="/" className="inline-block bg-brand text-white px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-hover shadow-lg">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const hasBespokeItems = order.items.some(
              (item) =>
                item.customizations &&
                item.customizations.measurements &&
                Object.keys(item.customizations.measurements).length > 0
            );

            return (
              <div key={order.id} className="bg-[#0d0f17] rounded-[2rem] border border-white/10 shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-4 md:p-6 bg-[#12151f] flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 gap-4 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-[#0d0f17]/10 backdrop-blur-md border border-white/10 rounded-xl text-white group-hover:scale-110 transition-transform">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-0.5">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Order ID</p>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-2 py-0.5 bg-[#0d0f17]/5 rounded-full border border-white/5">#AS-{order.id}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white leading-tight">
                        Dry Fish Basket Order
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-4 md:gap-8">
                    <div className="flex flex-col justify-center min-w-[100px]">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Status</p>
                      <div className="flex items-center h-6">
                        <span className={`inline-flex items-center px-3 py-0 h-6 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm border ${
                          order.status?.toLowerCase() === 'delivered' ? 'bg-green-600 text-white border-transparent' : 
                          order.status?.toLowerCase() === 'cancelled' ? 'bg-red-600 text-white border-transparent' : 
                          'bg-[#00e5ff] text-[#3b2314] border-transparent font-black'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center min-w-[80px]">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Date</p>
                      <div className="flex items-center h-6">
                        <span className="text-[10px] font-bold text-white">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center text-right min-w-[80px]">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Total</p>
                      <div className="flex items-center justify-end h-6">
                        <span className="text-lg font-black text-white tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {order.status?.toLowerCase() !== "cancelled" && order.status?.toLowerCase() !== "payment_pending" && (
                  <div className="px-6 md:px-24 lg:px-32 pb-8 pt-4">
                    {/* Horizontal Stepper for Desktop */}
                    <div className="hidden md:block relative">
                      {/* Background Line */}
                      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-brand/10 -translate-y-1/2 rounded-full" />
                      
                      {/* Active Progress Line */}
                      {(() => {
                        const getMilestoneIndex = (status: string) => {
                          const s = status?.toLowerCase() || "";
                          if (s === "confirmed") return 0;
                          if (s === "processing" || s === "ready to ship") return 1;
                          if (s === "shipped") return 2;
                          if (s === "delivered") return 3;
                          return -1;
                        };
                        const milestoneIndex = getMilestoneIndex(order.status);
                        return (
                          <div 
                            className="absolute top-1/2 left-0 h-[2px] bg-[#00e5ff] -translate-y-1/2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(197,160,89,0.4)]" 
                            style={{ 
                              width: `${milestoneIndex === -1 ? 0 : (milestoneIndex / (MILESTONES.length - 1)) * 100}%` 
                            }} 
                          />
                        );
                      })()}

                      {/* Milestone Dots */}
                      <div className="relative flex justify-between">
                        {MILESTONES.map((m, idx) => {
                          const getMilestoneIndex = (status: string) => {
                            const s = status?.toLowerCase() || "";
                            if (s === "confirmed") return 0;
                            if (s === "processing" || s === "ready to ship") return 1;
                            if (s === "shipped") return 2;
                            if (s === "delivered") return 3;
                            return -1;
                          };
                          const milestoneIndex = getMilestoneIndex(order.status);
                          const isCompleted = milestoneIndex >= idx;
                          const isCurrent = order.status?.toLowerCase() === m.toLowerCase();
                          return (
                            <div key={m} className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full border-2 transition-all duration-500 ${
                                isCompleted 
                                  ? "bg-[#00e5ff] border-[#00e5ff] scale-150" 
                                  : "bg-[#0d0f17] border-brand/20"
                              } ${isCurrent ? "animate-pulse ring-4 ring-[#00e5ff]/20" : ""}`} />
                              <span className={`absolute mt-6 text-[10px] font-bold uppercase tracking-[0.15em] text-center whitespace-nowrap transition-colors duration-500 ${
                                isCompleted ? "text-white" : "text-white/20"
                              }`}>
                                {m}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vertical Stepper for Mobile */}
                    <div className="md:hidden space-y-0 pl-2">
                      {MILESTONES.map((m, idx) => {
                        const getMilestoneIndex = (status: string) => {
                          const s = status?.toLowerCase() || "";
                          if (s === "confirmed") return 0;
                          if (s === "processing" || s === "ready to ship") return 1;
                          if (s === "shipped") return 2;
                          if (s === "delivered") return 3;
                          return -1;
                        };
                        const milestoneIndex = getMilestoneIndex(order.status);
                        const isCompleted = milestoneIndex >= idx;
                        const isCurrent = order.status?.toLowerCase() === m.toLowerCase();
                        const isLast = idx === MILESTONES.length - 1;
                        const isLineActive = milestoneIndex > idx;

                        return (
                          <div key={m} className="flex items-start space-x-4 relative pb-6 last:pb-0">
                            {/* Vertical Line Connector */}
                            {!isLast && (
                              <div className={`absolute left-[7px] top-4 bottom-0 w-[1.5px] transition-colors duration-500 ${
                                isLineActive ? "bg-[#00e5ff]" : "bg-brand/10"
                              }`} />
                            )}
                            
                            {/* Milestone Circle */}
                            <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-[#0d0f17] z-10 transition-all duration-500 ${
                              isCompleted 
                                ? "border-[#00e5ff] bg-[#00e5ff]" 
                                : "border-brand/20"
                            } ${isCurrent ? "ring-4 ring-[#00e5ff]/20 animate-pulse" : ""}`}>
                              <div className={`w-1 h-1 rounded-full ${isCompleted ? "bg-[#0d0f17]" : "bg-transparent"}`} />
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500 -mt-[1px] ${
                              isCurrent ? "text-[#00e5ff]" : isCompleted ? "text-white" : "text-white/25"
                            }`}>
                              {m}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.status?.toLowerCase() === "cancelled" && order.cancellationReason && (
                  <div className="mx-6 md:mx-8 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 animate-in fade-in">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Cancellation Reason</h5>
                      <p className="text-xs font-semibold leading-relaxed">{order.cancellationReason}</p>
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Product Details & Coupon Applied */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="space-y-6">
                        {order.items.map((item) => {
                          const isBespoke = item.customizations && item.customizations.measurements && Object.keys(item.customizations.measurements).length > 0;
                          const isProductCoupon = isProductCouponMatch(item, order.couponCode, order.couponTargetType, order.couponTargetValue);
                          const isDelivered = order.status?.toLowerCase() === "delivered";
                          const itemReview = userReviews.find(
                            (r) => r.orderId === order.id && r.productId === item.productId
                          );

                          return (
                            <div key={item.id} className="flex flex-row gap-6 items-start pb-6 border-b border-white/10 last:border-0 last:pb-0">
                              <div className="w-24 h-32 bg-[#0d0f17]/[0.02] rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-sm relative group/img">
                                {item.productImage ? (
                                  <img 
                                    src={item.productImage} 
                                    alt={item.productName} 
                                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "";
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <ImageIcon size={24} />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center text-white/10 -z-10 bg-[#0d0f17]/[0.02]">
                                  <ImageIcon size={24} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col mb-1">
                                  <h5 className="text-base font-bold text-white">{item.productName}</h5>
                                </div>

                                <div className="flex items-center space-x-3 mb-4 mt-2">
                                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Size: {item.size}</span>
                                  <div className="w-1.5 h-1.5 rounded-full bg-brand/10"></div>
                                  <span className="text-xs font-medium text-white/40 uppercase tracking-widest">Qty: {item.quantity}</span>
                                </div>
                                
                                {isBespoke && (
                                  <div className="bg-[#0d0f17]/[0.02] rounded-2xl p-4 border border-white/10 mb-4">
                                    <div className="flex items-center space-x-2 mb-3">
                                      <Ruler size={12} className="text-[#00e5ff]" />
                                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Your Custom Fit (Inches)</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      {Object.entries(item.customizations!.measurements).map(([key, val]) => (
                                        <div key={key}>
                                          <p className="text-[8px] font-bold text-white/40 uppercase tracking-tighter mb-0.5">{key}</p>
                                          <p className="text-[10px] font-black text-white">{val}"</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Product-specific Coupon Badge */}
                                {isProductCoupon && (
                                  <div className="flex items-center space-x-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-xl w-fit mt-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest">🏷️ Coupon Claimed: {order.couponCode}</span>
                                  </div>
                                )}

                                {/* Verified Buyer Review Action / Status */}
                                {isDelivered && (
                                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
                                    {itemReview ? (
                                      itemReview.status === "approved" ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Verified Review Published (★ {itemReview.rating})</span>
                                        </div>
                                      ) : itemReview.status === "rejected" ? (
                                        <div className="inline-flex items-center gap-2">
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                                            <XCircle className="w-3.5 h-3.5" />
                                            <span>Review Needs Changes</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenReviewModal(order.id, item)}
                                            className="text-[11px] font-bold text-white/60 hover:text-white underline cursor-pointer"
                                          >
                                            Update Review
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="inline-flex items-center gap-2">
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Pending Moderation (★ {itemReview.rating})</span>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenReviewModal(order.id, item)}
                                            className="text-[11px] font-bold text-white/60 hover:text-white underline cursor-pointer"
                                          >
                                            Edit
                                          </button>
                                        </div>
                                      )
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReviewModal(order.id, item)}
                                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#e51a34]/15 hover:bg-[#e51a34] text-[#ff4b60] hover:text-white border border-[#e51a34]/30 hover:border-transparent text-xs font-bold transition-all shadow-sm cursor-pointer"
                                      >
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>Write Review</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right self-center min-w-[80px]">
                                <span className="text-sm font-black text-white">₹{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing Summary (including coupon) */}
                      <div className="bg-[#0d0f17]/[0.02] border border-white/10 rounded-2xl p-5 space-y-3 text-white">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-white/55">Actual Price (Subtotal)</span>
                          <span>₹{(order.totalAmount + (order.discountAmount || 0)).toLocaleString()}</span>
                        </div>
                        
                        {order.couponCode && (
                          <div className="flex justify-between items-center text-xs text-green-700 bg-green-50/50 px-3.5 py-2.5 rounded-xl border border-green-100 font-bold">
                            <span className="flex items-center gap-1.5">
                              🏷️ Coupon Applied: <span className="uppercase bg-green-100 text-green-800 px-2 py-0.5 rounded text-[10px] tracking-wider">{order.couponCode}</span>
                              {order.couponTargetType && (order.couponTargetType === "product" || order.couponTargetType === "category") && (
                                <span className="text-[9px] text-green-600/70 font-normal normal-case">(Product-specific)</span>
                              )}
                            </span>
                            <span>-₹{order.discountAmount?.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm font-black">
                          <span>Paid Total</span>
                          <span className="text-[#00e5ff]">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Delivery Address & Cancel Option */}
                    <div className="lg:col-span-4 lg:border-l border-white/10 lg:pl-8 space-y-6 pt-6 lg:pt-0">
                      <div className="space-y-6">
                        {/* Shipping Details Card */}
                        {["shipped", "delivered"].includes(order.status?.toLowerCase() || "") && (
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-[#00e5ff] flex items-center gap-1.5">
                              🚚 Shipping Details
                            </h5>
                             <div className="bg-[#12151f]/5 border border-[#12151f]/10 rounded-2xl p-4 space-y-3 text-white">
                               {!order.courierServiceName && !order.trackingNumber ? (
                                 <p className="text-xs text-white/40 italic font-medium">
                                   Tracking details will be updated shortly.
                                 </p>
                               ) : (
                                 <>
                                   {order.courierServiceName && (
                                     <p className="text-xs text-white/80">
                                       <strong className="text-white font-black uppercase tracking-wider text-[10px]">Courier:</strong>{" "}
                                       {order.courierServiceName}
                                     </p>
                                   )}
                                   {order.courierId && (
                                     <p className="text-xs text-white/80">
                                       <strong className="text-white font-black uppercase tracking-wider text-[10px]">Courier ID:</strong>{" "}
                                       {order.courierId}
                                     </p>
                                   )}
                                   {order.trackingNumber && (
                                     <p className="text-xs text-white/80">
                                       <strong className="text-white font-black uppercase tracking-wider text-[10px]">Tracking Number:</strong>{" "}
                                       {order.trackingNumber}
                                     </p>
                                   )}
                                   {order.trackingLink && (
                                     <p className="text-xs">
                                       <strong className="text-white font-black uppercase tracking-wider text-[10px] block mb-1">Track Shipment:</strong>
                                       <a 
                                         href={order.trackingLink} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center gap-1 text-[#00e5ff] hover:underline text-xs font-bold"
                                       >
                                         View Shipment Progress →
                                       </a>
                                     </p>
                                   )}
                                 </>
                               )}
                              {order.estimatedDeliveryDate && (
                                <p className="text-xs text-white/80">
                                  <strong className="text-white font-black uppercase tracking-wider text-[10px]">Estimated Delivery:</strong>{" "}
                                  <span className="text-[#00e5ff] font-bold">
                                    Arriving by {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </p>
                              )}
                              {order.shippingNotes && (
                                <div className="border-t border-[#12151f]/10 pt-2">
                                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">Notes</p>
                                  <p className="text-[11px] italic text-white/70">{order.shippingNotes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Shipping Address */}
                        <div className="space-y-2">
                          <h5 className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-1.5">
                            <MapPin size={12} className="text-[#00e5ff]" /> Delivery Address
                          </h5>
                          <div className="bg-[#0d0f17]/[0.02] border border-white/10 rounded-2xl p-4">
                            {(() => {
                              const parsedAddr = parseAddress(order.shippingAddress);
                              if (parsedAddr) {
                                return (
                                  <div className="space-y-1.5 text-xs text-white/80 leading-relaxed">
                                    <p><strong className="text-white font-black uppercase tracking-wider text-[10px]">Name:</strong> {parsedAddr.name}</p>
                                    <p><strong className="text-white font-black uppercase tracking-wider text-[10px]">Address:</strong> {parsedAddr.street}</p>
                                    <p><strong className="text-white font-black uppercase tracking-wider text-[10px]">City:</strong> {parsedAddr.city}</p>
                                    <p><strong className="text-white font-black uppercase tracking-wider text-[10px]">State:</strong> {parsedAddr.state}</p>
                                    <p><strong className="text-white font-black uppercase tracking-wider text-[10px]">Pincode:</strong> {parsedAddr.pincode}</p>
                                    <p><strong className="text-white font-black uppercase tracking-wider text-[10px]">Contact:</strong> {parsedAddr.contact}</p>
                                  </div>
                                );
                              }
                              return (
                                <p className="text-xs font-semibold text-white/80 leading-relaxed">
                                  {order.shippingAddress || "No address provided"}
                                </p>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Cancel Order Action */}
                        {(order.status?.toLowerCase() === "pending" || order.status?.toLowerCase() === "confirmed") && (
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-white/40">Manage Order</h5>
                            <div className="bg-[#0d0f17]/[0.02] border border-white/10 rounded-2xl p-4">
                              {confirmingCancelId === order.id ? (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500">Confirm cancellation?</p>
                                  <div className="flex items-center space-x-2">
                                    <button 
                                      disabled={isCancelling}
                                      onClick={() => handleCancelOrder(order.id)}
                                      className="flex-1 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-1"
                                    >
                                      {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                      Yes, Cancel
                                    </button>
                                    <button 
                                      disabled={isCancelling}
                                      onClick={() => setConfirmingCancelId(null)}
                                      className="flex-1 py-2 bg-[#0d0f17]/[0.02] text-white/70 font-bold rounded-xl hover:bg-brand/10 transition-all text-[10px] uppercase tracking-widest border border-white/10"
                                    >
                                      No, Keep
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setConfirmingCancelId(order.id)}
                                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest"
                                >
                                  <XCircle size={14} />
                                  <span>Cancel Order</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {order.status?.toLowerCase() === "cancelled" && (
                          <div className="flex items-center space-x-3 px-6 py-4 rounded-2xl bg-red-50 border border-red-100 text-red-600">
                            <AlertTriangle size={18} />
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest">Order Cancelled</p>
                              <p className="text-[9px] font-medium opacity-70">A refund will be initiated if payment was captured. Amount will be credited within 7 to 9 business days.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Verified Review Submission Modal ── */}
      {isReviewModalOpen && selectedReviewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg bg-[#0d0f17] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#e51a34]/15 border border-[#e51a34]/30 text-[#ff4b60]">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Verified Buyer Review</h3>
                  <p className="text-xs text-white/50">Share your hands-on feedback on this studio instrument.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Capsule */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 border border-white/10">
                {selectedReviewItem.item.productImage ? (
                  <img
                    src={selectedReviewItem.item.productImage}
                    alt={selectedReviewItem.item.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <ImageIcon size={18} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-white truncate">{selectedReviewItem.item.productName}</h4>
                <p className="text-[10px] text-white/40 font-mono mt-0.5">
                  Order #{selectedReviewItem.orderId} • {selectedReviewItem.item.size}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="space-y-5">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-white hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= reviewRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-white/20 hover:text-white/40"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-mono text-xs font-semibold text-amber-400 ml-2">
                    {reviewRating === 5 && "5 / 5 (Exceptional)"}
                    {reviewRating === 4 && "4 / 5 (Very Good)"}
                    {reviewRating === 3 && "3 / 5 (Good / Average)"}
                    {reviewRating === 2 && "2 / 5 (Needs Improvement)"}
                    {reviewRating === 1 && "1 / 5 (Poor)"}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Review Headline *
                </label>
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Incredible optical sharpness for studio work"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#e51a34] transition-colors"
                />
              </div>

              {/* Review Body */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5">
                  Detailed Feedback *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your hands-on experience with the light output, cooling fan noise, GOBO stencils, or overall studio performance..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#e51a34] transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Error Alert */}
              {reviewError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 rounded-xl bg-[#e51a34] hover:bg-[#c9142b] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#e51a34]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#12151f] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 font-bold text-xs animate-in fade-in slide-in-from-bottom-5 duration-300 border border-[#00e5ff]/20">
          <CheckCircle2 size={16} />
          <span className="uppercase tracking-widest">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#00e5ff] animate-spin mb-4" />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Loading...</p>
        </div>
      }
    >
      <MyOrdersContent />
    </Suspense>
  );
}
